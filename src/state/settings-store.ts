// User preferences (sound, reminders). Persisted synchronously via kv-store —
// same approach as the language choice in src/i18n — so the very first render
// already has the saved values and there's no flash of defaults.

import Storage from 'expo-sqlite/kv-store';
import { create } from 'zustand';

const KEY = 'settings.v1';

type Prefs = {
  sound: boolean;
  reminders: boolean;
};

const DEFAULTS: Prefs = { sound: true, reminders: true };

function load(): Prefs {
  try {
    const raw = Storage.getItemSync(KEY);
    if (raw) return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Prefs>) };
  } catch {
    // corrupt/missing → defaults
  }
  return DEFAULTS;
}

function persist(p: Prefs) {
  try {
    Storage.setItemSync(KEY, JSON.stringify(p));
  } catch {
    // best-effort; a failed write just means defaults next launch
  }
}

type SettingsStore = Prefs & {
  setSound: (v: boolean) => void;
  setReminders: (v: boolean) => void;
};

export const useSettingsStore = create<SettingsStore>((set) => ({
  ...load(),
  setSound: (v) =>
    set((s) => {
      const next = { ...s, sound: v };
      persist(next);
      return { sound: v };
    }),
  setReminders: (v) =>
    set((s) => {
      const next = { ...s, reminders: v };
      persist(next);
      return { reminders: v };
    }),
}));

/** Read the sound flag without subscribing (for the non-React sfx engine). */
export function soundEnabled(): boolean {
  return useSettingsStore.getState().sound;
}
