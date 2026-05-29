-- ============================================================
-- Migration: Ажилтан + ээлж
-- Supabase SQL Editor дээр ажиллуул
-- ============================================================

create table if not exists staff (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  role text default 'Зөөгч',
  phone text,
  is_active boolean default true,
  on_shift boolean default false,
  created_at timestamptz default now()
);

-- Тоглолтыг аль ажилтан хийсэн бэ
alter table sessions add column if not exists staff_id uuid references staff(id);

alter table staff enable row level security;
create policy "auth staff" on staff for all to authenticated using (true) with check (true);

alter publication supabase_realtime add table staff;

-- Жишээ 3 ажилтан
insert into staff (name, role, on_shift) values
  ('Болд', 'Менежер', true),
  ('Сараа', 'Зөөгч', false),
  ('Тэмүүлэн', 'Зөөгч', false);
