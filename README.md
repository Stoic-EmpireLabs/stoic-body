# 🏛️ Stoic Body: Sovereign OS (2026 Edition)

[![Production Status](https://img.shields.io/badge/Production-Live%20(HTTP%20200)-success?style=flat-square)](https://stoic-body.vercel.app)
[![Tests Passing](https://img.shields.io/badge/Tests-60%2F60%20Passing-brightgreen?style=flat-square)](tests/)
[![Architecture](https://img.shields.io/badge/Architecture-Next.js%2015%20%7C%20React%2019%20%7C%20SQLite-blue?style=flat-square)](src/)
[![PWA Ready](https://img.shields.io/badge/PWA-Offline%20First-orange?style=flat-square)](public/manifest.json)
[![Commercial License](https://img.shields.io/badge/Commercial%20Store-Ready%20(iOS%2FAndroid%2FWin)-gold?style=flat-square)](docs/store-submission-packet.md)

> **"He who conquers himself is the mightiest warrior."** — Seneca

**Stoic Body** is a radical physical discipline, intermittent fasting, combat conditioning, and artificial intelligence learning operating system styled in **2026 Liquid Obsidian Glassmorphism**.

The system transforms daily habit execution into an engaging Sovereign RPG, connecting life milestones, 84-day periodized schedules, whole food nutrition blueprints (23:1 OMAD), progressive calisthenics overload, 6-round boxing HIIT, and an intellectual AI hierarchy spectrum curriculum with **zero cloud lock-in** and **zero third-party tracking**.

---

## 🌟 Key Features & Innovations

### 1. 2026 Liquid Obsidian Glassmorphism Design
- Translucent multi-layered glass panels with ultra-fine borders (`border-white/10` and `border-amber-500/20`).
- Atmospheric obsidian depth (`#0A0B10`), dynamic glowing accent orbs, and backdrop blur (`backdrop-blur-2xl`).
- High-efficiency floating bottom navigation dock with glowing active indicators.

### 2. Live Goal Ticking Countdown Clock
- Real-time countdown hero (`DAYS : HOURS : MINS : SECS`) mounted prominently on the Dashboard and Goals pages.
- Calibrated to the user's specific target date, fat loss velocity ($-1.5\text{ lbs/week}$), and caloric deficit ($-750\text{ kcal/day}$).
- Live milestone phase checkpoints tracking progress across the campaign.

### 3. 84-Day Multi-Week Periodized Campaign
- Generates an 84-day (10–12 week) scientific schedule across the unified calendar.
- Integrates peer-reviewed literature: Schoenfeld (hypertrophy), Morton (protein ceilings), San-Millán (Zone-2 fat oxidation), and Tremblay (fasting interval timing).
- Dynamic transition buffers: $B_i = \max(15\text{m}, 0.20 \times D)$ to prevent schedule collapse.

### 4. Interactive Tab Spotlight Onboarding & Companion
- Intelligent Aethelgard Host companion guiding first-time visitors through the entire system.
- Direct DOM bounding-box spotlight ring anchored to physical navigation tabs (`#tour-tab-...`).
- Contextual advice that dynamically adapts by hour of the day (Morning Anchor $\to$ Deep Work $\to$ Fasting Window $\to$ Evening Reflection).

### 5. Private Bring-Your-Own-Key (BYOK) AI Studio
- Integrated AI reasoning hub in `/settings` supporting:
  - **Google Gemini 2.5 Pro / Flash**
  - **Anthropic Claude 3.7 Sonnet**
  - **OpenAI GPT-4o / o1**
  - **Local Sovereign Ollama** (`http://localhost:11434`) for 100% offline reasoning.
- Live latency benchmark test pinging local and cloud models.
- **Zero-Cloud Guarantee**: Keys are stored exclusively in your browser and never touch external telemetry servers.

### 6. Multi-User Local-First Isolation
- Every visitor gets their own private, sandboxed environment stored locally on their device via `localStorage`.
- Zero user data is shared across visitors or sessions.
- Full offline SQLite database state export/import with two-step validation gates in `/imports`.

### 7. Commercial Store Readiness & Offline Cryptographic Licensing
- Complete multi-platform store submission packet for Apple App Store, Google Play, and Microsoft Store.
- Multi-tier in-app purchase simulator ($9.99/mo, $79.99/yr with 7-day trial).
- Tamper-evident Base64 offline license verification engine (`STOIC-LIC-*`).

---

## 🚀 Quickstart

### Live Web Application
Access the production deployment immediately without installation:  
👉 **[https://stoic-body.vercel.app](https://stoic-body.vercel.app)**

### Local Standalone Installation
```bash
# Clone the repository
git clone https://github.com/Stoic-EmpireLabs/stoic-body.git
cd stoic-body

# Install dependencies
npm install

# Run automated test suite (60/60 tests)
npm test

# Build production bundle
npm run build

# Start local server
npm start
# -> Access at http://localhost:3000
```

### Windows Offline One-Click Launch
Double click `release/run-offline.bat` or run `release/run-offline.ps1`.

---

## 📱 Progressive Web App (PWA) Installation

- **iOS / iPadOS**: Open Safari $\to$ Tap **Share** $\to$ Select **"Add to Home Screen"**.
- **Android**: Open Chrome $\to$ Tap menu $\to$ Select **"Install app"**.
- **Windows / macOS**: Open Chrome or Edge $\to$ Click the **Install** icon in the address bar.

---

## 🏛️ System Architecture

```
stoic-body/
├── src/
│   ├── app/                    # Next.js App Router (13 verified views)
│   │   ├── page.tsx            # Dashboard (Live Countdown, Anchor, Fasting Ring)
│   │   ├── calendar/           # 84-Day Multi-Week Periodized Schedule
│   │   ├── goals/              # Strategic Milestones & Target Matrix
│   │   ├── training/           # Boxing Timer (6 Rounds) & Calisthenics Overload
│   │   ├── nutrition/          # 23:1 OMAD Blueprints & Hydration Lab
│   │   ├── progress/           # US Navy BF%, 7-Day Moving Avg, Timeline
│   │   ├── learning/           # AI Hierarchy Spectrum & Interactive Sandboxes
│   │   ├── coaching/           # Multi-Tone Stoic Advisory & Historical Quotes
│   │   ├── quests/             # 5-Tier Gamification RPG & Combo Multipliers
│   │   ├── character/          # 5-Axis Radar Canvas & Level 12 Hierarchy
│   │   ├── imports/            # Document Vault & SQLite JSON State Sync
│   │   └── settings/           # BYOK AI Studio, Keys & Commercial License Hub
│   ├── components/             # Reusable UI widgets & Modals
│   │   ├── GoalCountdownHero.tsx # Live Ticking Countdown Clock
│   │   ├── InteractiveTour.tsx # DOM Tab Spotlight Companion
│   │   ├── AgentKeysHub.tsx    # Sovereign BYOK Studio & Latency Tester
│   │   ├── CommercialLicenseModal.tsx # Store Licensing & Sandbox Simulator
│   │   └── PwaRegistrar.tsx    # Service Worker Offline Registration
│   ├── context/
│   │   └── StoicContext.tsx    # Global Local-First State Provider
│   └── lib/                    # Core Empirical Domain Engines
│       ├── scheduling.ts       # Periodized Campaign & Buffers
│       ├── onboarding.ts       # Intake Calibration & Host Directives
│       ├── entitlements.ts     # In-App Purchases & Cryptographic Tokens
│       ├── gamification.ts     # XP Multipliers & Anti-Exploit Formulas
│       ├── nutrition.ts        # OMAD Fasting & Scale Food Blueprints
│       └── courses.ts          # AI Spectrum Curriculum & Brilliant Quizzes
├── public/
│   ├── sw.js                   # Service Worker (Cache-First Offline Engine)
│   └── manifest.json           # Web App Manifest & Shortcuts
├── release/                    # Phase 8 Distribution Bundle
│   ├── stoic-body-v1.0.0-rc1.zip # Standalone Portable Release Archive
│   ├── release-manifest.json   # SHA-256 Checksum Signatures
│   ├── run-offline.bat         # Windows Command Prompt Launcher
│   └── run-offline.ps1         # Windows PowerShell Launcher
├── docs/                       # Verification Packets & Documentation
│   ├── delivery-handbook.md    # Master Operator & Packaging Runbook
│   ├── store-submission-packet.md # App Store Metadata & IAP SKUs
│   ├── phase-7-verification.md # 13-Module Master Acceptance Record
│   ├── phase-8-delivery.md     # Phase 8 Delivery Record
│   └── progress.md             # Phase Progress Tracker
└── tests/                      # 60 Automated Unit & Integration Tests
```

---

## 🧪 Verification & Acceptance

- **Unit Test Suite**: `npm test` $\to$ **60/60 passing tests** in 350ms.
- **TypeScript Typecheck**: `npm run typecheck` $\to$ **0 errors**.
- **Master Playwright Audit**: `npm run audit` $\to$ **13/13 modules verified** with zero console errors.
- **Production URL**: Verified returning **`HTTP/1.1 200 OK`**.

---

## 📜 Sovereign Dual License

- **Open Core**: MIT License.
- **Commercial Distribution**: Dual-license model with built-in Apple In-App Purchase and Google Play billing wrappers.
- Developed by **Stoic Empire Labs** in partnership with **Antigravity Autonomous Engineering**.
