# Google Play Console Paste Blocks

## Play Console Data Safety Form (draft)
- Data collected:
  - Email address
  - Name
  - App activity/usage
- Data shared:
  - Payment info, processed by Stripe
- Security:
  - Encrypted in transit: yes
  - Encrypted at rest: yes
- Deletion:
  - Users can request data deletion: yes
- Data not collected/sold:
  - Audio/video not collected for app functionality
  - Photos/videos not collected for app functionality
  - Personal communications not collected
  - Health/fitness data not collected

## Test reviewer account
- Email:  [fill before submission]
- Password: [fill before submission]
- Notes: standard test account with no special permissions

## Google Play checklist
- [x] `store_assets/privacy_policy.html` present
- [x] `store_assets/terms_of_service.html` present
- [x] `store_assets/play_feature_graphic_1024x500.png` present
- [x] `store_assets/play_store_icon_512x512.png` present
- [x] phone screenshots present
- [ ] tablet screenshot needed:
  - requirement: 1 image for tablets >= 7", same aspect ratio as phone screenshots
  - save to: `store_assets/screenshots/screenshot_06_tablet.png`

## Data Safety form
- Email, Name, App activity/usage collected
- Payment info shared via Stripe
- Users can request data deletion
- Encrypted in transit + at rest

## Next actions requiring user input
- keystore passwords: `release.storePassword`, `release.keyPassword`
- tablet screenshot capture