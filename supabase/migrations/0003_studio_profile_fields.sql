-- =============================================================================
-- Inklee — Champs profil studio enrichi + helper auth.users
-- =============================================================================

-- Champs supplémentaires pour profil studio (réseaux + horaires)
alter table public.studios
  add column if not exists instagram_handle text,
  add column if not exists website_url text,
  add column if not exists phone text,
  add column if not exists address text,
  add column if not exists opening_hours jsonb default '{}'::jsonb;

-- Helper pour récupérer un user_id depuis un email (sans exposer auth.users)
create or replace function public.get_user_id_by_email(p_email text)
returns uuid
language sql
security definer
stable
as $$
  select id from auth.users where email = p_email limit 1;
$$;

-- Permet à l'anon role de l'appeler depuis une action serveur (via service_role
-- en fait, mais on autorise pour la flexibilité)
grant execute on function public.get_user_id_by_email(text) to anon, authenticated, service_role;
