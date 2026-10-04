export type LicenseTier = "founder_sovereign" | "retail_subscriber" | "retail_trial" | "unlicensed";

export type PlatformTarget = "windows_desktop" | "apple_app_store" | "microsoft_store" | "web";

export type FeatureKey =
  | "offline_local_storage"
  | "ultron_private_llm"
  | "export_sqlite"
  | "unlimited_quests"
  | "cloud_sync"
  | "advanced_analytics";

export interface LicenseState {
  tier: LicenseTier;
  platform: PlatformTarget;
  isActive: boolean;
  expiresAt: string | null;
  trialActive: boolean;
  hardwareBindingId?: string;
}

export const COMMERCIAL_PRICING = {
  monthly: {
    priceUSD: 9.99,
    billingInterval: "month",
    appleProductId: "com.stoicbody.subscription.monthly",
    microsoftProductId: "9PStoicMonthly",
  },
  yearly: {
    priceUSD: 79.99,
    savingsPercentage: 33,
    billingInterval: "year",
    appleProductId: "com.stoicbody.subscription.yearly",
    microsoftProductId: "9PStoicYearly",
  },
  trialDays: 7,
};

export interface LicenseEvaluation {
  isUnlocked: boolean;
  licenseType: string;
  daysRemaining: number | null;
  allowedFeatures: FeatureKey[];
}

export function evaluateLicenseState(state: LicenseState): LicenseEvaluation {
  // 1. Founder Sovereign Desktop Edition: Always 100% unlocked, zero subscription checks, zero telemetry
  if (state.tier === "founder_sovereign") {
    return {
      isUnlocked: true,
      licenseType: "Lifetime Sovereign (0 Paywalls)",
      daysRemaining: null,
      allowedFeatures: [
        "offline_local_storage",
        "ultron_private_llm",
        "export_sqlite",
        "unlimited_quests",
        "cloud_sync",
        "advanced_analytics",
      ],
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
      licenseType: state.trialActive ? "Retail 7-Day Free Trial" : "Retail Active Subscriber ($9.99/mo)",
      daysRemaining,
      allowedFeatures: [
        "offline_local_storage",
        "ultron_private_llm",
        "export_sqlite",
        "unlimited_quests",
        "cloud_sync",
        "advanced_analytics",
      ],
    };
  }

  // 3. Expired or Unlicensed
  return {
    isUnlocked: false,
    licenseType: "Subscription Expired",
    daysRemaining: 0,
    allowedFeatures: [],
  };
}

export function checkFeatureAccess(feature: FeatureKey, state: LicenseState): boolean {
  const evalResult = evaluateLicenseState(state);
  return evalResult.isUnlocked && evalResult.allowedFeatures.includes(feature);
}
