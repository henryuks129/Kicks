# Kicks production deployment checkpoint

Objective: push current storefront, configure MailerSend in Vercel Production, and apply the six-product Supabase catalog migration.

Repository: henryuks129/Kicks, branch main.
Vercel project: henryuks129s-projects/kicks.
Storefront: https://kicks-topaz-eight.vercel.app
Supabase project: pcfgvjircqriwdacvtgh.

Local validation: all 26 tests passed; Vite production build passed; Fallow reported no duplication; git diff check passed. Database tests now exercise the sign-in and reference catalog migrations and verify repeated catalog application preserves existing stock. Receipt thumbnails are embedded using MailerSend inline attachments and included in Vercel functions. Cart items persist on sign-out in the same browser. Payments remain in test mode.

Production configuration pending verification:
- MAILERSEND_API_KEY
- MAILERSEND_FROM_EMAIL
- MAILERSEND_FROM_NAME
- MAILERSEND_REPLY_TO_EMAIL
- VITE_APP_URL=https://kicks-topaz-eight.vercel.app

Do not read or copy local environment files; the user enters the four MailerSend values directly in Vercel Production. No secrets belong in this checkpoint.

Supabase: a read-only catalog/schema check was submitted in SQL Editor, but browser disconnected before results were confirmed. No production write migration has been submitted in this deployment session. Apply pending migration 202610020001_signin_email.sql if necessary, followed by 202610020002_reference_catalog.sql, to the project above. Catalog migration is transactional, rerunnable, adds six products and EU 39-45 variants, and preserves existing variant stock.

Resume: verify Git remote HEAD; reconnect Chrome; verify the four Production variable names without revealing their values; execute the migrations in Supabase SQL Editor; verify 12 total catalog products and seven sizes per new product; confirm Vercel deployment corresponds to latest main commit; test a new receipt with embedded thumbnails. Existing delivered receipts do not change.
