# MatchaMD Memory

This file is the project's long-term memory. It is loaded at the start of every MatchaMD session so the agent can continue where it left off. Keep it short and factual.

## Mandatory Workflow Rule
- **Empirical Verification Check Step**: In every workflow task, perform a mandatory empirical verification step (inspect actual code files, run tests, verify build outputs) to empirically confirm that what we think we did was actually executed successfully in the codebase.

## Last Shipped
- 2026-08-24: Updated all interview course video lessons with 5 verified working YouTube URLs (`DiUI7_oKxho`, `b3vI35Zc_Z8`, `ysM3qTOmvxI`, `WRLF8ULhZmw`, `JTnTbzskEuo`). Verified via file content inspection, 140/140 unit tests passing (`npm test`), and pushed commits to `emberwingindustriesllc/matchamd`.
- 2026-08-24: Integrated `book-catalog-shell` into MatchAMD as an interactive USMLE & Board Study Catalog (`BookCatalog.jsx`). Pre-seeded with top board review books, status tracking, search, category filtering, and ResourceHub linking. Audited Base44 removal (0 remaining references). Verified Vite production build (`npm run build`), 140/140 unit tests passing (`npm test`), and pushed commits to `emberwingindustriesllc/matchamd`.
- 2026-08-14: Shipped multi-location "Cast a Wide Net" search engine, saved searches preset engine (`supabase_saved_searches_schema.sql`), and OB/GYN persistent import & reconciliation workbench (`supabase_obgyn_import_schema.sql`, `scripts/obgyn-reconcile.js`, `scripts/stage-obgyn-candidates.js`) with live database enrichment.
- 2026-08-09: Shipped Nepal medical schools expansion, multi-specialty & location array search, Post Research Position modal, Become a Mentor application modal, on-the-fly PDF Handout generator (`jsPDF`), Interactive Mock Interview Video Player with timestamped chapters & faculty scorecards, USMLE Quiz Pack expansion (Pharmacology & Ethics), ERAS Program CSV Exporter, Profile Avatar upload with Base64 fallback, and updated master `supabase_migration_idempotent.sql`. Pushed to `emberwingindustriesllc/matchamd` main.

## Open Items
- [x] Integrate `book-catalog-shell` into `matchamd` main
- [x] Run `npm run build` production web bundle compilation
- [x] Run full test suite (140/140 passed)
- [ ] Upload compiled `app-release.aab` bundle to Google Play Console under `emberwingindustriesllc@gmail.com`
- [ ] Submit Play Console listing metadata (`store_assets/store_listing_metadata.md`)

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
