import type { Mood } from '@/core';

import { adj, mix, rgba } from './color';
import { DEFAULT_PALETTE, type Palette } from './palettes';

export type Celestial = 'sun' | 'cloud' | 'rain' | 'moon';

/** Mood glyphs; the labels/taglines live in the locale files (i18n). */
export const MOOD_META: Record<Mood, { glyph: string }> = {
  happy: { glyph: 'sun' },
  neutral: { glyph: 'leaf' },
  sad: { glyph: 'rain' },
  sleepy: { glyph: 'moon' },
  hungry: { glyph: 'bowl' },
};

export type Theme = {
  mood: Mood;
  night: boolean;
  // stage / room behind the toy
  room1: string;
  room2: string;
  // inset screen
  screen1: string;
  screen2: string;
  // habitat
  floor: string;
  floorEdge: string;
  glow: string;
  glowSize: number; // fraction of habitat width
  sky1: string;
  sky2: string;
  celest: Celestial;
  stars: boolean;
  // accents & inks
  accent: string;
  accentDeep: string;
  accentSoft: string;
  ink: string;
  inkSoft: string;
  inkFaint: string;
  inkGhost: string;
  // surfaces
  panel: string;
  panelLine: string;
  panelDeep: string;
  bubbleBg: string;
  bubbleLine: string;
  track: string;
  btnInk: string;
};

export function moodTheme(mood: Mood, P: Palette = DEFAULT_PALETTE): Theme {
  const night = mood === 'sleepy';
  let v: {
    room1: string;
    room2: string;
    screen1: string;
    screen2: string;
    floor: string;
    floorEdge: string;
    glow: string;
    glowSize: number;
    accent: string;
    accentDeep: string;
    celest: Celestial;
    stars: boolean;
    sky1: string;
    sky2: string;
  };
  if (mood === 'happy') {
    v = {
      room1: adj(P.cream, { dl: 0.03 }),
      room2: adj(P.gold, { dl: 0.1, ds: -0.06 }),
      screen1: adj(mix(P.cream, P.gold, 0.16), { dl: 0.03 }),
      screen2: adj(P.gold, { dl: 0.05 }),
      floor: mix(P.gold, P.rust, 0.34),
      floorEdge: mix(P.rust, P.ink, 0.25),
      glow: rgba(adj(P.gold, { dl: 0.2 }), 0.95),
      glowSize: 0.62,
      accent: P.rust,
      accentDeep: adj(P.rust, { dl: -0.09 }),
      celest: 'sun',
      stars: false,
      sky1: adj('#BFE3E0', { dl: 0.02 }),
      sky2: '#E9DCB8',
    };
  } else if (mood === 'neutral') {
    v = {
      room1: P.cream,
      room2: adj(P.sand, { dl: -0.04 }),
      screen1: mix(P.cream, P.sand, 0.5),
      screen2: adj(P.sand, { dl: -0.05 }),
      floor: mix(P.sand, P.olive, 0.32),
      floorEdge: mix(P.olive, P.ink, 0.3),
      glow: rgba(adj(P.gold, { dl: 0.16, ds: -0.1 }), 0.8),
      glowSize: 0.56,
      accent: adj(P.rust, { ds: -0.06 }),
      accentDeep: adj(P.rust, { dl: -0.1, ds: -0.06 }),
      celest: 'cloud',
      stars: false,
      sky1: '#CFDDD6',
      sky2: '#E4D8BC',
    };
  } else if (mood === 'sad') {
    v = {
      room1: adj(P.cream, { ds: -0.4 }),
      room2: adj(P.sand, { ds: -0.42, dl: -0.06, dh: -8 }),
      screen1: adj(mix(P.cream, P.sand, 0.5), { ds: -0.45, dl: -0.03, dh: -10 }),
      screen2: adj(P.sand, { ds: -0.5, dl: -0.1, dh: -12 }),
      floor: adj(mix(P.sand, P.olive, 0.4), { ds: -0.4, dl: -0.05 }),
      floorEdge: adj(P.ink, { ds: -0.3, dl: 0.02 }),
      glow: rgba(adj(P.olive, { ds: -0.4, dl: 0.1 }), 0.5),
      glowSize: 0.5,
      accent: adj(P.olive, { ds: -0.2, dh: -6 }),
      accentDeep: adj(P.olive, { dl: -0.12, ds: -0.2 }),
      celest: 'rain',
      stars: false,
      sky1: '#B9C0C2',
      sky2: '#C9CBC0',
    };
  } else if (mood === 'sleepy') {
    v = {
      room1: P.nightBg,
      room2: adj(P.nightBg, { dl: -0.06 }),
      screen1: adj(P.nightBg, { dl: 0.05 }),
      screen2: adj(P.nightBg, { dl: -0.02 }),
      floor: adj(P.nightBg, { dl: 0.08, ds: 0.05 }),
      floorEdge: adj(P.nightBg, { dl: -0.04 }),
      glow: rgba(P.nightAcc, 0.42),
      glowSize: 0.52,
      accent: P.nightAcc,
      accentDeep: adj(P.nightAcc, { dl: -0.12 }),
      celest: 'moon',
      stars: true,
      sky1: adj(P.nightBg, { dl: 0.06 }),
      sky2: adj(P.nightBg, { dl: -0.03 }),
    };
  } else {
    // hungry
    v = {
      room1: adj(P.cream, { dh: -4 }),
      room2: adj(P.sand, { dl: -0.05, dh: -4 }),
      screen1: mix(P.cream, P.sand, 0.45),
      screen2: adj(P.sand, { dl: -0.06, dh: -3 }),
      floor: mix(P.sand, P.rust, 0.3),
      floorEdge: mix(P.rust, P.ink, 0.3),
      glow: rgba(adj(P.rust, { dl: 0.22, ds: 0.1 }), 0.55),
      glowSize: 0.54,
      accent: adj(P.rust, { ds: 0.12, dl: 0.02 }),
      accentDeep: adj(P.rust, { dl: -0.1, ds: 0.1 }),
      celest: 'cloud',
      stars: false,
      sky1: '#D6CDB6',
      sky2: '#E3D2AE',
    };
  }
  const ink = night ? P.nightInk : P.ink;
  return {
    mood,
    night,
    ...v,
    accentSoft: rgba(v.accent, 0.16),
    ink,
    inkSoft: rgba(ink, 0.66),
    inkFaint: rgba(ink, 0.4),
    inkGhost: rgba(ink, 0.14),
    panel: night ? rgba(P.nightInk, 0.07) : rgba(P.ink, 0.045),
    panelLine: night ? rgba(P.nightInk, 0.16) : rgba(P.ink, 0.11),
    panelDeep: night ? 'rgba(0,0,0,0.22)' : rgba(P.ink, 0.08),
    bubbleBg: night ? adj(P.nightBg, { dl: 0.1 }) : adj(P.cream, { dl: 0.06 }),
    bubbleLine: night ? rgba(P.nightInk, 0.18) : rgba(P.ink, 0.12),
    track: night ? 'rgba(0,0,0,0.28)' : rgba(P.ink, 0.1),
    btnInk: night ? adj(P.nightBg, { dl: -0.04 }) : adj(P.cream, { dl: 0.06 }),
  };
}

// ── constant toy-shell colors (the device itself never changes with mood) ─────
export type Plastic = {
  toy1: string;
  toy2: string;
  toy3: string;
  toyLine: string;
  toyScrew: string;
  bezel1: string;
  bezel2: string;
  brand: string;
  knobInk: string;
  led: string;
  cream: string;
};

export function plasticTheme(P: Palette = DEFAULT_PALETTE): Plastic {
  return {
    toy1: mix(P.cream, '#ffffff', 0.2),
    toy2: adj(P.sand, { dl: 0.05 }),
    toy3: adj(P.sand, { dl: -0.11, ds: -0.04 }),
    toyLine: rgba(P.ink, 0.12),
    toyScrew: rgba(P.ink, 0.2),
    bezel1: adj(P.ink, { dl: 0.05 }),
    bezel2: adj(P.ink, { dl: -0.02 }),
    brand: rgba(P.ink, 0.42),
    knobInk: rgba(P.ink, 0.66),
    led: adj(P.rust, { dl: 0.04, ds: 0.1 }),
    cream: adj(P.cream, { dl: 0.06 }),
  };
}

// ── chunkiness (design tweak default: 62%) ────────────────────────────────────
const CHUNK = 0.62;
export const BTN_RADIUS = 9 + CHUNK * 16;
export const BTN_EDGE_H = 3 + CHUNK * 6;
export const SURF_RADIUS = 12 + CHUNK * 12;
export const TOY_RADIUS = 34 + CHUNK * 16;
export const BEZEL_RADIUS = 18 + CHUNK * 8;

// ── stat gauge + action button tones (from app.jsx) ───────────────────────────
export function gaugeTones(P: Palette = DEFAULT_PALETTE) {
  return { hunger: P.gold, joy: P.rust, energy: P.olive };
}

export type ButtonTone = { face: string; edge: string; ink: string };

export function buttonTones(
  P: Palette = DEFAULT_PALETTE,
): Record<'feed' | 'play' | 'sleep', ButtonTone> {
  return {
    feed: {
      face: P.gold,
      edge: adj(P.gold, { dl: -0.15, ds: 0.05 }),
      ink: adj(P.ink, { dl: 0.02 }),
    },
    play: { face: P.olive, edge: adj(P.olive, { dl: -0.14 }), ink: adj(P.cream, { dl: 0.07 }) },
    sleep: {
      face: adj(P.ink, { dl: 0.19, ds: -0.08 }),
      edge: adj(P.ink, { dl: 0.06 }),
      ink: adj(P.cream, { dl: 0.07 }),
    },
  };
}
