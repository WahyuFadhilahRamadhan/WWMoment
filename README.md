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
  screen slideshow, a tap-to-enlarge lightbox, and a global filter toggle
  for the projector display. There is no visible "Admin" control on this
  page on purpose (see below).
- **Hidden admin panel (`/admin`)** - not linked from anywhere in the UI.
  Enter the passcode there to enable, on that device only, per-photo
  download, per-photo delete, and CSV metadata export on `/gallery`.
- **Optional venue geofence** - restrict the upload page to guests
  physically near the venue, checked via the browser's GPS. Fully optional;
  disabled unless you set venue coordinates (see below).
- **Supabase backend** - a public `wedding-moments` storage bucket and a
  `guestbook_photos` table, fully defined in [`schema.sql`](./schema.sql).

## Getting started

### 1. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor -> New query**, paste the full contents of
   [`schema.sql`](./schema.sql), and run it. This creates the
   `guestbook_photos` table, RLS policies, Realtime registration, and the
   `wedding-moments` storage bucket + policies.
3. Copy your **Project URL**, **anon public key**, and **service_role
   secret key** from **Settings -> API**.

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret-key
ADMIN_PASSCODE=choose-a-passcode

# Optional - leave both empty to disable the venue location check
NEXT_PUBLIC_VENUE_LAT=
NEXT_PUBLIC_VENUE_LNG=
NEXT_PUBLIC_VENUE_RADIUS_METERS=500
```

### 3. Install dependencies & run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the upload page,
and [http://localhost:3000/gallery](http://localhost:3000/gallery) for the
live gallery. Visit `/admin` (not linked anywhere) to unlock admin mode.

## Project structure

```
src/
  app/
    page.tsx               # Guest upload page
    gallery/page.tsx        # Live gallery + slideshow (server component,
                              # reads the admin cookie)
    admin/page.tsx            # Hidden passcode-gated admin unlock page
    api/admin/
      login/route.ts           # Verifies passcode, sets httpOnly admin cookie
      logout/route.ts           # Clears the admin cookie
      delete-photo/route.ts      # Deletes a photo (cookie-gated, service role)
    layout.tsx                    # Fonts, theme, global shell
    globals.css                    # Wedding theme tokens + filter CSS classes
  components/
    UploadForm.tsx                 # Main upload flow
    LocationGate.tsx                # Optional GPS venue-proximity gate
    FilterSelector.tsx               # Filter preset picker/preview
    SuccessModal.tsx                   # Confetti + success modal
    GalleryView.tsx                      # Realtime grid/slideshow + admin actions
    PhotoCard.tsx / PhotoLightbox.tsx
    Slideshow.tsx
    AdminUnlockForm.tsx                    # Passcode form used on /admin
  lib/
    supabase.ts                             # Public (anon key) Supabase client
    supabaseAdmin.ts                          # Server-only service role client
    adminAuth.ts                               # Admin cookie hashing/verification
    adminApi.ts                                 # Client helpers for /api/admin/*
    geofence.ts                                  # Venue distance/geofence helpers
    types.ts                                      # Shared TypeScript types
    filters.ts                                     # Filter preset definitions
    compressImage.ts                                # Client-side image compression
    uploadPhoto.ts                                   # XHR upload w/ progress
    downloadPhotos.ts                                 # Admin CSV/photo export helpers
schema.sql                                       # Supabase DB + storage init
HOSTINGER_SETUP.md                                # Hostinger -> Vercel domain guide
```

## Deployment

1. Push to GitHub, import the repo into [Vercel](https://vercel.com/new).
2. Add the four environment variables above in Vercel's project settings.
   `SUPABASE_SERVICE_ROLE_KEY` and `ADMIN_PASSCODE` must **not** be
   prefixed with `NEXT_PUBLIC_` - they are server-only secrets.
3. Deploy. See [`HOSTINGER_SETUP.md`](./HOSTINGER_SETUP.md) for wiring up a
   custom domain purchased on Hostinger.

## Venue location gate

If `NEXT_PUBLIC_VENUE_LAT` and `NEXT_PUBLIC_VENUE_LNG` are set, the upload
page (`/`) asks the guest's browser for their GPS location before showing
the form, and only lets them through if they're within
`NEXT_PUBLIC_VENUE_RADIUS_METERS` (default 500m) of the venue. Guests
outside that radius, or who deny location access, see a friendly message
instead of the form, with a "Try Again" button.

This uses the browser's built-in Geolocation API - no extra service or key
needed. It requires HTTPS in production (Vercel provides this
automatically) since browsers block geolocation on plain HTTP. Leave the
two coordinates empty to disable this check entirely and let anyone with
the link upload from anywhere.

## Admin mode & security notes

- `/gallery` shows nothing indicating an admin feature exists - no button,
  no badge. This is deliberate, to avoid inviting guests to poke at it.
- Admin mode is unlocked at the hidden `/admin` route (not linked from the
  UI, and marked `noindex` for search engines). Entering the correct
  passcode calls `POST /api/admin/login`, which sets an **httpOnly** cookie
  containing a hash of the passcode - client-side JavaScript can never read
  or forge this cookie, and the passcode itself never ships in the browser
  bundle (unlike a `NEXT_PUBLIC_*` variable would).
- Deleting a photo (`POST /api/admin/delete-photo`) is only possible from a
  request carrying that valid cookie. The route then uses the Supabase
  **service_role** key server-side to remove both the storage file and the
  database row, bypassing RLS. The anon key used by the public app never
  has delete permission at the database level.
- Guests never need to log in to upload - uploads use the Supabase anon key
  with a scoped Row Level Security policy that only allows
  `INSERT`/`SELECT` on `guestbook_photos` and uploads to the
  `wedding-moments` bucket.
