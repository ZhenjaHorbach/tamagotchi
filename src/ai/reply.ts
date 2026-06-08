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
  | 'neutral'
  | 'camera';

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
  camera:
    "Your human pressed a button, but you're already full, rested and happy — buttons can't boost you further. " +
    'Cheekily tell them to point the CAMERA at something fun instead, to delight you more.',
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
 * System prompt: the pet's persistent identity, voice and reply rules. Stable
 * across a pet's life, so it belongs in the system role (better adherence,
 * and the model stops warning about a missing system prompt).
 */
export function buildReplySystem(p: Personality, lang: string): string {
  return (
    `You are ${p.name}, a tiny pixel creature living in a pocket terrarium. ` +
    `Voice: ${VOICE.temperament(p.temperament)}; ${VOICE.boldness(p.boldness)}. ` +
    `You sometimes (not always) let this quirk slip out: ${p.quirk}. ` +
    `Be witty, playful and a little unexpected — like a tiny weird friend, never a polite assistant. ` +
    `Every reply must be FRESH: new wording, a new little thought, never a line you've said before. ` +
    `Answer with ONE short punchy sentence (max 12 words), in character, in ${lang}. ` +
    `No quotes, no narration, no emoji spam. /no_think`
  );
}

// rotating "tone" sparks — a different creative angle each call breaks the
// model out of repeating the same line for the same event
const SPARKS = [
  'be cheeky and teasing',
  'overreact dramatically',
  'be sweetly affectionate',
  'make a tiny absurd joke',
  'be mock-philosophical about it',
  'act gently smug',
  'be adorably confused',
  'sound conspiratorial, like sharing a secret',
];

function pickSpark(): string {
  return SPARKS[Math.floor(Math.random() * SPARKS.length)];
}

/**
 * User turn: the situational facts + a fresh tone spark, and (optionally) the
 * last line to steer away from, so repeated actions don't produce repeats.
 */
export function buildReplyUser(ctx: ReplyContext, avoid?: string): string {
  const away =
    ctx.hoursAway >= 1 ? ` They were away about ${Math.round(ctx.hoursAway)} hour(s).` : '';
  const dontRepeat = avoid
    ? `\nDo NOT reuse or paraphrase your previous line: "${avoid}". Say something different.`
    : '';
  return (
    `WHAT JUST HAPPENED: ${EVENT_DIRECTIVE[ctx.event]}${away}\n` +
    `Background mood (do not just recite numbers): hunger ${Math.round(ctx.hunger)}/100, ` +
    `joy ${Math.round(ctx.joy)}/100, energy ${Math.round(ctx.energy)}/100.\n` +
    `This time, ${pickSpark()}.${dontRepeat}\n` +
    `Reply about WHAT JUST HAPPENED — one fresh, funny, in-character line.`
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
