# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code.

# UI: use the theme constants, no magic numbers

All UI styling must use the scales from `src/ui/theme` (see `shared-styles.ts`)
instead of literal numbers:

- `SPACING` (2/4/8/12/16/20/24) — every `padding`, `margin`, `gap`
- `FONT_SIZE` (semantic, even sizes) + `LETTER_SPACING` — every `Text`
- `BORDER_WIDTH` (hairline/regular/bold) — every border
- `RADIUS` (xxs…xl, pill) — every `borderRadius`
- `ICON_SIZE` (xs…xxl) — every `PixelIcon`
- shared building blocks: `shared.row/disabled/pixelLabel/caption`,
  `useSurfaces()` (panel/field/iconBox/accentTone)

Width-derived geometry stays computed, not on a scale (`KNOB_SIZE / 2`,
`WINDOW_W / 2`, `DOME_W / 2`, and the chunkiness-derived `BTN/SURF/TOY/BEZEL_RADIUS`).
If a value genuinely fits no scale, extend the scale or derive a named constant —
don't inline the number.

# DRY: repeated logic goes into hooks and components

When the same logic or markup shows up a second time, extract it instead of
copying:

- repeated stateful/effect logic → a hook in `src/hooks` (app-level) or next to
  its domain (`src/ui/use-*.ts`, `src/ai/use-*.ts`)
- repeated markup/visuals → a component in `src/ui/components`
  (e.g. the 3D press geometry lives only in `ChunkyButton` — reuse it, don't
  re-implement edge/face views)
- repeated non-React logic → a plain module (`src/core`, `src/ui/theme`)

Prefer extending an existing hook/component with a prop over forking a copy.
