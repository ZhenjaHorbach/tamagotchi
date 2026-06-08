// The pet's voice. When the on-device model is ready it generates an
// in-character reply (personality card + live facts); otherwise it falls back
// to the localized canned lines. Either way the bubble shows a calm "thinking"
// cue while the line is being produced, then reveals it with the typewriter —
// raw token streaming looked jerky on the small model.

import { useCallback, useEffect, useRef, useState } from 'react';

import { REPLY_CONFIG, useLlmStore } from '@/ai/llm-store';
import { usePersonalityStore } from '@/ai/personality-store';
import {
  buildReplySystem,
  buildReplyUser,
  modelLanguageName,
  stripThink,
  type SpeechEvent,
} from '@/ai/reply';
import i18n from '@/i18n';
import { usePetStore } from '@/state/pet-store';

import { useTypewriter } from './components/use-typewriter';

const HOUR_MS = 60 * 60 * 1000;

function cannedLine(event: SpeechEvent, last: string): string {
  const pool = i18n.t(`speech.${event}`, { returnObjects: true }) as string[];
  if (!Array.isArray(pool) || pool.length === 0) return '';
  let line = pool[Math.floor(Math.random() * pool.length)];
  let guard = 0;
  while (pool.length > 1 && line === last && guard++ < 5) {
    line = pool[Math.floor(Math.random() * pool.length)];
  }
  return line;
}

export function useSpeech() {
  const [text, setText] = useState(''); // the line to reveal (canned or dynamic)
  const [gen, setGen] = useState(0); // bump to restart the typewriter
  const [thinking, setThinking] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastLine = useRef('');
  const runId = useRef(0); // guards against an earlier slow reply landing late

  const reveal = useCallback((line: string) => {
    setThinking(false);
    setText(line);
    setGen((g) => g + 1);
  }, []);

  const sayCanned = useCallback(
    (event: SpeechEvent, delay = 620 + Math.random() * 520) => {
      const mine = runId.current;
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        if (mine !== runId.current) return;
        const line = cannedLine(event, lastLine.current);
        lastLine.current = line;
        reveal(line);
      }, delay);
    },
    [reveal],
  );

  const speak = useCallback(
    async (event: SpeechEvent) => {
      const mine = ++runId.current;
      if (timer.current) clearTimeout(timer.current);
      setThinking(true);

      const llm = useLlmStore.getState();
      const pet = usePetStore.getState().pet;
      const card = usePersonalityStore.getState().card;

      // dynamic reply only when the model is idle-ready and we have context
      if (llm.status !== 'ready' || llm.generating || !pet || !card) {
        sayCanned(event);
        return;
      }

      const hoursAway =
        event === 'greet' ? Math.max(0, (Date.now() - pet.lastSeenAt) / HOUR_MS) : 0;
      const system = buildReplySystem(card, modelLanguageName(i18n.language));
      const user = buildReplyUser(
        { event, hunger: pet.hunger, joy: pet.joy, energy: pet.energy, hoursAway },
        lastLine.current, // steer away from the previous line
      );

      // generate the whole reply first; only reveal once it's complete
      const full = await llm.generate(user, REPLY_CONFIG, system);
      if (mine !== runId.current) return; // superseded by a newer action
      const line = full ? stripThink(full) : '';
      if (line.length > 0) {
        lastLine.current = line;
        reveal(line);
      } else {
        sayCanned(event, 0); // generation failed → localized fallback, no extra wait
      }
    },
    [reveal, sayCanned],
  );

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  // typewriter reveals the finished line; hidden while thinking
  const typed = useTypewriter(text, { active: !thinking, gen });

  return {
    speak,
    speech: { shown: thinking ? '' : typed.shown, done: typed.done, thinking },
  };
}

export type { SpeechEvent };
