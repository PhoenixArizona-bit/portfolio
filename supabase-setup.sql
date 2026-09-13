-- Run this once in Supabase SQL editor (your project → SQL Editor → New query)

-- 1. Table that holds the editable text, keyed by a short id.
create table if not exists site_content (
  key text primary key,
  value text not null default '',
  updated_at timestamptz not null default now()
);

-- Public (anon) can READ content — the live site needs this to render text.
alter table site_content enable row level security;
create policy "anyone can read content"
  on site_content for select
  using (true);
-- No insert/update/delete policy for anon — writes only happen through the
-- password-checked function below, never directly against the table.

-- 2. Table that holds the admin password hash. Anon gets NO access to this
-- at all (no policies = fully locked, RLS still enabled).
create table if not exists admin_secret (
  id int primary key default 1,
  password_hash text not null
);
alter table admin_secret enable row level security;

-- pgcrypto gives us crypt()/gen_salt() for hashing the password.
create extension if not exists pgcrypto;

-- 3. Set your admin password. Replace 'change-this-password' then run this
-- once. Re-run it any time you want to change the password later.
insert into admin_secret (id, password_hash)
values (1, crypt('change-this-password', gen_salt('bf')))
on conflict (id) do update set password_hash = excluded.password_hash;

-- 4. The only way to write to site_content: password is checked server-side
-- inside this function, so the anon key alone is never enough to edit text.
create or replace function admin_update_content(p_key text, p_value text, p_password text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  ok boolean;
begin
  select (password_hash = crypt(p_password, password_hash)) into ok
  from admin_secret where id = 1;

  if not ok then
    return false;
  end if;

  insert into site_content (key, value, updated_at)
  values (p_key, p_value, now())
  on conflict (key) do update set value = excluded.value, updated_at = now();

  return true;
end;
$$;

grant execute on function admin_update_content(text, text, text) to anon;

-- 5. Same password check, used just to log in to the admin page (doesn't
-- touch any data).
create or replace function admin_check_password(p_password text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  ok boolean;
begin
  select (password_hash = crypt(p_password, password_hash)) into ok
  from admin_secret where id = 1;
  return coalesce(ok, false);
end;
$$;

grant execute on function admin_check_password(text) to anon;

-- 6. Seed the initial text so the site has something to show before you've
-- edited anything. Edit these values directly here, or just do it from the
-- admin page after setup.
insert into site_content (key, value) values
  ('hero_lede', 'Independent developer & founder, currently juggling classes and shipping Zentro — a booking marketplace for salons & barbershops. One person, whole stack, way too much coffee.'),
  ('about_p1', 'I build solo, on purpose. No team, no funding round — just a laptop, a few hours between classes, and a habit of shipping instead of endlessly planning.'),
  ('about_p2', 'Every project starts the same way: spot a real gap in a local market, build the smallest version that actually works, and get it in front of real people fast. Zentro exists because booking a barber in Lahore was still happening over phone calls.'),
  ('about_p3', 'I work mostly in React and Supabase, and along the way I''ve picked up motion design, video editing, and scrappy growth marketing — when you''re solo, you own every part of the product.'),
  ('services_intro', 'Reusable, mobile-first builds for shops that don''t have a digital presence yet — built fast, priced for small local businesses, not enterprise budgets.'),
  ('service_1_title', 'Restaurant & menu apps'),
  ('service_1_desc', 'Digital menus, ordering flows, WhatsApp-based order handoff.'),
  ('service_2_title', 'Salon & clinic booking'),
  ('service_2_desc', 'Slot-based booking systems, built on the same architecture powering Zentro.'),
  ('service_3_title', 'General shop storefronts'),
  ('service_3_desc', 'Lightweight e-commerce with COD/Easypaisa/bank transfer built in.'),
  ('service_4_title', 'Fast turnaround'),
  ('service_4_desc', 'Solo-built means fewer handoffs — from brief to a working build, quickly.')
on conflict (key) do nothing;
