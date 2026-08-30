# Connecting a Hostinger Domain to Vercel

This guide walks through pointing a domain (or subdomain) purchased on
Hostinger at your WWMoment app deployed on Vercel.

## 1. Deploy the project to Vercel

1. Push this repository to GitHub (already done if you're reading this from
   the repo).
2. Go to [vercel.com/new](https://vercel.com/new) and import the
   `WWMoment` GitHub repository.
3. Add the environment variables from `.env.example` in the Vercel project
   settings (**Settings -> Environment Variables**):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_ADMIN_PASSCODE`
4. Deploy. You'll get a default `*.vercel.app` URL - confirm the app works
   there first before wiring up the custom domain.

## 2. Add your domain in Vercel

1. In your Vercel project, go to **Settings -> Domains**.
2. Enter your domain (e.g. `ourwedding.com`) or subdomain (e.g.
   `moments.ourwedding.com`) and click **Add**.
3. Vercel will show you the DNS records it needs. Typically:
   - **Root domain** (`ourwedding.com`): an `A` record pointing to
     `76.76.21.21`
   - **Subdomain** (`moments.ourwedding.com` or `www.ourwedding.com`): a
     `CNAME` record pointing to `cname.vercel-dns.com`

   Keep this tab open - you'll copy these exact values into Hostinger next.

## 3. Update DNS records on Hostinger

1. Log in to [hpanel.hostinger.com](https://hpanel.hostinger.com).
2. Go to **Domains** -> select your domain -> **DNS / Nameservers**.
3. Make sure the domain is using **Hostinger's default nameservers** (not
   pointed elsewhere) so DNS records you add here actually take effect.
4. Add the record(s) Vercel gave you:

   **Option A - Subdomain (recommended, e.g. `moments.ourwedding.com`)**
   | Type  | Name/Host | Points to / Value       | TTL  |
   |-------|-----------|--------------------------|------|
   | CNAME | `moments` | `cname.vercel-dns.com`   | 3600 |

   **Option B - Root/apex domain (e.g. `ourwedding.com`)**
   | Type | Name/Host | Points to / Value | TTL  |
   |------|-----------|--------------------|------|
   | A    | `@`       | `76.76.21.21`      | 3600 |

   Optionally also add a `www` CNAME pointing to `cname.vercel-dns.com` so
   both `ourwedding.com` and `www.ourwedding.com` work.

5. Remove or edit any conflicting existing `A`/`CNAME` records for the same
   host (Hostinger sometimes ships a default "parked page" `A` record that
   needs to be deleted first).
6. Save changes.

## 4. Verify in Vercel

1. Back in Vercel's **Domains** tab, click **Refresh** next to your domain.
2. DNS propagation usually takes a few minutes, but can take up to 24-48
   hours worldwide. Vercel will show a green checkmark once it verifies the
   record and issues an SSL certificate automatically.
3. Once verified, both `https://your-domain` and the `*.vercel.app` URL will
   serve the app; you can generate a fresh QR code pointing at your custom
   domain for guests to scan on the wedding day.

## 5. Troubleshooting

- **"Invalid Configuration" in Vercel**: double-check you copied the exact
  record type (A vs CNAME) and value Vercel showed - it's specific to your
  project.
- **Still not resolving after 24h**: confirm the domain's nameservers in
  Hostinger are the default Hostinger ones (custom/foreign nameservers mean
  DNS is managed elsewhere, not in hPanel).
- **SSL certificate pending**: this resolves automatically once DNS
  verification succeeds - no action needed on Hostinger's side.
