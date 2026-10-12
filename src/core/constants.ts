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

/**
 * Camera "show me" reaction. How the pet feels about a thing shown to it depends
 * on its personality (likes vs dislikes), so the verdict comes from the model.
 * A loved sight is the ONLY source allowed to lift stats past the button cap
 * toward 100%; a disliked one actually hurts.
 *   love    → big joy + a jolt of excitement (uncapped)
 *   meh     → a tiny polite bump
 *   dislike → grossed out: joy and energy dip
 */
export const SIGHT_EFFECT = {
  love: { joy: +30, energy: +10 },
  meh: { joy: +5, energy: 0 },
  dislike: { joy: -20, energy: -5 },
} as const;

/**
 * When the shown thing is edible, it also moves the belly (hunger). Loved food
 * fills it up (negative hunger), disliked food turns the stomach a little. The
 * camera is the uncapped path, so loved food can top the belly all the way off.
 */
export const SIGHT_FOOD_HUNGER = { love: -25, meh: -8, dislike: +15 } as const;

export type SightVerdict = keyof typeof SIGHT_EFFECT;

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
