import { test, expect } from '@playwright/test';

test.describe('20-Question Precision Protocol Assessment', () => {
  test('User completes 20-question intake questionnaire with custom biometrics, split, and diet', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForTimeout(500);

    // Question 1: Athlete Profile & Mode
    await expect(page.locator('text=Choose your athlete profile and interface mode')).toBeVisible();
    await page.click('text="Female / Empress"');
    await page.click('button:has-text("Next Step")');

    // Question 2: Identity & Callsign
    await expect(page.locator('text=Athlete identity & callsign')).toBeVisible();
    const ageInput = page.locator('input[type="number"]');
    await ageInput.fill('');
    expect(await ageInput.inputValue()).toBe('');
    await ageInput.fill('32');
    expect(await ageInput.inputValue()).toBe('32');
    await page.click('button:has-text("Next Step")');

    // Question 3: Primary Athletic Quest
    await expect(page.locator('text=What kind of workout do you want?')).toBeVisible();
    await page.click('text="Lean Toning & Definition"');
    await page.click('button:has-text("Next Step")');

    // Question 4: Training Age & Experience
    await expect(page.locator('text=Training age and lifting experience')).toBeVisible();
    await page.click('button:has-text("Next Step")');

    // Question 5: Physical Biometrics
    await expect(page.locator('text=Current physical biometrics')).toBeVisible();
    await page.click('button:has-text("Next Step")');

    // Question 6: Body Fat & Composition Goal
    await expect(page.locator('text=Estimated body fat & composition goal')).toBeVisible();
    await page.click('button:has-text("Next Step")');

    // Question 7: Weekly Training Frequency
    await expect(page.locator('text=Weekly training frequency')).toBeVisible();
    await page.click('button:has-text("4 Days")');
    await page.click('button:has-text("Next Step")');

    // Question 8: Exact Days Available
    await expect(page.locator('text=Which days do you want to workout?')).toBeVisible();
    await page.click('button:has-text("Custom 4 (T/Th/Sa/Su)")');
    await expect(page.locator('text=Tue, Thu, Sat, Sun')).toBeVisible();
    await page.click('button:has-text("Next Step")');

    // Question 9: Workout Time & Duration
    await expect(page.locator('text=Workout time & session duration')).toBeVisible();
    await page.click('button:has-text("07:30 AM")');
    await page.click('button:has-text("45 Min")');
    await page.click('button:has-text("Next Step")');

    // Question 10: Training Split Architecture
    await expect(page.locator('text=Training split architecture')).toBeVisible();
    await page.click('button:has-text("Next Step")');

    // Question 11: Gym Equipment Access
    await expect(page.locator('text=Equipment access & gym setup')).toBeVisible();
    await page.click('button:has-text("Next Step")');

    // Question 12: Joint Safeguards & Limitations
    await expect(page.locator('text=Physical safeguards & joint limitations')).toBeVisible();
    await page.click('button:has-text("Next Step")');

    // Question 13: Target Emphasis & Add-ons
    await expect(page.locator('text=Target emphasis & workout add-ons')).toBeVisible();
    await expect(page.locator('text=Daily Abs & Core Toning Finisher')).toBeVisible();
    await page.click('button:has-text("Next Step")');

    // Question 14: Core & Transverse Abdominis
    await expect(page.locator('text=Core, transverse abdominis & abs protocol')).toBeVisible();
    await page.click('button:has-text("Next Step")');

    // Question 15: Cardiovascular Protocol
    await expect(page.locator('text=Cardiovascular & conditioning protocol')).toBeVisible();
    await page.click('button:has-text("Next Step")');

    // Question 16: Nutritional Philosophy
    await expect(page.locator('text=Nutritional philosophy & dietary preference')).toBeVisible();
    await page.click('button:has-text("Next Step")');

    // Question 17: Intermittent Fasting
    await expect(page.locator('text=Equipment access & fasting protocol')).toBeVisible();
    await page.click('button:has-text("Next Step")');

    // Question 18: Caloric Strategy
    await expect(page.locator('text=Caloric target strategy & energy balance')).toBeVisible();
    await page.click('button:has-text("Next Step")');

    // Question 19: Hydration & Supplements
    await expect(page.locator('text=Hydration goal & ergogenic supplements')).toBeVisible();
    await page.click('button:has-text("Next Step")');

    // Question 20: Stoic Coaching Voice
    await expect(page.locator('text=Stoic coaching persona & mindset voice')).toBeVisible();
    await page.click('button:has-text("Next Step")');

    // Step 21: Review & Launch Synthesis
    await expect(page.locator('text=Protocol Computation Complete')).toBeVisible();
    await expect(page.locator('text=Tue, Thu, Sat, Sun').first()).toBeVisible();
    await expect(page.locator('text=Daily Abs & Core Finisher')).toBeVisible();
    await expect(page.locator('text=Export Protocol JSON')).toBeVisible();

    // Capture Screenshot Proof of 20-Question Review Step
    await page.screenshot({
      path: 'C:/Users/stoic/.gemini/antigravity/brain/958af3de-883f-4c46-95ab-6f08aeb8e3d0/proof-20-questionnaire-review.png',
    });

    await page.click('button:has-text("Launch Protocol & Enter Sanctuary")');
    await page.waitForTimeout(800);

    // Verify modal dismissed and Dashboard active
    await expect(page.locator('text=TODAY\'S ROUTINE')).toBeVisible();
  });
});
