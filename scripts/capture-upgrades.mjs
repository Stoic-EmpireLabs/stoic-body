import { chromium } from "playwright";
import path from "path";

const ARTIFACT_DIR = "C:\\Users\\stoic\\.gemini\\antigravity\\brain\\958af3de-883f-4c46-95ab-6f08aeb8e3d0";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 950 },
    deviceScaleFactor: 2,
  });

  // Pre-seed localStorage so onboarding and tour modals are dismissed
  await context.addInitScript(() => {
    localStorage.setItem("stoic_has_visited", "true");
    localStorage.setItem("stoic_tour_completed", "true");
  });

  const page = await context.newPage();

  console.log("1. Capturing /training with Form Cues & Rest Timer...");
  await page.goto("http://localhost:3000/training", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  // Click on first Form Cues button to expand anatomical breakdown
  const formCuesButton = page.locator("button:has-text('Form Cues')").first();
  if (await formCuesButton.isVisible()) {
    await formCuesButton.click();
    await page.waitForTimeout(400);
  }

  // Click on a set checkbox to activate the floating tactical rest timer
  const setCheckbox = page.locator("button:has-text('Set 1')").first();
  if (await setCheckbox.isVisible()) {
    await setCheckbox.click();
    await page.waitForTimeout(500);
  }

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, "upgraded-training-tactical.png"),
    fullPage: false,
  });

  console.log("2. Capturing /quests with Sovereign Vault & Step Checklists...");
  await page.goto("http://localhost:3000/quests", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, "upgraded-quests-board.png"),
    fullPage: false,
  });

  console.log("3. Capturing /character with Dynamic 5-Axis Radar & Spartan Relics...");
  await page.goto("http://localhost:3000/character", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, "upgraded-character-radar.png"),
    fullPage: false,
  });

  console.log("4. Capturing /coaching with Socratic Oracle & Dichotomy of Control...");
  await page.goto("http://localhost:3000/coaching", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  // Click on preset chip
  const presetBtn = page.locator("button:has-text('Hesitation Before Heavy Leg Day')").first();
  if (await presetBtn.isVisible()) {
    await presetBtn.click();
    await page.waitForTimeout(500);
  }

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, "upgraded-coaching-oracle.png"),
    fullPage: false,
  });

  console.log("All screenshots captured successfully into artifact directory!");
  await browser.close();
}

main().catch((err) => {
  console.error("Error capturing screenshots:", err);
  process.exit(1);
});
