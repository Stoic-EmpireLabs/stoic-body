import { chromium } from "playwright";
import { spawn } from "child_process";

async function run() {
  console.log("Starting Next.js server on port 3011...");
  const server = spawn("cmd.exe", ["/c", "npx next start -p 3011"], {
    cwd: "C:/Users/stoic/AntigravityWorkspace/projects/stoic-body",
    stdio: "pipe",
  });

  await new Promise((r) => setTimeout(r, 4500));

  try {
    const browser = await chromium.launch();
    const context = await browser.newContext({ viewport: { width: 1280, height: 950 } });
    
    // Seed all keys so onboarding & tours are silent
    await context.addInitScript(() => {
      localStorage.setItem("stoic_has_visited", "true");
      localStorage.setItem("stoic_founder_onboarding_completed", "true");
      localStorage.setItem("stoic_tour_completed", "true");
      localStorage.setItem("stoic_user_onboarded", "true");
    });

    const page = await context.newPage();

    // 1. Capture /training (Open-GYM Anatomical Body Map)
    console.log("Navigating to /training...");
    await page.goto("http://localhost:3011/training", { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: "C:/Users/stoic/.gemini/antigravity/brain/958af3de-883f-4c46-95ab-6f08aeb8e3d0/opengym-bodymap-clean.png",
      fullPage: true,
    });
    console.log("Captured opengym-bodymap-clean.png");

    // Click on muscle chip or SVG path using page.evaluate
    await page.evaluate(() => {
      const g = document.getElementById("muscle-group-chest");
      if (g) g.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    await page.waitForTimeout(500);
    await page.screenshot({
      path: "C:/Users/stoic/.gemini/antigravity/brain/958af3de-883f-4c46-95ab-6f08aeb8e3d0/opengym-bodymap-chest-targeted.png",
      fullPage: true,
    });
    console.log("Captured opengym-bodymap-chest-targeted.png");

    // 2. Capture /exercises (552 Catalog)
    console.log("Navigating to /exercises...");
    await page.goto("http://localhost:3011/exercises", { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: "C:/Users/stoic/.gemini/antigravity/brain/958af3de-883f-4c46-95ab-6f08aeb8e3d0/opengym-exercises-catalog.png",
      fullPage: true,
    });
    console.log("Captured opengym-exercises-catalog.png");

    // 3. Capture / (Today Command Center with Open-GYM Active Engine)
    console.log("Navigating to /...");
    await page.goto("http://localhost:3011/", { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: "C:/Users/stoic/.gemini/antigravity/brain/958af3de-883f-4c46-95ab-6f08aeb8e3d0/opengym-today-hero.png",
    });
    console.log("Captured opengym-today-hero.png");

    await browser.close();
    console.log("ALL PLAYWRIGHT SCREENSHOTS CAPTURED WITH 100% SUCCESS!");
  } finally {
    server.kill();
  }
}

run().catch((err) => {
  console.error("Verification error:", err);
  process.exit(1);
});
