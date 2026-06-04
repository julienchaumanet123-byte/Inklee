-- =============================================================================
-- Inklee — Portfolio (Pro feature)
-- =============================================================================

create table if not exists public.portfolio_images (
  id          uuid primary key default uuid_generate_v4(),
  studio_id   uuid not null references public.studios(id) on delete cascade,
  image_url   text not null,
  storage_path text not null, -- pour pouvoir delete dans Storage à la suppression
  caption     text,
  position    integer not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists portfolio_images_studio_idx on public.portfolio_images(studio_id, position);

-- RLS
alter table public.portfolio_images enable row level security;

-- Lecture publique : tout le monde voit le portfolio d'un studio
drop policy if exists "portfolio_select_public" on public.portfolio_images;
create policy "portfolio_select_public" on public.portfolio_images
  for select using (true);

-- Écriture : owner du studio uniquement
drop policy if exists "portfolio_insert_own_studio" on public.portfolio_images;
create policy "portfolio_insert_own_studio" on public.portfolio_images
  for insert with check (public.owns_studio(studio_id));

drop policy if exists "portfolio_update_own_studio" on public.portfolio_images;
create policy "portfolio_update_own_studio" on public.portfolio_images
  for update using (public.owns_studio(studio_id));

drop policy if exists "portfolio_delete_own_studio" on public.portfolio_images;
create policy "portfolio_delete_own_studio" on public.portfolio_images
  for delete using (public.owns_studio(studio_id));

-- Storage bucket
insert into storage.buckets (id, name, public)
values ('portfolio-images', 'portfolio-images', true)
on conflict (id) do nothing;
