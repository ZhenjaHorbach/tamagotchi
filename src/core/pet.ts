import {
  ACTION_EFFECTS,
  BUTTON_CAP,
  DECAY_PER_HOUR,
  HOUR_MS,
  MOOD_THRESHOLDS,
  NEWBORN_STATS,
  SIGHT_EFFECT,
  SIGHT_FOOD_HUNGER,
  type SightVerdict,
} from './constants';
import { NEUTRAL_MODIFIERS, type Modifiers } from './traits';
import type { Mood, PetState } from './types';

/** Clamp a stat into the 0..100 range. */
export function clamp(n: number): number {
  return Math.min(100, Math.max(0, n));
}

// Buttons raise a good stat toward BUTTON_CAP but never past it — and never
// drag down a stat already above the cap (e.g. from birth or, later, the
// camera). delta >= 0 raises joy/energy; delta <= 0 lowers hunger (= fullness).
function raiseCapped(current: number, delta: number): number {
  return Math.min(clamp(current + delta), Math.max(BUTTON_CAP, current));
}
function lowerHungerCapped(current: number, delta: number): number {
  const floor = 100 - BUTTON_CAP; // best hunger reachable by buttons
  return Math.max(clamp(current + delta), Math.min(floor, current));
}

/** Create a freshly born pet. */
export function createPet(now: number): PetState {
  return {
    ...NEWBORN_STATS,
    lastSeenAt: now,
    bornAt: now,
  };
}

/**
 * Apply time-based decay for the period since `lastSeenAt`.
 * Clock-tamper safe: a clock rolled backwards yields zero elapsed time,
 * never negative decay. Personality modifiers scale the per-hour rates.
 */
export function applyElapsed(
  s: PetState,
  now: number,
  mods: Modifiers = NEUTRAL_MODIFIERS,
): PetState {
  const elapsedMs = Math.max(0, now - s.lastSeenAt);
  const hours = elapsedMs / HOUR_MS;
  return {
    ...s,
    hunger: clamp(s.hunger + DECAY_PER_HOUR.hunger * mods.hungerDecay * hours),
    energy: clamp(s.energy + DECAY_PER_HOUR.energy * mods.energyDecay * hours),
    joy: clamp(s.joy + DECAY_PER_HOUR.joy * mods.joyDecay * hours),
    lastSeenAt: now,
  };
}

/** Mood is derived from stats, never stored. Priority order matters. */
export function deriveMood(s: PetState): Mood {
  if (s.energy < MOOD_THRESHOLDS.sleepyEnergyBelow) return 'sleepy';
  if (s.hunger > MOOD_THRESHOLDS.hungryHungerAbove) return 'hungry';
  if (s.joy > MOOD_THRESHOLDS.happyJoyAbove) return 'happy';
  if (s.joy < MOOD_THRESHOLDS.sadJoyBelow) return 'sad';
  return 'neutral';
}

export function feed(s: PetState, mods: Modifiers = NEUTRAL_MODIFIERS): PetState {
  return {
    ...s,
    // feed.hunger is negative (fills the belly) — feedGain scales it; capped
    hunger: lowerHungerCapped(s.hunger, ACTION_EFFECTS.feed.hunger * mods.feedGain),
    joy: raiseCapped(s.joy, ACTION_EFFECTS.feed.joy),
  };
}

export function play(s: PetState, mods: Modifiers = NEUTRAL_MODIFIERS): PetState {
  return {
    ...s,
    joy: raiseCapped(s.joy, ACTION_EFFECTS.play.joy * mods.playJoyGain),
    // energy/hunger here are costs (worse) — not capped, just clamped
    energy: clamp(s.energy + ACTION_EFFECTS.play.energy * mods.playEnergyCost),
    hunger: clamp(s.hunger + ACTION_EFFECTS.play.hunger),
  };
}

export function sleep(s: PetState): PetState {
  return {
    ...s,
    energy: raiseCapped(s.energy, ACTION_EFFECTS.sleep.energy),
  };
}

/**
 * The camera "show me" reaction. Verdict (love/meh/dislike) is decided from the
 * pet's personality by the model. Unlike the buttons this is NOT capped at
 * BUTTON_CAP — a loved sight is how stats reach 100%; a disliked one stings.
 * When the shown thing is edible (`isFood`), it also moves the belly: loved food
 * fills it up, disliked food turns the stomach a little.
 */
export function reactToSight(s: PetState, verdict: SightVerdict, isFood = false): PetState {
  const e = SIGHT_EFFECT[verdict];
  return {
    ...s,
    joy: clamp(s.joy + e.joy),
    energy: clamp(s.energy + e.energy),
    hunger: isFood ? clamp(s.hunger + SIGHT_FOOD_HUNGER[verdict]) : s.hunger,
  };
}
