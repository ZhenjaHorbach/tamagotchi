// The pet's personality card — generated once at birth by the on-device SLM,
// then stored and reused forever (no per-reply regeneration → no drift).
//
// The model picks an option id per axis plus a few pool entries; choosing from
// an enumerated catalog is far more robust for tiny models than free-text JSON.
// buildPersonalityPrompt() and parsePersonality() are pure and testable;
// parse never throws — callers fall back to a template when it returns null.

import {
  APPETITES,
  AXIS_IDS,
  BOLDNESS,
  ENERGY_TYPES,
  FOOD_DISLIKES,
  FOOD_LIKES,
  NEEDINESS,
  PLAYFULNESS,
  QUIRKS,
  RHYTHMS,
  TEMPERAMENTS,
} from '@/core';

export type Personality = {
  name: string; // a short made-up name
  temperament: string; // flavor axis ids…
  boldness: string;
  energyType: string; // mechanical axis ids…
  appetite: string;
  neediness: string;
  playfulness: string;
  rhythm: string;
  likesFood: string[]; // 1–2 from FOOD_LIKES
  dislikes: string[]; // 0–1 from FOOD_DISLIKES
  quirk: string; // 1 from QUIRKS (free text tolerated)
};

// ── random name generator (no fixed list) ────────────────────────────────────
// Syllable grammar → thousands of cozy two-syllable names. Deterministic from a
// seed so a given pet keeps the same name across restarts.
const ONSETS = ['m', 'p', 'b', 't', 'd', 'k', 'n', 'l', 'r', 's', 'f', 'y', 'v', 'mo', 'pi', 'bo'];
const VOWELS = ['a', 'o', 'i', 'u', 'e', 'oo', 'ee'];
const CODAS = ['', '', 'n', 'ko', 'mi', 'po', 'fu', 'bo', 'la', 'ri', 'na'];

export function generateName(seed: number): string {
  const s = Math.abs(Math.floor(seed));
  const onset = ONSETS[s % ONSETS.length];
  const vowel = VOWELS[Math.floor(s / 7) % VOWELS.length];
  const coda = CODAS[Math.floor(s / 53) % CODAS.length];
  const raw = onset + vowel + coda;
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

// ── prompt ───────────────────────────────────────────────────────────────────

function optionList(ids: readonly string[]): string {
  return ids.join(' | ');
}

/**
 * Birth prompt. `lang` is the human language the quirk should be written in
 * (matches the app UI). Axis values must be ids from the catalog; the model
 * only fills `quirk` freely. `/no_think` suppresses Qwen3's reasoning block.
 */
export function buildPersonalityPrompt(lang: string): string {
  return (
    `Design a tiny pixel pet. Invent a short cozy name (one made-up word). ` +
    `Pick ONE id from each list, 1-2 foods it likes, ` +
    `0-1 it dislikes, and write a short quirk in ${lang}.\n` +
    `temperament: ${optionList(AXIS_IDS.temperament)}\n` +
    `boldness: ${optionList(AXIS_IDS.boldness)}\n` +
    `energyType: ${optionList(AXIS_IDS.energyType)}\n` +
    `appetite: ${optionList(AXIS_IDS.appetite)}\n` +
    `neediness: ${optionList(AXIS_IDS.neediness)}\n` +
    `playfulness: ${optionList(AXIS_IDS.playfulness)}\n` +
    `rhythm: ${optionList(AXIS_IDS.rhythm)}\n` +
    `likesFood/dislikes from: ${optionList([...FOOD_LIKES, ...FOOD_DISLIKES])}\n` +
    `Output ONLY minified JSON with keys: name, temperament, boldness, energyType, ` +
    `appetite, neediness, playfulness, rhythm, likesFood, dislikes, quirk. /no_think`
  );
}

// ── parsing / validation ─────────────────────────────────────────────────────

function extractJsonObject(text: string): string | null {
  const start = text.indexOf('{');
  if (start === -1) return null;
  let depth = 0;
  let inStr = false;
  let escaped = false;
  for (let i = start; i < text.length; i++) {
    const c = text[i];
    if (inStr) {
      if (escaped) escaped = false;
      else if (c === '\\') escaped = true;
      else if (c === '"') inStr = false;
    } else if (c === '"') inStr = true;
    else if (c === '{') depth++;
    else if (c === '}') {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return null;
}

/** Pick a valid id, or null. Case-insensitive, tolerates surrounding text. */
function pickId(v: unknown, ids: readonly string[]): string | null {
  if (typeof v !== 'string') return null;
  const s = v.trim().toLowerCase();
  return ids.find((id) => id === s) ?? null;
}

function pickFromPool(v: unknown, pool: readonly string[], min: number, max: number): string[] | null {
  if (!Array.isArray(v)) return null;
  const set = new Set(pool.map((p) => p.toLowerCase()));
  const out: string[] = [];
  for (const x of v) {
    if (typeof x !== 'string') continue;
    const s = x.trim().toLowerCase();
    const match = pool.find((p) => p.toLowerCase() === s);
    if (match && !out.includes(match) && set.has(s)) out.push(match);
    if (out.length >= max) break;
  }
  return out.length >= min ? out : null;
}

function asQuirk(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  const s = v.trim();
  return s && s.length <= 160 ? s : null;
}

/** A short single-token name (model output may be messy → take the first word). */
function asName(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  const word = v.trim().replace(/["'.,!]/g, '').split(/\s+/)[0] ?? '';
  if (word.length < 2 || word.length > 14) return null;
  return word.charAt(0).toUpperCase() + word.slice(1);
}

/**
 * Validate model output into a Personality, or null if any required axis is
 * missing/invalid. Pools and quirk are lenient (dislikes may be empty).
 */
export function parsePersonality(raw: string): Personality | null {
  const json = extractJsonObject(raw);
  if (!json) return null;
  let obj: Record<string, unknown>;
  try {
    obj = JSON.parse(json);
  } catch {
    return null;
  }
  if (!obj || typeof obj !== 'object') return null;

  const temperament = pickId(obj.temperament, AXIS_IDS.temperament);
  const boldness = pickId(obj.boldness, AXIS_IDS.boldness);
  const energyType = pickId(obj.energyType, AXIS_IDS.energyType);
  const appetite = pickId(obj.appetite, AXIS_IDS.appetite);
  const neediness = pickId(obj.neediness, AXIS_IDS.neediness);
  const playfulness = pickId(obj.playfulness, AXIS_IDS.playfulness);
  const rhythm = pickId(obj.rhythm, AXIS_IDS.rhythm);
  const likesFood = pickFromPool(obj.likesFood, FOOD_LIKES, 1, 2);
  const quirk = asQuirk(obj.quirk);
  const name = asName(obj.name);

  if (!name || !temperament || !boldness || !energyType || !appetite || !neediness || !playfulness || !rhythm) {
    return null;
  }
  if (!likesFood || !quirk) return null;

  const dislikes = pickFromPool(obj.dislikes, FOOD_DISLIKES, 0, 1) ?? [];
  return { name, temperament, boldness, energyType, appetite, neediness, playfulness, rhythm, likesFood, dislikes, quirk };
}

// ── fallback ─────────────────────────────────────────────────────────────────

/** Deterministic, always-valid card from the pet's bornAt (survives restarts). */
export function fallbackPersonality(bornAt: number): Personality {
  const seed = Math.abs(Math.floor(bornAt / 1000));
  const at = <T>(arr: readonly T[], salt: number) => arr[(seed + salt) % arr.length];
  return {
    name: generateName(bornAt),
    temperament: at(TEMPERAMENTS, 0).id,
    boldness: at(BOLDNESS, 1).id,
    energyType: at(ENERGY_TYPES, 2).id,
    appetite: at(APPETITES, 3).id,
    neediness: at(NEEDINESS, 4).id,
    playfulness: at(PLAYFULNESS, 5).id,
    rhythm: at(RHYTHMS, 6).id,
    likesFood: [at(FOOD_LIKES, 7), at(FOOD_LIKES, 11)].filter((v, i, a) => a.indexOf(v) === i),
    dislikes: [at(FOOD_DISLIKES, 8)],
    quirk: at(QUIRKS, 9),
  };
}
