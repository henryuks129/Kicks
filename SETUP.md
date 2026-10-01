# Kicks integration deployment

The implementation uses Vercel Node functions and Supabase Postgres/Auth. No GitHub-to-Supabase connection is needed.

## Apply database migrations
In the Supabase SQL Editor, run these files in order, once:
1. supabase/migrations/202610010001_commerce.sql
2. supabase/migrations/202610010002_demo_catalog.sql

Alternatively use Supabase CLI migrations against the correct linked project. The seed preserves the existing six-product demo catalog; it does not add missing shoe assets.

## Vercel environment variables
Config: VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY, VITE_APP_URL, SUPABASE_URL, MAILGUN_DOMAIN, MAILGUN_FROM_EMAIL, MAILGUN_API_BASE_URL.
Secrets: SUPABASE_SECRET_KEY, PAYSTACK_SECRET_KEY, MAILGUN_API_KEY.
Optional Config: ENABLE_DEMO_PAYMENTS=true to expose a server-authorized simulated checkout.

Use sk_test_ credentials only. Live payments intentionally fail until real inventory reservation and seller-approved catalog data are implemented.
VITE_APP_URL must be the HTTPS deployed origin. MAILGUN_API_BASE_URL must be https://api.mailgun.net or https://api.eu.mailgun.net without a trailing slash.
Google credentials belong in Supabase's Google provider settings.

## Deploy and configure Paystack
Deploy the code after setting the variables. Test callback URL:
https://kicks-topaz-eight.vercel.app/payment/callback
Test webhook URL:
https://kicks-topaz-eight.vercel.app/api/paystack/webhook
Callback verification requires the signed-in customer. The signed webhook can finish an order independently.

## Email operation
Registration creates one welcome event; the authenticated app sends pending mail after session restoration. Successful order completion queues one receipt. Provider rejections are retried on subsequent sign-in or POST /api/commerce with action emails and a valid user bearer token, up to five attempts.
Sending events with uncertain outcomes are never automatically reclaimed: inspect Mailgun logs before manually resetting one to failed. Provider HTTP acceptance is recorded as sent, not proof of inbox delivery. A future reconciliation worker can automate this audit.
Sandbox recipient addresses must be verified in Mailgun. There is no background email scheduler in this release.

## Acceptance checks
Sign in, save profile, add a size, reload and verify cart persistence.
Test successful, cancelled, and declined Paystack payments. Replay verification and a webhook: one paid order and one receipt event must remain.
Use two accounts to verify RLS separation. Check email_events and Mailgun logs for receipts and welcome messages. Test/demo emails are labelled no money charged.
Local unit tests and builds do not prove cloud credentials or provider delivery.
