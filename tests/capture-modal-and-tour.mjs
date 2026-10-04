import { chromium } from "playwright";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";

async function runCapture() {
  const screenshotsDir = path.resolve("./verification-screenshots");
  const server = spawn("npx", ["next", "start", "-p", "3011"], {
    shell: true,
    stdio: "inherit",
    cwd: process.cwd(),
  });

  await new Promise((r) => setTimeout(r, 3000));

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });

    // 1. Visit page and open Onboarding Modal to Step 2
    await page.goto("http://localhost:3011", { waitUntil: "networkidle" });
    
    // Check if onboarding modal is visible, click Continue -> Step 2
    const continueBtn = await page.$('button:has-text("Continue")');
    if (continueBtn) {
      await continueBtn.click();
      await page.waitForTimeout(500);
      await page.screenshot({
        path: path.join(screenshotsDir, "07-onboarding-step2-timeline-deficit.png"),
        fullPage: false,
      });
      console.log("✓ Captured Onboarding Step 2 with Timeline & Live Deficit calculation!");
    }

    // Now complete onboarding to get to main dashboard
    // Click Next until finished or click "Skip Setup (Explore as Guest)" or "Load Founder Baseline"
    await page.goto("http://localhost:3011", { waitUntil: "networkidle" });
    const loadFounderBtn = await page.$('button:has-text("Load Founder Baseline")');
    if (loadFounderBtn) {
      await loadFounderBtn.click();
      await page.waitForTimeout(600);
    }

    // Now start the Tour via header button
    const tourBtn = await page.$('button:has-text("Tour")');
    if (tourBtn) {
      await tourBtn.click();
      await page.waitForTimeout(700);
      await page.screenshot({
        path: path.join(screenshotsDir, "08-interactive-tour-live-spotlight.png"),
        fullPage: false,
      });
      console.log("✓ Captured Interactive Tour Spotlight with glowing tab ring & pointer arrow!");
    }

  } finally {
    if (browser) await browser.close();
    server.kill();
  }
}

runCapture().catch((err) => {
  console.error("Capture failed:", err);
  process.exit(1);
});
