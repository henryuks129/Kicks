# API configuration template

Placeholders only. Do not put actual credentials in this document.
The current storefront does not consume these variables yet; this defines the configuration contract for integration.

## React / Vite public configuration

Copy these into your local `.env.local` yourself. Only public values belong in VITE_ variables, which are exposed to the browser.

```dotenv
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
# Optional: needed if we use Paystack Inline in the browser.
VITE_PAYSTACK_PUBLIC_KEY=YOUR_PAYSTACK_TEST_PUBLIC_KEY
```

## Server configuration

Set these in the backend deployment's secrets/settings when the backend is connected. Never prefix these secrets with VITE_.

```dotenv
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
PAYSTACK_SECRET_KEY=YOUR_PAYSTACK_TEST_SECRET_KEY
MAILGUN_API_KEY=YOUR_MAILGUN_API_KEY
MAILGUN_DOMAIN=YOUR_VERIFIED_MAILGUN_DOMAIN
MAILGUN_API_BASE_URL=https://api.mailgun.net
MAILGUN_FROM="Kicks <orders@YOUR_VERIFIED_MAILGUN_DOMAIN>"
APP_URL=http://localhost:5173
DEMO_PAYMENTS_ENABLED=false
```

Use https://api.eu.mailgun.net for an EU-region Mailgun domain. Use matching Paystack test keys during development. Demo payment enablement must be enforced by the backend, never by a browser checkbox alone.

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
- [Mailgun API regions](https://documentation.mailgun.com/docs/mailgun/api-reference/api-overview)

No .env files were inspected or edited when creating this template.
