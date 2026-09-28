create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  provider text not null check (provider in ('mercadopago', 'webpay', 'unknown')),
  provider_reference text,
  provider_payment_id text unique,
  customer_email text not null,
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'failed', 'cancelled', 'unknown')),
  amount integer not null check (amount >= 0),
  total_amount integer not null check (total_amount >= 0),
  currency text not null default 'CLP',
  items jsonb not null default '[]'::jsonb
    check (jsonb_typeof(items) = 'array'),
  paid_at timestamptz,
  notification_email_claimed_at timestamptz,
  notification_email_sent_at timestamptz
);

alter table public.orders
  add column if not exists created_at timestamptz;

alter table public.orders
  add column if not exists provider text;

alter table public.orders
  add column if not exists provider_reference text;

alter table public.orders
  add column if not exists provider_payment_id text;

alter table public.orders
  add column if not exists customer_email text;

alter table public.orders
  add column if not exists status text;

alter table public.orders
  add column if not exists amount integer;

alter table public.orders
  add column if not exists total_amount integer;

alter table public.orders
  add column if not exists currency text;

alter table public.orders
  add column if not exists items jsonb;

alter table public.orders
  add column if not exists paid_at timestamptz;

alter table public.orders
  add column if not exists notification_email_claimed_at timestamptz;

alter table public.orders
  add column if not exists notification_email_sent_at timestamptz;

update public.orders
set created_at = now()
where created_at is null;

update public.orders
set provider = 'unknown'
where provider is null;

update public.orders
set status = 'unknown'
where status is null;

update public.orders
set amount = 0
where amount is null;

update public.orders
set total_amount = amount
where total_amount is null;

update public.orders
set currency = 'CLP'
where currency is null;

update public.orders
set items = '[]'::jsonb
where items is null;

alter table public.orders
  alter column created_at set default now(),
  alter column created_at set not null,
  alter column provider set default 'unknown',
  alter column provider set not null,
  alter column status set default 'unknown',
  alter column status set not null,
  alter column amount set not null,
  alter column total_amount set not null,
  alter column currency set default 'CLP',
  alter column currency set not null;

alter table public.orders
  alter column items set default '[]'::jsonb,
  alter column items set not null;

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_status_idx on public.orders (status);

alter table public.orders enable row level security;
alter table public.products enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'products'
      and policyname = 'Anyone can view products'
  ) then
    create policy "Anyone can view products"
      on public.products for select to anon, authenticated
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'orders'
      and policyname = 'Admins can view orders'
  ) then
    create policy "Admins can view orders"
      on public.orders for select to authenticated
      using (
        exists (
          select 1 from public.profiles
          where id = (select auth.uid()) and is_admin is true
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'products'
      and policyname = 'Admins can manage products'
  ) then
    create policy "Admins can manage products"
      on public.products for all to authenticated
      using (
        exists (
          select 1 from public.profiles
          where id = (select auth.uid()) and is_admin is true
        )
      )
      with check (
        exists (
          select 1 from public.profiles
          where id = (select auth.uid()) and is_admin is true
        )
      );
  end if;
end
$$;

notify pgrst, 'reload schema';

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'Admins can upload product images'
  ) then
    create policy "Admins can upload product images"
      on storage.objects for insert to authenticated
      with check (
        bucket_id = 'products'
        and exists (
          select 1 from public.profiles
          where id = (select auth.uid()) and is_admin is true
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'Admins can update product images'
  ) then
    create policy "Admins can update product images"
      on storage.objects for update to authenticated
      using (
        bucket_id = 'products'
        and exists (
          select 1 from public.profiles
          where id = (select auth.uid()) and is_admin is true
        )
      )
      with check (
        bucket_id = 'products'
        and exists (
          select 1 from public.profiles
          where id = (select auth.uid()) and is_admin is true
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'Admins can delete product images'
  ) then
    create policy "Admins can delete product images"
      on storage.objects for delete to authenticated
      using (
        bucket_id = 'products'
        and exists (
          select 1 from public.profiles
          where id = (select auth.uid()) and is_admin is true
        )
      );
  end if;
end
$$;