# ApplyJet AI — marketing + applications

Premium landing site and authenticated **applications** area for the **ApplyJet AI** Chrome extension (React, Vite, TypeScript, Tailwind CSS v4, Framer Motion, React Three Fiber, Supabase).

## Project structure

| Path | Purpose |
| --- | --- |
| `src/main.tsx` | App shell: router, auth provider, optional mouse spotlight |
| `src/routes.tsx` | Route table (`/`, `/login`, `/signup`, `/applications`, `/profile`, legal) |
| `src/pages/` | Home, auth, **`applications-page`**, **`profile-page`** (autofill + billing), legal |
| `src/components/landing/` | Marketing sections (hero, demo, pricing, etc.) |
| `src/components/layout/` | Header, footer, protected route |
| `src/components/ui/` | Reusable UI primitives (button, input, card, tabs) |
| `src/components/three/` | R3F hero scene |
| `src/components/effects/` | Cursor-follow glow |
| `src/context/auth-context.tsx` | Supabase session + `signOut` |
| `src/lib/supabase.ts` | Typed Supabase client |
| `src/lib/edge-function.ts` | `invokeEdgeFunction` helper |
| `src/types/database.ts` | Starter Postgres types |
| `supabase/schema.sql` | Tables, RLS, storage policies, auth trigger |
| `supabase/migrations/` | Incremental SQL (e.g. `users` + Stripe columns on `subscriptions`) |
| `supabase/functions/hello/` | Example Edge Function |
| `supabase/functions/stripe-checkout/` | Creates [Checkout Session](https://docs.stripe.com/api/checkout/sessions/create) (subscription mode) |
| `supabase/functions/stripe-customer-portal/` | Opens [Customer Portal](https://docs.stripe.com/api/customer_portal/sessions/create) |
| `supabase/functions/stripe-webhook/` | Syncs Stripe events into `public.subscriptions` |

## Environment variables

Copy `.env.example` to `.env` (or keep your existing `.env`).

- **`VITE_SUPABASE_URL`** / **`VITE_SUPABASE_ANON_KEY`** — from Supabase **Project Settings → API**. The Vite client only uses the **anon** key (never put the **service role** key in Vite env).
- **`VITE_STRIPE_PRICE_PRO`** — recurring **Price** id (`price_...`) from [Stripe Dashboard → Products](https://dashboard.stripe.com/products); used by **Go Pro** on `/profile`.
- **`VITE_STRIPE_PRICE_INTERN_PACK`** / **`VITE_STRIPE_PRICE_JUNIOR_PACK`** / **`VITE_STRIPE_PRICE_ADVANCED_PACK`** — one-time **Price** ids for credit packs on `/profile` → Billing.
- **`VITE_EXTENSION_DOWNLOAD_URL`** — Chrome Web Store listing or `.crx` / self-hosted URL used by every **Download extension** CTA.
- **`VITE_SUPABASE_EDGE_FUNCTION_NAME`** — optional: name for `supabase.functions.invoke` from your own UI (default: `hello`).
- **`VITE_X_SECRET_KEY`** — shared secret the app sends as `X-Secret-Key` to some Edge Functions (must match the function secret `X-SECRET-KEY`).

## Auth flow

1. `AuthProvider` calls `supabase.auth.getSession()` once, then subscribes with `onAuthStateChange`.
2. Session persistence uses Supabase’s default browser storage.
3. **`/login`** and **`/signup`** use `signInWithPassword` / `signUp`. OAuth buttons call `signInWithOAuth` (enable Google/GitHub in **Authentication → Providers** and add redirect URLs).
4. **`ProtectedRoute`** wraps **`/applications`** and **`/profile`**: unauthenticated users go to **`/login`** with `state.from` preserved.

## Run locally

```bash
npm install
npm run dev
```

Build:

```bash
npm run build && npm run preview
```

## Run Stripe locally

Use **test mode** keys and the [Stripe CLI](https://stripe.com/docs/stripe-cli) so Checkout and webhooks hit your machine.

### 1. Prerequisites

1. Install the Stripe CLI and log in:

```bash
brew install stripe/stripe-cli/stripe   # macOS
stripe login
```

2. Install the [Supabase CLI](https://supabase.com/docs/guides/cli) and link the project (`supabase link`).
3. In Stripe **Test mode**, create Products/Prices for Pro (recurring) and Intern / Junior / Advanced (one-time). Put the `price_...` ids in `.env` as `VITE_STRIPE_PRICE_*`.
4. Put the matching **test** secret key in Edge Function secrets as `STRIPE_SECRET_KEY` (`sk_test_...`).

### 2. Serve Edge Functions locally

In one terminal, serve the Stripe functions (Docker required for `supabase functions serve`):

```bash
supabase functions serve stripe-checkout --env-file .env.local --no-verify-jwt
```

Or serve all functions:

```bash
supabase functions serve --env-file .env.local --no-verify-jwt
```

Create `.env.local` (or use `supabase secrets` / Dashboard secrets) with at least:

```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_INTERN_PACK=price_...
STRIPE_PRICE_JUNIOR_PACK=price_...
STRIPE_PRICE_ADVANCED_PACK=price_...
X-SECRET-KEY=same-as-VITE_X_SECRET_KEY
# SUPABASE_URL / ANON / SERVICE_ROLE are usually injected when linked;
# set them explicitly if serve does not inject them.
```

Point the Vite app at the local functions URL if you are not using the hosted project URL (default local gateway is typically `http://127.0.0.1:54321/functions/v1`). For a linked remote project, `supabase.functions.invoke` still calls the **deployed** project URL — deploy the functions, or temporarily point `VITE_SUPABASE_URL` at local Supabase if you run the full local stack.

### 3. Forward webhooks with Stripe CLI

In a second terminal, forward Stripe events to the local webhook:

```bash
stripe listen --forward-to http://127.0.0.1:54321/functions/v1/stripe-webhook
```

If the webhook is deployed on Supabase instead of local serve:

```bash
stripe listen --forward-to https://<project-ref>.supabase.co/functions/v1/stripe-webhook
```

The CLI prints a signing secret like `whsec_...`. Set that as **`STRIPE_WEBHOOK_SECRET`** for the webhook function (restart `functions serve` after changing it, or `supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...` for hosted).

Listen for the events this app handles:

```bash
stripe listen \
  --events checkout.session.completed,customer.subscription.created,customer.subscription.updated,customer.subscription.deleted,invoice.paid \
  --forward-to http://127.0.0.1:54321/functions/v1/stripe-webhook
```

### 4. Exercise checkout

1. Start the app: `npm run dev`.
2. Sign in → **Profile → Billing**.
3. Click **Go Pro** (subscription) or a pack (**Intern / Junior / Advanced**, one-time).
4. Pay with a [test card](https://docs.stripe.com/testing#cards), e.g. `4242 4242 4242 4242`, any future expiry, any CVC.
5. Confirm in the `stripe listen` terminal that events are received `200`, and that `user_subscriptions` / `user_usage` update in Supabase.

### 5. Customer Portal (optional)

Enable the [Customer portal](https://dashboard.stripe.com/settings/billing/portal) in test mode. **Manage billing** on `/profile` opens a portal session for the stored `stripe_customer_id`.

### Quick checklist

| Step | Command / action |
| --- | --- |
| CLI auth | `stripe login` |
| App env | `VITE_STRIPE_PRICE_PRO` + pack price ids |
| Functions | `supabase functions serve … --env-file .env.local` |
| Webhooks | `stripe listen --forward-to …/stripe-webhook` |
| Signing secret | Copy `whsec_…` → `STRIPE_WEBHOOK_SECRET` |
| App | `npm run dev` → Profile → Billing |

## Supabase database & storage

1. In the Supabase SQL editor, run `supabase/schema.sql` (greenfield), **or** apply `supabase/migrations/20260320120000_users_and_stripe.sql` on an existing project that already ran the older schema.
2. Confirm a **private** Storage bucket named **`resumes`** exists (the script inserts the bucket row; tune policies if your project already defines storage rules).
3. Sign up — the auth trigger creates **`profiles`**, **`users`** (autofill profile), and a stub **`subscriptions`** row; the client also ensures **`subscriptions`** / optional **`user_usage`** when possible.
4. **`/profile`** — edit **`public.users`** (name, address, expected salary, summary, etc.) for autofill; **Billing** tab calls Stripe Edge Functions when configured.
5. Authenticated **`/applications`** lists **`applications`** for `user_id = auth.uid()`.

## Edge Functions

1. Install the [Supabase CLI](https://supabase.com/docs/guides/cli) and link your project.
2. Deploy: `supabase functions deploy hello` (sample), plus:
   - `supabase functions deploy stripe-checkout` (keep **Verify JWT** on — the app sends the user session)
   - `supabase functions deploy stripe-customer-portal` (same)
   - `supabase functions deploy stripe-webhook --no-verify-jwt` (Stripe calls this; no Supabase JWT)
3. **Secrets** (Dashboard → Edge Functions → Secrets, or CLI `supabase secrets set`):
   - `STRIPE_SECRET_KEY` — from Stripe API keys (**test** for local, **live** for production).
   - `STRIPE_WEBHOOK_SECRET` — signing secret from the webhook endpoint or from `stripe listen` (`whsec_...`).
   - `STRIPE_PRICE_PRO` — optional fallback if the client does not send `priceId` (same value as `VITE_STRIPE_PRICE_PRO`).
   - `STRIPE_PRICE_INTERN_PACK` / `STRIPE_PRICE_JUNIOR_PACK` / `STRIPE_PRICE_ADVANCED_PACK` — used by `stripe-webhook` to map one-time Checkout sessions to credit grants.
   - `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` — often injected by Supabase; the webhook **must** use the **service role** to update `user_subscriptions` / `user_usage` (bypasses RLS).
4. In **Stripe Dashboard → Developers → Webhooks**, add the deployed **`stripe-webhook`** URL and select events: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`. For local work, prefer **`stripe listen`** instead of a Dashboard endpoint.
5. Enable **Customer portal** in Stripe: [Settings → Billing → Customer portal](https://dashboard.stripe.com/settings/billing/portal).
6. **Flow (how Stripe pieces fit together)**  
   - **[Checkout](https://docs.stripe.com/payments/checkout)** — hosted page; we create a **Checkout Session** in **subscription** mode (Pro) or **payment** mode (packs) with a **Price** (`line_items`).  
   - **[Customer Portal](https://docs.stripe.com/customer-management)** — hosted self-service for payment method, invoices, and cancel; we create a short-lived **billing portal session** for the same **Customer** id we stored in `user_subscriptions.stripe_customer_id`.  
   - **Webhooks** — the only trusted way to mirror subscription state and pack credits in your DB; the client never sets `plan`/`status` from checkout success alone.

`invokeEdgeFunction` in `src/lib/edge-function.ts` sends the logged-in user’s JWT automatically for `stripe-checkout` and `stripe-customer-portal`.

## Where to wire the real extension

- **`src/lib/constants.ts`** → `LINKS.extensionDownload` reads `import.meta.env.VITE_EXTENSION_DOWNLOAD_URL`.
- All CTAs use that constant or the same env via `LINKS`.

## Notes

- Legal pages are **placeholders** — replace with counsel-reviewed copy.
- Tune RLS and Storage policies before production; the schema is a **starter**.
