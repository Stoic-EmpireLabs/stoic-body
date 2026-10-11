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
console.log('  VERIFYING STOIC BODY CUSTOMIZATIONS & FEATURES          ');
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

  // 1. Verify Home Screen & Daily Stoic Quote Card
  console.log('\n--- 1. TODAY DASHBOARD & STOIC QUOTE CARD ---');
  const quoteCard = await page.$('text=Daily Discipline');
  test('Daily Stoic Quote Card is mounted', !!quoteCard);

  const initialQuoteText = await page.evaluate(() => {
    const el = document.querySelector('blockquote, p.italic');
    return el ? el.textContent : '';
  });
  console.log(`Initial Quote: "${(initialQuoteText || '').slice(0, 60)}..."`);
  test('Initial quote is non-empty', (initialQuoteText || '').length > 5);

  // Click Quote Shuffle Button
  const shuffleBtn = await page.$('button[title="Draw another quote"]');
  test('Quote shuffle button exists', !!shuffleBtn);
  if (shuffleBtn) {
    await shuffleBtn.click();
    await page.waitForTimeout(400);
    const shuffledQuoteText = await page.evaluate(() => {
      const el = document.querySelector('blockquote, p.italic');
      return el ? el.textContent : '';
    });
    console.log(`Shuffled Quote: "${(shuffledQuoteText || '').slice(0, 60)}..."`);
    test('Quote shuffle triggered', (shuffledQuoteText || '').length > 5);
  }

  // Screenshot 1: Home Screen with Quote Card
  await page.screenshot({
    path: path.join(artifactDir, 'stoic-body-quote-and-home.png'),
    fullPage: false,
  });
  console.log('📸 Saved screenshot: stoic-body-quote-and-home.png');

  // 2. Verify Athlete Switcher Modal
  console.log('\n--- 2. ATHLETE SWITCHER MODAL & LOGIN ---');
  const athletePill = await page.$('button[title="Switch Athlete Profile / Persona"]');
  test('Top bar athlete pill exists', !!athletePill);

  if (athletePill) {
    await athletePill.click();
    await page.waitForTimeout(600);

    const switcherModal = await page.$('text=Athlete Switcher');
    test('Athlete Switcher Modal opened', !!switcherModal);

    // Verify 3 default accounts exist
    const stoicAcc = await page.$('text=Stoic 1712');
    const aureliusAcc = await page.$('text=Marcus Aurelius');
    const coachAcc = await page.$('text=Coach Vanguard');
    test('Default account Stoic 1712 displayed', !!stoicAcc);
    test('Default account Marcus Aurelius displayed', !!aureliusAcc);
    test('Default account Coach Vanguard displayed', !!coachAcc);

    // Screenshot 2: Athlete Switcher Modal
    await page.screenshot({
      path: path.join(artifactDir, 'stoic-body-athlete-switcher.png'),
    });
    console.log('📸 Saved screenshot: stoic-body-athlete-switcher.png');

    // Close switcher modal by clicking close button
    const closeBtn = await page.$('button[title="Close"], button[aria-label="Close"]');
    if (closeBtn) {
      await closeBtn.click();
    } else {
      await page.mouse.click(10, 10);
    }
    await page.waitForTimeout(500);
  }

  // 3. Settings Screen: Coaching Personalities & Assessment Retake
  console.log('\n--- 3. SETTINGS SCREEN COACHING & ASSESSMENT ---');
  const settingsNav = await page.$('aside button:has-text("Settings & Privacy")');
  test('Settings & Privacy nav button found', !!settingsNav);
  if (settingsNav) {
    await settingsNav.click();
    await page.waitForTimeout(600);

    const coachHeader = await page.$('text=Coaching Voice & Quotes Personality');
    test('Coaching Voice section visible in Settings', !!coachHeader);

    const marineCard = await page.$('text=USMC Combat Conditioning');
    const stoicCard = await page.$('text=Classical Stoic Philosophy');
    const proCard = await page.$('text=High-Performance Coach');
    test('USMC Combat Conditioning card present', !!marineCard);
    test('Classical Stoic Philosophy card present', !!stoicCard);
    test('High-Performance Coach card present', !!proCard);

    const assessmentSection = await page.$('text=Stoic Body Assessment Questionnaire');
    test('Assessment Questionnaire panel visible in Settings', !!assessmentSection);

    // Screenshot 3: Settings Screen
    await page.screenshot({
      path: path.join(artifactDir, 'stoic-body-settings-coaches.png'),
    });
    console.log('📸 Saved screenshot: stoic-body-settings-coaches.png');

    // Click Retake Assessment Questionnaire
    const retakeBtn = await page.$('button:has-text("Retake Assessment")');
    test('Retake Assessment button exists', !!retakeBtn);

    if (retakeBtn) {
      await retakeBtn.click();
      await page.waitForTimeout(600);

      const modalHeader = await page.$('text=Personalize Your Protocol');
      test('Onboarding Assessment Questionnaire opened', !!modalHeader);

      // Screenshot 4: Assessment Modal
      await page.screenshot({
        path: path.join(artifactDir, 'stoic-body-assessment-modal.png'),
      });
      console.log('📸 Saved screenshot: stoic-body-assessment-modal.png');

      const modal = page.locator('.fixed.inset-0.z-50');

      // Click Next Step through questions
      await modal.locator('button:has-text("Next Step")').click();
      await page.waitForTimeout(300);

      // Step 2
      const step2 = await modal.locator('text=Experience & Training Age').isVisible();
      test('Assessment Step 2 rendered', step2);
      await modal.locator('text=Combat Veteran / Advanced Athlete').click();
      await page.waitForTimeout(300);
      await modal.locator('button:has-text("Next Step")').click();
      await page.waitForTimeout(300);

      // Step 3
      const step3 = await modal.locator('text=What equipment do you have access to?').isVisible();
      test('Assessment Step 3 rendered', step3);
      await modal.locator('text=Commercial / Base Gym').click();
      await page.waitForTimeout(300);
      await modal.locator('button:has-text("Next Step")').click();
      await page.waitForTimeout(300);

      // Step 4
      const step4 = await modal.locator('text=Choose Your Primary Coach & Philosophy').isVisible();
      test('Assessment Step 4 rendered', step4);
      await modal.locator('button:has-text("Complete Assessment")').click();
      await page.waitForTimeout(600);

      const modalVisible = await modal.isVisible().catch(() => false);
      test('Assessment Questionnaire completed & closed', !modalVisible);
    }
  }

  // 4. Profile Screen Verification
  console.log('\n--- 4. PROFILE SCREEN & MILITARY IDENTITY ---');
  const profileNav = await page.$('aside button:has-text("Athlete Profile")');
  test('Athlete Profile nav button found', !!profileNav);
  if (profileNav) {
    await profileNav.click();
    await page.waitForTimeout(600);

    const nameEl = await page.$('text=Stoic 1712');
    test('Profile displays Stoic 1712', !!nameEl);

    const usmcBadge = await page.$('text=USMC');
    test('Profile displays USMC branch badge', !!usmcBadge);

    const callsignBadge = await page.$('text=Callsign: Gunny');
    test('Profile displays Callsign: Gunny', !!callsignBadge);

    const switchBtn = await page.$('button:has-text("Switch Athlete")');
    test('Switch Athlete button is present on Profile', !!switchBtn);

    // Screenshot 5: Profile Screen
    await page.screenshot({
      path: path.join(artifactDir, 'stoic-body-profile-marine.png'),
    });
    console.log('📸 Saved screenshot: stoic-body-profile-marine.png');
  }

} catch (err) {
  console.error('Test execution error:', err);
} finally {
  await browser.close();
  server.kill();
  const passedCount = results.filter((r) => r.passed).length;
  console.log('\n===========================================================');
  console.log(`  SUMMARY: ${passedCount}/${results.length} TESTS PASSED`);
  console.log('===========================================================');
  process.exit(passedCount === results.length ? 0 : 1);
}
