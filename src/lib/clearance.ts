export const CLEARANCE_TYPES = [
  "academic",
  "financial",
  "library",
  "department",
  "accommodation",
] as const;

export type ClearanceType = (typeof CLEARANCE_TYPES)[number];
