# Stoic Body: Sovereign OS — Operator & Delivery Handbook

**Version:** 1.0.0-rc1  
**Target Release Date:** October 2026  
**License:** Sovereign MIT / Proprietary Dual Commercial Model  
**Live Production URL:** [https://stoic-body.vercel.app](https://stoic-body.vercel.app)  
**Repository:** [https://github.com/Stoic-EmpireLabs/stoic-body](https://github.com/Stoic-EmpireLabs/stoic-body)  

---

## 1. Executive Summary & Philosophy

Stoic Body (Stoic Sovereign OS) is an evidence-based physical discipline, intermittent fasting, calisthenics/boxing training, and cognitive development engine styled in **2026 Liquid Obsidian Glassmorphism**.

The system operates under three sovereign axioms:
1. **Local-First Data Sovereignty**: All biometrics, weigh-ins, meal logs, notes, and private API keys reside exclusively on the user's local hardware (`localStorage` and offline client-side SQLite). Zero cloud lock-in. Zero third-party tracking.
2. **Deterministic Periodization**: Multi-week campaigns (10–12 weeks / 84 days) calibrated to individual physiological deficit rates ($-1.5\text{ lbs/wk}$ at $-750\text{ kcal/day}$) with live ticking countdown clocks.
3. **Classical Stoic Gamification**: 5-tier difficulty quests (Micro $\to$ Legendary), streak multipliers, punctuality critical hits, and crisis-mode protection (Minimum Viable Day).

---

## 2. Quickstart & Deployment Options

### Option A: Live Cloud Production (Vercel)
The application is pre-deployed and globally available with zero configuration:
- URL: **`https://stoic-body.vercel.app`**
- Each visitor receives their own isolated instance in their browser. No user data is ever shared between visitors.

### Option B: Local Standalone Production (Windows / Mac / Linux)
Requirements: Node.js 20+ (LTS).

```bash
# 1. Clone repository
git clone https://github.com/Stoic-EmpireLabs/stoic-body.git
cd stoic-body

# 2. Install dependencies
npm install

# 3. Build production bundle
npm run build

# 4. Start local production server
npm start
# -> Access at http://localhost:3000
```

### Option C: Standalone One-Click Offline Launcher (Windows)
Double-click `release/run-offline.bat` or execute `release/run-offline.ps1` to automatically open the default browser at `http://localhost:3000`.

---

## 3. PWA Installation (Desktop & Mobile)

Stoic Body is built as an offline-first **Progressive Web App (PWA)** registered via `public/sw.js` and `public/manifest.json`.

### On iOS (iPhone / iPad):
1. Open Safari and navigate to `https://stoic-body.vercel.app`.
2. Tap the **Share** button (box with upward arrow) at the bottom toolbar.
3. Scroll down and select **"Add to Home Screen"**.
4. The app launches full-screen without Safari browser bars and functions completely offline.

### On Android:
1. Open Chrome and navigate to `https://stoic-body.vercel.app`.
2. Tap the three dots menu in the top right.
3. Tap **"Install app"** or **"Add to Home screen"**.

### On Windows 11 / macOS:
1. In Google Chrome or Microsoft Edge, look for the **Install App icon** in the right side of the address bar.
2. Click **Install**.
3. The app is added to the Windows Start Menu / macOS Applications folder and runs in an isolated desktop window.

---

## 4. Multi-Platform Native App Store Packaging

### 1. Microsoft Store (Windows 11 / 10 MSIX)
Using the official Microsoft PWA Builder CLI:

```bash
# Install PWA Builder CLI
npm install -g @pwabuilder/cli

# Generate Windows Store package
pwa-builder --url https://stoic-body.vercel.app --msix
```
Upload the resulting `.msix` bundle to the [Microsoft Partner Center](https://partner.microsoft.com/dashboard).

### 2. Apple App Store (iOS / iPadOS Native Wrapper)
Using the included `capacitor.config.json`:

```bash
# Install Capacitor core & CLI
npm install @capacitor/core @capacitor/cli @capacitor/ios

# Initialize and sync iOS project
npx cap add ios
npx cap sync ios

# Open in Xcode
npx cap open ios
```
In Xcode:
1. Select your Apple Developer Team under **Signing & Capabilities**.
2. Run Product $\to$ **Archive**.
3. Upload to App Store Connect.

### 3. Google Play Store (Android TWA)
Using Google's Bubblewrap CLI:

```bash
# Install Bubblewrap CLI
npm install -g @bubblewrap/cli

# Initialize TWA project from manifest
bubblewrap init --manifest https://stoic-body.vercel.app/manifest.json

# Build signed Android App Bundle (.aab)
bubblewrap build
```
Upload the generated `app-release-bundle.aab` to the Google Play Console.

---

## 5. Sovereign AI Studio (Bring-Your-Own-Key)

Stoic Body includes an integrated, zero-cloud-telemetry AI Studio accessible at `/settings`.

### Supported Model Providers:
- **Google Gemini 2.5 Pro / Flash**: Provide an API key from Google AI Studio.
- **Anthropic Claude 3.7 Sonnet**: Provide an API key from Anthropic Console.
- **OpenAI GPT-4o / o1**: Provide an API key from OpenAI Platform.
- **Local Sovereign Ollama**: Set endpoint to `http://localhost:11434` for 100% offline, zero-internet AI reasoning.

### Security Guarantee:
API keys are stored exclusively in browser `localStorage` (`stoic_ai_keys`). They are never logged, never transmitted to third parties, and are dispatched only to the official provider endpoints.

---

## 6. Commercial Licensing & In-App Purchase Verification

### Tier Structure:
- **Monthly Sovereign Pass**: $9.99 / month (`com.stoicbody.subscription.monthly`)
- **Annual Sovereign Pass**: $79.99 / year (`com.stoicbody.subscription.yearly`) with 7-Day Free Trial
- **Founder Perpetual Pass**: Offline hardware-bound perpetual license.

### Offline Cryptographic Token Engine:
Users without internet access or who purchase outside traditional app stores can activate their instance using cryptographically signed offline tokens:
- **Token Format**: `STOIC-LIC-[TIER]-[EXPIRES_TIMESTAMP]-[SIGNATURE]`
- **Universal Founder Bypass**: `STOIC-LIC-SOVEREIGN-FOUNDER-PASS-2026`
- **Tamper Evident**: Modifying timestamps or payload invalidates the token hash automatically.

---

## 7. Data Backup, Export & Disaster Recovery

### Creating a Backup:
1. Navigate to `/imports`.
2. Scroll to **JSON State Export / Import**.
3. Click **"Export Full OS State (.json)"**.
4. A complete snapshot of biometrics, schedules, completed lessons, quests, and XP is downloaded to your disk.

### Restoring State:
1. On any device or clean browser, navigate to `/imports`.
2. Click **"Choose File"** and select your `.json` backup file.
3. Review the staged data preview and click **"Commit & Restore State"**.
4. The entire OS resumes instantly with all history preserved.
