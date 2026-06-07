// Personality trait catalog — pure DATA, no logic. Designed to be extended:
// add an option to any axis/pool here and the prompt, validation and (for
// mechanical axes) the modifiers pick it up automatically.
//
// Axes with `modifiers` multiply the core decay/action rates; flavor axes
// (voice) and pools only shape how the pet talks. Keep multipliers within
// 0.6–1.5 — the balance test enforces it.

import type { Modifiers } from './traits';

export type AxisOption = {
  id: string;
  label: string;
  note?: string;
  modifiers?: Partial<Modifiers>;
};
export type FlavorOption = { id: string; label: string; voice: string };
export type RhythmOption = { id: string; label: string; active: 'night' | 'morning' | 'any' };

// ── flavor axes (shape the voice, no mechanics) ──────────────────────────────
export const TEMPERAMENTS: readonly FlavorOption[] = [
  { id: 'cheerful', label: 'Cheerful', voice: 'warm, upbeat, lots of exclamation' },
  { id: 'grumpy', label: 'Grumpy', voice: 'complains, but secretly fond of you' },
  { id: 'shy', label: 'Shy', voice: 'soft, hesitant, trails off' },
  { id: 'sassy', label: 'Sassy', voice: 'cheeky, teasing, a little smug' },
  { id: 'dreamy', label: 'Dreamy', voice: 'spacey, poetic, half-asleep' },
  { id: 'anxious', label: 'Anxious', voice: 'worried, keeps asking if things are okay' },
  { id: 'stoic', label: 'Stoic', voice: 'calm, terse, dry humor' },
  { id: 'mischievous', label: 'Mischievous', voice: 'playful trouble-maker, always plotting' },
];

export const BOLDNESS: readonly FlavorOption[] = [
  { id: 'brave', label: 'Brave', voice: 'curious, unbothered, dives right in' },
  { id: 'cautious', label: 'Cautious', voice: 'checks things over carefully first' },
  { id: 'timid', label: 'Timid', voice: 'startles easily, hides, then peeks out' },
];

// ── mechanical axes (carry stat modifiers) ───────────────────────────────────
export const ENERGY_TYPES: readonly AxisOption[] = [
  { id: 'lazy', label: 'Lazy', note: 'naps a lot, tires fast when active', modifiers: { energyDecay: 0.7, playEnergyCost: 1.4 } },
  { id: 'balanced', label: 'Balanced', modifiers: { energyDecay: 1, playEnergyCost: 1 } },
  { id: 'energetic', label: 'Energetic', note: 'burns energy fast, plays cheaply', modifiers: { energyDecay: 1.3, playEnergyCost: 0.7 } },
];

export const APPETITES: readonly AxisOption[] = [
  { id: 'glutton', label: 'Glutton', note: 'hungry often, a good meal fills it well', modifiers: { hungerDecay: 1.5, feedGain: 1.3 } },
  { id: 'balanced', label: 'Balanced', modifiers: { hungerDecay: 1, feedGain: 1 } },
  { id: 'light_eater', label: 'Light eater', note: 'rarely hungry, picks at its food', modifiers: { hungerDecay: 0.7, feedGain: 0.7 } },
];

export const NEEDINESS: readonly AxisOption[] = [
  { id: 'clingy', label: 'Clingy', note: 'misses you fast', modifiers: { joyDecay: 1.4 } },
  { id: 'balanced', label: 'Balanced', modifiers: { joyDecay: 1 } },
  { id: 'independent', label: 'Independent', note: 'content on its own', modifiers: { joyDecay: 0.6 } },
];

export const PLAYFULNESS: readonly AxisOption[] = [
  { id: 'playful', label: 'Playful', note: 'lights up when you play', modifiers: { playJoyGain: 1.5 } },
  { id: 'balanced', label: 'Balanced', modifiers: { playJoyGain: 1 } },
  { id: 'serious', label: 'Serious', note: 'play helps less; prefers calm company', modifiers: { playJoyGain: 0.7 } },
];

// time-of-day axis — no stat modifier yet (uses the tool-use clock later)
export const RHYTHMS: readonly RhythmOption[] = [
  { id: 'night_owl', label: 'Night owl', active: 'night' },
  { id: 'early_bird', label: 'Early bird', active: 'morning' },
  { id: 'flexible', label: 'Flexible', active: 'any' },
];

// ── flavor pools ─────────────────────────────────────────────────────────────
export const FOOD_LIKES = [
  'mushrooms', 'berries', 'fish', 'bread', 'candy', 'leaves', 'soup', 'noodles',
  'fruit', 'cheese', 'honey', 'anything blue', 'crunchy things', 'warm things',
] as const;

export const FOOD_DISLIKES = [
  'carrots', 'spicy things', 'sour things', 'green things', 'medicine',
  'cold leftovers', 'vegetables in general',
] as const;

export const QUIRKS = [
  'afraid of its own shadow', 'collects pebbles', 'talks in its sleep',
  'loves the rain', 'hoards shiny things', 'hums old tunes to itself',
  'naps in the most inconvenient corners', 'is suspicious of the moon',
  'keeps a secret favorite rock', 'quietly narrates its own day',
  'insists it saw a ghost once', 'rearranges its things when bored',
] as const;
