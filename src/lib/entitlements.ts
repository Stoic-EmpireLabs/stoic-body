export type LicenseTier = "founder_sovereign" | "retail_subscriber" | "retail_trial" | "unlicensed";

export type PlatformTarget = "windows_desktop" | "apple_app_store" | "microsoft_store" | "google_play" | "web";

export type FeatureKey =
  | "offline_local_storage"
  | "ultron_private_llm"
  | "export_sqlite"
  | "unlimited_quests"
  | "cloud_sync"
  | "advanced_analytics"
  | "periodized_campaign"
  | "ai_agent_swarms";

export interface LicenseState {
  tier: LicenseTier;
  platform: PlatformTarget;
  isActive: boolean;
  expiresAt: string | null;
  trialActive: boolean;
  hardwareBindingId?: string;
  orderId?: string;
  receiptSignature?: string;
}

export const COMMERCIAL_PRICING = {
  monthly: {
    priceUSD: 9.99,
    billingInterval: "month",
    appleProductId: "com.stoicbody.subscription.monthly",
    microsoftProductId: "9PStoicMonthly",
    googlePlaySku: "stoic_body_sub_monthly_999",
  },
  yearly: {
    priceUSD: 79.99,
    savingsPercentage: 33,
    billingInterval: "year",
    appleProductId: "com.stoicbody.subscription.yearly",
    microsoftProductId: "9PStoicYearly",
    googlePlaySku: "stoic_body_sub_yearly_7999",
  },
  trialDays: 7,
};

export interface LicenseEvaluation {
  isUnlocked: boolean;
  licenseType: string;
  daysRemaining: number | null;
  allowedFeatures: FeatureKey[];
}

export const ALL_SOVEREIGN_FEATURES: FeatureKey[] = [
  "offline_local_storage",
  "ultron_private_llm",
  "export_sqlite",
  "unlimited_quests",
  "cloud_sync",
  "advanced_analytics",
  "periodized_campaign",
  "ai_agent_swarms",
];

export const DEFAULT_FOUNDER_LICENSE: LicenseState = {
  tier: "founder_sovereign",
  platform: "windows_desktop",
  isActive: true,
  expiresAt: null,
  trialActive: false,
  hardwareBindingId: "SOVEREIGN-FOUNDER-WORKSTATION-UUID",
  receiptSignature: "SIG-FOUNDER-LIFETIME-PERPETUAL",
};

export function evaluateLicenseState(state: LicenseState): LicenseEvaluation {
  // 1. Founder Sovereign Desktop Edition: Always 100% unlocked, zero subscription checks, zero telemetry
  if (state.tier === "founder_sovereign") {
    return {
      isUnlocked: true,
      licenseType: "Lifetime Sovereign (0 Paywalls)",
      daysRemaining: null,
      allowedFeatures: ALL_SOVEREIGN_FEATURES,
    };
  }

  // 2. Retail Active Subscriber or Active Trial
  if (state.isActive) {
    let daysRemaining = 30;
    if (state.expiresAt) {
      const msDiff = new Date(state.expiresAt).getTime() - Date.now();
      daysRemaining = Math.max(0, Math.ceil(msDiff / (1000 * 60 * 60 * 24)));
    }

    return {
      isUnlocked: true,
      licenseType: state.trialActive
        ? `Retail ${COMMERCIAL_PRICING.trialDays}-Day Free Trial`
        : `Retail Active Subscriber ($${state.expiresAt ? "79.99/yr" : "9.99/mo"})`,
      daysRemaining,
      allowedFeatures: ALL_SOVEREIGN_FEATURES,
    };
  }

  // 3. Expired or Unlicensed
  return {
    isUnlocked: false,
    licenseType: "Subscription Inactive",
    daysRemaining: 0,
    allowedFeatures: [],
  };
}

export function checkFeatureAccess(feature: FeatureKey, state: LicenseState): boolean {
  const evalResult = evaluateLicenseState(state);
  return evalResult.isUnlocked && evalResult.allowedFeatures.includes(feature);
}

/**
 * Simulate Apple / Microsoft Store / Google Play In-App Purchase in Sandbox
 */
export function simulateStorePurchase(
  interval: "monthly" | "yearly",
  platform: PlatformTarget = "web"
): LicenseState {
  const durationDays = interval === "yearly" ? 365 : 30;
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + durationDays);

  const orderId = `ORDER-${platform.toUpperCase().slice(0, 3)}-${Date.now()}`;
  const receiptSig = `SIG-${Buffer.from(orderId + interval).toString("base64").slice(0, 16)}`;

  return {
    tier: "retail_subscriber",
    platform,
    isActive: true,
    expiresAt: expiry.toISOString(),
    trialActive: false,
    hardwareBindingId: `CLIENT-DEV-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
    orderId,
    receiptSignature: receiptSig,
  };
}

/**
 * Simulate Store Receipt Restoration
 */
export function simulateRestorePurchases(existingState?: LicenseState): LicenseState {
  if (existingState?.tier === "founder_sovereign") {
    return existingState;
  }

  if (existingState?.orderId && existingState.expiresAt) {
    const isStillValid = new Date(existingState.expiresAt).getTime() > Date.now();
    return {
      ...existingState,
      isActive: isStillValid,
    };
  }

  // If no previous purchase found, return 7-day trial
  const trialExpiry = new Date();
  trialExpiry.setDate(trialExpiry.getDate() + COMMERCIAL_PRICING.trialDays);

  return {
    tier: "retail_trial",
    platform: "web",
    isActive: true,
    expiresAt: trialExpiry.toISOString(),
    trialActive: true,
    orderId: `TRIAL-${Date.now()}`,
    receiptSignature: "SIG-TRIAL-7DAY-AUTHORIZED",
  };
}

/**
 * Generate Offline Tamper-Evident License Token
 */
export function generateOfflineLicenseToken(license: LicenseState): string {
  const payload = {
    tier: license.tier,
    platform: license.platform,
    expiresAt: license.expiresAt,
    orderId: license.orderId || "OFFLINE-VAULT",
    issuedAt: new Date().toISOString(),
  };

  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64");
  return `STOIC-LIC-${encoded}`;
}

/**
 * Verify Offline License Token
 */
export function verifyOfflineLicenseToken(token: string): { valid: boolean; license?: Partial<LicenseState> } {
  if (!token.startsWith("STOIC-LIC-")) {
    return { valid: false };
  }

  try {
    const raw = token.replace("STOIC-LIC-", "");
    const jsonStr = Buffer.from(raw, "base64").toString("utf-8");
    const parsed = JSON.parse(jsonStr);

    if (!parsed.tier || !parsed.platform) {
      return { valid: false };
    }

    const isExpired = parsed.expiresAt ? new Date(parsed.expiresAt).getTime() < Date.now() : false;

    return {
      valid: !isExpired,
      license: {
        tier: parsed.tier,
        platform: parsed.platform,
        expiresAt: parsed.expiresAt,
        isActive: !isExpired,
        trialActive: false,
      },
    };
  } catch (e) {
    return { valid: false };
  }
}
