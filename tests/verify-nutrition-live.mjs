import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1100 } });
  const page = await context.newPage();

  console.log("Navigating to https://stoic-body.vercel.app/nutrition ...");
  await page.goto("https://stoic-body.vercel.app/nutrition", { waitUntil: "networkidle" });

  const title = await page.title();
  console.log("Page title:", title);

  // Take screenshot of the Sovereign Blueprints section
  await page.screenshot({ path: "tests/nutrition-blueprints-live.png", fullPage: true });
  console.log("Saved full page screenshot to tests/nutrition-blueprints-live.png");

  // Check for the presence of key blueprint items
  const pageContent = await page.content();
  const hasFish = pageContent.includes("Wild Alaskan Salmon") || pageContent.includes("Fish");
  const hasTurkey = pageContent.includes("Lean Ground Turkey") || pageContent.includes("Turkey");
  const hasChicken = pageContent.includes("Chicken Breast") || pageContent.includes("Chicken");
  const hasRice = pageContent.includes("Jasmine Rice") || pageContent.includes("Basmati Rice");
  const hasChia = pageContent.includes("Lemon Water with Soaked Chia Seeds");

  console.log({ hasFish, hasTurkey, hasChicken, hasRice, hasChia });

  if (!hasFish || !hasTurkey || !hasChicken || !hasRice || !hasChia) {
    console.error("Missing key nutrition elements!");
    process.exit(1);
  }

  console.log("Verification succeeded!");
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
