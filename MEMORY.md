# MatchaMD Memory

This file is the project's long-term memory. It is loaded at the start of every MatchaMD session so the agent can continue where it left off. Keep it short and factual.

## Last Shipped
- 2026-08-09: Shipped Nepal medical schools expansion, multi-specialty & location array search, Post Research Position modal, Become a Mentor application modal, on-the-fly PDF Handout generator (`jsPDF`), Interactive Mock Interview Video Player with timestamped chapters & faculty scorecards, USMLE Quiz Pack expansion (Pharmacology & Ethics), ERAS Program CSV Exporter, Profile Avatar upload with Base64 fallback, and updated master `supabase_migration_idempotent.sql`. Pushed to `emberwingindustriesllc/matchamd` main.

## Open Items
- [ ] Run `npm run build && npx cap sync android` to build native bundle
- [ ] Generate 512x512 App Icon & 1024x500 Feature Graphic image assets in `store_assets/`
- [ ] Perform full mobile UI & responsiveness sweep across all 25 screens
- [ ] Configure Android release keystore/signing for AAB
- [ ] Complete Play Console metadata, content rating questionnaire, and Data Safety form

## Keystore
- Status: NOT YET CREATED
- Path: `android/upload-keystore.jks`
- Alias: `EmberWingIndustriesLLC`
- Notes: Use Play App Signing upload key path first

## Play Console
- Package: `com.emberwingindustriesllc.matchamd`
- Track: Internal testing / Production draft
- Listing assets: `store_assets/`
- Metadata draft: `store_assets/store_listing_metadata.md`

## Session Notes
- 2026-08-09: Expanded Nepal support (13 MBBS colleges + ECFMG tips), multi-select search dropdowns, research position modal, mentor registration modal, PDF handout downloads, interactive video timeline player, expanded quiz pack, CSV exporter, avatar upload Base64 fallback, and idempotent SQL migration. All 87 unit tests passed. Saved Google Play Store audit report for tomorrow (`play_store_audit.md`).

