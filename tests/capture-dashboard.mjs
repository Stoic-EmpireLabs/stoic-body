import { chromium } from "playwright";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";

async function runCaptureDashboard() {
  const screenshotsDir = path.resolve("./verification-screenshots");
  const server = spawn("npx", ["next", "start", "-p", "3012"], {
    shell: true,
    stdio: "inherit",
    cwd: process.cwd(),
  });

  await new Promise((r) => setTimeout(r, 3000));

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });

    await page.goto("http://localhost:3012", { waitUntil: "networkidle" });
    
    // Dismiss onboarding by clicking Load Founder Baseline or Skip Setup
    const loadFounderBtn = await page.$('button:has-text("Load Founder Baseline")');
    if (loadFounderBtn) {
      await loadFounderBtn.click();
      await page.waitForTimeout(600);
    } else {
      const skipBtn = await page.$('button:has-text("Skip Setup")');
      if (skipBtn) {
        await skipBtn.click();
        await page.waitForTimeout(600);
      }
    }

    // Now screenshot clean dashboard
    await page.screenshot({
      path: path.join(screenshotsDir, "09-dashboard-full-view.png"),
      fullPage: false,
    });
    console.log("✓ Captured Full Clean Dashboard with Live Countdown & Glassmorphism!");

  } finally {
    if (browser) await browser.close();
    server.kill();
  }
}

runCaptureDashboard().catch((err) => {
  console.error("Capture failed:", err);
  process.exit(1);
});
