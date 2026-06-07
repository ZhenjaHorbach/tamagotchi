// Procedural pet sprites. The drawing logic mirrors the build-time
// scripts/generate-sprite-sheet.js, but here it's pure + seeded: each pet's
// "DNA" (colours + shape quirks) is derived from a seed, so every creature
// looks unique yet stable across restarts. Rendered live by SpritePlayer.

import type { Mood } from '@/core';

export const FRAME = 16;
export const FRAMES = 4;

type Cell = { x: number; y: number; color: string };

// ── DNA ──────────────────────────────────────────────────────────────────────
const OUTLINE = '#33291A';
const SHINE = '#F1E8D5';

// body / belly / cheek palettes — one coherent set per creature
const PALETTES = [
  { body: '#C9A24B', belly: '#E3D4B4', accent: '#A6552F' }, // gold
  { body: '#6E9E5E', belly: '#CFE0BE', accent: '#C56A4E' }, // green
  { body: '#5E84B2', belly: '#CBD9E8', accent: '#D98C5F' }, // blue
  { body: '#C56A8E', belly: '#EBC9D6', accent: '#7A5E9E' }, // pink
  { body: '#B5774B', belly: '#E6CDA8', accent: '#8E5A2F' }, // brown
  { body: '#9A86C4', belly: '#D8CFEA', accent: '#C9A24B' }, // purple
  { body: '#4FA6A0', belly: '#C6E6E2', accent: '#E0856E' }, // teal
];

export type SpriteDNA = {
  body: string;
  belly: string;
  accent: string;
  hasBelly: boolean;
  ears: 0 | 1 | 2; // none / small dots / tall
  rx: number; // body half-width (rounder vs slimmer)
  eyes: [number, number]; // eye columns
};

/** Stable string → seed hash (e.g. from the pet's name). */
export function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export function dnaFromSeed(seed: number): SpriteDNA {
  const pal = PALETTES[seed % PALETTES.length];
  return {
    ...pal,
    hasBelly: (seed >> 7) % 4 !== 0, // ~75% have a belly patch
    ears: ((seed >> 3) % 3) as 0 | 1 | 2,
    rx: 5.8 + ((seed >> 5) % 3) * 0.3, // 5.8 / 6.1 / 6.4
    eyes: (seed >> 9) % 2 === 0 ? [5, 10] : [4, 11],
  };
}

// ── grid helpers (char keys, like the build script) ──────────────────────────
function blank(): string[][] {
  return Array.from({ length: FRAME }, () => Array<string>(FRAME).fill('_'));
}

function ellipse(g: string[][], cx: number, cy: number, rx: number, ry: number, ch: string) {
  for (let y = 0; y < FRAME; y++) {
    for (let x = 0; x < FRAME; x++) {
      const dx = (x - cx) / rx;
      const dy = (y - cy) / ry;
      if (dx * dx + dy * dy <= 1) g[y][x] = ch;
    }
  }
}

function set(g: string[][], x: number, y: number, ch: string) {
  if (y >= 0 && y < FRAME && x >= 0 && x < FRAME) g[y][x] = ch;
}

function outline(g: string[][]) {
  const isBody = (x: number, y: number) =>
    y >= 0 && y < FRAME && x >= 0 && x < FRAME && g[y][x] !== '_';
  for (let y = 0; y < FRAME; y++) {
    for (let x = 0; x < FRAME; x++) {
      if (g[y][x] === '_') continue;
      if (!isBody(x - 1, y) || !isBody(x + 1, y) || !isBody(x, y - 1) || !isBody(x, y + 1)) {
        g[y][x] = 'O';
      }
    }
  }
}

// ── frame builder ────────────────────────────────────────────────────────────
function buildGrid(mood: Mood, frame: number, dna: SpriteDNA): string[][] {
  const g = blank();
  const squash = frame === 1 ? 1 : frame === 3 ? -0.4 : 0;
  const ry = 5.6 - squash * 0.7;
  const cy = 9.4 + squash * 0.6;
  ellipse(g, 7.5, cy, dna.rx + squash * 0.4, ry, 'B');
  if (dna.hasBelly) ellipse(g, 7.5, cy + 2.2, 3.6, ry - 2.6, 'L');

  // ears
  const earY = Math.round(cy - ry) - 1;
  if (dna.ears === 1) {
    set(g, 4, earY, 'B');
    set(g, 11, earY, 'B');
  } else if (dna.ears === 2) {
    set(g, 4, earY, 'B');
    set(g, 4, earY - 1, 'B');
    set(g, 11, earY, 'B');
    set(g, 11, earY - 1, 'B');
  }
  outline(g);

  const eyeY = Math.round(cy - 1.8);
  const blink = frame === 2;
  const closed = mood === 'sleepy';
  const [eL, eR] = dna.eyes;
  for (const ex of [eL, eR]) {
    if (closed || blink) {
      set(g, ex, eyeY, 'O');
      set(g, ex + (ex < 7.5 ? 1 : -1), eyeY, 'O');
    } else {
      set(g, ex, eyeY, 'O');
      set(g, ex, eyeY - 1, 'O');
      set(g, ex + (ex < 7.5 ? 1 : -1), eyeY - 1, 'W');
    }
  }

  const mouthY = eyeY + 3;
  if (mood === 'happy') {
    set(g, 6, mouthY, 'O');
    set(g, 7, mouthY + 1, 'O');
    set(g, 8, mouthY + 1, 'O');
    set(g, 9, mouthY, 'O');
    set(g, 4, mouthY, 'R');
    set(g, 11, mouthY, 'R');
  } else if (mood === 'neutral') {
    set(g, 7, mouthY, 'O');
    set(g, 8, mouthY, 'O');
  } else if (mood === 'sad') {
    set(g, 6, mouthY + 1, 'O');
    set(g, 7, mouthY, 'O');
    set(g, 8, mouthY, 'O');
    set(g, 9, mouthY + 1, 'O');
    if (frame % 2 === 0) set(g, 3, eyeY + 1, 'W');
  } else if (mood === 'sleepy') {
    set(g, 7, mouthY, 'O');
    const zx = 13;
    const zy = 3 - (frame % 2);
    set(g, zx, zy, 'W');
    set(g, zx - 1, zy + 1, 'W');
    set(g, zx, zy + 2, 'W');
  } else {
    set(g, 7, mouthY, 'O');
    set(g, 8, mouthY, 'O');
    if (frame % 2 === 1) {
      set(g, 7, mouthY + 1, 'R');
      set(g, 8, mouthY + 1, 'R');
    }
  }
  return g;
}

/** Filled cells for one animation frame, ready to draw as Skia rects. */
export function spriteCells(mood: Mood, frame: number, dna: SpriteDNA): Cell[] {
  const color: Record<string, string> = {
    O: OUTLINE,
    B: dna.body,
    L: dna.belly,
    R: dna.accent,
    W: SHINE,
  };
  const g = buildGrid(mood, frame, dna);
  const cells: Cell[] = [];
  for (let y = 0; y < FRAME; y++) {
    for (let x = 0; x < FRAME; x++) {
      const c = g[y][x];
      if (c !== '_') cells.push({ x, y, color: color[c] });
    }
  }
  return cells;
}
