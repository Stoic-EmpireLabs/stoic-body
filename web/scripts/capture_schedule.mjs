import { chromium } from 'playwright';
import path from 'path';

const BRAIN_DIR = 'C:/Users/stoic/.gemini/antigravity/brain/958af3de-883f-4c46-95ab-6f08aeb8e3d0';

async function run() {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const page = await context.newPage();

  await page.goto('http://localhost:5174', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  const getBaseData = (gender, personality) => ({
    profile: {
      name: gender === 'female' ? 'Sophia' : 'Cristofer Arellano',
      callsign: gender === 'female' ? 'Aurelia' : 'Marcus',
      gender,
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
      heatTone: gender === 'female' ? 'rose' : 'ember',
      language: 'en',
      coachPersonality: personality,
      gender,
      activeProfileId: `${gender}-1`,
      onboardingCompleted: true
    },
    showOnboarding: false,
    coachPersonality: personality,
    route: 'home'
  });

  // Male Spartan Mode
  await page.evaluate((data) => {
    localStorage.setItem('stoic_community_v1', JSON.stringify(data));
  }, getBaseData('male', 'marine'));

  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  // Click Schedule tab
  console.log('Navigating to Schedule tab (Male)...');
  await page.click('nav button:has-text("Schedule")');
  await page.waitForTimeout(1000);

  await page.screenshot({ path: path.join(BRAIN_DIR, 'proof-schedule-male-verified.png') });

  // Female Empress Mode
  await page.evaluate((data) => {
    localStorage.setItem('stoic_community_v1', JSON.stringify(data));
  }, getBaseData('female', 'aurelia'));

  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  // Click Schedule tab
  console.log('Navigating to Schedule tab (Female)...');
  await page.click('nav button:has-text("Schedule")');
  await page.waitForTimeout(1000);

  await page.screenshot({ path: path.join(BRAIN_DIR, 'proof-schedule-female-verified.png') });

  console.log('Schedule screenshots captured successfully!');
  await browser.close();
}
run();
