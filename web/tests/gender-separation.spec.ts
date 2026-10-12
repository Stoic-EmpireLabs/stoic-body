import { test, expect } from '@playwright/test';

test.describe('Male & Female Questionnaire Separation & Direct Switcher', () => {
  test('Questionnaire Male selection configures Stoic male routines & likeness; Female selection configures Sophia female routines & likeness', async ({ page }) => {
    // Set standard desktop viewport to test full desktop workstation interface
    await page.setViewportSize({ width: 1440, height: 900 });

    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForTimeout(600);

    // 1. Questionnaire Step 1: Select Male / Spartan
    await expect(page.locator('text=Choose your athlete profile and interface mode')).toBeVisible();
    await page.click('text="Male / Spartan"');

    // Click Auto-Calculate to synthesize Stoic's male protocol directly
    await page.click('button:has-text("Auto-Calculate")');
    await page.waitForTimeout(400);

    // Verify Review step shows Stoic / Male protocol
    await expect(page.locator('text=Protocol Computation Complete')).toBeVisible();
    await expect(page.locator('text=Stoic Arellano').first()).toBeVisible();

    // Confirm Protocol
    await page.click('button:has-text("Launch Protocol & Enter Sanctuary")');
    await page.waitForTimeout(800);

    // 2. Verify Male version is active on Desktop TopBar
    await expect(page.locator('button:has-text("Male (Stoic)")')).toBeVisible();

    // Navigate to Daily Schedule
    await page.click('button:has-text("Daily Schedule")');
    await page.waitForTimeout(600);

    // Verify Monday routine is a Spartan / Tactical routine (NOT Glute Hypertrophy)
    await expect(page.locator('text=/Tactical Push/').first()).toBeVisible();

    // Verify male 3D exercise images are rendered
    const maleImg = page.locator('img[src*="/assets/male-3d/"]').first();
    await expect(maleImg).toBeVisible();

    // Take screenshot proof of Stoic male routine & 3D images
    await page.screenshot({
      path: 'C:/Users/stoic/.gemini/antigravity/brain/958af3de-883f-4c46-95ab-6f08aeb8e3d0/proof-male-separation-schedule.png',
    });

    // 3. Switch to Female version using direct top-bar switcher
    await page.click('button:has-text("Female (Sophia)")');
    await page.waitForTimeout(600);

    // Verify Monday routine now shows Empress / Glute routine
    await expect(page.locator('text=/Glute Hypertrophy/').first()).toBeVisible();

    // Verify female 3D exercise images are rendered
    const femaleImg = page.locator('img[src*="/assets/female-3d/"]').first();
    await expect(femaleImg).toBeVisible();

    // Take screenshot proof of Sophia female routine & 3D images
    await page.screenshot({
      path: 'C:/Users/stoic/.gemini/antigravity/brain/958af3de-883f-4c46-95ab-6f08aeb8e3d0/proof-female-separation-schedule.png',
    });

    // 4. Switch back to Male version using direct top-bar switcher
    await page.click('button:has-text("Male (Stoic)")');
    await page.waitForTimeout(600);

    // Verify Tactical Push is restored
    await expect(page.locator('text=/Tactical Push/').first()).toBeVisible();
    await expect(maleImg).toBeVisible();

    // 5. Open Athlete Login Modal
    await page.click('button[title="Athlete Sign-In / Switch Profile"]');
    await page.waitForTimeout(500);

    // Verify Athlete Sign-In & Profile Portal
    await expect(page.locator('text="Athlete Sign-In & Profile Portal"')).toBeVisible();
    await expect(page.locator('.fixed').locator('text="Stoic Arellano"').first()).toBeVisible();
    await expect(page.locator('.fixed').locator('text="Sophia"').first()).toBeVisible();
    await expect(page.locator('text="Start 20-Question Protocol Assessment"')).toBeVisible();
  });
});
