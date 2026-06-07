// Runtime in-character replies. Facts (stats, time away) are computed by code
// and handed to the model as ready values — it phrases them, never invents
// numbers (spec). Pure prompt builder + helpers, so they're testable.

import { BOLDNESS, TEMPERAMENTS } from '@/core';

import type { Personality } from './personality';

export type SpeechEvent =
  | 'greet'
  | 'feed'
  | 'play'
  | 'sleep'
  | 'wake'
  | 'hungry'
  | 'sad'
  | 'happy'
  | 'neutral';

export type ReplyContext = {
  event: SpeechEvent;
  hunger: number;
  joy: number;
  energy: number;
  hoursAway: number;
};

// The action the reply MUST be about. Phrased as an imperative so the model
// reacts to this specific moment instead of drifting to stats or its quirk.
const EVENT_DIRECTIVE: Record<SpeechEvent, string> = {
  greet: 'Your human just opened the app to check on you. React to seeing them again.',
  feed: 'Your human just FED you a snack. React to being fed right now.',
  play: 'Your human just PLAYED with you. React to the fun you just had.',
  sleep: 'You just had a NAP and woke up rested, energy restored. React to feeling recharged.',
  wake: 'You just WOKE UP. React to waking up.',
  hungry: 'You are getting HUNGRY. React to your rumbling tummy.',
  sad: 'You feel lonely and a bit down. React to feeling blue.',
  happy: 'You feel wonderful. React to your great mood.',
  neutral: 'Nothing special is happening. Make a small idle remark.',
};

const VOICE = {
  temperament: (id: string) => TEMPERAMENTS.find((o) => o.id === id)?.voice ?? '',
  boldness: (id: string) => BOLDNESS.find((o) => o.id === id)?.voice ?? '',
};

/** ExecuTorch model language name from a UI locale code. */
export function modelLanguageName(code: string): string {
  return (
    { en: 'English', es: 'Spanish', pl: 'Polish', ru: 'Russian', uk: 'Ukrainian' }[code] ??
    'English'
  );
}

/**
 * One-line reply prompt. Tiny and concrete — small models follow it best.
 * `/no_think` suppresses Qwen3's reasoning block.
 */
export function buildReplyPrompt(p: Personality, ctx: ReplyContext, lang: string): string {
  const away =
    ctx.hoursAway >= 1 ? ` They were away about ${Math.round(ctx.hoursAway)} hour(s).` : '';
  return (
    `You are ${p.name}, a tiny pixel pet. ` +
    `Voice: ${VOICE.temperament(p.temperament)}; ${VOICE.boldness(p.boldness)}. Quirk: ${p.quirk}.\n` +
    // the action is the headline instruction
    `WHAT JUST HAPPENED: ${EVENT_DIRECTIVE[ctx.event]}${away}\n` +
    // stats are background colour only
    `Background mood (do not just list it): hunger ${Math.round(ctx.hunger)}/100, ` +
    `joy ${Math.round(ctx.joy)}/100, energy ${Math.round(ctx.energy)}/100.\n` +
    `Reply with ONE short sentence (max 12 words) about WHAT JUST HAPPENED, ` +
    `in character, in ${lang}. No quotes, no emoji spam. /no_think`
  );
}

/**
 * Qwen3 emits a (with /no_think — empty) <think>…</think> block before the
 * reply. Strip closed blocks and any still-open block while it streams.
 */
export function stripThink(text: string): string {
  return text
    .replace(/<think>[\s\S]*?<\/think>/g, '')
    .replace(/<think>[\s\S]*$/, '')
    .trimStart();
}
