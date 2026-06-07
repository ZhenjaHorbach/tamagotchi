import { create } from 'zustand';

import { applyElapsed, createPet, feed, play, sleep, type PetState } from '@/core';
import { getPet, savePet } from '@/db/pet-repo';

type PetStore = {
  pet: PetState | null;
  hydrated: boolean;
  bootstrap: () => Promise<void>;
  refresh: () => Promise<void>;
  feed: () => Promise<void>;
  play: () => Promise<void>;
  sleep: () => Promise<void>;
};

export const usePetStore = create<PetStore>((set, get) => {
  const commit = async (action?: (s: PetState) => PetState) => {
    const current = get().pet;
    if (!current) return;
    let next = applyElapsed(current, Date.now());
    if (action) next = action(next);
    set({ pet: next });
    await savePet(next);
  };

  return {
    pet: null,
    hydrated: false,

    bootstrap: async () => {
      const now = Date.now();
      const stored = await getPet();
      const pet = applyElapsed(stored ?? createPet(now), now);
      await savePet(pet);
      set({ pet, hydrated: true });
    },

    refresh: () => commit(),
    feed: () => commit(feed),
    play: () => commit(play),
    sleep: () => commit(sleep),
  };
});
