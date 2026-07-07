create type order_status as enum ('reserved', 'checkout_started', 'paid', 'expired', 'cancelled', 'refunded');

alter table public.owners
  add column if not exists mandate_accepted_at timestamptz,
  add column if not exists mandate_text text;

alter table public.hats
  add column if not exists reserved_until timestamptz,
  add column if not exists stripe_checkout_session_id text unique;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  hat_id uuid not null references public.hats(id),
  owner_id uuid references public.owners(id),
  email text not null,
  charity_id uuid references public.charities(id),
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text unique,
  amount_cents integer not null check (amount_cents > 0),
  currency text not null default 'usd',
  status order_status not null default 'reserved',
  mandate_text text not null,
  mandate_accepted_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '20 minutes',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_hat_id_idx on public.orders(hat_id);
create index orders_email_idx on public.orders(email);
create index orders_status_idx on public.orders(status);

-- Phase 2 reservation rule:
-- A checkout request should update hats from available -> reserved only when
-- status = 'available'. If no row updates, the number has already been won.
