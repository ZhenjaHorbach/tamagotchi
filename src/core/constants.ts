export const HOUR_MS = 60 * 60 * 1000;

/** Stat drift per elapsed hour (starting point, tune later). */
export const DECAY_PER_HOUR = {
  hunger: +10,
  energy: -7.5,
  joy: -6,
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
  feed: { hunger: -10, joy: +2 },
  play: { joy: +10, energy: -10, hunger: +10 },
  sleep: { energy: +10 },
} as const;

/** Stats of a newborn pet. */
export const NEWBORN_STATS = {
  hunger: 20,
  joy: 80,
  energy: 90,
} as const;

/**
 * Buttons (feed/play/sleep) can only lift a "good" stat up to this ceiling.
 * The remaining 60→100 will come from the camera "show me" feature (future).
 * For hunger (inverted), this means buttons can lower it only to 100 − cap.
 */
export const BUTTON_CAP = 70;
