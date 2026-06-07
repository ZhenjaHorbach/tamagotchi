import {
  ACTION_EFFECTS,
  DECAY_PER_HOUR,
  HOUR_MS,
  MOOD_THRESHOLDS,
  NEWBORN_STATS,
} from './constants';
import { NEUTRAL_MODIFIERS, type Modifiers } from './traits';
import type { Mood, PetState } from './types';

/** Clamp a stat into the 0..100 range. */
export function clamp(n: number): number {
  return Math.min(100, Math.max(0, n));
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
export function applyElapsed(s: PetState, now: number, mods: Modifiers = NEUTRAL_MODIFIERS): PetState {
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
    // ACTION_EFFECTS.feed.hunger is negative (fills the belly) — feedGain scales it
    hunger: clamp(s.hunger + ACTION_EFFECTS.feed.hunger * mods.feedGain),
    joy: clamp(s.joy + ACTION_EFFECTS.feed.joy),
  };
}

export function play(s: PetState, mods: Modifiers = NEUTRAL_MODIFIERS): PetState {
  return {
    ...s,
    joy: clamp(s.joy + ACTION_EFFECTS.play.joy * mods.playJoyGain),
    // ACTION_EFFECTS.play.energy is negative — playEnergyCost scales the drain
    energy: clamp(s.energy + ACTION_EFFECTS.play.energy * mods.playEnergyCost),
    hunger: clamp(s.hunger + ACTION_EFFECTS.play.hunger),
  };
}

export function sleep(s: PetState): PetState {
  return {
    ...s,
    energy: clamp(s.energy + ACTION_EFFECTS.sleep.energy),
  };
}
