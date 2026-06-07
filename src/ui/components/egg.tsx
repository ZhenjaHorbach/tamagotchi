// The hatch egg, drawn as chunky pixel art to match the pet sprite: a low-res
// ovoid grid (wider/rounder low, pointier up) with a pixel outline, a shine,
// and jagged pixel cracks revealed one cluster per warming.

import { Canvas, Rect } from '@shopify/react-native-skia';
import { useMemo } from 'react';

import { mix, PLASTIC, useTheme } from '@/ui/theme';

export const EGG_W = 124;
export const EGG_H = 156;

// pixel grid (keeps ~EGG_W/EGG_H proportions); more cells = finer pixels
const GW = 20;
const GH = 26;

// is grid cell (x,y) inside the egg ovoid? top is tapered narrower than bottom
function insideEgg(x: number, y: number): boolean {
  const cx = (GW - 1) / 2;
  const cy = GH * 0.54;
  const rx = GW / 2;
  const ry = GH / 2;
  const ny = (y - cy) / ry;
  if (Math.abs(ny) > 1) return false;
  let half = rx * Math.sqrt(1 - ny * ny);
  if (ny < 0) half *= 1 + ny * 0.22; // taper the top
  return Math.abs(x - cx) <= half - 0.0001;
}

// pixel cracks (grid cells), scattered in 3 clusters revealed in order
const CRACKS: [number, number][][] = [
  // top-centre vertical zig-zag + splinter
  [[10, 3], [11, 4], [10, 5], [11, 6], [10, 7], [10, 8], [11, 9], [10, 10], [12, 4], [13, 5]],
  // left flank, angled down + splinter
  [[7, 8], [6, 9], [7, 10], [6, 11], [6, 12], [6, 7]],
  // lower-right, short angled + splinter
  [[12, 14], [13, 15], [12, 16], [13, 17], [13, 14]],
];

// vertical shade band for a cell row (0 = top light … 3 = bottom shadow)
function shadeBand(y: number): 0 | 1 | 2 | 3 {
  if (y < GH * 0.28) return 0;
  if (y < GH * 0.55) return 1;
  if (y < GH * 0.85) return 2;
  return 3;
}

type FillCell = { x: number; y: number; outline: boolean; band: 0 | 1 | 2 | 3 };

const SHELL = ((): FillCell[] => {
  const cells: FillCell[] = [];
  for (let y = 0; y < GH; y++) {
    for (let x = 0; x < GW; x++) {
      if (!insideEgg(x, y)) continue;
      const edge =
        !insideEgg(x - 1, y) || !insideEgg(x + 1, y) || !insideEgg(x, y - 1) || !insideEgg(x, y + 1);
      cells.push({ x, y, outline: edge, band: shadeBand(y) });
    }
  }
  return cells;
})();

// upper-left glossy highlight
const SHINE: [number, number][] = [
  [6, 5],
  [7, 5],
  [6, 6],
];

// freckles scattered on the shell (interior, non-edge) for texture
const SPOTS: [number, number][] = (
  [
    [7, 10],
    [14, 9],
    [11, 14],
    [8, 17],
    [15, 15],
    [10, 20],
    [6, 13],
    [13, 19],
  ] as [number, number][]
).filter(
  ([x, y]) =>
    insideEgg(x, y) &&
    insideEgg(x - 1, y) &&
    insideEgg(x + 1, y) &&
    insideEgg(x, y - 1) &&
    insideEgg(x, y + 1),
);

type Props = {
  /** 0–3 cracks shown so far */
  cracks: number;
};

export function Egg({ cracks }: Props) {
  const theme = useTheme();
  const cell = EGG_W / GW;

  // four shade bands: lit top → cream → sand → bottom shadow
  const bands = useMemo(
    () => [
      mix(PLASTIC.cream, '#ffffff', 0.28),
      PLASTIC.cream,
      PLASTIC.toy3,
      mix(PLASTIC.toy3, '#000000', 0.16),
    ],
    [],
  );

  const crackCells = useMemo(() => CRACKS.slice(0, cracks).flat(), [cracks]);

  return (
    <Canvas style={{ width: EGG_W, height: GH * cell }} pointerEvents="none">
      {SHELL.map((c, i) => (
        <Rect
          key={i}
          x={c.x * cell}
          y={c.y * cell}
          width={cell * 1.02}
          height={cell * 1.02}
          color={c.outline ? theme.panelLine : bands[c.band]}
        />
      ))}
      {SPOTS.map(([x, y], i) => (
        <Rect
          key={`spot${i}`}
          x={x * cell}
          y={y * cell}
          width={cell * 1.02}
          height={cell * 1.02}
          color={theme.inkGhost}
        />
      ))}
      {SHINE.map(([x, y], i) => (
        <Rect
          key={`s${i}`}
          x={x * cell}
          y={y * cell}
          width={cell * 1.02}
          height={cell * 1.02}
          color="rgba(255,255,255,0.6)"
        />
      ))}
      {crackCells.map(([x, y], i) => (
        <Rect
          key={`c${i}`}
          x={x * cell}
          y={y * cell}
          width={cell * 1.02}
          height={cell * 1.02}
          color={theme.inkSoft}
        />
      ))}
    </Canvas>
  );
}
