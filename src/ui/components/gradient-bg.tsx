import { Canvas, LinearGradient, RadialGradient, Rect, vec } from '@shopify/react-native-skia';
import { useState } from 'react';
import {
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

type BaseProps = {
  colors: string[];
  style?: StyleProp<ViewStyle>;
};

function useSize() {
  const [size, setSize] = useState({ w: 0, h: 0 });
  const onLayout = (e: LayoutChangeEvent) =>
    setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height });
  return { size, onLayout };
}

/** Vertical (default) or custom-angle linear gradient, fills its container. */
export function LinearBg({
  colors,
  start,
  end,
  style,
}: BaseProps & { start?: { x: number; y: number }; end?: { x: number; y: number } }) {
  const { size, onLayout } = useSize();
  return (
    <View style={[StyleSheet.absoluteFill, style]} onLayout={onLayout} pointerEvents="none">
      {size.w > 0 && (
        <Canvas style={{ width: size.w, height: size.h }}>
          <Rect x={0} y={0} width={size.w} height={size.h}>
            <LinearGradient
              start={vec((start?.x ?? 0) * size.w, (start?.y ?? 0) * size.h)}
              end={vec((end?.x ?? 0) * size.w, (end?.y ?? 1) * size.h)}
              colors={colors}
            />
          </Rect>
        </Canvas>
      )}
    </View>
  );
}

/** Radial gradient; center/radius are fractions of the container box. */
export function RadialBg({
  colors,
  center = { x: 0.5, y: 0.5 },
  radius = 0.75,
  positions,
  style,
}: BaseProps & { center?: { x: number; y: number }; radius?: number; positions?: number[] }) {
  const { size, onLayout } = useSize();
  const r = Math.max(size.w, size.h) * radius;
  return (
    <View style={[StyleSheet.absoluteFill, style]} onLayout={onLayout} pointerEvents="none">
      {size.w > 0 && (
        <Canvas style={{ width: size.w, height: size.h }}>
          <Rect x={0} y={0} width={size.w} height={size.h}>
            <RadialGradient
              c={vec(center.x * size.w, center.y * size.h)}
              r={r}
              colors={colors}
              positions={positions}
            />
          </Rect>
        </Canvas>
      )}
    </View>
  );
}
