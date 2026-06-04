-- =============================================================================
-- Inklee — Stripe Connect (champs sur studios)
-- =============================================================================

alter table public.studios
  add column if not exists stripe_account_id text,
  add column if not exists stripe_charges_enabled boolean not null default false,
  add column if not exists stripe_details_submitted boolean not null default false;

create index if not exists studios_stripe_account_id_idx on public.studios(stripe_account_id);
