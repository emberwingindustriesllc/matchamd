# MatchaMD Memory

This file is the project's long-term memory. It is loaded at the start of every MatchaMD session so the agent can continue where it left off. Keep it short and factual.

## Last Shipped
- 2026-07-01: Remote `main` advanced to `8c83457` — expanded USMLE quizzes to 40 questions, specialty progress tracking dashboard, video player upgrade, Match Cost Calculator page, AI Pathway Assistant Supabase function, Stripe checkout/portal/one-time checkout functions, ProgramDetailsModal, Android JDK 17 setup, jsconfig fixes, web purchase state fixes.
- 2026-06-24: Community program intelligence features (ProgramsList, ProgramDetail, scam reporting, Supabase migration)

## Open Items
- [ ] Fix 42 lint errors: unused imports in ProgramDetail, ProgramsList, USMLEQuizPack
- [ ] Add missing Play Store screenshot for tablet (7" or 10") — have 5 phone screenshots
- [ ] Address large bundle warning (~1.5MB main chunk) via code splitting / manualChunks
- [ ] Setup Android signing keystore/alias for AAB generation
- [ ] Run `supabase_subscription_schema.sql` and latest migrations in Supabase SQL Editor
- [ ] Wire `/programs` route into Header/BottomNav if not already present
- [ ] Seed initial program data beyond examples if required

## Keystore
- Status: NOT YET SETUP
- Path:
- Alias:
- Note: Android build.gradle now targets Java 17 (`compileOptions` added). Gradle wrapper machine-specific paths were removed.

## Play Console
- Package: `com.emberwingindustriesllc.matchamd`
- Track: Internal testing (pending)
- Console URL:
- AAB path:
- Note: CAPTCHA/TOS/privacy assets exist. Store listing metadata is present.

## Session Notes
- 2026-07-01: Synced local repo with upstream `origin/main` (8c83457). Verified build passes, 75 tests pass, lint shows 42 errors, store assets present but 1 tablet screenshot missing.
- 2026-06-24: User asked to upload conversation and push GitHub updates. Mostly worked in Supabase and the community program intelligence pages.
