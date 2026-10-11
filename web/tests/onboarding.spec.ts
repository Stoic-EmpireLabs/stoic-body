import { test, expect } from '@playwright/test';

test.describe('Onboarding Protocol Assessment', () => {
  test('User completes 8-step intake questionnaire with custom days and abs finisher', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForTimeout(500);

    // Step 1: Select Archetype
    await expect(page.locator('text=Choose your athlete profile')).toBeVisible();
    await page.click('button:has-text("Next Step")');

    // Step 2: Name & Experience
    await expect(page.locator('text=Athlete identity')).toBeVisible();
    await page.click('button:has-text("Next Step")');

    // Step 3: Workout Kind
    await expect(page.locator('text=What kind of workout do you want?')).toBeVisible();
    await page.click('text="Lean Toning & Definition"');
    await page.click('button:has-text("Next Step")');

    // Step 4: Target Emphasis & Abs Finisher
    await expect(page.locator('text=Target emphasis & workout add-ons')).toBeVisible();
    await expect(page.locator('text=Daily Abs & Core Toning Finisher')).toBeVisible();
    await page.click('button:has-text("Next Step")');

    // Step 5: Exact Days Selection
    await expect(page.locator('text=Which days do you want to workout?')).toBeVisible();
    await page.click('button:has-text("Custom 4 (T/Th/Sa/Su)")');
    await expect(page.locator('text=Tue, Thu, Sat, Sun')).toBeVisible();
    await page.click('button:has-text("Next Step")');

    // Step 6: Preferred Time & Duration
    await expect(page.locator('text=Workout time & session duration')).toBeVisible();
    await page.click('button:has-text("07:30 AM")');
    await page.click('button:has-text("45 Min")');
    await page.click('button:has-text("Next Step")');

    // Step 7: Equipment & Fasting
    await expect(page.locator('text=Equipment access & fasting protocol')).toBeVisible();
    await page.click('button:has-text("Next Step")');

    // Step 8: Computed Protocol Review & Launch
    await expect(page.locator('text=Protocol Computation Complete')).toBeVisible();
    await expect(page.locator('text=Tue, Thu, Sat, Sun').first()).toBeVisible();
    await expect(page.locator('text=Daily Abs & Core Finisher')).toBeVisible();

    await page.click('button:has-text("Launch Protocol & Enter Sanctuary")');
    await page.waitForTimeout(800);

    // Verify modal dismissed and Dashboard active
    await expect(page.locator('text=TODAY\'S ROUTINE')).toBeVisible();
  });
});
