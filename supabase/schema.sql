-- ============================================================
-- Billiard Bar — Supabase schema
-- Supabase → SQL Editor дээр энэ бүхнийг хуулж ажиллуул
-- ============================================================

-- Ширээнүүд
create table if not exists tables (
  id uuid default gen_random_uuid() primary key,
  number int not null unique,
  name text default '',
  status text default 'free', -- free | occupied | reserved
  started_at timestamptz,
  current_session_id uuid,
  hourly_rate numeric default 5000,
  created_at timestamptz default now()
);

-- Бараа (beer, beverage, snack г.м)
create table if not exists products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  category text default 'beverage', -- beverage | beer | snack | other
  price numeric not null,
  stock int default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Сесс (ширээний тоглолт)
create table if not exists sessions (
  id uuid default gen_random_uuid() primary key,
  table_id uuid references tables(id),
  started_at timestamptz default now(),
  ended_at timestamptz,
  duration_minutes int,
  table_charge numeric default 0,
  items_total numeric default 0,
  total_amount numeric default 0,
  status text default 'active', -- active | closed
  note text,
  created_at timestamptz default now()
);

-- Сессийн захиалсан бараанууд
create table if not exists session_items (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references sessions(id) on delete cascade,
  product_id uuid references products(id),
  product_name text,
  quantity int default 1,
  unit_price numeric,
  total_price numeric,
  created_at timestamptz default now()
);

-- ============================================================
-- Эхний өгөгдөл — 6 ширээ
-- ============================================================
insert into tables (number, name, hourly_rate) values
  (1, 'Ширээ 1', 5000),
  (2, 'Ширээ 2', 5000),
  (3, 'Ширээ 3', 5000),
  (4, 'Ширээ 4', 5000),
  (5, 'Ширээ 5', 5000),
  (6, 'Ширээ 6', 5000)
on conflict (number) do nothing;

-- Эхний өгөгдөл — бараанууд
insert into products (name, category, price, stock) values
  ('Хайнекен', 'beer', 6000, 100),
  ('Чингис', 'beer', 4000, 100),
  ('Кока Кола', 'beverage', 2500, 50),
  ('Спрайт', 'beverage', 2500, 50),
  ('Ус', 'beverage', 1000, 100),
  ('Энержи дринк', 'beverage', 5000, 30),
  ('Чипс', 'snack', 3000, 50),
  ('Самар', 'snack', 4000, 30);

-- ============================================================
-- Realtime идэвхжүүлэх (нэг browser дээр өөрчлөгдөхөд бусад нь шинэчлэгдэнэ)
-- ============================================================
alter publication supabase_realtime add table tables;
alter publication supabase_realtime add table sessions;
alter publication supabase_realtime add table session_items;

-- ============================================================
-- RLS — зөвхөн нэвтэрсэн хэрэглэгч уншиж/бичиж чадна
-- ============================================================
alter table tables enable row level security;
alter table products enable row level security;
alter table sessions enable row level security;
alter table session_items enable row level security;

create policy "authenticated full access tables"
  on tables for all to authenticated using (true) with check (true);
create policy "authenticated full access products"
  on products for all to authenticated using (true) with check (true);
create policy "authenticated full access sessions"
  on sessions for all to authenticated using (true) with check (true);
create policy "authenticated full access session_items"
  on session_items for all to authenticated using (true) with check (true);
