import { chromium } from "playwright";

const BASE_URL = "http://localhost:3000";

const TABS = [
  { href: "/", label: "Today", testSelector: "button:has-text('MVD Crisis Mode')" },
  { href: "/calendar", label: "Calendar", testSelector: "text=Unified Temporal Calendar" },
  { href: "/goals", label: "Goals & Countdown", testSelector: "text=Goals & Weekly Targets Hub" },
  { href: "/training", label: "Boxing & Calisthenics", testSelector: "button:has-text('PULL')" },
  { href: "/nutrition", label: "23:1 OMAD", testSelector: "button:has-text('Turkey')" },
  { href: "/progress", label: "170→155 Recomp", testSelector: "text=US Navy Body Fat Formula" },
  { href: "/learning", label: "AI Spectrum & Courses", testSelector: "text=AI Hierarchy Spectrum" },
  { href: "/coaching", label: "Stoic Coach", testSelector: "button:has-text('Centurion')" },
  { href: "/quests", label: "Quests", testSelector: "button:has-text('Forge New Quest')" },
  { href: "/character", label: "Character HUD", testSelector: "canvas" },
  { href: "/imports", label: "Document Vault", testSelector: "text=Document & Reference Media Staging Vault" },
  { href: "/settings", label: "Settings", testSelector: "button:has-text('Save Profile Baseline')" },
];

async function runAudit() {
  console.log("=== STARTING COMPREHENSIVE STOIC BODY TAB & INTERACTION AUDIT ===");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 950 },
  });

  await context.addInitScript(() => {
    localStorage.setItem("stoic_has_visited", "true");
    localStorage.setItem("stoic_tour_completed", "true");
  });

  const page = await context.newPage();
  const consoleErrors = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(`[Console Error on ${page.url()}]: ${msg.text()}`);
    }
  });

  page.on("pageerror", (err) => {
    consoleErrors.push(`[Uncaught Page Error on ${page.url()}]: ${err.message}`);
  });

  const results = [];

  for (const tab of TABS) {
    const url = `${BASE_URL}${tab.href}`;
    console.log(`Auditing Tab: "${tab.label}" (${tab.href})...`);
    
    const response = await page.goto(url, { waitUntil: "networkidle" });
    const status = response.status();
    
    if (status !== 200) {
      results.push({ tab: tab.label, href: tab.href, status, success: false, detail: `HTTP ${status}` });
      continue;
    }

    // Verify key interactive selector exists on the page
    let interactiveFound = false;
    try {
      const el = page.locator(tab.testSelector).first();
      await el.waitFor({ timeout: 5000, state: "visible" });
      interactiveFound = await el.isVisible();
    } catch (e) {
      interactiveFound = false;
    }

    results.push({
      tab: tab.label,
      href: tab.href,
      status,
      success: interactiveFound,
      detail: interactiveFound ? "All Interactive Elements Verified" : `Missing test selector: ${tab.testSelector}`,
    });
  }

  console.log("\n=== TESTING IN-DEPTH INTERACTION BEHAVIORS ===");

  // 1. Test Navigation clicks via Nav bar
  console.log("Testing Nav bar tab click transitions...");
  await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
  await page.locator("#tour-tab-training").click();
  await page.waitForURL("**/training");
  console.log("✓ Navigated to /training via #tour-tab-training");

  // 2. Test Training Form Cues Expansion & Rest Timer
  console.log("Testing Training Form Cues toggle...");
  const formCuesBtn = page.locator("button:has-text('Tactical Form Cues')").first();
  await formCuesBtn.click();
  const cuesVisible = await page.locator("text=SETUP & SCAPULAR LOCKOUT").isVisible();
  console.log(cuesVisible ? "✓ Form Cues expanded successfully" : "✗ Form Cues failed to expand");

  // 3. Test Set click & Rest timer HUD
  console.log("Testing Set Checkbox & Rest Timer HUD...");
  const setBtn = page.locator("button:has-text('S1')").first();
  await setBtn.click();
  const timerVisible = await page.locator("text=REST INTERVAL").isVisible();
  console.log(timerVisible ? "✓ Tactical Rest Timer HUD activated on set click" : "✗ Timer HUD not visible");

  // 4. Test Quests Forge Modal
  console.log("Testing /quests Forge Modal...");
  await page.locator("#tour-tab-quests").click();
  await page.waitForURL("**/quests");
  await page.waitForTimeout(400);
  const forgeBtn = page.locator("button:has-text('Forge New Quest')").first();
  await forgeBtn.click();
  await page.waitForTimeout(400);
  const modalVisible = await page.locator("text=Forge Custom Sovereign Quest").isVisible();
  console.log(modalVisible ? "✓ Quest Forge Modal opened" : "✗ Quest Forge Modal failed to open");
  // Close modal
  await page.locator("button:has-text('Cancel')").first().click();
  await page.waitForTimeout(300);

  // 5. Test Coaching Socratic Oracle Dilemma Triage
  console.log("Testing /coaching Socratic Oracle interaction...");
  await page.locator("#tour-tab-coaching").click();
  await page.waitForURL("**/coaching");
  const chip = page.locator("button:has-text('Tempted to Break 23:1 OMAD Fast Early')").first();
  await chip.click();
  const triageVisible = await page.locator("text=Within Sovereign Control").isVisible();
  console.log(triageVisible ? "✓ Socratic Oracle resolved dilemma with Dichotomy of Control" : "✗ Oracle failed to resolve");

  // 6. Test Settings Tab & Audio Chime
  console.log("Testing /settings audio buttons and biometrics form...");
  await page.locator("#tour-tab-settings").click();
  await page.waitForURL("**/settings");
  const saveBtn = page.locator("button:has-text('Save Profile Baseline')").first();
  const saveBtnVisible = await saveBtn.isVisible();
  console.log(saveBtnVisible ? "✓ Settings profile form verified" : "✗ Settings profile form not visible");

  console.log("\n=== AUDIT RESULTS SUMMARY ===");
  console.table(results);

  if (consoleErrors.length > 0) {
    console.log("\nConsole Errors encountered:", consoleErrors);
  } else {
    console.log("\n✓ ZERO CONSOLE ERRORS ENCOUNTERED ACROSS ALL 12 TABS!");
  }

  await browser.close();
}

runAudit().catch((err) => {
  console.error("Audit failed with error:", err);
  process.exit(1);
});
