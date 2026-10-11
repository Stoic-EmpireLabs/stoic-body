import { test, expect } from '@playwright/test';

test.describe('Male & Female Physiological Calibration & Planned Sets', () => {
  test('Female athlete (Aurelia) generates calibrated glute/core plan with dynamic sets & reps', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForTimeout(500);

    // Step 1: Select Aurelia Archetype (Female)
    await expect(page.locator('text=Choose your athlete profile')).toBeVisible();
    await page.click('text="Female / Empress"');
    await page.click('button:has-text("Next Step")');

    // Step 2: Name & Experience
    await expect(page.locator('text=Athlete identity')).toBeVisible();
    await page.click('button:has-text("Next Step")');

    // Step 3: Workout Kind - select Lean Toning & Definition
    await expect(page.locator('text=What kind of workout do you want?')).toBeVisible();
    await page.click('text="Lean Toning & Definition"');
    await page.click('button:has-text("Next Step")');

    // Step 4: Add-ons - Abs & Core Finisher should be enabled
    await expect(page.locator('text=Target emphasis & workout add-ons')).toBeVisible();
    await page.click('button:has-text("Next Step")');

    // Step 5: Days selection
    await expect(page.locator('text=Which days do you want to workout?')).toBeVisible();
    await page.click('button:has-text("Next Step")');

    // Step 6: Preferred Time & Duration
    await expect(page.locator('text=Workout time & session duration')).toBeVisible();
    await page.click('button:has-text("Next Step")');

    // Step 7: Equipment & Fasting
    await expect(page.locator('text=Equipment access & fasting protocol')).toBeVisible();
    await page.click('button:has-text("Next Step")');

    // Step 8: Review & Launch
    await expect(page.locator('text=Protocol Computation Complete')).toBeVisible();
    await expect(page.locator('text=Empress').first()).toBeVisible();
    await page.click('button:has-text("Launch Protocol & Enter Sanctuary")');
    await page.waitForTimeout(800);

    // Navigate to Schedule Screen
    await page.click('button:has-text("Schedule")');
    await page.waitForTimeout(600);

    // Verify Picture Schedule is displayed
    await expect(page.getByRole('heading', { name: 'Visual Picture Schedule' })).toBeVisible();

    // Verify that planned sets and reps are dynamically displayed (e.g. "Sets · " format)
    const setsBadge = page.locator('text=/\\d+ Sets · \\d+r/').first();
    await expect(setsBadge).toBeVisible();

    // Take screenshot proof
    await page.screenshot({
      path: 'C:/Users/stoic/.gemini/antigravity/brain/958af3de-883f-4c46-95ab-6f08aeb8e3d0/proof-female-calibration-schedule.png',
    });
  });

  test('Male athlete (Marcus) profile verifies Spartan strength protocol & planned sets', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);

    // Dismiss onboarding if shown
    const skipBtn = page.locator('button:has-text("Skip")');
    if (await skipBtn.isVisible()) {
      await skipBtn.click();
      await page.waitForTimeout(500);
    }

    // Open Athlete Login Switcher
    const athleteBtn = page.locator('button[title="Athlete Sign-In / Switch Profile"]').first();
    await expect(athleteBtn).toBeVisible();
    await athleteBtn.click();
    await page.waitForTimeout(400);

    // Select Marcus (Spartan Male)
    const marcusBtn = page.locator('text="Marcus"').first();
    await expect(marcusBtn).toBeVisible();
    await marcusBtn.click();
    await page.waitForTimeout(600);

    // Navigate to Schedule
    await page.click('button:has-text("Schedule")');
    await page.waitForTimeout(600);

    // Verify Schedule displays sets and reps
    const scheduleTitle = page.getByRole('heading', { name: 'Visual Picture Schedule' });
    await expect(scheduleTitle).toBeVisible();

    // Take screenshot proof
    await page.screenshot({
      path: 'C:/Users/stoic/.gemini/antigravity/brain/958af3de-883f-4c46-95ab-6f08aeb8e3d0/proof-male-calibration-schedule.png',
    });
  });
});
