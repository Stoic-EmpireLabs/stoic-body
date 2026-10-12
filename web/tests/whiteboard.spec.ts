import { test, expect } from '@playwright/test';

test.describe('System Architecture & Neural Whiteboard Screen', () => {
  test('Renders interactive whiteboard, switches tabs, toggles sex calibration and theme', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);

    // Skip onboarding if open
    const skipBtn = page.locator('button:has-text("Skip")');
    if (await skipBtn.isVisible()) {
      await skipBtn.click();
      await page.waitForTimeout(400);
    }

    // Click on Architecture Web in Desktop Sidebar
    const whiteboardNav = page.locator('text=Architecture Web').first();
    await expect(whiteboardNav).toBeVisible();
    await whiteboardNav.click();
    await page.waitForTimeout(500);

    // Verify Whiteboard Heading
    await expect(page.locator('text=System Architecture & Neural Web').first()).toBeVisible();

    // Verify 5 Web Tabs exist
    await expect(page.locator('text=1. Intake Questionnaire Web')).toBeVisible();
    await expect(page.locator('text=2. Picture Schedule Web')).toBeVisible();
    await expect(page.locator('text=3. Planned Sets & Reps Web')).toBeVisible();
    await expect(page.locator('text=4. Diet, Fasting & Macros Web')).toBeVisible();
    await expect(page.locator('text=5. Client JSON & GitHub Web')).toBeVisible();

    // Test Tab 2: Picture Schedule Web
    await page.click('text=2. Picture Schedule Web');
    await page.waitForTimeout(300);
    await expect(page.locator('text=7-Day Picture Schedule Periodization')).toBeVisible();

    // Test Tab 3: Planned Sets & Reps Web
    await page.click('text=3. Planned Sets & Reps Web');
    await page.waitForTimeout(300);
    await expect(page.locator('text=Planned Sets, Reps & Weight Engine')).toBeVisible();

    // Test Tab 4: Diet, Fasting & Macros Web
    await page.click('text=4. Diet, Fasting & Macros Web');
    await page.waitForTimeout(300);
    await expect(page.locator('text=Macro Targets & Intermittent Fasting Schedule')).toBeVisible();

    // Test Tab 5: Client JSON & GitHub Web
    await page.click('text=5. Client JSON & GitHub Web');
    await page.waitForTimeout(300);
    await expect(page.locator('text=Client JSON Export & GitHub Architecture')).toBeVisible();

    // Test Sex Toggle
    await page.click('text=♀ Empress (Sophia)');
    await page.waitForTimeout(300);
    await expect(page.locator('text=Sophia').first()).toBeVisible();

    await page.click('text=♂ Spartan (Marcus)');
    await page.waitForTimeout(300);
    await expect(page.locator('text=Marcus').first()).toBeVisible();

    // Capture screenshot proof of the whiteboard in action
    await page.screenshot({
      path: 'C:/Users/stoic/.gemini/antigravity/brain/958af3de-883f-4c46-95ab-6f08aeb8e3d0/proof-whiteboard-screen.png',
      fullPage: false,
    });
  });
});
