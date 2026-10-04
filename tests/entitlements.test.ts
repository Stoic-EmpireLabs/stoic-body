import test from "node:test";
import assert from "node:assert/strict";
import {
  checkFeatureAccess,
  evaluateLicenseState,
  LicenseState,
  FeatureKey,
  COMMERCIAL_PRICING,
} from "../src/lib/entitlements";

test("Stoic Body — Commercial Pricing & Sovereign Tier Verification", () => {
  // Verify retail store pricing constraints from user instructions
  assert.equal(COMMERCIAL_PRICING.monthly.priceUSD, 9.99);
  assert.equal(COMMERCIAL_PRICING.yearly.priceUSD, 79.99);
  assert.equal(COMMERCIAL_PRICING.trialDays, 7);

  // 1. Founder Sovereign Mode: Desktop workstation edition
  const sovereignLicense: LicenseState = {
    tier: "founder_sovereign",
    platform: "windows_desktop",
    isActive: true,
    expiresAt: null, // Lifetime
    trialActive: false,
    hardwareBindingId: "STOIC-WORKSTATION-SECURE-UUID",
  };

  const status = evaluateLicenseState(sovereignLicense);
  assert.equal(status.isUnlocked, true);
  assert.equal(status.licenseType, "Lifetime Sovereign (0 Paywalls)");
  assert.equal(checkFeatureAccess("offline_local_storage", sovereignLicense), true);
  assert.equal(checkFeatureAccess("ultron_private_llm", sovereignLicense), true);
  assert.equal(checkFeatureAccess("export_sqlite", sovereignLicense), true);
  assert.equal(checkFeatureAccess("unlimited_quests", sovereignLicense), true);

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
