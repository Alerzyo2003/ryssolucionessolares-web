-- Recordatorios de carrito abandonado
alter table public.orders
  add column if not exists abandoned_email_claimed_at timestamptz,
  add column if not exists abandoned_email_sent_at timestamptz;

create index if not exists orders_pending_abandoned_idx
  on public.orders (created_at)
  where status = 'pending' and abandoned_email_sent_at is null;

-- Personas que pidieron no recibir más recordatorios
create table if not exists public.email_optouts (
  email text primary key,
  created_at timestamptz not null default now()
);

-- Solo el servidor (service role) puede leer o escribir esta tabla
alter table public.email_optouts enable row level security;
