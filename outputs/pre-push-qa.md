# Kicks pre-push QA — 2026-10-05

## Completed source changes
- Contained second hero photograph on its own right-hand orange stage; smaller product scale and subdued decorative wordmark. Static hero retained.
- Fluid Anton display sizes, natural font weight without synthetic bold, Manrope interface text, clearer product/account/dialog hierarchy.
- Compact navigation, constrained search/sort widths, 44px bag quantity controls and reduced narrow-screen headline sizes.
- Unknown-route recovery, catalogue loading/error states and section scrolling after route changes.
- Web account save and checkout share the native update-only profile helper, including missing-profile detection.
- Native campaign selector, home/collection/editorial/FAQ/footer, bundled fonts, category/colour search and price sorting. Shared catalogue, shopping-guide and field-guide content. Native guide route returns to a selected category.
- Removed unused hero animation attributes. Preserved the current pointed PNG Kicks cursor and text-entry cursors.

## Verified locally
- 51/51 Node tests: RLS/customer isolation, profile update permissions, guest persistence/merge, cart queue/sync, private realtime invalidations, API authentication, payment idempotency/verification boundaries, email queue/deduplication and receipt imagery/typography.
- Added shared web/native category/colour/price-order test.
- Re-running incremental cart and catalogue migrations passes without duplicating triggers or replacing existing prices/stock.
- Final Vite production build passed with KICKS_SKIP_ENV_FILES=true.
- Native TypeScript and ESLint passed with EXPO_NO_DOTENV=1.
- Final Android and iOS Hermes bundle exports passed at /tmp/kicks-native-qa-export, after clearing Metro's file map. First export failed during source-file creation; the final export is the valid result.
- Fallow source-only duplication scan: zero clone groups; no secrets/config included in the scan. Whitespace diff check passed.

## Outstanding integration acceptance
- Desktop and 320/375/390/768px browser screenshots and overflow checks; both hero selectors, links, FAQ, catalogue filters/search/sort, product gallery/size selection, guest bag add/update/remove/reload and checkout sign-in gate.
- Connected Google sign-in/logout, account details/history, same-account bidirectional web/native cart sync, hosted Paystack verification and actual receipt delivery. Unit tests and disconnected preview do not establish provider success.
- Android/iOS actual emulator interaction and a compatible rebuilt native development client after the expo-font dependency change. Bundle exports are not native compilation or device proof.
- Codex browser displays 16 products; second hero selection, EU 42 selection and guest add-to-bag passed. Opening the bag then timed out; the remaining journey is unverified.
- Existing port 5173 reported catalogue fetch failure. Isolated port 5174 has VITE_LOCAL_CATALOG_PREVIEW=true and disconnects auth/payment; never deploy with this preview flag.

## Release cleanup
- Excluded local configuration, design experiments, generated native projects and checkpoints. Added the missing mobile configuration example.
- Final release rerun: 51/51 tests, production build, native TypeScript and ESLint passed. API tests required local network binding outside the filesystem sandbox.

## Supabase SQL Editor
1. Run outputs/supabase-readiness.sql (read-only metadata audit).
2. For the existing store with base commerce/email migrations already applied, run outputs/supabase-upgrade.sql. It combines 202610030001_cart_realtime.sql and 202610040001_reference_shoes.sql. Both are safe to rerun and preserve existing commercial data.
3. Run the audit again and separately run its commented four-product/variant check. Confirm the native Google callback redirect in the dashboard (see mobile/README.md).
Remote migrations have not been applied by this task. GitHub release status is recorded separately after push.
