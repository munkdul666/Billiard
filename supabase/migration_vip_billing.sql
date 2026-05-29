-- ============================================================
-- Migration: VIP ширээ + цагийн багц (open / fixed)
-- Supabase SQL Editor дээр ажиллуул
-- ============================================================

-- Шинэ багана
alter table tables   add column if not exists is_vip boolean default false;
alter table sessions add column if not exists billing_mode text default 'open';   -- open | fixed
alter table sessions add column if not exists planned_minutes int;

-- 7 дахь ширээ = VIP (15,000₮/цаг)
insert into tables (number, name, hourly_rate, is_vip) values
  (7, 'VIP Ширээ', 15000, true)
on conflict (number) do update set is_vip = true, hourly_rate = 15000;
