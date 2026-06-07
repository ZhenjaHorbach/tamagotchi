import {
  ACTION_EFFECTS,
  DECAY_PER_HOUR,
  HOUR_MS,
  MOOD_THRESHOLDS,
  NEWBORN_STATS,
} from './constants';
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
 * never negative decay.
 */
export function applyElapsed(s: PetState, now: number): PetState {
  const elapsedMs = Math.max(0, now - s.lastSeenAt);
  const hours = elapsedMs / HOUR_MS;
  return {
    ...s,
    hunger: clamp(s.hunger + DECAY_PER_HOUR.hunger * hours),
    energy: clamp(s.energy + DECAY_PER_HOUR.energy * hours),
    joy: clamp(s.joy + DECAY_PER_HOUR.joy * hours),
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

export function feed(s: PetState): PetState {
  return {
    ...s,
    hunger: clamp(s.hunger + ACTION_EFFECTS.feed.hunger),
    joy: clamp(s.joy + ACTION_EFFECTS.feed.joy),
  };
}

export function play(s: PetState): PetState {
  return {
    ...s,
    joy: clamp(s.joy + ACTION_EFFECTS.play.joy),
    energy: clamp(s.energy + ACTION_EFFECTS.play.energy),
    hunger: clamp(s.hunger + ACTION_EFFECTS.play.hunger),
  };
}

export function sleep(s: PetState): PetState {
  return {
    ...s,
    energy: clamp(s.energy + ACTION_EFFECTS.sleep.energy),
  };
}
