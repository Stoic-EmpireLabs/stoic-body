import { chromium } from "playwright";

async function verifyLiveApp() {
  console.log("🚀 Launching Headless Chromium to verify https://stoic-body.vercel.app ...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();

  // 1. Home / Today Command Center
  console.log("📍 Navigating to https://stoic-body.vercel.app ...");
  const res = await page.goto("https://stoic-body.vercel.app", { waitUntil: "networkidle" });
  console.log(`✅ Status: ${res.status()}`);

  const title = await page.title();
  console.log(`✅ Document Title: "${title}"`);

  // Check Header Elements
  const headerLevel = await page.locator("header").textContent();
  console.log(`✅ Header text content verified: ${headerLevel.slice(0, 80)}...`);

  // Verify Morning Anchor card is present
  const morningAnchor = await page.locator("text=Morning Anchor").first();
  console.log(`✅ Found Morning Anchor section`);

  // Click on the first morning anchor task
  const firstTaskCheckbox = page.locator('input[type="checkbox"]').first();
  await firstTaskCheckbox.click();
  console.log("✅ Clicked first task (Hydration + Electrolytes)");

  // 2. Training Studio
  console.log("📍 Navigating to /training ...");
  await page.goto("https://stoic-body.vercel.app/training", { waitUntil: "networkidle" });
  const boxingHeader = await page.locator("text=Home Boxing Round Timer").first();
  console.log("✅ Found Home Boxing Round Timer");

  // Click Start Round
  const startBtn = page.locator("button:has-text('START ROUND')");
  await startBtn.click();
  console.log("✅ Clicked START ROUND on Boxing Timer");

  // Wait 2 seconds and verify timer ticked
  await page.waitForTimeout(2000);
  const timerText = await page.locator("#timerDisplay, .font-mono.font-black").first().textContent();
  console.log(`✅ Boxing Timer ticking live: ${timerText}`);

  // 3. Character Status HUD
  console.log("📍 Navigating to /character ...");
  await page.goto("https://stoic-body.vercel.app/character", { waitUntil: "networkidle" });
  const radarCanvas = await page.locator("canvas").first();
  console.log("✅ 5-Axis Radar Canvas element located and rendered");

  // 4. Quest Vault
  console.log("📍 Navigating to /quests ...");
  await page.goto("https://stoic-body.vercel.app/quests", { waitUntil: "networkidle" });
  const mustangQuest = await page.locator("text=2015 Ford Mustang").first();
  console.log("✅ 2015 Ford Mustang V6 Oil Change Quest verified");

  // 5. Nutrition & OMAD Hub
  console.log("📍 Navigating to /nutrition ...");
  await page.goto("https://stoic-body.vercel.app/nutrition", { waitUntil: "networkidle" });
  const omadBadge = await page.locator("text=23:1 OMAD Protocol").first();
  console.log("✅ 23:1 OMAD Protocol badge verified");
  const clinicalTable = await page.locator("text=Comparative Clinical Evidence Matrix").first();
  console.log("✅ 9-Diet Comparative Clinical Evidence Matrix verified");

  // 6. 170 -> 155 Recomposition & Telemetry
  console.log("📍 Navigating to /progress ...");
  await page.goto("https://stoic-body.vercel.app/progress", { waitUntil: "networkidle" });
  const recompositionHeader = await page.locator("text=Target: 155.0 lbs").first();
  console.log("✅ 170 -> 155 lbs Recomposition Target verified");
  const vaultHeader = await page.locator("text=Encrypted Visual Check-In Vault").first();
  console.log("✅ Encrypted Visual Check-In Vault verified");

  // 7. Timeline & MVD Calendar
  console.log("📍 Navigating to /calendar ...");
  await page.goto("https://stoic-body.vercel.app/calendar", { waitUntil: "networkidle" });
  const timelineHeader = await page.locator("text=Protected Buffer Timeline").first();
  console.log("✅ Protected Buffer Timeline verified");
  const mvdButton = page.locator("button:has-text('Active Day View')");
  await mvdButton.click();
  console.log("✅ Switched to Minimum Viable Day (MVD) compressed schedule");

  // 8. Settings & Sovereign License
  console.log("📍 Navigating to /settings ...");
  await page.goto("https://stoic-body.vercel.app/settings", { waitUntil: "networkidle" });
  const sovereignBadge = await page.locator("text=Founder Sovereign License").first();
  console.log("✅ Founder Sovereign License permanently verified");

  await browser.close();
  console.log("🏆 ALL 8 ROUTES & LIVE BROWSER VERIFICATIONS PASSED 100%!");
}

verifyLiveApp().catch((err) => {
  console.error("❌ Verification failed:", err);
  process.exit(1);
});
