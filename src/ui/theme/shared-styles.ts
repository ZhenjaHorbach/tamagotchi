// Shared building blocks used across screens: static utility styles and
// theme-dependent surfaces, so panel/label/disabled looks stay consistent.

import { useMemo } from 'react';
import { StyleSheet } from 'react-native';

import { FONTS, useTheme } from './context';
import { SURF_RADIUS } from './mood-theme';

/**
 * 4pt spacing scale — all layout paddings/gaps/margins snap to it.
 * (Sub-4px pixel-art micro gaps stay literal.)
 */
export const SPACING = {
  xxs: 2, // pixel-art micro gaps (segments, grilles)
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;

/** Semantic type scale (even sizes only) — every Text picks a role. */
export const FONT_SIZE = {
  pixel: 8, // tiny pixel-font captions
  pixelLg: 10, // brand, chips, gauge caps
  caption: 12, // secondary copy under titles
  body: 12, // regular UI copy
  button: 14, // button & row labels
  input: 14, // text inputs
  subtitle: 16, // panel headings
  speech: 18, // the pet's voice
  title: 20, // nameplate
  display: 24, // screen headings
  hero: 40, // the hatch reveal name — a one-off big moment
} as const;

export const LETTER_SPACING = {
  tight: 0.5,
  base: 0.8,
  wide: 1.2,
} as const;

/**
 * Corner radii. Toy-shell chrome (BTN/SURF/TOY/BEZEL_RADIUS) stays derived
 * from the design's chunkiness; width-derived shapes (dome arches) stay
 * computed from their own width.
 */
export const RADIUS = {
  xxs: 2, // pixel micro elements: screws, grille bars
  xs: 4, // segments, planks, bubble tail
  sm: 8, // chips, icon squircles, corks
  md: 12, // habitat, inner window corners
  lg: 16, // speech bubble, screen, dome bottoms
  xl: 20, // dome shine
  pill: 999, // circles & pills
} as const;

/** PixelIcon sizes — pixel glyphs read best on this even scale. */
export const ICON_SIZE = {
  xs: 8, // micro decorations: alert bang, raindrops, small stars
  sm: 12, // inline glyphs: chevrons, sparkles, mood marks
  md: 16, // row icons, hardware knobs, gauges
  lg: 24, // big marks: shield, action-button icons, zzz
  xl: 32, // scene art: plants, sun/moon, dome egg
  xxl: 40, // the habitat cloud
} as const;

/** Border widths — three weights cover the whole UI. */
export const BORDER_WIDTH = {
  hairline: 1, // panel outlines, dividers
  regular: 1.5, // speech bubbles, inputs, the screen edge
  bold: 2, // floor edges, rings
} as const;

/** Static styles that don't depend on the mood theme. */
export const shared = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.45,
  },
  /** small pixel-font caption (taglines, footers, metric lines) */
  pixelLabel: {
    fontFamily: FONTS.pixel,
    fontSize: FONT_SIZE.pixel,
    letterSpacing: LETTER_SPACING.base,
    textTransform: 'uppercase',
  },
  /** secondary copy under titles */
  caption: {
    fontFamily: FONTS.ui,
    fontSize: FONT_SIZE.caption,
  },
});

/** Mood-themed surfaces, memoized per theme. */
export function useSurfaces() {
  const theme = useTheme();
  return useMemo(
    () => ({
      /** standard panel: soft fill + hairline + chunky radius */
      panel: {
        backgroundColor: theme.panel,
        borderColor: theme.panelLine,
        borderWidth: BORDER_WIDTH.hairline,
        borderRadius: SURF_RADIUS,
      },
      /** brighter input/bubble surface */
      field: {
        backgroundColor: theme.bubbleBg,
        borderColor: theme.panelLine,
      },
      /** small squircle holding a pixel icon (settings rows etc.) */
      iconBox: {
        backgroundColor: theme.bubbleBg,
        borderColor: theme.panelLine,
        borderWidth: BORDER_WIDTH.hairline,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
      },
      /** chunky-button tone built from the mood accent */
      accentTone: {
        face: theme.accent,
        edge: theme.accentDeep,
        ink: theme.btnInk,
      },
    }),
    [theme],
  );
}
