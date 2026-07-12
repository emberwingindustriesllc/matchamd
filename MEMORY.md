# MatchaMD Memory

This file is the project's long-term memory. It is loaded at the start of every MatchaMD session so the agent can continue where it left off. Keep it short and factual.

## Last Shipped
- 2026-07-01: Published prep branch `play-store-prep` with lint cleanup; built local AAB artifact but did not finish signing/store submission
- 2026-06-24: Community program intelligence features (ProgramsList, ProgramDetail, scam reporting, Supabase migration)

## Open Items
- [x] Restore or confirm `/programs` navigation link in Header/BottomNav
- [x] Seed initial program data (Pakistan rotation examples)
- [x] Run `supabase_migration_idempotent.sql` in Supabase SQL Editor
- [x] Fix 42 lint errors (addressed by merging `play-store-prep`)
- [ ] Configure Android release keystore/signing for AAB
- [ ] Add tablet screenshot to `store_assets/screenshots/`
- [x] Host privacy policy + Terms of Service at real URLs (deployed to Vercel)
- [ ] Finish Play Console metadata, content rating questionnaire, and Data Safety form
- [ ] Consider code splitting to reduce main JS chunk size (~1.5MB main chunk)
- [ ] Add test reviewer account in Play Console "App access"

## Keystore
- Status: NOT YET SETUP
- Path: `android/upload-keystore.jks`
- Alias: `EmberWingIndustriesLLC`
- Notes: Use Play App Signing upload key path first; exact passwords still needed from user. Android build.gradle now targets Java 17 (`compileOptions` added). Gradle wrapper machine-specific paths were removed.

## Play Console
- Package: `com.emberwingindustriesllc.matchamd`
- Track: Internal testing (pending)
- Console URL:
- Listing assets: `store_assets/`
- Metadata draft: `store_assets/store_listing_metadata.md`
- AAB path:
- Note: CAPTCHA/TOS/privacy assets exist. Store listing metadata is present.

## Session Notes
- 2026-07-11: Fixed checkModerator runtime bug in ProgramDetail.jsx, committed completed program moderation intelligence & verified build health (lint and tests pass).
- 2026-07-01: Cleaned up lint errors, reset local main, pushed `play-store-prep`, built release AAB, and prepared Play Store checklist.
- 2026-06-24: User asked to upload conversation and push GitHub updates. Mostly worked in Supabase and the community program intelligence pages.
