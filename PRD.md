# Kicks Storefront — PRD

## Product decision

Build Kicks, a sneaker shop featuring Nike, Adidas, Puma and selected sports and slip-on silhouettes. Use the supplied shoe images as edited cutouts. Prices, exact model identities and stock availability are demo fixtures until seller confirmation.

## Assignment baseline vs project scope

The attached assignment asks for a shop website with checkout, persistent data, Google authentication, and confirmation email. This project uses Supabase for database and auth, MailerSend for email, and Paystack for payment. It also adds profile details, a welcome email, receipt email, a motion hero, strict secret handling, and duplicate-code prevention.

## Primary user journey

Discover shoes → view product details → select EU size → add to cart → sign in/register → enter delivery details → choose Paystack or clearly labelled demo payment → receive custom Kicks receipt by email → view order status.

## MVP requirements

1. Sneaker landing page with isolated product imagery and a “Find your next pair” CTA. Burnt-orange product image stage with lift and 360-degree image rotation on hover or explicit spin control; reduced-motion fallback required.
2. Small product catalog and product detail view.
3. Cart with quantity controls, removal, subtotal, and empty state.
4. Google sign-in, registration fallback if enabled, session persistence, and logout.
5. Checkout form for full name, email, phone, and delivery address with validation and error recovery.
6. Paystack checkout with server-side transaction verification.
7. Demo payment mode for development: creates a test transaction/order only when explicitly enabled; no real charge.
8. Supabase records for profiles, products, orders, and order items, protected with RLS.
9. MailerSend welcome email after first registration and order confirmation/receipt after verified order processing.
10. Order success page with order reference and status; do not show success before persistence/payment handling succeeds.

## Email strategy without real payment

Use two safe paths:

- Registration: trigger a welcome email from the auth/profile flow, guarded by a `welcome_email_sent_at` field or equivalent idempotency record.
- Orders: use a demo-payment feature flag in development/staging. The demo endpoint must create an explicitly `demo_paid` order and call the same receipt-mail service used after Paystack verification. The email must say “Demo order” or equivalent so it cannot be confused with a real charge.

MailerSend requires an authorized sender/domain and a server-side API token. Record provider setup and delivery as a separate verification step, not as a code failure.

## Out of scope

Inventory management, discounts, reviews, subscriptions, shipping carrier integration, refunds, multi-vendor support, customer analytics, and a large admin dashboard.

## Acceptance criteria

- A user can sign in with Google, log out, add products to cart, submit required details, and see their own order.
- Invalid checkout input preserves entered values and explains how to recover.
- Demo payment can trigger a visibly labelled test receipt without charging money.
- A real Paystack order is marked paid only after server verification.
- Welcome email is sent once per registration, not once per login.
- Receipt email is sent only after an order is successfully processed; retries are idempotent.
- No secrets appear in source, logs, commits, or generated artifacts.
