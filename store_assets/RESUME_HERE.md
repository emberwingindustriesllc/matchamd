# MatchaMD — Resume Here

## Completed
- Audit done: no showstopper build blockers found.
- Keystore guidance prepared for upload-key path.
- Privacy/TOS pages already exist in `store_assets/`.
- Store listing drafts ready in `store_assets/store_listing_metadata.md`.
- Data Safety/test-account drafts ready in `store_assets/play_console_drafts.md`.
- Screenshots ready: phone; tablet screenshot still missing.

## Blocked On User Input
- release keystore passwords: `release.storePassword`, `release.keyPassword`
- tablet screenshot capture
- test account email/password
- D-U-N-S / Play Console account access

## Exact Commands When Resuming
1. keystore:
   cd android
   keytool -genkey -v -noprompt -keystore upload-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias EmberWingIndustriesLLC -dname "CN=MatchaMD, OU=Emberwing Industries LLC, O=Emberwing Industries LLC, L=City, S=State, C=US" -storepass <STORE_PASSWORD> -keypass <KEY_PASSWORD>
   keytool -export -rfc -keystore upload-keystore.jks -alias EmberWingIndustriesLLC -storepass <STORE_PASSWORD> -file upload-keystore.pem -keypass <KEY_PASSWORD>

2. tablet screenshot:
   - open built app on 7"+ tablet or emulator
   - go to a core page like Program Search or Dashboard
   - save to `store_assets/screenshots/screenshot_06_tablet.png`

3. Play Console metadata:
   - copy drafts from `store_assets/play_console_drafts.md`
