import { APPETITES, ENERGY_TYPES, NEEDINESS, PLAYFULNESS } from '../trait-catalog';
import {
  ACTION_EFFECTS,
  BUTTON_CAP,
  DECAY_PER_HOUR,
  HOUR_MS,
  NEWBORN_STATS,
  MOOD_THRESHOLDS,
} from '../constants';
import { applyElapsed, createPet, feed, play } from '../pet';
import { NEUTRAL_MODIFIERS, selectionToModifiers, type Modifiers } from '../traits';

const T0 = 1_700_000_000_000;

describe('selectionToModifiers', () => {
  it('returns neutral for all-balanced selection', () => {
    const m = selectionToModifiers({
      energyType: 'balanced',
      appetite: 'balanced',
      neediness: 'balanced',
      playfulness: 'balanced',
    });
    expect(m).toEqual(NEUTRAL_MODIFIERS);
  });

  it('applies each axis modifier to the right key', () => {
    const m = selectionToModifiers({
      energyType: 'energetic', // energyDecay 1.3, playEnergyCost 0.7
      appetite: 'glutton', // hungerDecay 1.5, feedGain 1.3
      neediness: 'clingy', // joyDecay 1.4
      playfulness: 'playful', // playJoyGain 1.5
    });
    expect(m).toEqual<Modifiers>({
      hungerDecay: 1.5,
      energyDecay: 1.3,
      joyDecay: 1.4,
      feedGain: 1.3,
      playJoyGain: 1.5,
      playEnergyCost: 0.7,
    });
  });

  it('falls back to the first option for unknown ids', () => {
    const m = selectionToModifiers({
      energyType: 'bogus',
      appetite: 'bogus',
      neediness: 'bogus',
      playfulness: 'bogus',
    });
    // first options: lazy, glutton, clingy, playful
    expect(m.energyDecay).toBeCloseTo(0.7);
    expect(m.hungerDecay).toBeCloseTo(1.5);
    expect(m.joyDecay).toBeCloseTo(1.4);
    expect(m.playJoyGain).toBeCloseTo(1.5);
  });
});

describe('modifiers affect the core', () => {
  const glutton: Modifiers = { ...NEUTRAL_MODIFIERS, hungerDecay: 1.5, feedGain: 1.3 };

  it('scales hunger decay', () => {
    const H = 4;
    const after = applyElapsed(createPet(T0), T0 + H * HOUR_MS, glutton);
    expect(after.hunger).toBeCloseTo(NEWBORN_STATS.hunger + DECAY_PER_HOUR.hunger * 1.5 * H);
  });

  it('scales the Feed action (within the button cap)', () => {
    const fed = feed({ ...createPet(T0), hunger: 80 }, glutton);
    expect(fed.hunger).toBeCloseTo(80 + ACTION_EFFECTS.feed.hunger * 1.3);
  });

  it('scales Play energy cost, and joy gain is still capped', () => {
    const energetic: Modifiers = { ...NEUTRAL_MODIFIERS, playEnergyCost: 0.7, playJoyGain: 1.5 };
    const played = play({ ...createPet(T0), joy: 50, energy: 50 }, energetic);
    expect(played.joy).toBeCloseTo(BUTTON_CAP); // 50 + 10*1.5 = 65 → capped at 60
    expect(played.energy).toBeCloseTo(50 + ACTION_EFFECTS.play.energy * 0.7);
  });
});

// balance_rule: no trait combination drives a stat to its critical threshold
// from a newborn faster than ~2 hours.
describe('balance rule', () => {
  const MIN_HOURS = 2;

  function hoursToCross(start: number, perHour: number, threshold: number, dir: 'up' | 'down') {
    if (dir === 'up') return (threshold - start) / perHour; // hunger rising
    return (start - threshold) / -perHour; // energy/joy falling (perHour negative)
  }

  it('worst-case decay never crosses a threshold within 2h', () => {
    for (const e of ENERGY_TYPES) {
      for (const a of APPETITES) {
        for (const n of NEEDINESS) {
          for (const p of PLAYFULNESS) {
            const m = selectionToModifiers({
              energyType: e.id,
              appetite: a.id,
              neediness: n.id,
              playfulness: p.id,
            });
            const hunger = hoursToCross(
              NEWBORN_STATS.hunger,
              4 * m.hungerDecay,
              MOOD_THRESHOLDS.hungryHungerAbove,
              'up',
            );
            const energy = hoursToCross(
              NEWBORN_STATS.energy,
              -3 * m.energyDecay,
              MOOD_THRESHOLDS.sleepyEnergyBelow,
              'down',
            );
            const joy = hoursToCross(
              NEWBORN_STATS.joy,
              -2 * m.joyDecay,
              MOOD_THRESHOLDS.sadJoyBelow,
              'down',
            );
            expect(hunger).toBeGreaterThan(MIN_HOURS);
            expect(energy).toBeGreaterThan(MIN_HOURS);
            expect(joy).toBeGreaterThan(MIN_HOURS);
          }
        }
      }
    }
  });

  it('keeps every catalog multiplier within 0.6–1.5', () => {
    for (const axis of [ENERGY_TYPES, APPETITES, NEEDINESS, PLAYFULNESS]) {
      for (const opt of axis) {
        for (const val of Object.values(opt.modifiers ?? {})) {
          expect(val).toBeGreaterThanOrEqual(0.6);
          expect(val).toBeLessThanOrEqual(1.5);
        }
      }
    }
  });
});
