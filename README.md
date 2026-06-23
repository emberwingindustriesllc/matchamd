# MatchaMD

**The complete guide for international medical graduates (IMGs/FMGs) matching into US residency and fellowship programs.**

[![App Store](https://img.shields.io/badge/iOS-App%20Store-black?logo=apple)](https://apps.apple.com)
[![Play Store](https://img.shields.io/badge/Android-Play%20Store-green?logo=google-play)](https://play.google.com)

---

## 🛠 Dev Setup

```bash
npm install
npm run dev
```

## 📱 Mobile Builds (Capacitor)

### First-time setup
```bash
# Add platforms (only needed once)
npm run cap:add:android

# Build web app and sync to both platforms
npm run cap:sync
```

### Android (Google Play)
```bash
npm run cap:build:android   # Build + sync
npm run cap:open:android    # Open in Android Studio
```
Then in Android Studio: Build → Generate Signed Bundle/APK

### iOS (App Store)
```bash
npm run cap:build:ios       # Build + sync
npm run cap:open:ios        # Open in Xcode
```
Then in Xcode: Product → Archive

---

## 🏗 Tech Stack

- **React 18** + Vite
- **Capacitor 8** — iOS + Android native wrapper
- **shadcn/ui** — component library
- **Tailwind CSS** — styling
- **TanStack Query** — data fetching
- **Framer Motion** — animations
- **Stripe** — premium subscriptions
- **Supabase** — backend, auth, database

## 📁 Project Structure

```
src/
  pages/          # All app screens
  components/     # Reusable UI components
  lib/            # Utilities and hooks
  api/            # Supabase Client
ios/              # iOS Capacitor platform
android/          # Android Capacitor platform
supabase/         # Supabase Edge Functions (Stripe)
```

## 🔑 Environment

The app uses Supabase for backend services. Configure via the Supabase dashboard.

Stripe keys are set as environment variables in the Supabase Edge Function deployment.

---

*Built with ❤️ for the global medical community*
