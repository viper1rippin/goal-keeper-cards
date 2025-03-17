
// Constants for subscription tiers
export const SUBSCRIPTION_TIERS = {
  FREE: 'free',
  PREMIUM: 'premium'
};

// Usage limits interface
export interface UsageLimits {
  maxParentGoals: number;
  maxSubGoals: number;
}

// Default usage limits - these should match the database
export const DEFAULT_USAGE_LIMITS: Record<string, UsageLimits> = {
  [SUBSCRIPTION_TIERS.FREE]: {
    maxParentGoals: 3,
    maxSubGoals: 4
  },
  [SUBSCRIPTION_TIERS.PREMIUM]: {
    maxParentGoals: 999999,
    maxSubGoals: 999999
  }
};

// Check if a user is at their parent goal limit
export const isAtParentGoalLimit = (
  parentGoalCount: number, 
  subscriptionTier: string = SUBSCRIPTION_TIERS.FREE
): boolean => {
  const limits = DEFAULT_USAGE_LIMITS[subscriptionTier] || DEFAULT_USAGE_LIMITS[SUBSCRIPTION_TIERS.FREE];
  return parentGoalCount >= limits.maxParentGoals;
};

// Check if a parent goal is at its sub-goal limit
export const isAtSubGoalLimit = (
  subGoalCount: number, 
  subscriptionTier: string = SUBSCRIPTION_TIERS.FREE
): boolean => {
  const limits = DEFAULT_USAGE_LIMITS[subscriptionTier] || DEFAULT_USAGE_LIMITS[SUBSCRIPTION_TIERS.FREE];
  return subGoalCount >= limits.maxSubGoals;
};

// Format subscription tier for display
export const formatSubscriptionTier = (tier: string): string => {
  if (tier === SUBSCRIPTION_TIERS.FREE) return 'Free';
  if (tier === SUBSCRIPTION_TIERS.PREMIUM) return 'Premium';
  return tier.charAt(0).toUpperCase() + tier.slice(1);
};

// Get features for a subscription tier
export const getSubscriptionFeatures = (tier: string): string[] => {
  if (tier === SUBSCRIPTION_TIERS.FREE) {
    return [
      'Up to 3 goals',
      'Up to 4 sub-goals per goal',
      'Focus timer and level progression',
      'Basic badges'
    ];
  }
  
  if (tier === SUBSCRIPTION_TIERS.PREMIUM) {
    return [
      'Unlimited goals',
      'Unlimited sub-goals',
      'Focus timer and level progression',
      'All badges including Patriot badge',
      'Team collaboration features (coming soon)',
      'AI auto-suggest goals (coming soon)',
      'AI project notes (coming soon)'
    ];
  }
  
  return [];
};
