# Android Release Signing — MatchaMD

## Target
- Package: `com.emberwingindustriesllc.matchamd`
- Build type: release AAB
- Signing path: Google Play App Signing with upload keystore

## Chosen Values
- Keystore file: `android/upload-keystore.jks`
- Alias: `EmberWingIndustriesLLC`
- Store password: pending
- Key password: pending

## Upload Key Generation
Run in `C:\Users\paulf\matchamd\android` with Android Studio `keytool` available:

1. Create keystore
2. Confirm `android/upload-keystore.jks` exists
3. Export `android/upload-keystore.pem`

## Upload to Play Console
1. Open Play Console > Release > Setup > App integrity
2. Under Upload key certificate, choose "Request upgrade"
3. Upload `android/upload-keystore.pem`

## Next
- [ ] ask user for store/key passwords
- [ ] wire `android/local.properties` or secret store
- [ ] build signed AAB
