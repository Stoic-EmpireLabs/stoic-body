import { chromium } from "playwright";
import path from "path";

const ARTIFACT_DIR = "C:/Users/stoic/.gemini/antigravity/brain/958af3de-883f-4c46-95ab-6f08aeb8e3d0";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1100 },
    deviceScaleFactor: 2,
  });

  await context.addInitScript(() => {
    localStorage.setItem("stoic_has_visited", "true");
    localStorage.setItem("stoic_tour_completed", "true");
  });

  const page = await context.newPage();

  console.log("Capturing coaching page centered on Dichotomy of Control & Directive...");
  await page.goto("http://localhost:3000/coaching", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  // Click on preset chip
  const presetBtn = page.locator("button:has-text('Hesitation Before Heavy Leg Day')").first();
  if (await presetBtn.isVisible()) {
    await presetBtn.click();
    await page.waitForTimeout(500);
  }

  // Scroll down slightly so oracle card, dichotomy of control, and tactical directive are perfectly in view
  await page.evaluate(() => {
    window.scrollBy(0, 320);
  });
  await page.waitForTimeout(400);

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, "upgraded-coaching-dichotomy.png"),
    fullPage: false,
  });

  console.log("Capturing full-page coaching audit...");
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, "upgraded-coaching-fullpage.png"),
    fullPage: true,
  });

  await browser.close();
  console.log("Captured successfully!");
}

main().catch((err) => {
  console.error("Error capturing screenshots:", err);
  process.exit(1);
});
