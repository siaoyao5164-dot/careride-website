# CareRide – Penang

**More Than a Ride, We Care.**

The website for CareRide, a private car transport and hospital accompaniment service in Penang, Malaysia (Bukit Mertajam, Perai, Seberang Jaya, Butterworth and Penang Island). It's one fast, mobile-friendly page with:

- Hero, services, price estimate, customer rewards, FAQ, testimonials and contact sections
- A full **EN | BM | 中文** language switch. The visitor's choice is remembered for their next visit, and English is the default.
- **Light / dark mode** toggle (follows the device setting on the first visit and remembers the choice)
- A **price estimate** from the real road distance between the customer's exact pickup and destination, with vouchers applied
- **Customer registration, RM8 First Ride Vouchers and RM5 referral rewards**, stored in Netlify Database
- **Book via WhatsApp** (`https://wa.me/601136224566`): creates a booking with a reference number, reserves the chosen voucher and opens WhatsApp with every detail filled in. Bookings are clearly marked as *not confirmed* until CareRide replies.
- A private **admin dashboard** at `/admin` (bookings, customers, vouchers, referrals, history, reviews, CSV export)
- SEO foundations: page title, meta description, keywords, H1/H2/H3 structure, Open Graph tags, LocalBusiness and FAQ structured data (JSON-LD), `sitemap.xml`, `robots.txt`, canonical URL

## Admin dashboard setup (one time)

1. In the Netlify dashboard, open **Identity** for this project, set **Registration** to **Invite only**, and click **Invite users** to invite your own email.
2. Accept the invite from the email and choose a password (the link opens the admin sign-in page).
3. Back in Identity, open your user, add the role `admin`, and save. (Alternatively set the environment variable `ADMIN_EMAILS` to your email.)
4. Sign in at `/admin`.

Daily use: when a WhatsApp booking arrives, check it came from the same number as the booking, press **Confirm**, and press **Complete** after the trip. Vouchers are only redeemed when a booking is completed; **Cancel** gives them back.

## Key technologies

TanStack Start (React 19) · Tailwind CSS 4 · Vite · TypeScript · Netlify (hosting + Image CDN)

## Run locally

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm test       # pricing, phone validation and voucher/referral rule tests
```

## How to update the website

| What you want to change | File |
| --- | --- |
| Fares: per-km rate, minimum fare, crossing charge, peak-hour charge and times, accompaniment prices | `src/config/pricing.ts` |
| Voucher amounts, expiry days, vouchers per booking, referral reward timing, anti-abuse limits | `src/config/rewards.ts` |
| WhatsApp number, website address, minimum booking days, SEO title/description/keywords, Google verification code | `src/config/business.ts` |
| Any wording, in any language | `src/i18n/translations.ts` |
| Colours and fonts | `src/styles.css` |

### How the estimate is calculated

```
transport     = road km × RM3.6 per one-way trip (minimum RM25), × 2 for a round trip
crossing      = + RM18 per mainland ↔ island trip (its own line in the estimate)
peak hours    = + RM10 per trip starting 7:30–9:00am or 5:00–7:00pm
accompaniment = RM90 for the first 2 hours + RM20 per extra hour (minimum 2 hours)
subtotal      = transport + crossing + peak + accompaniment
final         = subtotal − voucher (vouchers only reduce transport, crossing and peak; never below RM0)
```

The per-km rate is used in the calculation but is not shown to customers.

## Google Search Console (help Google find the site)

1. Go to <https://search.google.com/search-console> and sign in with your Google account.
2. Click **Add property** → choose **URL prefix** → enter `https://careride-website.netlify.app/` (or your custom domain).
3. Choose the **HTML tag** verification method. Google shows a tag like
   `<meta name="google-site-verification" content="abc123..." />`.
4. Copy only the `content` value (`abc123...`) into `googleSiteVerification` in `src/config/business.ts` and deploy.
5. Back in Search Console, click **Verify**.
6. Open **Sitemaps** and submit `sitemap.xml`.
7. Optional but recommended: create a free **Google Business Profile** for CareRide (Penang) and link to this website. It helps a lot with local searches like "hospital transport Penang".

If you move to a custom domain, update `siteUrl` in `src/config/business.ts`, plus the URLs in `public/robots.txt` and `public/sitemap.xml`.

> SEO note: this site gives Google a strong, accurate foundation. No website can guarantee a first-page or first-position ranking. Rankings depend on Google, competition, reviews and time.

## Possible next steps

- Map-based distance calculation from the exact addresses (needs a maps API key, e.g. Google Maps)
- A small password-protected admin page to edit fares without touching code
- Real customer reviews, once you have them (with customers' permission)
