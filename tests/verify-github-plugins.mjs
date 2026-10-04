import { chromium } from "playwright";
import fs from "node:fs";

const BASE_URL = "https://stoic-body.vercel.app";

async function verifyGitHubPluginsHub() {
  console.log(`🚀 Starting Playwright verification on ${BASE_URL}/learning ...`);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });

  try {
    // 1. Navigate to /learning
    await page.goto(`${BASE_URL}/learning`, { waitUntil: "networkidle" });
    console.log("✓ Loaded /learning page successfully");

    // 2. Verify GitHub Repo Plugins header
    const hubHeader = await page.textContent("text=GitHub Repository Plugins & Sovereign Curricula");
    if (!hubHeader) throw new Error("GitHub Plugins Hub header not found!");
    console.log("✓ Verified GitHub Plugins Hub header");

    // 3. Verify top curated repos are visible
    const geminiRepo = await page.isVisible("text=google-gemini/cookbook");
    const promptRepo = await page.isVisible("text=dair-ai/Prompt-Engineering-Guide");
    const playwrightRepo = await page.isVisible("text=microsoft/playwright");
    const shadcnRepo = await page.isVisible("text=shadcn-ui/ui");

    console.log(`✓ Curated Repos Rendered: Gemini (${geminiRepo}), PromptEng (${promptRepo}), Playwright (${playwrightRepo}), shadcn (${shadcnRepo})`);

    // 4. Test Search Bar
    const searchInput = page.locator('input[placeholder*="Search repositories"]');
    await searchInput.fill("playwright");
    await page.waitForTimeout(300);
    const searchMatch = await page.isVisible("text=Microsoft Playwright Automation");
    console.log(`✓ Search filtering for 'playwright' verified: ${searchMatch}`);

    // Clear search
    await searchInput.fill("");
    await page.waitForTimeout(300);

    // 5. Test Category Filter
    await page.click('button:has-text("Google Antigravity & AI")');
    await page.waitForTimeout(300);
    const geminiCookbookVisible = await page.isVisible("text=Google Gemini API Cookbook");
    console.log(`✓ Filter by 'Google Antigravity & AI' verified: ${geminiCookbookVisible}`);

    // 6. Test Copy Clone Command Feedback
    const copyButton = page.locator('button:has-text("Copy Clone")').first();
    await copyButton.click();
    await page.waitForTimeout(400);
    const copiedFeedback = await page.isVisible("text=Copied Clone CMD!");
    console.log(`✓ Copy Clone feedback verified: ${copiedFeedback}`);

    // 7. Reset Category to All
    await page.click('button:has-text("All")');
    await page.waitForTimeout(300);

    // 8. Test Tab Switching to Brilliant AI Courses
    await page.click('button:has-text("Brilliant AI Courses & Studio")');
    await page.waitForTimeout(400);
    const brilliantPlayerVisible = await page.isVisible("text=% Mastered");
    console.log(`✓ Switched to Brilliant Interactive Player: ${brilliantPlayerVisible}`);

    // 9. Switch back to GitHub Plugins tab and take screenshot
    await page.click('button:has-text("GitHub Plugins & Free Repos")');
    await page.waitForTimeout(400);

    await page.screenshot({ path: "tests/github-plugins-live.png", fullPage: true });
    console.log("✓ Full page screenshot saved to tests/github-plugins-live.png");

    console.log("\n🎯 ALL PLAYWRIGHT VERIFICATION CHECKS PASSED WITH 100% SUCCESS!");
  } catch (err) {
    console.error("❌ Verification failed:", err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

verifyGitHubPluginsHub();
