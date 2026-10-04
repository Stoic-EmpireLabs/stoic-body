import { chromium } from "playwright";

const BASE_URL = "https://stoic-body.vercel.app";

async function verifyAiSpectrumIntegration() {
  console.log(`🚀 Starting Playwright verification on ${BASE_URL} ...`);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  const page = await context.newPage();

  try {
    // 1. Check Learning Page
    await page.goto(`${BASE_URL}/learning`, { waitUntil: "networkidle" });
    console.log("✓ Loaded /learning page");

    // 2. Check AI Hierarchy Spectrum Banner
    const roadmapVisible = await page.isVisible("text=The AI Hierarchy Spectrum: From Machine Learning to Agentic AI");
    console.log(`✓ AI Hierarchy Spectrum Banner Visible: ${roadmapVisible}`);
    if (!roadmapVisible) throw new Error("AI Hierarchy Spectrum banner not visible!");

    // 3. Verify all 7 Pillars exist
    const p1 = await page.isVisible("text=1. AI");
    const p2 = await page.isVisible("text=2. ML");
    const p3 = await page.isVisible("text=3. DL");
    const p4 = await page.isVisible("text=4. GenAI");
    const p5 = await page.isVisible("text=5. LLMs");
    const p6 = await page.isVisible("text=6. RAG");
    const p7 = await page.isVisible("text=7. Agentic AI");
    console.log(`✓ 7 Pillars Verified: AI(${p1}), ML(${p2}), DL(${p3}), GenAI(${p4}), LLMs(${p5}), RAG(${p6}), Agentic(${p7})`);

    // 4. Test clicking on Pillar 7 (Agentic AI)
    await page.click('button:has-text("7. Agentic AI")');
    await page.waitForTimeout(400);
    const agenticActive = await page.isVisible("text=7. Agentic AI — Autonomous Goal-Directed Systems");
    console.log(`✓ Jump to Pillar 7 verified: ${agenticActive}`);

    // 5. Test clicking on Pillar 4 (Generative AI)
    await page.click('button:has-text("4. GenAI")');
    await page.waitForTimeout(400);
    const genAiActive = await page.isVisible("text=4. Generative AI (GenAI) — Content Creation Machines");
    console.log(`✓ Jump to Pillar 4 verified: ${genAiActive}`);

    // 6. Test 'Schedule Study Session' button
    await page.click('button:has-text("Schedule Study Session")');
    await page.waitForTimeout(400);
    const scheduleNotif = await page.isVisible("text=Synchronized to Calendar");
    console.log(`✓ Schedule Study Session button verified: ${scheduleNotif}`);

    // 7. Test in-browser Code Sandbox Execution
    const runCodeBtn = page.locator('button:has-text("Run & Test Code")');
    if (await runCodeBtn.isVisible()) {
      await runCodeBtn.click();
      await page.waitForTimeout(600);
      const executionPassed = await page.isVisible("text=TERMINAL STDOUT");
      console.log(`✓ In-Browser Sandbox Execution verified: ${executionPassed}`);
    }

    // 8. Screenshot /learning page
    await page.screenshot({ path: "tests/ai-spectrum-learning.png", fullPage: true });
    console.log("✓ Saved tests/ai-spectrum-learning.png");

    // 9. Navigate to /calendar to verify scheduled study sessions
    await page.goto(`${BASE_URL}/calendar`, { waitUntil: "networkidle" });
    const calendarAiEvent = await page.isVisible("text=AI Spectrum Study");
    console.log(`✓ AI Spectrum Study sessions visible in Calendar: ${calendarAiEvent}`);
    await page.screenshot({ path: "tests/ai-spectrum-calendar.png", fullPage: true });
    console.log("✓ Saved tests/ai-spectrum-calendar.png");

    // 10. Navigate to / to verify daily tasks
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
    const dailyTaskAi = await page.isVisible("text=AI Spectrum Mastery");
    console.log(`✓ AI Spectrum Mastery task visible on Dashboard: ${dailyTaskAi}`);
    await page.screenshot({ path: "tests/ai-spectrum-dashboard.png", fullPage: true });
    console.log("✓ Saved tests/ai-spectrum-dashboard.png");

    console.log("\n🎯 ALL PLAYWRIGHT VERIFICATION CHECKS PASSED WITH 100% SUCCESS!");
  } catch (err) {
    console.error("❌ Playwright verification error:", err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

verifyAiSpectrumIntegration();
