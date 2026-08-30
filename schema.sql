-- ============================================================================
-- WWMoment - Digital Wedding Guestbook & Photo Upload App
-- Supabase database + storage initialization script
--
-- How to use:
--   1. Open your Supabase project -> SQL Editor -> New query
--   2. Paste this entire file and click "Run"
--   3. Then create a Storage bucket named "wedding-moments" (see section 2
--      below - this script creates it for you automatically if the
--      "storage" extension is available, which it is by default on Supabase)
-- ============================================================================

-- 1. EXTENSIONS ---------------------------------------------------------------
create extension if not exists "pgcrypto";

-- 2. TABLE: guestbook_photos --------------------------------------------------
create table if not exists public.guestbook_photos (
  id uuid primary key default gen_random_uuid(),
  guest_name text not null default 'Guest',
  message text,
  photo_url text not null,
  filter_style text not null default 'original'
    check (filter_style in ('original', 'warm', 'soft', 'bw', 'vivid')),
  created_at timestamp with time zone not null default now()
);

comment on table public.guestbook_photos is
  'Guest-submitted wedding photos + wishes for the live guestbook gallery.';

-- Helpful index for the gallery feed (newest first)
create index if not exists guestbook_photos_created_at_idx
  on public.guestbook_photos (created_at desc);

-- 3. ROW LEVEL SECURITY --------------------------------------------------------
alter table public.guestbook_photos enable row level security;

-- Anyone (anon key) can read all guestbook entries -> needed for the public
-- live gallery / slideshow.
drop policy if exists "Public can read guestbook photos" on public.guestbook_photos;
create policy "Public can read guestbook photos"
  on public.guestbook_photos
  for select
  to anon, authenticated
  using (true);

-- Anyone (anon key) can insert a new guestbook entry -> needed so guests can
-- upload photos/wishes without logging in.
drop policy if exists "Public can insert guestbook photos" on public.guestbook_photos;
create policy "Public can insert guestbook photos"
  on public.guestbook_photos
  for insert
  to anon, authenticated
  with check (true);

-- No public update/delete policy is created on purpose: the anon key can
-- never modify or remove entries. Deleting a photo is only possible via the
-- app's /api/admin/delete-photo route, which authenticates the request with
-- a passcode-gated cookie and then uses the Supabase service_role key
-- (SUPABASE_SERVICE_ROLE_KEY) server-side to bypass RLS - the anon key used
-- by the browser never gets delete access.

-- 4. REALTIME -------------------------------------------------------------------
-- Register the table with Supabase Realtime so the /gallery page can
-- subscribe to INSERT events and update the live slideshow without a
-- page refresh.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'guestbook_photos'
  ) then
    alter publication supabase_realtime add table public.guestbook_photos;
  end if;
end $$;

-- 5. STORAGE: "wedding-moments" bucket ------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'wedding-moments',
  'wedding-moments',
  true,
  5242880, -- 5 MB hard ceiling (client compresses to ~1.5MB before upload)
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = true,
    file_size_limit = 5242880,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

-- 6. STORAGE POLICIES -------------------------------------------------------------
-- Public read access so photos display in the gallery/slideshow without auth.
drop policy if exists "Public can view wedding photos" on storage.objects;
create policy "Public can view wedding photos"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'wedding-moments');

-- Public upload access so guests can upload from their phones without an
-- account. Uploads are restricted to the wedding-moments bucket only.
drop policy if exists "Public can upload wedding photos" on storage.objects;
create policy "Public can upload wedding photos"
  on storage.objects
  for insert
  to anon, authenticated
  with check (bucket_id = 'wedding-moments');

-- ============================================================================
-- Done! Next steps:
--   - Copy your Project URL + anon public key into .env.local
--     (see .env.example in the repo root)
--   - Visit "/" on your deployed app to test uploading a photo
--   - Visit "/gallery" to see the live slideshow
-- ============================================================================
