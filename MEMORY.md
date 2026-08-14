# MatchaMD Memory

This file is the project's long-term memory. It is loaded at the start of every MatchaMD session so the agent can continue where it left off. Keep it short and factual.

## Last Shipped
- 2026-08-14: Shipped multi-location "Cast a Wide Net" search engine, saved searches preset engine (`supabase_saved_searches_schema.sql`), and OB/GYN persistent import & reconciliation workbench (`supabase_obgyn_import_schema.sql`, `scripts/obgyn-reconcile.js`, `scripts/stage-obgyn-candidates.js`) with live database enrichment.
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
- 2026-08-14: Created persistent OB/GYN residency import & reconciliation system (`supabase_obgyn_import_schema.sql`, `scripts/obgyn-reconcile.js`, `scripts/stage-obgyn-candidates.js`) and multi-location search overhaul with saved searches engine. Audited baseline Supabase data: 12,503 total program records, 171 OB/GYN related records, 112 core OB/GYN residencies.
- 2026-08-09: Expanded Nepal support (13 MBBS colleges + ECFMG tips), multi-select search dropdowns, research position modal, mentor registration modal, PDF handout downloads, interactive video timeline player, expanded quiz pack, CSV exporter, avatar upload Base64 fallback, and idempotent SQL migration. All 87 unit tests passed. Saved Google Play Store audit report for tomorrow (`play_store_audit.md`).
- 2026-07-25: Implemented React.lazy route code-splitting and Vite vendor manualChunks. Verified ESLint (0 errors), Vite production build, Capacitor Android sync, and native Android Gradle build (`assembleDebug` succeeded in 1m 53s).
- 2026-07-11: Fixed checkModerator runtime bug in ProgramDetail.jsx, committed completed program moderation intelligence & verified build health (lint and tests pass).
- 2026-07-01: Cleaned up lint errors, reset local main, pushed `play-store-prep`, built release AAB, and prepared Play Store checklist.
- 2026-06-24: User asked to upload conversation and push GitHub updates. Mostly worked in Supabase and the community program intelligence pages.
