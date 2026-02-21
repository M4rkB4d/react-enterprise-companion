const featureFlags: Record<string, boolean> = {
  'bill-payments-v1': true,
};

export function useFeatureFlag(flag: string): boolean {
  return featureFlags[flag] ?? false;
}
