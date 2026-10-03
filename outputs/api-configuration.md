# API configuration template

Placeholders only. Do not put actual credentials in this document.
These are placeholders documenting the configuration used by the current storefront and server API. Do not paste real credentials into this file.

## React / Vite public configuration

Copy these into your local `.env.local` yourself. Only public values belong in VITE_ variables, which are exposed to the browser.

```dotenv
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

## Server configuration

Set these in the backend deployment's secrets/settings when the backend is connected. Never prefix these secrets with VITE_.

```dotenv
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SECRET_KEY=YOUR_SUPABASE_SECRET_KEY
PAYSTACK_SECRET_KEY=YOUR_PAYSTACK_TEST_SECRET_KEY
MAILERSEND_API_KEY=YOUR_MAILERSEND_API_TOKEN
MAILERSEND_FROM_EMAIL=EXACT_SENDER_FROM_MAILERSEND
MAILERSEND_FROM_NAME=Kicks
MAILERSEND_REPLY_TO_EMAIL=YOUR_ACTUAL_INBOX
MAILERSEND_DOMAIN_ID=YOUR_MAILERSEND_DOMAIN_ID
CRON_SECRET=YOUR_STRONG_RANDOM_CRON_SECRET
VITE_APP_URL=https://YOUR_STOREFRONT_ORIGIN
ENABLE_DEMO_PAYMENTS=false
```

The MailerSend sender address must be authorized for a sending domain in your account. Keep the previous Resend credentials until MailerSend is verified, then remove them from the environment. Use matching Paystack test keys during development. Demo payment enablement is enforced by the backend, never by a browser checkbox alone.

## Google OAuth — configure in Supabase

Google authentication uses an OAuth client ID and client secret, not a Google API key. For hosted Supabase, enter these directly in Supabase's Google provider settings. They are not React environment variables:

```dotenv
# Documentation labels only; these are not consumed by the app.
GOOGLE_CLIENT_ID=YOUR_GOOGLE_OAUTH_WEB_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_OAUTH_CLIENT_SECRET
```

Create a Web application OAuth client in Google Cloud. Add the callback URL shown by Supabase's Google provider settings to Google's authorized redirect URIs (normally https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback). Enable Google in Supabase and enter the client ID and secret there. Configure the app's site URL and allowed redirect URLs in Supabase to match the actual local/deployed app URL.

## References

- [Supabase Google sign-in](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Paystack authentication and key types](https://paystack.com/docs/api/authentication/)
- [MailerSend send email API](https://developers.mailersend.com/api/v1/email)
- [MailerSend Activity API](https://developers.mailersend.com/api/v1/email/activity)

No .env files were inspected or edited when creating this template.
