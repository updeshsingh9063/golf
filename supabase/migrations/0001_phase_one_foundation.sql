create extension if not exists "pgcrypto";

create type hat_status as enum ('available', 'reserved', 'sold', 'inactive');
create type donation_status as enum ('pending', 'succeeded', 'failed', 'refunded');

create table public.owners (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  phone text unique,
  stripe_customer_id text unique,
  default_pm_id text,
  created_at timestamptz not null default now()
);

create table public.charities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  stripe_dest text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.hats (
  id uuid primary key default gen_random_uuid(),
  number integer not null unique check (number > 0),
  status hat_status not null default 'available',
  charity_id uuid references public.charities(id),
  owner_id uuid references public.owners(id),
  qr_token text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.donations (
  id uuid primary key default gen_random_uuid(),
  hat_id uuid not null references public.hats(id),
  payer_owner_id uuid references public.owners(id),
  charity_id uuid not null references public.charities(id),
  amount_cents integer not null check (amount_cents > 0),
  platform_fee integer not null default 0,
  stripe_fee integer not null default 0,
  stripe_pi_id text unique,
  status donation_status not null default 'pending',
  created_at timestamptz not null default now()
);

create index hats_status_idx on public.hats(status);
create index hats_qr_token_idx on public.hats(qr_token);
create index donations_hat_id_idx on public.donations(hat_id);
create index donations_charity_id_idx on public.donations(charity_id);

insert into public.charities (name)
values
  ('Community Food Share'),
  ('Wednesday Pantry'),
  ('Second Harvest Kitchen'),
  ('Fairway Food Bank');

insert into public.hats (number, status, qr_token)
select number, 'available', encode(gen_random_bytes(18), 'hex')
from generate_series(1, 72) as number;
