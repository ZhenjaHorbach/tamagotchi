// Live pixel-art pet. Builds the four animation frames procedurally from the
// pet's seed (unique look per creature) and plays them on a Skia canvas with
// crisp, nearest-neighbor-style rects — no sprite sheet, no image loading.

import { Canvas, Rect } from '@shopify/react-native-skia';
import { useEffect, useMemo, useState } from 'react';

import type { Mood } from '@/core';

import { dnaFromSeed, FRAME, FRAMES, spriteCells } from './sprite-gen';

const FPS = 5;

type Props = { mood: Mood; seed: number; size?: number };

export function SpritePlayer({ mood, seed, size = 98 }: Props) {
  const [frame, setFrame] = useState(0);

  const dna = useMemo(() => dnaFromSeed(seed), [seed]);
  // precompute all four frames' cells per (mood, dna); the tick only swaps index
  const frames = useMemo(
    () => Array.from({ length: FRAMES }, (_, f) => spriteCells(mood, f, dna)),
    [mood, dna],
  );

  useEffect(() => {
    const id = setInterval(() => setFrame((f) => (f + 1) % FRAMES), 1000 / FPS);
    return () => clearInterval(id);
  }, []);

  const cell = size / FRAME;
  return (
    <Canvas style={{ width: size, height: size }} pointerEvents="none">
      {frames[frame].map((c, i) => (
        // 1.02 overlap avoids hairline seams between pixels
        <Rect
          key={i}
          x={c.x * cell}
          y={c.y * cell}
          width={cell * 1.02}
          height={cell * 1.02}
          color={c.color}
        />
      ))}
    </Canvas>
  );
}
