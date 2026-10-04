import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const BASE_URL = "https://stoic-body.vercel.app";

const ROUTES = [
  { path: "/", name: "Today Command Center", selector: "text=Morning Anchor" },
  { path: "/training", name: "Calisthenics & Boxing Studio", selector: "text=Home Boxing Round Timer" },
  { path: "/nutrition", name: "23:1 OMAD Fasting & Macros", selector: "text=23:1 OMAD Protocol" },
  { path: "/progress", name: "170→155 Recomposition Vault", selector: "text=Target Body Goal" },
  { path: "/calendar", name: "Structured Buffer Timeline", selector: "text=Unified Temporal Calendar" },
  { path: "/learning", name: "Deconstructed Learning Curricula", selector: "text=Deconstructed Learning Curricula" },
  { path: "/coaching", name: "Multi-Tone Stoic Advisory", selector: "text=Multi-Tone Stoic Advisory" },
  { path: "/imports", name: "Document & Media Staging Vault", selector: "text=Vault Index & Two-Step Confirmation Gate" },
  { path: "/character", name: "5-Axis Character Radar & Ladder", selector: "canvas" },
  { path: "/quests", name: "Quest Vault & Milestones", selector: "text=2015 Ford Mustang" },
  { path: "/settings", name: "Founder Sovereign License", selector: "text=Founder Sovereign License" },
];

async function runComprehensiveAudit() {
  console.log(`🔍 Starting Comprehensive Phase 7 Verification Audit on ${BASE_URL} ...`);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });

  const auditResults = [];
  let totalViolations = 0;

  for (const route of ROUTES) {
    const page = await context.newPage();
    const consoleErrors = [];
    const thirdPartyTrackers = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    page.on("request", (req) => {
      const url = req.url();
      if (
        url.includes("google-analytics") ||
        url.includes("doubleclick") ||
        url.includes("facebook") ||
        url.includes("hotjar") ||
        url.includes("telemetry")
      ) {
        thirdPartyTrackers.push(url);
      }
    });

    const startTime = Date.now();
    const response = await page.goto(`${BASE_URL}${route.path}`, {
      waitUntil: "networkidle",
    });
    const loadTimeMs = Date.now() - startTime;
    const status = response.status();

    // Check critical selector
    const element = await page.locator(route.selector).first();
    const isVisible = await element.isVisible();

    // Basic a11y: headings check
    const headingsCount = await page.locator("h1, h2, h3, h4").count();

    const routeResult = {
      route: route.path,
      name: route.name,
      status,
      loadTimeMs,
      elementFound: isVisible,
      headingsCount,
      consoleErrorsCount: consoleErrors.length,
      trackersDetected: thirdPartyTrackers.length,
      passed: status === 200 && isVisible && consoleErrors.length === 0 && thirdPartyTrackers.length === 0,
    };

    if (!routeResult.passed) {
      totalViolations++;
    }

    console.log(
      `  [${routeResult.passed ? "PASS" : "FAIL"}] ${route.path.padEnd(12)} | Status: ${status} | Load: ${loadTimeMs}ms | Headings: ${headingsCount} | Console Errs: ${consoleErrors.length} | Trackers: ${thirdPartyTrackers.length}`
    );

    auditResults.push(routeResult);
    await page.close();
  }

  await browser.close();

  console.log("\n==================================================");
  console.log(`🏆 AUDIT COMPLETE: ${ROUTES.length - totalViolations}/${ROUTES.length} Routes 100% Passed`);
  console.log("==================================================\n");

  if (totalViolations > 0) {
    throw new Error(`Audit failed with ${totalViolations} route violations.`);
  }

  return auditResults;
}

runComprehensiveAudit().catch((err) => {
  console.error("❌ Comprehensive audit failed:", err);
  process.exit(1);
});
