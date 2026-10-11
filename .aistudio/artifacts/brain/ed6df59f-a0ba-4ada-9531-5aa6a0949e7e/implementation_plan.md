# MatchaMD: Complete Medical Residency Match & USMLE Prep Suite

Enhance and refine **MatchaMD** across its web (`matchamd.com`) and mobile builds while preserving 100% compatibility with your existing **Supabase** backend (`mmfixpgfaskufmrfmzcc`), **Vercel** hosting, and **Cloudflare** infrastructure.

## User Review & Critical Decisions

> [!IMPORTANT]
> **Backend & Cloud Architecture Guarantee**:
> - **Supabase Remains 100% Untouched as Your Cloud Source of Truth**: Your Supabase database (`mmfixpgfaskufmrfmzcc`), user authentication, tables (`programs`, `saved_searches`, `scam_reports`), and RLS policies do NOT go away.
> - **No Destructive Backend Changes**: Vercel hosting, Cloudflare DNS, and Supabase auth remain completely in place.
> - **What "Local Caching" Actually Means**: It is strictly a client-side performance feature on the user's phone or browser. Instead of making the phone wait for a network request to Supabase on every keystroke when filtering 10,000+ residency programs, the app caches program lists locally so search is instantaneous (0ms) and works even in hospital baselines without cell service. It reads from and syncs with Supabase whenever online.
> - **Unified Web + Mobile Enhancements**: Enhancements directly benefit both the live website (`matchamd.com` on Vercel) and the Android/iOS app via Capacitor (`com.emberwingindustriesllc.matchamd`).

- **Confirmed Decision 1**: Preserving existing Supabase backend (`mmfixpgfaskufmrfmzcc`), GitHub Auth, Vercel, and Cloudflare setup without any breaking changes.
- **Confirmed Decision 2**: Calming Matcha-tea green aesthetic (`#2D5A27`, `#4E7A42`, `#88B04B`, `#E8F0E4`) with modern Material 3 / Tailwind design.
- **Confirmed Decision 3**: Fixing broken search crashes, removing fabricated statistics, polishing the ERAS Match Cost Calculator, USMLE Step 2 CK Quiz Pack, and Residency Program Explorer.

---

## 1. Overview & Core Concept

- **What It Does**: MatchaMD is the specialized match platform for International Medical Graduates (IMGs) and US medical students matching into US residency and fellowship programs. It provides an IMG-friendly residency program finder (filtering by J-1/H-1B visa sponsorship, Step 2 CK score cutoffs, and specialty), an ERAS/NRMP Match Cost Calculator, USMLE Step 2 CK clinical vignettes, Match Season deadlines, and an Interview Preparation hub.
- **Target Audience**: Medical students, foreign medical graduates (IMGs/FMGs), pediatric and specialty residency applicants.
- **Key Value**: Delivers accurate, un-fabricated program data and stress-reducing match tools in a soothing matcha-green aesthetic.

---

## 2. User Experience & Visual Design

### Key Modules & Enhancements

1. **IMG Residency Program Explorer**:
   - Filter verified ACGME programs by Specialty (Pediatrics, Internal Medicine, Family Medicine, Surgery, Psychiatry, OBGYN, Neurology, etc.).
   - Visa sponsorship filter: J-1, H-1B, Permanent Resident / US Citizen only.
   - Step 2 CK minimum cutoffs and state/region filters.
   - Detailed program cards with hospital setting, stipend, ACGME ID, program website, and direct bookmarking to the user's Supabase rank list.
2. **Fixing Search & Navigation Stability**:
   - Resolve the Radix UI empty string (`value: ''`) Select crash identified in past audits.
   - Implement resilient error boundaries with clean reload keys.
3. **ERAS & NRMP Match Cost Calculator**:
   - Official tiered ERAS fee calculation (1-10 programs: $99, 11-30: $19 each, 31+: $27 each) with multi-specialty support.
   - Comprehensive budget categories: USMLE Step 1/2 exams, OET, ECFMG certification, interview attire, travel.
   - Visual breakdown chart and budget-saving recommendations.
4. **USMLE Step 2 CK Clinical Vignettes**:
   - High-yield pediatric, internal medicine, and surgery case vignettes with clinical pearls and detailed pathophysiological explanations.
5. **Interview Preparation & Rank Order List (ROL)**:
   - High-yield residency interview questions (Traditional, Behavioral STAR method, Ethical dilemmas).
   - Saved programs organizer and personalized match rank order builder.

### Visual Identity & Theme

- **Palette**: Calming Matcha Tea Palette:
  - *Primary Matcha Forest*: `#2D5A27`
  - *Matcha Leaf Green*: `#4E7A42`
  - *Fresh Leaf Accent*: `#88B04B`
  - *Matcha Cream Surface*: `#F4F7F2`
  - *Soft Matcha Latte Container*: `#E8F2EA`
  - *Text Charcoal*: `#1B241A`
  - *Subtle Muted Slate*: `#64748B`

---

## 3. Key Product Decisions & Trade-Offs

- **Supabase as Single Source of Truth + Client Local Cache**:
  - *Approach*: Supabase holds all live databases, users, and saved rank lists. Client-side caching merely provides instant offline filtering so students never stare at loading spinners.
  - *Why*: Guarantees zero disruption to your paid Cloudflare domain (`matchamd.com`) and existing Supabase database while dramatically speeding up mobile performance.
- **Data Integrity (No Fabricated Stats)**:
  - *Approach*: Present verified ACGME program data and real visa sponsorship policies, cleanly flagging missing fields as "Contact Program" rather than hallucinating stats.
  - *Why*: Essential for professional medical accreditation and trust.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        MatchaMD System Overview                        │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │             Cloud Backend (100% PRESERVED & ACTIVE)            │   │
│   │                                                                │   │
│   │   [Cloudflare DNS/SSL] ──► [Vercel Deployment: matchamd.com]   │   │
│   │                                      │                         │   │
│   │                                      ▼                         │   │
│   │                 [Supabase Project: mmfixpgfaskufmrfmzcc]       │   │
│   │                 - PostgreSQL (programs, scam_reports)          │   │
│   │                 - Supabase Auth (GitHub / Email)               │   │
│   │                 - RLS Security Policies                        │   │
│   └──────────────────────────────────────┬─────────────────────────┘   │
│                                          │                             │
│                                          │ Sync / REST API             │
│                                          ▼                             │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │                      Client Application                        │   │
│   │                     (Web + Mobile App)                         │   │
│   │                                                                │   │
│   │   ┌────────────────────────────────────────────────────────┐   │   │
│   │   │       Client-Side Instant Cache (Zero-Lag Search)      │   │   │
│   │   │       - Offline program catalog for instant search     │   │   │
│   │   │       - Hospital profiles & Step 2 CK requirements     │   │   │
│   │   └───────────────────────────┬────────────────────────────┘   │   │
│   │                               │                                │   │
│   │   ┌───────────────────────────▼────────────────────────────┐   │   │
│   │   │             Matcha UI Layer (Matcha Green M3)          │   │   │
│   │   │   - Programs Explorer (J-1 / H-1B Visa Filters)        │   │   │
│   │   │   - ERAS Match Cost Calculator (Dynamic Tiers)         │   │   │
│   │   │   - USMLE Step 2 CK Clinical Quiz Pack                 │   │   │
│   │   │   - Interview Prep & Rank Order List (ROL)             │   │   │
│   │   │   - Match Season Deadlines & Countdown                 │   │   │
│   │   └────────────────────────────────────────────────────────┘   │   │
│   └────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```
