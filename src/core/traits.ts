// Trait mechanics: modifier math over the catalog in trait-catalog.ts.
// Pure, no React/Native — keeps the personality's effect on stats deterministic
// and unit-tested (see traits.test.ts / the balance test).

import {
  APPETITES,
  type AxisOption,
  BOLDNESS,
  ENERGY_TYPES,
  NEEDINESS,
  PLAYFULNESS,
  RHYTHMS,
  TEMPERAMENTS,
} from './trait-catalog';

/** Multipliers on the base rates. 1 = unchanged. Kept within 0.6–1.5. */
export type Modifiers = {
  hungerDecay: number; // × base hunger increase per hour
  energyDecay: number; // × base energy loss per hour
  joyDecay: number; // × base joy loss per hour
  feedGain: number; // × hunger reduction from Feed
  playJoyGain: number; // × joy gained from Play
  playEnergyCost: number; // × energy spent on Play
};

export const NEUTRAL_MODIFIERS: Modifiers = {
  hungerDecay: 1,
  energyDecay: 1,
  joyDecay: 1,
  feedGain: 1,
  playJoyGain: 1,
  playEnergyCost: 1,
};

/** Which mechanical axes a selection draws from. */
export type TraitSelection = {
  energyType: string;
  appetite: string;
  neediness: string;
  playfulness: string;
};

function optionById(axis: readonly AxisOption[], id: string): AxisOption {
  return axis.find((o) => o.id === id) ?? axis[0];
}

/** Multiply the chosen mechanical axes into one Modifiers set. */
export function selectionToModifiers(sel: TraitSelection): Modifiers {
  const chosen = [
    optionById(ENERGY_TYPES, sel.energyType),
    optionById(APPETITES, sel.appetite),
    optionById(NEEDINESS, sel.neediness),
    optionById(PLAYFULNESS, sel.playfulness),
  ];
  const m: Modifiers = { ...NEUTRAL_MODIFIERS };
  for (const opt of chosen) {
    if (!opt.modifiers) continue;
    for (const k of Object.keys(opt.modifiers) as (keyof Modifiers)[]) {
      m[k] *= opt.modifiers[k]!;
    }
  }
  return m;
}

/** Ids of every axis, for prompt building and validation. */
export const AXIS_IDS = {
  temperament: TEMPERAMENTS.map((o) => o.id),
  energyType: ENERGY_TYPES.map((o) => o.id),
  appetite: APPETITES.map((o) => o.id),
  neediness: NEEDINESS.map((o) => o.id),
  playfulness: PLAYFULNESS.map((o) => o.id),
  rhythm: RHYTHMS.map((o) => o.id),
  boldness: BOLDNESS.map((o) => o.id),
} as const;
