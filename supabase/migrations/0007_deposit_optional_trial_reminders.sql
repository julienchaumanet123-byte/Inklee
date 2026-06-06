-- 0007 — Acompte optionnel, anti double-booking, trial 14j, rappels SMS
-- Idempotent : peut être rejoué sans risque.

-- =========================================================
-- 1. Acompte optionnel (le tatoueur choisit)
-- =========================================================
alter table studios
  add column if not exists deposit_required boolean not null default true;

-- =========================================================
-- 2. Anti double-booking
-- Empêche deux RDV actifs sur le même créneau d'un même studio.
-- (status annulé / no-show ne bloquent pas un nouveau créneau)
-- =========================================================
create unique index if not exists appointments_no_double_book
  on appointments (studio_id, starts_at)
  where status in ('pending', 'confirmed');

-- =========================================================
-- 3. Trial 14 jours
-- =========================================================
alter table studios
  add column if not exists trial_ends_at timestamptz;

-- Backfill des studios existants (14j après leur création)
update studios
  set trial_ends_at = created_at + interval '14 days'
  where trial_ends_at is null;

alter table studios
  alter column trial_ends_at set default (now() + interval '14 days');

alter table studios
  alter column trial_ends_at set not null;

-- =========================================================
-- 4. Rappels SMS J-1 — idempotence
-- =========================================================
alter table appointments
  add column if not exists reminder_sent_at timestamptz;
