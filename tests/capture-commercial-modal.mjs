import { chromium } from "playwright";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";

async function runCaptureCommercial() {
  const screenshotsDir = path.resolve("./verification-screenshots");
  const server = spawn("npx", ["next", "start", "-p", "3018"], {
    shell: true,
    stdio: "inherit",
    cwd: process.cwd(),
  });

  await new Promise((r) => setTimeout(r, 3000));

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });

    // Visit home first to bypass onboarding if needed
    await page.goto("http://localhost:3018", { waitUntil: "networkidle" });
    
    // Dismiss onboarding if present
    const loadFounderBtn = await page.$('button:has-text("Load Founder Baseline")');
    if (loadFounderBtn) {
      await loadFounderBtn.click();
      await page.waitForTimeout(500);
    } else {
      const skipBtn = await page.$('button:has-text("Skip Setup")');
      if (skipBtn) {
        await skipBtn.click();
        await page.waitForTimeout(500);
      }
    }

    // Now visit settings page
    await page.goto("http://localhost:3018/settings", { waitUntil: "networkidle" });
    
    // Click "Manage Commercial License"
    const licenseBtn = await page.$('button:has-text("Manage Commercial License")');
    if (licenseBtn) {
      await licenseBtn.click();
      await page.waitForTimeout(600);
      await page.screenshot({
        path: path.join(screenshotsDir, "10-commercial-license-modal.png"),
        fullPage: false,
      });
      console.log("✓ Captured Commercial Licensing & Store Sandbox Modal!");
    } else {
      console.warn("Manage Commercial License button not found!");
    }

  } finally {
    if (browser) await browser.close();
    server.kill();
  }
}

runCaptureCommercial().catch((err) => {
  console.error("Capture failed:", err);
  process.exit(1);
});
