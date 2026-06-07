import { Canvas, Rect } from '@shopify/react-native-skia';
import { memo } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

import { BITMAPS, type IconName } from './pixel-bitmaps';

type Props = {
  name: IconName;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
};

export const PixelIcon = memo(function PixelIcon({ name, size = 16, color = '#000', style }: Props) {
  const bm = BITMAPS[name];
  const rows = bm.length;
  const cols = bm[0].length;
  const cell = size / cols;
  const height = cell * rows;
  const rects: { x: number; y: number }[] = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (bm[y][x] === '#') rects.push({ x, y });
    }
  }
  return (
    <Canvas style={[{ width: size, height }, style]} pointerEvents="none">
      {rects.map((r, i) => (
        // 1.04 cell overlap avoids hairline seams between pixels
        <Rect key={i} x={r.x * cell} y={r.y * cell} width={cell * 1.04} height={cell * 1.04} color={color} />
      ))}
    </Canvas>
  );
});
