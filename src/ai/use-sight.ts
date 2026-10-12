// Orchestrates the camera "show me" moment: classify the captured frame on
// device → ask the LLM how the pet (by its personality) feels about that thing
// → apply the stat reaction → reveal the in-character line with the typewriter.
// All local; the frame never leaves the device.

import { useCallback, useRef, useState } from 'react';

import { SIGHT_CONFIG, useLlmStore } from '@/ai/llm-store';
import { usePersonalityStore } from '@/ai/personality-store';
import { buildSightSystem, buildSightUser, modelLanguageName, parseSight } from '@/ai/reply';
import { useVisionStore } from '@/ai/vision-store';
import { playSfx } from '@/audio/sfx';
import type { SightVerdict } from '@/core';
import i18n from '@/i18n';
import { usePetStore } from '@/state/pet-store';

import { useTypewriter } from '@/ui/components/use-typewriter';

export type SightPhase = 'aim' | 'scanning' | 'seen';

const SFX_FOR: Record<SightVerdict, 'play' | 'tap' | 'sleep'> = {
  love: 'play',
  meh: 'tap',
  dislike: 'sleep',
};

function cannedSight(): string {
  const pool = i18n.t('camera.fallback', { returnObjects: true }) as string[];
  if (!Array.isArray(pool) || pool.length === 0) return '…';
  return pool[Math.floor(Math.random() * pool.length)];
}

export function useSightReaction() {
  const [phase, setPhase] = useState<SightPhase>('aim');
  const [line, setLine] = useState('');
  const [gen, setGen] = useState(0);
  const lastLine = useRef('');
  const runId = useRef(0);

  // React to a captured frame. Drives phase: scanning → seen.
  const run = useCallback(async (uri: string) => {
    const mine = ++runId.current;
    setPhase('scanning');

    const llm = useLlmStore.getState();
    const card = usePersonalityStore.getState().card;
    let verdict: SightVerdict = 'meh';
    let food = false;
    let text = '';
    if (card && llm.status === 'ready' && !llm.generating) {
      const vision = useVisionStore.getState();
      if (vision.status !== 'ready') await vision.load();
      const label = (await useVisionStore.getState().classify(uri)) ?? 'mysterious thing';
      if (mine !== runId.current) return;

      const system = buildSightSystem(card, modelLanguageName(i18n.language));
      const user = buildSightUser(label, card.likesFood, card.dislikes, lastLine.current);
      const raw = await llm.generate(user, SIGHT_CONFIG, system);
      const parsed = raw ? parseSight(raw) : null;
      if (parsed) {
        verdict = parsed.verdict;
        food = parsed.food;
        text = parsed.line;
      }
    }
    if (mine !== runId.current) return;
    if (!text) text = cannedSight();

    await usePetStore.getState().react(verdict, food);
    playSfx(SFX_FOR[verdict]);
    lastLine.current = text;
    setLine(text);
    setGen((g) => g + 1);
    setPhase('seen');
  }, []);

  const reset = useCallback(() => {
    runId.current += 1; // cancel any in-flight reaction
    setPhase('aim');
  }, []);

  const typed = useTypewriter(line, { active: phase === 'seen', gen });

  return {
    phase,
    run,
    reset,
    bubble: { shown: typed.shown, done: typed.done },
  };
}
