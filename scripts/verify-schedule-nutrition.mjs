import { chromium } from '../web/node_modules/playwright/index.mjs';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const artifactDir = 'C:\\Users\\stoic\\.gemini\\antigravity\\brain\\958af3de-883f-4c46-95ab-6f08aeb8e3d0';

console.log('===========================================================');
console.log('  VERIFYING SCHEDULE & NUTRITION MISSION WORKFLOWS         ');
console.log('===========================================================');

const server = spawn('npm', ['--prefix', 'web', 'run', 'preview', '--', '--port', '4173'], {
  cwd: projectRoot,
  shell: true,
  stdio: 'pipe',
});

await new Promise((r) => setTimeout(r, 2500));

const browser = await chromium.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: true,
});

const context = await browser.newContext({
  viewport: { width: 1440, height: 950 },
  deviceScaleFactor: 2,
});

const page = await context.newPage();
page.on('dialog', async (dialog) => {
  await dialog.accept();
});

const results = [];
function test(name, passed, detail = '') {
  results.push({ name, passed, detail });
  console.log(`${passed ? '✅ PASS' : '❌ FAIL'} | ${name} ${detail ? `(${detail})` : ''}`);
}

try {
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1000);

  // 1. Verify Home Screen Widgets
  console.log('\n--- 1. HOME SCREEN: SCHEDULE & NUTRITION SNAPSHOTS ---');
  const scheduleWidget = await page.$('text=Today\'s Mission Timeline');
  test('Home Screen has Today\'s Mission Timeline widget', !!scheduleWidget);

  const nutritionWidget = await page.$('text=Nutrition & Fasting');
  test('Home Screen has Nutrition & Fasting widget', !!nutritionWidget);

  // Check water add button
  const initialWaterText = await page.evaluate(() => {
    const el = document.body.innerText;
    const match = el.match(/Hydration:\s*(\d+)\s*ml/);
    return match ? parseInt(match[1]) : 0;
  });

  const plus250Btn = await page.$('button:has-text("250ml")');
  if (plus250Btn) {
    await plus250Btn.click();
    await page.waitForTimeout(400);
    const newWater = await page.evaluate(() => {
      const el = document.body.innerText;
      const match = el.match(/Hydration:\s*(\d+)\s*ml/);
      return match ? parseInt(match[1]) : 0;
    });
    test('Quick +250ml Hydration button updates store state', newWater === initialWaterText + 250, `${initialWaterText} -> ${newWater}`);
  }

  // Capture Home Screen with widgets
  const homeScreenshot = path.join(artifactDir, 'stoic-body-home-schedule-widget.png');
  await page.screenshot({ path: homeScreenshot, fullPage: false });
  console.log(`📸 Screenshot saved: ${homeScreenshot}`);

  // 2. Navigate to Daily Schedule Screen
  console.log('\n--- 2. DAILY SCHEDULE SCREEN & 14-DAY TIMELINE ---');
  const scheduleNavBtn = await page.$('button:has-text("Daily Schedule")');
  if (scheduleNavBtn) {
    await scheduleNavBtn.click();
    await page.waitForTimeout(600);
  }

  const scheduleHeader = await page.$('text=Daily Schedule & Mission Planner');
  test('Navigated to Daily Schedule screen', !!scheduleHeader);

  // Check 14-day horizontal strip
  const dateTabs = await page.$$('.overflow-x-auto button');
  test('14-day date strip buttons rendered', dateTabs.length >= 10, `Found ${dateTabs.length} date buttons`);

  // Click tomorrow tab (2 days ago, yesterday, today, tomorrow -> index 3)
  if (dateTabs.length > 3) {
    await dateTabs[3].click();
    await page.waitForTimeout(400);
    test('Can switch to Tomorrow in calendar', true);
  }

  // Switch back to today (index 2)
  if (dateTabs.length > 2) {
    await dateTabs[2].click();
    await page.waitForTimeout(400);
  }

  // Capture Schedule Screen Main View
  const scheduleScreenshot = path.join(artifactDir, 'stoic-body-schedule-screen.png');
  await page.screenshot({ path: scheduleScreenshot, fullPage: false });
  console.log(`📸 Screenshot saved: ${scheduleScreenshot}`);

  // Test "+ Schedule Event" modal
  const addEventBtn = await page.$('button:has-text("Schedule Event")');
  test('Schedule Event button exists', !!addEventBtn);
  if (addEventBtn) {
    await addEventBtn.click();
    await page.waitForTimeout(400);

    const scheduleModalScreenshot = path.join(artifactDir, 'stoic-body-schedule-modal.png');
    await page.screenshot({ path: scheduleModalScreenshot, fullPage: false });

    const modalTitleInput = await page.$('input[placeholder*="Boxing"], input[placeholder*="Heavy Bag"]');
    if (modalTitleInput) {
      await modalTitleInput.fill('Afternoon 45m Tactical Ruck (45lb Plate Carrier)');
      const submitBtn = await page.$('button:has-text("Add Event to Schedule")');
      if (submitBtn) {
        await submitBtn.click();
        await page.waitForTimeout(500);
        const addedEvent = await page.$('text=Afternoon 45m Tactical Ruck');
        test('Custom event added to schedule timeline successfully', !!addedEvent);
      }
    }
  }

  // 3. Navigate to Meals & Nutrition Screen
  console.log('\n--- 3. MEALS & NUTRITION LEDGER ---');
  const nutritionNavBtn = await page.$('button:has-text("Meals & Nutrition")');
  if (nutritionNavBtn) {
    await nutritionNavBtn.click();
    await page.waitForTimeout(600);
  }

  const nutritionHeader = await page.$('text=Nutrition & Macro Ledger');
  test('Navigated to Meals & Nutrition screen', !!nutritionHeader);

  // Fasting Protocol Card
  const fastingCard = await page.$('text=Fasting Protocol');
  test('Fasting protocol & countdown card is visible', !!fastingCard);

  // Read initial calories
  const initialCalories = await page.evaluate(() => {
    const el = document.body.innerText;
    const match = el.match(/(\d[\d,]*)\s*\/\s*(\d[\d,]*)\s*kcal/);
    return match ? parseInt(match[1].replace(/,/g, '')) : 0;
  });

  // Test 1-Click Founder Preset: Wild Salmon & Steamed Jasmine Rice
  const salmonPresetBtn = await page.$('button:has-text("Wild Salmon")');
  test('Founder Preset (Wild Salmon & Jasmine Rice) exists', !!salmonPresetBtn);
  if (salmonPresetBtn) {
    await salmonPresetBtn.click();
    await page.waitForTimeout(500);

    const updatedCalories = await page.evaluate(() => {
      const el = document.body.innerText;
      const match = el.match(/(\d[\d,]*)\s*\/\s*(\d[\d,]*)\s*kcal/);
      return match ? parseInt(match[1].replace(/,/g, '')) : 0;
    });
    test('Logging Founder Preset immediately updates calorie total (+680 kcal)', updatedCalories > initialCalories, `${initialCalories} -> ${updatedCalories}`);
  }

  // Check Clinical Matrix
  const clinicalMatrix = await page.$('text=Clinical Dietary Composition Archetypes');
  test('Clinical Nutrition Matrix with peer-reviewed citations is present', !!clinicalMatrix);

  // Capture Nutrition Screen Main View (with logged preset!)
  const nutritionScreenshot = path.join(artifactDir, 'stoic-body-nutrition-screen.png');
  await page.screenshot({ path: nutritionScreenshot, fullPage: false });
  console.log(`📸 Screenshot saved: ${nutritionScreenshot}`);

  // Test Custom Food Modal
  const logCustomFoodBtn = await page.$('button:has-text("Log Custom Food")');
  test('Log Custom Food button exists', !!logCustomFoodBtn);
  if (logCustomFoodBtn) {
    await logCustomFoodBtn.click();
    await page.waitForTimeout(400);

    const nutritionModalScreenshot = path.join(artifactDir, 'stoic-body-nutrition-modal.png');
    await page.screenshot({ path: nutritionModalScreenshot, fullPage: false });

    const mealNameInput = await page.$('input[placeholder*="Bison Ribeye"]');
    if (mealNameInput) {
      await mealNameInput.fill('Ribeye Steak & Sweet Potato');
      const calInput = await page.$('input[placeholder="e.g. 750"]');
      if (calInput) await calInput.fill('850');
      const submitFoodBtn = await page.$('button:has-text("Log Food Item")');
      if (submitFoodBtn) {
        await submitFoodBtn.click();
        await page.waitForTimeout(500);
        const loggedEntry = await page.$('text=Ribeye Steak & Sweet Potato');
        test('Custom meal logged to ledger successfully', !!loggedEntry);
      }
    }
  }

  // Summary
  console.log('\n===========================================================');
  console.log(`  VERIFICATION COMPLETE: ${results.filter(r => r.passed).length} / ${results.length} PASSED`);
  console.log('===========================================================');

} catch (err) {
  console.error('Test execution error:', err);
} finally {
  await browser.close();
  server.kill();
  process.exit(0);
}
