export const HOUR_MS = 60 * 60 * 1000;

/** Stat drift per elapsed hour (starting point, tune later). */
export const DECAY_PER_HOUR = {
  hunger: +4,
  energy: -3,
  joy: -2,
} as const;

/** Mood thresholds, checked in priority order (see deriveMood). */
export const MOOD_THRESHOLDS = {
  sleepyEnergyBelow: 20,
  hungryHungerAbove: 75,
  happyJoyAbove: 70,
  sadJoyBelow: 30,
} as const;

/** Instant stat changes applied by actions. */
export const ACTION_EFFECTS = {
  feed: { hunger: -30, joy: +5 },
  play: { joy: +25, energy: -10, hunger: +10 },
  sleep: { energy: +40 },
} as const;

/** Stats of a newborn pet. */
export const NEWBORN_STATS = {
  hunger: 20,
  joy: 80,
  energy: 90,
} as const;
