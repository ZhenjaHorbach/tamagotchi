import {
  Canvas,
  FilterMode,
  Group,
  Image as SkiaImage,
  MipmapMode,
  rect,
  useImage,
} from '@shopify/react-native-skia';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import type { Mood } from '@/core';

const SHEET = require('@/assets/sprites/pet-sheet.png');

export const FRAME_SIZE = 16;
export const FRAME_COUNT = 4;
const FPS = 5;

/** mood → sprite-sheet row (clip) */
export const MOOD_CLIP: Record<Mood, number> = {
  happy: 0,
  neutral: 1,
  sad: 2,
  sleepy: 3,
  hungry: 4,
};

const MOOD_ROWS = Object.keys(MOOD_CLIP).length;

type Props = { mood: Mood; size?: number };

export function SpritePlayer({ mood, size = 98 }: Props) {
  const image = useImage(SHEET);
  const [frame, setFrame] = useState(0);

  // frame loop on a clock
  useEffect(() => {
    const id = setInterval(() => setFrame((f) => (f + 1) % FRAME_COUNT), 1000 / FPS);
    return () => clearInterval(id);
  }, []);

  if (!image) return <View style={{ width: size, height: size }} />;

  const row = MOOD_CLIP[mood];
  return (
    <Canvas style={{ width: size, height: size }}>
      {/* clip to one frame; slide the full sheet so the wanted cell shows */}
      <Group clip={rect(0, 0, size, size)}>
        <SkiaImage
          image={image}
          x={-frame * size}
          y={-row * size}
          width={FRAME_COUNT * size}
          height={MOOD_ROWS * size}
          fit="fill"
          sampling={{ filter: FilterMode.Nearest, mipmap: MipmapMode.None }}
        />
      </Group>
    </Canvas>
  );
}
