-- ArtDrop Monetization: Phase 1
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query)

-- 1. Add fee columns to auctions
alter table auctions
  add column if not exists fee_model text not null default 'collector',
  add column if not exists fee_rate  numeric not null default 8;

-- 2. Add subscription tier + fee balance to profiles
alter table profiles
  add column if not exists subscription_tier text not null default 'free',
  add column if not exists fee_balance_owed  numeric not null default 0;

-- 3. Create platform_fees tracking table
create table if not exists platform_fees (
  id                       uuid primary key default gen_random_uuid(),
  auction_id               uuid references auctions(id),
  winning_bid              numeric not null,
  fee_rate                 numeric not null,
  fee_amount               numeric not null,
  fee_model                text    not null default 'collector',
  artist_id                uuid    references profiles(id),
  collector_email          text,
  stripe_payment_intent_id text,
  collected                boolean not null default false,
  created_at               timestamptz not null default now()
);

-- Row-level security: platform_fees is admin-only for now
alter table platform_fees enable row level security;
-- Artists can see their own fee records
create policy "artists_see_own_fees" on platform_fees
  for select using (artist_id = auth.uid());
-- Service role can insert (used by our app via anon key for now)
create policy "insert_fees" on platform_fees
  for insert with check (true);
