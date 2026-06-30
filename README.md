# Hariprabodham Sweets — Diwali storefront (Next.js)

A one-page Diwali storefront with a cart drawer and multi-step checkout (cart → details → payment → confirmation), wired to Razorpay with a demo fallback. Converted from an original single-file HTML prototype.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

This works out of the box: with no `.env`, checkout runs in **demo mode**, orders are
**not** persisted, and confirmation emails are **logged to the console** instead of sent.
Configure the env vars below to turn each feature on.

## Where to edit things

Everything you'll routinely change lives in **`lib/config.ts`**:

- **Prices** — `katli`, `pak`, `bulkKatliPerKg`, `bulkPakPerKg` (`mrp` is the struck-through "before" price)
- **Dates** — `DIWALI`, `CUT_REGULAR_DAYS`, `CUT_BULK_DAYS`, `DELIVER_BY`
- **Delivery** — `deliveryMumbai`, `deliveryOutside` (placeholder — set your courier rate), `emergencyMumbai`
- **Contacts** — `WHATSAPP`, `PHONE`, `INSTAGRAM`
- **Cause** — `CAUSE_HTML` (shown in the "Why we do this" section)
- Reviews and FAQ are the `REVIEWS` and `FAQ` exports in the same file.

**Payments** live in environment variables, not `config.ts` — see below.

## Project structure

```
app/
  layout.tsx      fonts (next/font), metadata, CartProvider, Razorpay script
  page.tsx        composes the sections
  globals.css     the full design (CSS variables, all component styles)
  icon.svg        favicon
  api/razorpay/
    order/route.ts    creates the Razorpay order (server re-computes the amount)
    verify/route.ts   verifies the payment signature (HMAC-SHA256)
    webhook/route.ts  backstop: confirms + emails from Razorpay's server-to-server event
components/        one file per section + CartDrawer (the checkout)
lib/
  config.ts       prices, dates, contacts, reviews, FAQ, helpers
  pricing.ts      server-side price authority (used by the API)
  cart-context.tsx  shared cart + drawer state
  prisma.ts       lazy PrismaClient (null when DATABASE_URL unset)
  orders.ts       persist order / mark paid / mark emailed
  email.ts        Nodemailer confirmation (HTML + text)
prisma/
  schema.prisma   Order + OrderItem models
```

## Payments (Razorpay)

Checkout uses a real two-step server flow:

1. **`POST /api/razorpay/order`** — the server re-derives the amount from `lib/pricing.ts`
   (it never trusts the price the browser sends), then creates a Razorpay order.
2. Razorpay Checkout opens against that order.
3. **`POST /api/razorpay/verify`** — the server verifies the `razorpay_signature`
   (`HMAC-SHA256(order_id|payment_id, key_secret)`) before the order is confirmed.

### Going live

1. Copy `.env.example` → **`.env`** (not `.env.local` — Prisma's CLI reads `.env`) and fill it in.
2. Restart `npm run dev` (env changes need a restart). Use the `rzp_test_…` key first.

The **secret never reaches the browser** — only the public key id is sent back from the
order route at runtime. While the keys are unset (or left as `XXXX` placeholders), checkout
stays in **demo mode**: it confirms an order without charging, so the site still works.

## Order storage (PostgreSQL via Prisma)

Every order is saved — at create time as `PENDING` (or `DEMO`), then flipped to `PAID`
once the payment signature verifies. Amounts are stored as whole-rupee integers; line
items live in a related `OrderItem` table.

**One-time setup** (after putting `DATABASE_URL` in `.env`):

```bash
createdb hariprabodham          # or create the DB in pgAdmin
npm run db:migrate              # prisma migrate dev — creates the tables
```

**Track / browse orders** with the built-in GUI — no admin panel needed:

```bash
npm run db:studio               # opens Prisma Studio at http://localhost:5555
```

If `DATABASE_URL` is unset, persistence is skipped (logged), and the rest of checkout
still works.

## Confirmation email (SMTP via Nodemailer)

On a confirmed order the customer is emailed a branded receipt (set `SHOP_EMAIL` to also
BCC yourself for tracking). Configure `SMTP_*` and `MAIL_FROM` in `.env`. When SMTP is
unset, the email is logged to the console instead of sent — nothing breaks.

- **Demo orders** email immediately from the order route.
- **Live (Razorpay) orders** email from the verify route, *after* the signature check —
  this reads the order back from the DB, so live-payment emails require `DATABASE_URL`.

## Webhook backstop

If a customer pays but closes the tab before the browser's verify call runs, the order
would otherwise stay `PENDING`. The webhook fixes that: Razorpay calls it server-to-server,
and it marks the order `PAID` + sends the email. Both the verify route and the webhook funnel
through one `confirmAndEmail` helper, so whichever lands first wins and the email is sent
**once** (it checks `emailSent` first).

Set up in the Razorpay dashboard → Settings → Webhooks:

- **URL:** `https://your-domain.com/api/razorpay/webhook`
- **Secret:** any random string → also put it in `.env` as `RAZORPAY_WEBHOOK_SECRET`
  (this is a *separate* secret from the API key secret)
- **Events:** `payment.captured`, `order.paid`

The signature is verified against the raw request body; unconfigured or invalid requests are
rejected (or acknowledged-and-ignored) without touching any data. To test against `localhost`,
expose it with a tunnel (e.g. `ngrok http 3000`) and use the tunnel URL in the dashboard.

> Still optional for hardening: rate-limiting the API routes (e.g. with Upstash) — not added yet.
