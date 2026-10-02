# Kicks integration deployment

The implementation uses Vercel Node functions and Supabase Postgres/Auth. No GitHub-to-Supabase connection is needed.

## Apply database migrations
In the Supabase SQL Editor, run these files in order, once:
1. supabase/migrations/202610010001_commerce.sql
2. supabase/migrations/202610010002_demo_catalog.sql
3. supabase/migrations/202610020001_signin_email.sql
4. supabase/migrations/202610020002_reference_catalog.sql

Alternatively use Supabase CLI migrations against the correct linked project. The reference catalog migration adds six image-backed demo products and EU 39–45 variants. Prices and stock remain illustrative until seller data is confirmed. Apply it to the connected Supabase project before these products appear in the storefront.

## Vercel environment variables
Config: VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY, VITE_APP_URL, MAILERSEND_FROM_EMAIL, MAILERSEND_FROM_NAME, MAILERSEND_REPLY_TO_EMAIL. The server uses the same VITE_SUPABASE_URL as the browser.
Secrets: SUPABASE_SECRET_KEY, PAYSTACK_SECRET_KEY, MAILERSEND_API_KEY.
Optional Config: ENABLE_DEMO_PAYMENTS=true to expose a server-authorized simulated checkout.

## Customer emails

Paystack's automatic transaction email is separate from the Kicks MailerSend receipt. Kicks sends one welcome email after account creation, a sign-in notice once per verified Google session, and an order receipt only after server-side payment verification. Token refreshes do not count as new sign-ins. Welcome and sign-in recipients come from the authenticated customer's account email; receipt recipients come from the signed-in customer and saved order. `MAILERSEND_REPLY_TO_EMAIL` is where replies are delivered. It does not select who receives these messages.

MailerSend requires an authorized sender and an API token with email-send access. The sender email and display name identify Kicks; the reply-to address should be an inbox monitored by the store owner.

Create a local MailerSend API token and configure the four `MAILERSEND_*` variables in the server environment. Keep the existing Resend credentials in local/deployment settings until MailerSend delivery is verified; the current code no longer reads them. Do not share API tokens or commit environment files.

Verify in order: sign in and inspect MailerSend Activity for a sign-in notice; check the inbox and spam folder; place a simulated order and confirm its receipt says no money was charged; then test Paystack test checkout. A returning customer must not receive another welcome email. Test welcome delivery only with a genuinely new permitted account. Refreshing an existing session must not resend the sign-in message. A `202` response and `x-message-id` indicate MailerSend accepted/queued the message, not that it reached the inbox.

Use sk_test_ credentials only. Live payments intentionally fail until real inventory reservation and seller-approved catalog data are implemented.
VITE_APP_URL must be the HTTPS deployed origin.
Google credentials belong in Supabase's Google provider settings.

## Deploy and configure Paystack
Deploy the code after setting the variables. Test callback URL:
https://kicks-topaz-eight.vercel.app/payment/callback
Test webhook URL:
https://kicks-topaz-eight.vercel.app/api/paystack/webhook
Callback verification requires the signed-in customer. The signed webhook can finish an order independently.

## Email operation
Registration creates one welcome event; a verified sign-in creates one event per Supabase session; successful order completion queues one receipt. Provider rejections are retried on subsequent sign-in or POST /api/commerce with action emails and a valid user bearer token, up to five attempts.
Sending events with uncertain outcomes are never automatically reclaimed: inspect MailerSend Activity using the `x-message-id` before manually resetting one to failed. Provider HTTP acceptance is recorded as sent, not proof of inbox delivery. A future reconciliation worker can automate this audit.
There is no background email scheduler in this release.

## Acceptance checks
Sign in, save profile, add a size, reload and verify cart persistence.
Test successful, cancelled, and declined Paystack payments. Replay verification and a webhook: one paid order and one receipt event must remain.
Use two accounts to verify RLS separation. Check email_events and MailerSend Activity for receipts and welcome messages. Test/demo emails are labelled no money charged.
Local unit tests and builds do not prove cloud credentials or provider delivery.

## Receipt product images and sign-out cart

Receipts resolve each ordered variant to its catalog image and embed a small PNG thumbnail as a MailerSend inline attachment. npm run dev and npm run build regenerate public/receipt-products from public/products; Vercel functions explicitly include these thumbnails. No public image URL is needed for bundled catalog products, including local testing. HTTPS image URLs remain a fallback for external or missing catalog images. Catalog images are resolved at sending time, rather than snapshotted at purchase. Existing delivered emails do not change; create a new test order to verify this fix.

Signing out copies the current cart into guest storage on the same browser. Signing back in merges quantities using the larger saved quantity, rather than adding them twice.
