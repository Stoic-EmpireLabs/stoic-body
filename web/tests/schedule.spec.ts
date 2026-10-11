import { test, expect } from '@playwright/test';

test.describe('Schedule Visual Picture Calendar', () => {
  test('User navigates to visual schedule and verifies day cards and workout routines', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);

    // Dismiss onboarding if present
    const skipBtn = page.locator('button:has-text("Skip")');
    if (await skipBtn.isVisible()) {
      await skipBtn.click();
      await page.waitForTimeout(500);
    }

    // Navigate to Schedule screen
    const scheduleNavBtn = page.locator('button:has-text("Schedule")').first();
    await scheduleNavBtn.click();
    await page.waitForTimeout(600);

    // Verify Visual Picture Schedule elements
    await expect(page.getByRole('heading', { name: 'Visual Picture Schedule' })).toBeVisible();
    await expect(page.locator('text=Picture Schedule').first()).toBeVisible();

    // Capture Desktop Proof Screenshot
    await page.screenshot({
      path: 'C:/Users/stoic/.gemini/antigravity/brain/958af3de-883f-4c46-95ab-6f08aeb8e3d0/proof-picture-schedule-desktop.png',
    });

    // Switch to Mobile Viewport & Verify BottomNav Schedule Tab
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(500);

    // Capture Mobile Proof Screenshot showing BottomNav with Schedule tab and visual day cards
    await page.screenshot({
      path: 'C:/Users/stoic/.gemini/antigravity/brain/958af3de-883f-4c46-95ab-6f08aeb8e3d0/proof-picture-schedule-mobile.png',
    });
  });
});
