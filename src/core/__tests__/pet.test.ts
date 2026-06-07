import { ACTION_EFFECTS, HOUR_MS, NEWBORN_STATS } from '../constants';
import { applyElapsed, clamp, createPet, deriveMood, feed, play, sleep } from '../pet';
import type { PetState } from '../types';

const T0 = 1_700_000_000_000; // arbitrary fixed epoch ms

function makePet(overrides: Partial<PetState> = {}): PetState {
  return {
    hunger: 50,
    joy: 50,
    energy: 50,
    lastSeenAt: T0,
    bornAt: T0,
    ...overrides,
  };
}

describe('clamp', () => {
  it('clamps below 0 to 0', () => expect(clamp(-5)).toBe(0));
  it('clamps above 100 to 100', () => expect(clamp(140)).toBe(100));
  it('keeps values in range untouched', () => expect(clamp(42)).toBe(42));
});

describe('createPet', () => {
  it('sets newborn stats and timestamps', () => {
    const pet = createPet(T0);
    expect(pet).toEqual({ ...NEWBORN_STATS, lastSeenAt: T0, bornAt: T0 });
  });
});

describe('applyElapsed', () => {
  it('decays stats over N hours (hunger +4/h, energy -3/h, joy -2/h)', () => {
    const pet = makePet();
    const after = applyElapsed(pet, T0 + 10 * HOUR_MS);
    expect(after.hunger).toBeCloseTo(90); // 50 + 4*10
    expect(after.energy).toBeCloseTo(20); // 50 - 3*10
    expect(after.joy).toBeCloseTo(30); // 50 - 2*10
    expect(after.lastSeenAt).toBe(T0 + 10 * HOUR_MS);
  });

  it('supports fractional hours', () => {
    const after = applyElapsed(makePet(), T0 + HOUR_MS / 2);
    expect(after.hunger).toBeCloseTo(52);
    expect(after.energy).toBeCloseTo(48.5);
    expect(after.joy).toBeCloseTo(49);
  });

  it('clamps stats at the 0..100 bounds after a long absence', () => {
    const after = applyElapsed(makePet(), T0 + 100 * HOUR_MS);
    expect(after.hunger).toBe(100);
    expect(after.energy).toBe(0);
    expect(after.joy).toBe(0);
  });

  it('is a no-op for zero elapsed time', () => {
    const pet = makePet();
    expect(applyElapsed(pet, T0)).toEqual(pet);
  });

  it('guards against a clock rolled backwards (no negative decay)', () => {
    const pet = makePet();
    const after = applyElapsed(pet, T0 - 5 * HOUR_MS);
    expect(after.hunger).toBe(pet.hunger);
    expect(after.energy).toBe(pet.energy);
    expect(after.joy).toBe(pet.joy);
  });

  it('does not mutate the input state', () => {
    const pet = makePet();
    const snapshot = { ...pet };
    applyElapsed(pet, T0 + HOUR_MS);
    expect(pet).toEqual(snapshot);
  });

  it('preserves bornAt', () => {
    const after = applyElapsed(makePet(), T0 + HOUR_MS);
    expect(after.bornAt).toBe(T0);
  });
});

describe('deriveMood', () => {
  it('energy < 20 → sleepy', () => {
    expect(deriveMood(makePet({ energy: 19 }))).toBe('sleepy');
  });

  it('hunger > 75 → hungry', () => {
    expect(deriveMood(makePet({ hunger: 76 }))).toBe('hungry');
  });

  it('joy > 70 → happy', () => {
    expect(deriveMood(makePet({ joy: 71 }))).toBe('happy');
  });

  it('joy < 30 → sad', () => {
    expect(deriveMood(makePet({ joy: 29 }))).toBe('sad');
  });

  it('otherwise → neutral', () => {
    expect(deriveMood(makePet())).toBe('neutral');
  });

  it('boundary values are exclusive (20/75/70/30 → neutral)', () => {
    expect(deriveMood(makePet({ energy: 20, hunger: 75, joy: 70 }))).toBe('neutral');
    expect(deriveMood(makePet({ joy: 30 }))).toBe('neutral');
  });

  it('priority: sleepy beats hungry, hungry beats happy', () => {
    expect(deriveMood(makePet({ energy: 10, hunger: 90, joy: 90 }))).toBe('sleepy');
    expect(deriveMood(makePet({ energy: 50, hunger: 90, joy: 90 }))).toBe('hungry');
  });
});

describe('actions', () => {
  it('feed lowers hunger and adds a little joy', () => {
    const after = feed(makePet());
    expect(after.hunger).toBe(50 + ACTION_EFFECTS.feed.hunger);
    expect(after.joy).toBe(50 + ACTION_EFFECTS.feed.joy);
  });

  it('feed clamps hunger at 0', () => {
    expect(feed(makePet({ hunger: 10 })).hunger).toBe(0);
  });

  it('play raises joy, costs energy and adds hunger', () => {
    const after = play(makePet());
    expect(after.joy).toBe(50 + ACTION_EFFECTS.play.joy);
    expect(after.energy).toBe(50 + ACTION_EFFECTS.play.energy);
    expect(after.hunger).toBe(50 + ACTION_EFFECTS.play.hunger);
  });

  it('sleep restores energy, clamped at 100', () => {
    expect(sleep(makePet()).energy).toBe(90);
    expect(sleep(makePet({ energy: 80 })).energy).toBe(100);
  });

  it('actions are pure: input is not mutated', () => {
    const pet = makePet();
    const snapshot = { ...pet };
    feed(pet);
    play(pet);
    sleep(pet);
    expect(pet).toEqual(snapshot);
  });

  it('actions do not touch timestamps', () => {
    const after = play(feed(sleep(makePet())));
    expect(after.lastSeenAt).toBe(T0);
    expect(after.bornAt).toBe(T0);
  });
});
