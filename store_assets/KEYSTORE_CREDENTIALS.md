# Android Release Keystore Credentials — MatchaMD

These credentials are used by Gradle to sign the Android App Bundle (`.aab`) for Google Play Store release.

---

## 🔒 Credentials Summary

| Property | Value |
| :--- | :--- |
| **Keystore File** | `android/upload-keystore.jks` |
| **Key Alias** | `EmberWingIndustriesLLC` |
| **Store Password** | `MatchaMD_StorePass_98f4a7c2e1b3d5a0` |
| **Key Password** | `MatchaMD_StorePass_98f4a7c2e1b3d5a0` |
| **Keystore Format** | PKCS12 |
| **Distinguished Name (dname)** | `CN=MatchaMD, OU=Emberwing Industries LLC, O=Emberwing Industries LLC, C=US` |

---

## 📁 Storage Locations
- **`android/local.properties`**: Contains these values for automatic Gradle release builds (git-ignored for security).
- **`store_assets/KEYSTORE_CREDENTIALS.md`**: Backup documentation for your reference.

---

> [!IMPORTANT]
> Keep `upload-keystore.jks` and these passwords backed up safely. Google Play requires every update to your app to be signed with this exact key!
