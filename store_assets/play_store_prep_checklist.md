# Play Store Prep — Ready State

## Current Status
- Keystore: not yet created
- Upload target: Play Console / Google Play App Signing recommended
- blocker: account admin / D-U-N-S verification in progress

## Exact Windows Keystore Steps
Run in `C:\Users\paulf\matchamd\android` in Git Bash / Command Prompt.

1. Create upload keystore:
  keytool -genkey -v -noprompt -keystore upload-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias EmberWingIndustriesLLC -dname "CN=MatchaMD, OU=Emberwing Industries LLC, O=Emberwing Industries LLC, L=City, S=State, C=US" -storepass <STORE_PASSWORD> -keypass <KEY_PASSWORD>

2. Confirm file exists:
  ls -l upload-keystore.jks

3. Generate upload certificate:
  keytool -export -rfc -keystore upload-keystore.jks -alias EmberWingIndustriesLLC -storepass <STORE_PASSWORD> -file upload-keystore.pem -keypass <KEY_PASSWORD>

## User Input Needed Before Applying
- Preferred release.storePassword
- Preferred release.keyPassword
- Preferred release.storeFile: `android/upload-keystore.jks`

Until confirmed, do not edit `android/local.properties`.

## Store Readiness
- privacy policy HTML present: `store_assets/privacy_policy.html`
- terms of service HTML present: `store_assets/terms_of_service.html`
- feature graphic present: `store_assets/play_feature_graphic_1024x500.png`
- store icon present: `store_assets/play_store_icon_512x512.png`
- phone screenshots present in `store_assets/screenshots/`
- tablet screenshot missing: needs 1 screenshot for 7"+ tablet

## Approve When Ready
- [ ] confirm keystore password values and alias
- [ ] confirm privacy/TOS hosting URLs
- [ ] capture tablet screenshot