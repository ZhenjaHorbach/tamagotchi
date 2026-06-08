import { ACTION_EFFECTS, BUTTON_CAP, DECAY_PER_HOUR, HOUR_MS, NEWBORN_STATS } from '../constants';
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
  it('decays stats at the per-hour rates (computed from constants)', () => {
    const H = 3; // short enough that nothing clamps
    const after = applyElapsed(makePet(), T0 + H * HOUR_MS);
    expect(after.hunger).toBeCloseTo(50 + DECAY_PER_HOUR.hunger * H);
    expect(after.energy).toBeCloseTo(50 + DECAY_PER_HOUR.energy * H);
    expect(after.joy).toBeCloseTo(50 + DECAY_PER_HOUR.joy * H);
    expect(after.lastSeenAt).toBe(T0 + H * HOUR_MS);
  });

  it('supports fractional hours', () => {
    const after = applyElapsed(makePet(), T0 + HOUR_MS / 2);
    expect(after.hunger).toBeCloseTo(50 + DECAY_PER_HOUR.hunger * 0.5);
    expect(after.energy).toBeCloseTo(50 + DECAY_PER_HOUR.energy * 0.5);
    expect(after.joy).toBeCloseTo(50 + DECAY_PER_HOUR.joy * 0.5);
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

  it('play raises joy, costs energy and adds hunger', () => {
    const after = play(makePet());
    expect(after.joy).toBe(50 + ACTION_EFFECTS.play.joy);
    expect(after.energy).toBe(50 + ACTION_EFFECTS.play.energy);
    expect(after.hunger).toBe(50 + ACTION_EFFECTS.play.hunger);
  });

  it('sleep restores energy toward the button cap', () => {
    expect(sleep(makePet({ energy: 50 })).energy).toBe(50 + ACTION_EFFECTS.sleep.energy);
  });

  // buttons can lift a good stat only up to BUTTON_CAP — 60→100 is the camera's job
  describe('button cap (max 60% via buttons)', () => {
    it('sleep cannot push energy past the cap', () => {
      expect(sleep(makePet({ energy: BUTTON_CAP - 5 })).energy).toBe(BUTTON_CAP);
    });
    it('sleep leaves an already-high stat untouched', () => {
      expect(sleep(makePet({ energy: 80 })).energy).toBe(80);
    });
    it('play cannot push joy past the cap', () => {
      expect(play(makePet({ joy: BUTTON_CAP - 5 })).joy).toBe(BUTTON_CAP);
    });
    it('feed cannot lower hunger past the fullness cap (100 − cap)', () => {
      expect(feed(makePet({ hunger: 45 })).hunger).toBe(100 - BUTTON_CAP);
    });
    it('feed leaves an already-full pet untouched', () => {
      expect(feed(makePet({ hunger: 10 })).hunger).toBe(10);
    });
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
