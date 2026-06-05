-- =============================================================================
-- Inklee — Créneaux configurables (IDEMPOTENT)
-- =============================================================================

-- 1. Colonnes paramétrage sur studios
alter table public.studios
  add column if not exists appointment_duration_min int not null default 60,
  add column if not exists booking_horizon_days int not null default 14,
  add column if not exists booking_min_lead_hours int not null default 24;

-- 2. Règles hebdo récurrentes (1 ligne par jour de semaine et par studio)
create table if not exists public.availability_rules (
  id           uuid primary key default uuid_generate_v4(),
  studio_id    uuid not null references public.studios(id) on delete cascade,
  day_of_week  int not null check (day_of_week between 0 and 6),  -- 0=Dim, 1=Lun, ..., 6=Sam
  is_open      boolean not null default false,
  ranges       jsonb not null default '[]'::jsonb,
  -- ranges = [{ "start": "10:00", "end": "12:00" }, { "start": "14:00", "end": "18:00" }]
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (studio_id, day_of_week)
);

create index if not exists availability_rules_studio_idx on public.availability_rules(studio_id);

-- 3. Exceptions ponctuelles (fermetures, horaires spéciaux)
create table if not exists public.availability_exceptions (
  id           uuid primary key default uuid_generate_v4(),
  studio_id    uuid not null references public.studios(id) on delete cascade,
  date         date not null,
  is_closed    boolean not null default true,
  ranges       jsonb,  -- null si is_closed=true
  reason       text,
  created_at   timestamptz not null default now(),
  unique (studio_id, date)
);

create index if not exists availability_exceptions_studio_date_idx on public.availability_exceptions(studio_id, date);

-- 4. RLS
alter table public.availability_rules enable row level security;
alter table public.availability_exceptions enable row level security;

-- Lecture publique : la page de résa publique doit pouvoir lire
drop policy if exists "availability_rules_select_public" on public.availability_rules;
create policy "availability_rules_select_public" on public.availability_rules
  for select using (true);

drop policy if exists "availability_exceptions_select_public" on public.availability_exceptions;
create policy "availability_exceptions_select_public" on public.availability_exceptions
  for select using (true);

-- Écriture : owner du studio uniquement
drop policy if exists "availability_rules_write_own" on public.availability_rules;
create policy "availability_rules_write_own" on public.availability_rules
  for all using (public.owns_studio(studio_id)) with check (public.owns_studio(studio_id));

drop policy if exists "availability_exceptions_write_own" on public.availability_exceptions;
create policy "availability_exceptions_write_own" on public.availability_exceptions
  for all using (public.owns_studio(studio_id)) with check (public.owns_studio(studio_id));

-- 5. Trigger updated_at
drop trigger if exists availability_rules_set_updated_at on public.availability_rules;
create trigger availability_rules_set_updated_at
  before update on public.availability_rules
  for each row execute function public.set_updated_at();

-- 6. Seed défauts pour les studios existants (Mar-Sam 10h-12h + 14h-18h)
-- Pour chaque studio sans aucune règle, on crée les 7 lignes
do $$
declare
  s record;
  default_ranges jsonb := '[{"start":"10:00","end":"12:00"},{"start":"14:00","end":"18:00"}]'::jsonb;
begin
  for s in select id from public.studios where not exists (
    select 1 from public.availability_rules where studio_id = studios.id
  ) loop
    -- 0=Dim, 1=Lun fermés
    insert into public.availability_rules (studio_id, day_of_week, is_open, ranges)
    values
      (s.id, 0, false, '[]'::jsonb),  -- Dim
      (s.id, 1, false, '[]'::jsonb),  -- Lun
      (s.id, 2, true,  default_ranges),  -- Mar
      (s.id, 3, true,  default_ranges),  -- Mer
      (s.id, 4, true,  default_ranges),  -- Jeu
      (s.id, 5, true,  default_ranges),  -- Ven
      (s.id, 6, true,  default_ranges);  -- Sam
  end loop;
end $$;

-- 7. Au futur INSERT de studio, on crée les règles défaut
create or replace function public.seed_default_availability()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  default_ranges jsonb := '[{"start":"10:00","end":"12:00"},{"start":"14:00","end":"18:00"}]'::jsonb;
begin
  insert into public.availability_rules (studio_id, day_of_week, is_open, ranges)
  values
    (new.id, 0, false, '[]'::jsonb),
    (new.id, 1, false, '[]'::jsonb),
    (new.id, 2, true,  default_ranges),
    (new.id, 3, true,  default_ranges),
    (new.id, 4, true,  default_ranges),
    (new.id, 5, true,  default_ranges),
    (new.id, 6, true,  default_ranges);
  return new;
end;
$$;

drop trigger if exists on_studio_created_seed_availability on public.studios;
create trigger on_studio_created_seed_availability
  after insert on public.studios
  for each row execute function public.seed_default_availability();
