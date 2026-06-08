// Personality lifecycle: load the stored card, or generate one once at birth
// via the SLM (falling back to a template when the model is unavailable or its
// output won't parse). The derived modifiers feed the deterministic core.

import { create } from 'zustand';

import { NEUTRAL_MODIFIERS, selectionToModifiers, type Modifiers } from '@/core';
import { getPersonality, savePersonality } from '@/db/personality-repo';
import i18n from '@/i18n';

import { PERSONALITY_CONFIG, useLlmStore } from './llm-store';
import {
  buildPersonalityPrompt,
  fallbackPersonality,
  parsePersonality,
  type Personality,
} from './personality';

// model language name for the prompt (quirk/name are written in the UI language)
const LANG_NAME: Record<string, string> = {
  en: 'English',
  es: 'Spanish',
  pl: 'Polish',
  ru: 'Russian',
  uk: 'Ukrainian',
};

/** Generate via the SLM when it's ready, else null (caller falls back). */
async function generateCard(): Promise<Personality | null> {
  const llm = useLlmStore.getState();
  if (llm.status !== 'ready') return null;
  const lang = LANG_NAME[i18n.language] ?? 'English';
  const system =
    'You design a tiny pixel pet. Output ONLY one minified JSON object with the exact requested keys — no prose, no markdown, no code fences. /no_think';
  const raw = await llm.generate(buildPersonalityPrompt(lang), PERSONALITY_CONFIG, system);
  return raw ? parsePersonality(raw) : null;
}

type PersonalityStore = {
  card: Personality | null;
  modifiers: Modifiers;
  /** true once a model-generated card is persisted (not just a fallback) */
  persisted: boolean;
  /** card built for the hatch ceremony, before the pet is committed */
  preview: Personality | null;
  /**
   * Make sure a card exists for this pet. Loads the stored one; otherwise
   * generates via the SLM when ready (persisted), or an in-memory fallback
   * that a later call (model ready) can upgrade.
   */
  ensure: (bornAt: number) => Promise<void>;
  /** Build the card shown during hatching (generate now, or template). */
  prepare: () => Promise<Personality>;
  /** Persist the prepared card for the just-born pet. */
  commit: (bornAt: number) => Promise<void>;
  /** Drop the in-memory card (DB row is cleared by the pet reset flow). */
  clear: () => void;
};

export const usePersonalityStore = create<PersonalityStore>((set, get) => ({
  card: null,
  modifiers: NEUTRAL_MODIFIERS,
  persisted: false,
  preview: null,

  ensure: async (bornAt: number) => {
    if (get().persisted && get().card) return;

    const stored = await getPersonality(bornAt);
    if (stored) {
      set({ card: stored, modifiers: selectionToModifiers(stored), persisted: true });
      return;
    }

    const generated = await generateCard();
    if (generated) {
      await savePersonality(bornAt, generated);
      set({ card: generated, modifiers: selectionToModifiers(generated), persisted: true });
      return;
    }
    // model absent/unparseable → template; not persisted so it can upgrade later
    const fb = fallbackPersonality(bornAt);
    set({ card: fb, modifiers: selectionToModifiers(fb), persisted: false });
  },

  prepare: async () => {
    const existing = get().preview;
    if (existing) return existing;
    const card = (await generateCard()) ?? fallbackPersonality(Date.now());
    set({ preview: card });
    return card;
  },

  commit: async (bornAt: number) => {
    const card = get().preview ?? fallbackPersonality(bornAt);
    await savePersonality(bornAt, card);
    set({ card, modifiers: selectionToModifiers(card), persisted: true, preview: null });
  },

  clear: () => set({ card: null, modifiers: NEUTRAL_MODIFIERS, persisted: false, preview: null }),
}));

/** Current modifiers without subscribing (for the pet store's actions). */
export function currentModifiers(): Modifiers {
  return usePersonalityStore.getState().modifiers;
}

/** The pet's name (from its card), or a gentle placeholder before birth. */
export function usePetName(): string {
  return usePersonalityStore((s) => s.card?.name ?? s.preview?.name ?? '…');
}
