-- =============================================================================
-- Inklee — Chat + Auth client (IDEMPOTENT)
-- =============================================================================

-- =============================================================================
-- 1. Lien entre clients (fiche dans un studio) et auth.users
-- Un client peut être référencé chez plusieurs studios mais a UN compte auth
-- partagé (identifié par email). Le auth_user_id est nullable car les
-- clients existants n'ont pas forcément de compte tant qu'ils ne se sont
-- pas connectés via magic link.
-- =============================================================================
alter table public.clients
  add column if not exists auth_user_id uuid references auth.users(id) on delete set null;

create index if not exists clients_auth_user_id_idx on public.clients(auth_user_id);

-- =============================================================================
-- 2. messages — chat entre un studio et un client
-- Pas de table "conversations" : une conversation = (studio_id, client_id).
-- attachments est JSONB array pour stocker plus tard des URLs d'images.
-- =============================================================================
do $$ begin
  create type message_sender as enum ('client', 'studio');
exception when duplicate_object then null; end $$;

create table if not exists public.messages (
  id           uuid primary key default uuid_generate_v4(),
  studio_id    uuid not null references public.studios(id) on delete cascade,
  client_id    uuid not null references public.clients(id) on delete cascade,
  sender       message_sender not null,
  body         text not null,
  attachments  jsonb not null default '[]'::jsonb,
  read_at      timestamptz,
  created_at   timestamptz not null default now()
);

create index if not exists messages_studio_client_idx on public.messages(studio_id, client_id, created_at desc);
create index if not exists messages_client_unread_idx on public.messages(client_id) where read_at is null and sender = 'studio';
create index if not exists messages_studio_unread_idx on public.messages(studio_id) where read_at is null and sender = 'client';

-- =============================================================================
-- 3. Helper : client auth_user_id appartient-il à ce client_id ?
-- =============================================================================
create or replace function public.is_client(p_client_id uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.clients
    where id = p_client_id and auth_user_id = auth.uid()
  );
$$;

-- =============================================================================
-- 4. RLS messages
-- - Studio owner lit/écrit les messages de SON studio
-- - Client lit/écrit les messages de SA fiche client (matché par auth_user_id)
-- =============================================================================
alter table public.messages enable row level security;

drop policy if exists "messages_select_studio" on public.messages;
create policy "messages_select_studio" on public.messages
  for select using (public.owns_studio(studio_id));

drop policy if exists "messages_insert_studio" on public.messages;
create policy "messages_insert_studio" on public.messages
  for insert with check (public.owns_studio(studio_id) and sender = 'studio');

drop policy if exists "messages_update_studio" on public.messages;
create policy "messages_update_studio" on public.messages
  for update using (public.owns_studio(studio_id));

drop policy if exists "messages_select_client" on public.messages;
create policy "messages_select_client" on public.messages
  for select using (public.is_client(client_id));

drop policy if exists "messages_insert_client" on public.messages;
create policy "messages_insert_client" on public.messages
  for insert with check (public.is_client(client_id) and sender = 'client');

drop policy if exists "messages_update_client" on public.messages;
create policy "messages_update_client" on public.messages
  for update using (public.is_client(client_id));

-- =============================================================================
-- 5. RLS additionnelles sur clients pour que le client puisse lire SA fiche
-- =============================================================================
drop policy if exists "clients_select_own" on public.clients;
create policy "clients_select_own" on public.clients
  for select using (auth_user_id = auth.uid());

-- Idem pour appointments : un client doit voir SES RDV
drop policy if exists "appointments_select_own_client" on public.appointments;
create policy "appointments_select_own_client" on public.appointments
  for select using (
    exists (
      select 1 from public.clients c
      where c.id = appointments.client_id and c.auth_user_id = auth.uid()
    )
  );

-- Idem pour studios : le client doit pouvoir lire les infos pub du studio
-- (déjà en lecture publique via studios_select_public, donc rien à faire)

-- =============================================================================
-- 6. Storage bucket pour les attachements de chat (images dans messages)
-- =============================================================================
insert into storage.buckets (id, name, public)
values ('chat-attachments', 'chat-attachments', true)
on conflict (id) do nothing;

-- =============================================================================
-- 7. Trigger : auto-link auth_user_id quand un user signup avec un email
-- qui correspond à un client existant
-- =============================================================================
create or replace function public.link_auth_user_to_clients()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.clients
  set auth_user_id = new.id
  where email = new.email and auth_user_id is null;
  return new;
end;
$$;

drop trigger if exists on_auth_user_link_clients on auth.users;
create trigger on_auth_user_link_clients
  after insert on auth.users
  for each row execute function public.link_auth_user_to_clients();

-- =============================================================================
-- 8. Trigger inverse : à l'insert d'un client, si un auth.users existe déjà
-- avec le même email, on lie tout de suite. Couvre le cas booking-first,
-- account-later.
-- =============================================================================
create or replace function public.auto_link_client_to_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
begin
  if new.auth_user_id is null and new.email is not null then
    select id into v_user_id from auth.users where email = new.email limit 1;
    if v_user_id is not null then
      new.auth_user_id := v_user_id;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists on_client_insert_link_auth on public.clients;
create trigger on_client_insert_link_auth
  before insert on public.clients
  for each row execute function public.auto_link_client_to_auth_user();
