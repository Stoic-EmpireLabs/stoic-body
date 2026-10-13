import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BRAIN_DIR = 'C:/Users/stoic/.gemini/antigravity/brain/958af3de-883f-4c46-95ab-6f08aeb8e3d0';

async function runTest() {
  console.log('Launching browser (msedge channel)...');
  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true
  });

  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }, // Mobile viewport iPhone 12/13/14
    deviceScaleFactor: 2
  });

  const page = await context.newPage();

  console.log('Navigating to http://localhost:5174 ...');
  await page.goto('http://localhost:5174', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  // Set male Spartan profile in localStorage
  await page.evaluate(() => {
    const defaultData = {
      profile: {
        name: 'Cristofer Arellano',
        callsign: 'Marcus',
        gender: 'male',
        bio: 'Discipline is destiny.',
        heightCm: 180,
        targetWeightKg: 82,
        activityLevel: 'athlete'
      },
      settings: {
        theme: 'dark',
        units: 'kg',
        soundEnabled: false,
        defaultRestSec: 60,
        heatTone: 'ember',
        language: 'en',
        coachPersonality: 'marine',
        gender: 'male',
        activeProfileId: 'male-spartan-1',
        onboardingCompleted: true
      },
      showOnboarding: false,
      coachPersonality: 'marine',
      route: 'schedule'
    };

    localStorage.setItem('stoic_community_v1', JSON.stringify(defaultData));
    localStorage.setItem('gym-storage', JSON.stringify({ state: defaultData }));
  });

  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Dismiss onboarding if present
  const skipBtn = await page.$('button:has-text("Skip")');
  if (skipBtn) {
    await skipBtn.click();
    await page.waitForTimeout(500);
  }

  console.log('Capturing Schedule Screen (Male / Spartan mode)...');
  await page.screenshot({
    path: path.join(BRAIN_DIR, 'proof-dual-avatar-schedule-male.png'),
    fullPage: false
  });

  // Switch to female profile in localStorage to test female schedule
  await page.evaluate(() => {
    const raw = localStorage.getItem('stoic_community_v1');
    const data = JSON.parse(raw);
    data.profile.gender = 'female';
    data.settings.gender = 'female';
    data.coachPersonality = 'aurelia';
    data.showOnboarding = false;
    localStorage.setItem('stoic_community_v1', JSON.stringify(data));
  });

  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const skipBtn2 = await page.$('button:has-text("Skip")');
  if (skipBtn2) {
    await skipBtn2.click();
    await page.waitForTimeout(500);
  }

  console.log('Capturing Schedule Screen (Female / Empress mode)...');
  await page.screenshot({
    path: path.join(BRAIN_DIR, 'proof-dual-avatar-schedule-female.png'),
    fullPage: false
  });

  // Navigate to Library Screen
  console.log('Navigating to Library Screen...');
  await page.click('nav button:has-text("Library")');
  await page.waitForTimeout(1000);

  console.log('Capturing Library Screen (Female view)...');
  await page.screenshot({
    path: path.join(BRAIN_DIR, 'proof-dual-avatar-library-female.png'),
    fullPage: false
  });

  // Toggle to Male view in Library
  console.log('Toggling to Male (Cristofer) view in Library...');
  const maleBtn = await page.waitForSelector('button:has-text("Male (Cristofer)")');
  await maleBtn.click();
  await page.waitForTimeout(1000);

  console.log('Capturing Library Screen (Male view)...');
  await page.screenshot({
    path: path.join(BRAIN_DIR, 'proof-dual-avatar-library-male.png'),
    fullPage: false
  });

  // Open "Barbell Bench Press" card
  console.log('Opening Barbell Bench Press modal...');
  const benchCard = await page.waitForSelector('text="Barbell Bench Press"');
  await benchCard.click();
  await page.waitForTimeout(1000);

  // Modal Male view
  console.log('Capturing Modal (Male view)...');
  const modalMaleBtn = await page.waitForSelector('button:has-text("Male (Cristofer)")');
  await modalMaleBtn.click();
  await page.waitForTimeout(600);
  await page.screenshot({
    path: path.join(BRAIN_DIR, 'proof-dual-avatar-modal-male.png'),
    fullPage: false
  });

  // Modal Female view
  console.log('Capturing Modal (Female view)...');
  const modalFemaleBtn = await page.waitForSelector('button:has-text("Female (Wife)")');
  await modalFemaleBtn.click();
  await page.waitForTimeout(600);
  await page.screenshot({
    path: path.join(BRAIN_DIR, 'proof-dual-avatar-modal-female.png'),
    fullPage: false
  });

  // Set active session directly to verify Session Screen
  console.log('Setting active session to verify Session Runner Screen...');
  await page.evaluate(() => {
    const raw = localStorage.getItem('stoic_community_v1');
    const data = JSON.parse(raw);
    data.route = 'session';
    data.showOnboarding = false;
    data.session = {
      startTime: Date.now() - 120000,
      elapsedSeconds: 120,
      isPaused: false,
      currentExerciseIndex: 0,
      restEndsAt: null,
      restTotalSeconds: 60,
      routineName: 'Chest & Arms Iron Hypertrophy',
      exercises: [
        {
          id: 'session-ex-1',
          exerciseId: 'EIeI8Vf', // Barbell Bench Press
          name: 'Barbell Bench Press',
          primary: 'chest',
          sets: [
            { id: 'set-1', reps: 10, weight: 100, done: true, kind: 'normal' },
            { id: 'set-2', reps: 8, weight: 100, done: false, kind: 'normal' },
            { id: 'set-3', reps: 6, weight: 100, done: false, kind: 'normal' }
          ]
        }
      ]
    };
    localStorage.setItem('stoic_community_v1', JSON.stringify(data));
  });

  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  console.log('Capturing Active Workout Runner / Session Screen...');
  await page.screenshot({
    path: path.join(BRAIN_DIR, 'proof-dual-avatar-session.png'),
    fullPage: false
  });

  console.log('SUCCESS: All 6 dual-avatar verification screenshots successfully captured!');
  await browser.close();
}

runTest().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
