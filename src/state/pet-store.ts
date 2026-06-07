import { create } from 'zustand';

import { applyElapsed, createPet, feed, play, sleep, type PetState } from '@/core';
import { currentModifiers, usePersonalityStore } from '@/ai/personality-store';
import { clearPet, getPet, savePet } from '@/db/pet-repo';
import { clearPersonality } from '@/db/personality-repo';

type PetStore = {
  pet: PetState | null;
  hydrated: boolean;
  bootstrap: () => Promise<void>;
  refresh: () => Promise<void>;
  feed: () => Promise<void>;
  play: () => Promise<void>;
  sleep: () => Promise<void>;
  /** Give birth to a new pet (the hatch ceremony's payoff). */
  hatch: () => Promise<void>;
  /** Say goodbye: forget the pet and its personality. Leaves no pet. */
  reset: () => Promise<void>;
};

export const usePetStore = create<PetStore>((set, get) => {
  /** Catch up on elapsed time (with personality modifiers), apply an optional
   *  action, persist, publish. */
  const commit = async (
    action?: (s: PetState, mods: ReturnType<typeof currentModifiers>) => PetState,
  ) => {
    const current = get().pet;
    if (!current) return;
    const mods = currentModifiers();
    let next = applyElapsed(current, Date.now(), mods);
    if (action) next = action(next, mods);
    set({ pet: next });
    await savePet(next);
  };

  return {
    pet: null,
    hydrated: false,

    // Read the stored pet (catching up on elapsed time). No auto-create: a
    // missing pet means the player hasn't hatched one yet → hatch flow.
    bootstrap: async () => {
      const stored = await getPet();
      const pet = stored ? applyElapsed(stored, Date.now(), currentModifiers()) : null;
      if (pet) await savePet(pet);
      set({ pet, hydrated: true });
    },

    refresh: () => commit(),
    feed: () => commit((s, mods) => feed(s, mods)),
    play: () => commit((s, mods) => play(s, mods)),
    sleep: () => commit((s) => sleep(s)),

    hatch: async () => {
      const pet = createPet(Date.now());
      // persist the personality previewed during the ceremony for this bornAt
      await usePersonalityStore.getState().commit(pet.bornAt);
      set({ pet });
      await savePet(pet);
    },

    reset: async () => {
      await clearPet();
      await clearPersonality();
      usePersonalityStore.getState().clear();
      set({ pet: null });
    },
  };
});
