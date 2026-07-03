# MatchaMD — Week 1 Plan Review

## Plan Source
Original plan: Week 1: Administrative Setup, Package Configs, & Assets

---

## Day 1: Account Setup
- [ ] Google Play Developer Account
- [ ] Merchant Profile
- [ ] RevenueCat account + MatchaMD project

Status: **Blocked — waiting for D-U-N-S / Google approval.**
Once approved, start with Play Console merchant setup, then create RevenueCat project.

---

## Day 2: Native Identifiers Config
- [x] App ID already set in `capacitor.config.ts`: `com.emberwingindustriesllc.matchamd`
- [x] `android/app/build.gradle` already uses matching `namespace` and `applicationId`
- [x] iOS `PRODUCT_BUNDLE_IDENTIFIER` already matches in `ios/App/App.xcodeproj/project.pbxproj`
- [x] `android/strings.xml` already uses matching `package_name`/`custom_url_scheme`
- `npx cap sync android`: **Done as part of Day 3 artifact generation.**
Status: **Already completed in repo.** No code change needed.

---

## Day 3: Icon & Splash Asset Generation
- [x] `assets/icon.png` and `assets/splash.png` already present
- [x] `@capacitor/assets` installed
- [x] `npx @capacitor/assets generate --android` ran successfully
- Generated: **87 files, ~8.71 MB**
- Location: `android/app/src/main/res/` including adaptive icons, `mipmap-*` launchers, and `drawable*` splash assets
Status: **Complete.** Android launch/splash resources are generated and synced.

---

## Day 4: Legal & Policy Hosting
- [x] Privacy policy draft: `store_assets/privacy_policy.html`
- [x] Terms of service draft: `store_assets/terms_of_service.html`
- [ ] Host live URLs on reachable web server
- [ ] Verify from mobile browser/web view
Status: **Drafts complete.** Still needs public hosting and URL verification.

---

## Day 5: Supabase Schema Verification
- [x] `supabase_subscription_schema.sql` present with `subscriptions`, `purchased_content`, `quiz_progress`
- [x] `supabase_migration_idempotent.sql` present
- [ ] Execute in Supabase SQL Editor
- [ ] Verify tables exist
Status: **Ready.** SQL files are prepared; execution in Supabase is pending.

---

## Day 6: Store Listing Text Prep
- [x] App title/description copy drafted
- [x] Long description drafted
- [x] Keywords compiled
- Saved to: `store_assets/play_console_submission_pasteblocks.md`
Status: **Complete.** Ready for Play Console once account is approved.

---

## Day 7: Weekly Checkpoint
- [ ] Compile 20 emails
- [ ] Send heads-up emails
Status: **Pending.** Requires your input for email list.

---

## Unblock These Next
1. Play Developer Account approval
2. Merchant Profile setup
3. RevenueCat project creation
4. Privacy/TOS hosting
5. Supabase SQL execution
6. Beta email list/send
