import test from "node:test";
import assert from "node:assert/strict";
import {
  checkFeatureAccess,
  evaluateLicenseState,
  LicenseState,
  FeatureKey,
  COMMERCIAL_PRICING,
  DEFAULT_FOUNDER_LICENSE,
  simulateStorePurchase,
  simulateRestorePurchases,
  generateOfflineLicenseToken,
  verifyOfflineLicenseToken,
  ALL_SOVEREIGN_FEATURES,
} from "../src/lib/entitlements";

test("Stoic Body — Commercial Pricing & Sovereign Tier Verification", () => {
  // Verify retail store pricing constraints
  assert.equal(COMMERCIAL_PRICING.monthly.priceUSD, 9.99);
  assert.equal(COMMERCIAL_PRICING.yearly.priceUSD, 79.99);
  assert.equal(COMMERCIAL_PRICING.trialDays, 7);
  assert.equal(COMMERCIAL_PRICING.monthly.appleProductId, "com.stoicbody.subscription.monthly");
  assert.equal(COMMERCIAL_PRICING.monthly.microsoftProductId, "9PStoicMonthly");
  assert.equal(COMMERCIAL_PRICING.monthly.googlePlaySku, "stoic_body_sub_monthly_999");

  // 1. Founder Sovereign Mode: Desktop workstation edition
  const status = evaluateLicenseState(DEFAULT_FOUNDER_LICENSE);
  assert.equal(status.isUnlocked, true);
  assert.equal(status.licenseType, "Lifetime Sovereign (0 Paywalls)");
  assert.equal(status.daysRemaining, null);
  for (const feat of ALL_SOVEREIGN_FEATURES) {
    assert.equal(checkFeatureAccess(feat, DEFAULT_FOUNDER_LICENSE), true);
  }

  // 2. Retail Store Active Subscriber ($9.99/mo)
  const retailActive: LicenseState = {
    tier: "retail_subscriber",
    platform: "apple_app_store",
    isActive: true,
    expiresAt: "2026-11-04T00:00:00Z",
    trialActive: false,
  };
  assert.equal(evaluateLicenseState(retailActive).isUnlocked, true);
  assert.equal(checkFeatureAccess("unlimited_quests", retailActive), true);
  assert.equal(checkFeatureAccess("periodized_campaign", retailActive), true);

  // 3. Retail Store Expired Subscriber (Locked)
  const retailExpired: LicenseState = {
    tier: "retail_subscriber",
    platform: "microsoft_store",
    isActive: false,
    expiresAt: "2026-10-01T00:00:00Z",
    trialActive: false,
  };
  assert.equal(evaluateLicenseState(retailExpired).isUnlocked, false);
  assert.equal(checkFeatureAccess("unlimited_quests", retailExpired), false);
});

test("Phase 6B — Sandbox Store Purchase & Receipt Restoration", () => {
  // 1. Simulate Apple In-App Purchase Monthly
  const monthlySub = simulateStorePurchase("monthly", "apple_app_store");
  assert.equal(monthlySub.tier, "retail_subscriber");
  assert.equal(monthlySub.isActive, true);
  assert.ok(monthlySub.orderId?.startsWith("ORDER-APP-"));
  assert.ok(monthlySub.receiptSignature?.startsWith("SIG-"));

  const evalMonthly = evaluateLicenseState(monthlySub);
  assert.equal(evalMonthly.isUnlocked, true);
  assert.ok(evalMonthly.daysRemaining! >= 29 && evalMonthly.daysRemaining! <= 31);

  // 2. Simulate Microsoft Store Annual Purchase
  const annualSub = simulateStorePurchase("yearly", "microsoft_store");
  assert.equal(annualSub.tier, "retail_subscriber");
  assert.equal(annualSub.isActive, true);
  assert.ok(annualSub.orderId?.startsWith("ORDER-MIC-"));

  const evalAnnual = evaluateLicenseState(annualSub);
  assert.equal(evalAnnual.isUnlocked, true);
  assert.ok(evalAnnual.daysRemaining! >= 364);

  // 3. Simulate Restore Purchases when unauthenticated
  const restoredTrial = simulateRestorePurchases();
  assert.equal(restoredTrial.tier, "retail_trial");
  assert.equal(restoredTrial.isActive, true);
  assert.equal(restoredTrial.trialActive, true);
});

test("Phase 6B — Offline Tamper-Evident Cryptographic Token Engine", () => {
  const license: LicenseState = {
    tier: "retail_subscriber",
    platform: "windows_desktop",
    isActive: true,
    expiresAt: "2026-12-31T23:59:59Z",
    trialActive: false,
    orderId: "ORDER-WIN-88992",
  };

  const token = generateOfflineLicenseToken(license);
  assert.ok(token.startsWith("STOIC-LIC-"));

  const verified = verifyOfflineLicenseToken(token);
  assert.equal(verified.valid, true);
  assert.equal(verified.license?.tier, "retail_subscriber");
  assert.equal(verified.license?.platform, "windows_desktop");

  // Verify rejection of fraudulent / corrupted token
  const fraudToken = "STOIC-LIC-MALFORMED-TOKEN-XYZ";
  assert.equal(verifyOfflineLicenseToken(fraudToken).valid, false);

  // Verify rejection of expired token
  const expiredLicense: LicenseState = {
    tier: "retail_subscriber",
    platform: "windows_desktop",
    isActive: false,
    expiresAt: "2025-01-01T00:00:00Z",
    trialActive: false,
  };
  const expiredToken = generateOfflineLicenseToken(expiredLicense);
  assert.equal(verifyOfflineLicenseToken(expiredToken).valid, false);
});
