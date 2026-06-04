-- =============================================================================
-- Inklee — Schéma initial (IDEMPOTENT)
-- Tu peux relancer ce script autant de fois que tu veux sans erreur.
-- =============================================================================

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- =============================================================================
-- Enums (idempotent via DO block)
-- =============================================================================
do $$ begin
  create type specialty as enum ('tattoo', 'piercing', 'both');
exception when duplicate_object then null; end $$;

do $$ begin
  create type appointment_status as enum ('pending', 'confirmed', 'completed', 'cancelled', 'no_show');
exception when duplicate_object then null; end $$;

do $$ begin
  create type plan_tier as enum ('starter', 'pro', 'studio');
exception when duplicate_object then null; end $$;

-- =============================================================================
-- profiles — lié à auth.users
-- =============================================================================
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null unique,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Auto-création du profil au signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================================
-- studios
-- =============================================================================
create table if not exists public.studios (
  id                      uuid primary key default uuid_generate_v4(),
  owner_id                uuid not null references public.profiles(id) on delete cascade,
  name                    text not null,
  slug                    text not null unique,
  specialty               specialty not null default 'tattoo',
  city                    text,
  bio                     text,
  logo_url                text,
  cover_url               text,
  deposit_amount          numeric(10,2) not null default 50.00,
  plan_tier               plan_tier not null default 'starter',
  stripe_customer_id      text,
  stripe_subscription_id  text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create index if not exists studios_owner_id_idx on public.studios(owner_id);
create index if not exists studios_slug_idx on public.studios(slug);

-- =============================================================================
-- clients — fiches clients d'un studio
-- =============================================================================
create table if not exists public.clients (
  id          uuid primary key default uuid_generate_v4(),
  studio_id   uuid not null references public.studios(id) on delete cascade,
  first_name  text not null,
  last_name   text not null,
  email       text not null,
  phone       text,
  notes       text,
  created_at  timestamptz not null default now(),
  unique (studio_id, email)
);

create index if not exists clients_studio_id_idx on public.clients(studio_id);
create index if not exists clients_email_idx on public.clients(email);

-- =============================================================================
-- appointments
-- parent_project_id permet de lier plusieurs RDV (suivi multi-séances)
-- =============================================================================
create table if not exists public.appointments (
  id                          uuid primary key default uuid_generate_v4(),
  studio_id                   uuid not null references public.studios(id) on delete cascade,
  client_id                   uuid not null references public.clients(id) on delete cascade,
  project_description         text,
  reference_image_url         text,
  starts_at                   timestamptz not null,
  ends_at                     timestamptz not null,
  status                      appointment_status not null default 'pending',
  deposit_paid                boolean not null default false,
  deposit_amount              numeric(10,2) not null default 0,
  stripe_payment_intent_id    text,
  parent_project_id           uuid references public.appointments(id) on delete set null,
  session_index               integer not null default 1,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now(),
  check (ends_at > starts_at)
);

create index if not exists appointments_studio_id_idx on public.appointments(studio_id);
create index if not exists appointments_client_id_idx on public.appointments(client_id);
create index if not exists appointments_starts_at_idx on public.appointments(starts_at);
create index if not exists appointments_parent_idx on public.appointments(parent_project_id);

-- =============================================================================
-- consents — consentement médical signé
-- =============================================================================
create table if not exists public.consents (
  id              uuid primary key default uuid_generate_v4(),
  appointment_id  uuid not null references public.appointments(id) on delete cascade,
  pdf_url         text,
  signed_at       timestamptz,
  medical_info    jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null default now()
);

create index if not exists consents_appointment_id_idx on public.consents(appointment_id);

-- =============================================================================
-- updated_at trigger générique
-- =============================================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists studios_set_updated_at on public.studios;
create trigger studios_set_updated_at
  before update on public.studios
  for each row execute function public.set_updated_at();

drop trigger if exists appointments_set_updated_at on public.appointments;
create trigger appointments_set_updated_at
  before update on public.appointments
  for each row execute function public.set_updated_at();

-- =============================================================================
-- Row Level Security
-- =============================================================================
alter table public.profiles      enable row level security;
alter table public.studios       enable row level security;
alter table public.clients       enable row level security;
alter table public.appointments  enable row level security;
alter table public.consents      enable row level security;

-- helper : l'utilisateur courant possède-t-il ce studio ?
create or replace function public.owns_studio(p_studio_id uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.studios
    where id = p_studio_id and owner_id = auth.uid()
  );
$$;

-- profiles
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- studios : lecture publique pour la page de résa, écriture par owner uniquement
drop policy if exists "studios_select_public" on public.studios;
create policy "studios_select_public" on public.studios
  for select using (true);

drop policy if exists "studios_insert_own" on public.studios;
create policy "studios_insert_own" on public.studios
  for insert with check (auth.uid() = owner_id);

drop policy if exists "studios_update_own" on public.studios;
create policy "studios_update_own" on public.studios
  for update using (auth.uid() = owner_id);

drop policy if exists "studios_delete_own" on public.studios;
create policy "studios_delete_own" on public.studios
  for delete using (auth.uid() = owner_id);

-- clients : visibles uniquement par le propriétaire du studio
drop policy if exists "clients_select_own_studio" on public.clients;
create policy "clients_select_own_studio" on public.clients
  for select using (public.owns_studio(studio_id));

drop policy if exists "clients_insert_own_studio" on public.clients;
create policy "clients_insert_own_studio" on public.clients
  for insert with check (public.owns_studio(studio_id));

drop policy if exists "clients_update_own_studio" on public.clients;
create policy "clients_update_own_studio" on public.clients
  for update using (public.owns_studio(studio_id));

drop policy if exists "clients_delete_own_studio" on public.clients;
create policy "clients_delete_own_studio" on public.clients
  for delete using (public.owns_studio(studio_id));

-- appointments : visible uniquement par owner du studio
-- (création publique gérée via service role depuis la booking action)
drop policy if exists "appointments_select_own_studio" on public.appointments;
create policy "appointments_select_own_studio" on public.appointments
  for select using (public.owns_studio(studio_id));

drop policy if exists "appointments_insert_own_studio" on public.appointments;
create policy "appointments_insert_own_studio" on public.appointments
  for insert with check (public.owns_studio(studio_id));

drop policy if exists "appointments_update_own_studio" on public.appointments;
create policy "appointments_update_own_studio" on public.appointments
  for update using (public.owns_studio(studio_id));

drop policy if exists "appointments_delete_own_studio" on public.appointments;
create policy "appointments_delete_own_studio" on public.appointments
  for delete using (public.owns_studio(studio_id));

-- consents : suit l'appointment associé
drop policy if exists "consents_select_own_studio" on public.consents;
create policy "consents_select_own_studio" on public.consents
  for select using (
    exists (
      select 1 from public.appointments a
      where a.id = consents.appointment_id and public.owns_studio(a.studio_id)
    )
  );

drop policy if exists "consents_insert_own_studio" on public.consents;
create policy "consents_insert_own_studio" on public.consents
  for insert with check (
    exists (
      select 1 from public.appointments a
      where a.id = consents.appointment_id and public.owns_studio(a.studio_id)
    )
  );

drop policy if exists "consents_update_own_studio" on public.consents;
create policy "consents_update_own_studio" on public.consents
  for update using (
    exists (
      select 1 from public.appointments a
      where a.id = consents.appointment_id and public.owns_studio(a.studio_id)
    )
  );

-- =============================================================================
-- Storage buckets
-- =============================================================================
insert into storage.buckets (id, name, public)
values
  ('avatars',            'avatars',            true),
  ('studio-covers',      'studio-covers',      true),
  ('booking-references', 'booking-references', true),
  ('consent-pdfs',       'consent-pdfs',       false)
on conflict (id) do nothing;
