# WWMoment - Digital Wedding Guestbook & Photo Upload App

A mobile-first digital guestbook for weddings. Guests scan a QR code, snap
or pick a photo, apply a filter, leave a wish, and it instantly shows up on
a live gallery/slideshow you can project at the venue.

Built with **Next.js (App Router) + TypeScript + Tailwind CSS + Supabase**.

## Features

- **Guest upload page (`/`)** - elegant cream/emerald wedding theme, name +
  wishes form, camera capture or gallery picker, client-side image
  compression (`browser-image-compression`, capped at ~1.5MB / 2560px /
  85% JPEG quality), 5 CSS-based filter presets (Original, Warm Romance,
  Soft Minimalist, Classic Monochrome, Vivid Glow), real upload progress
  bar, and a confetti success modal.
- **Live gallery (`/gallery`)** - Supabase Realtime-powered grid + full
  screen slideshow, a global filter toggle for the projector display, and a
  passcode-gated Admin panel to download individual photos or export all
  guestbook metadata as CSV.
- **Supabase backend** - a public `wedding-moments` storage bucket and a
  `guestbook_photos` table, fully defined in [`schema.sql`](./schema.sql).

## Getting started

### 1. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor -> New query**, paste the full contents of
   [`schema.sql`](./schema.sql), and run it. This creates the
   `guestbook_photos` table, RLS policies, Realtime registration, and the
   `wedding-moments` storage bucket + policies.
3. Copy your **Project URL** and **anon public key** from
   **Settings -> API**.

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
NEXT_PUBLIC_ADMIN_PASSCODE=choose-a-passcode
```

### 3. Install dependencies & run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the upload page,
and [http://localhost:3000/gallery](http://localhost:3000/gallery) for the
live gallery.

## Project structure

```
src/
  app/
    page.tsx           # Guest upload page
    gallery/page.tsx    # Live gallery + slideshow
    layout.tsx          # Fonts, theme, global shell
    globals.css          # Wedding theme tokens + filter CSS classes
  components/
    UploadForm.tsx       # Main upload flow
    FilterSelector.tsx   # Filter preset picker/preview
    SuccessModal.tsx      # Confetti + success modal
    GalleryView.tsx        # Realtime grid/slideshow + admin controls
    PhotoCard.tsx
    Slideshow.tsx
    AdminGate.tsx          # Passcode gate for admin actions
  lib/
    supabase.ts             # Supabase client
    types.ts                  # Shared TypeScript types
    filters.ts                 # Filter preset definitions
    compressImage.ts            # Client-side image compression
    uploadPhoto.ts                # XHR upload w/ progress to Supabase Storage
    downloadPhotos.ts               # Admin CSV/photo export helpers
schema.sql                          # Supabase DB + storage initialization
HOSTINGER_SETUP.md                    # Connect a Hostinger domain to Vercel
```

## Deployment

1. Push to GitHub, import the repo into [Vercel](https://vercel.com/new).
2. Add the three environment variables above in Vercel's project settings.
3. Deploy. See [`HOSTINGER_SETUP.md`](./HOSTINGER_SETUP.md) for wiring up a
   custom domain purchased on Hostinger.

## Notes

- The Admin gate on `/gallery` is a lightweight client-side passcode check
  (`NEXT_PUBLIC_ADMIN_PASSCODE`) meant to keep casual guests from bulk
  downloading photos - it is **not** a substitute for real authentication.
  Rotate/remove it after the event if that matters to you.
- Guests never need to log in - uploads use the Supabase anon key with a
  scoped Row Level Security policy that only allows `INSERT`/`SELECT` on
  `guestbook_photos` and uploads to the `wedding-moments` bucket.
