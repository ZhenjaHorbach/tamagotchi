import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { PixelIcon } from '@/render/pixel-icon';
import { LinearBg, RadialBg } from '@/ui/components/gradient-bg';
import { BORDER_WIDTH, fadeOut, ICON_SIZE, RADIUS, SPACING, useTheme } from '@/ui/theme';

const WINDOW_W = 150;
const WINDOW_RIM = 3;

const STARS: [number, number][] = [
  [14, 18],
  [30, 40],
  [52, 22],
  [70, 50],
  [84, 30],
  [40, 64],
  [62, 70],
];

function Star({ x, y, index }: { x: number; y: number; index: number }) {
  const theme = useTheme();
  const o = useSharedValue(0.35);
  useEffect(() => {
    o.value = withDelay(
      index * 400,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 1300, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.35, { duration: 1300, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
      ),
    );
  }, [index, o]);
  const style = useAnimatedStyle(() => ({ opacity: o.value }));
  return (
    <Animated.View style={[{ position: 'absolute', left: `${x}%`, top: `${y}%` }, style]}>
      <PixelIcon
        name="star"
        size={index % 3 === 0 ? ICON_SIZE.sm : ICON_SIZE.xs}
        color={theme.inkSoft}
      />
    </Animated.View>
  );
}

function Raindrop({ x, index }: { x: number; index: number }) {
  const theme = useTheme();
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(
      index * 220,
      withRepeat(withTiming(1, { duration: 1400, easing: Easing.linear }), -1),
    );
  }, [index, t]);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: -10 + t.value * 110 }],
    opacity: t.value < 0.2 ? t.value * 3.5 : 1 - t.value * 0.7,
  }));
  return (
    <Animated.View style={[{ position: 'absolute', left: `${x}%`, top: 0 }, style]}>
      <PixelIcon name="drop" size={ICON_SIZE.xs} color={theme.inkFaint} />
    </Animated.View>
  );
}

export function Habitat({ children }: { children?: React.ReactNode }) {
  const theme = useTheme();
  const sunny = theme.celest === 'sun';
  return (
    <View style={styles.root}>
      {/* arched window. The rim is a nested view, not a border: RN borders
          glitch into a thick cap at the apex when the two top radii meet
          (radius == width/2), while rounded fills render clean. */}
      <View style={styles.window}>
        <View style={styles.windowInner}>
          <LinearBg colors={[theme.sky1, theme.sky2]} />
          {theme.stars && STARS.map(([x, y], i) => <Star key={i} x={x} y={y} index={i} />)}
          <View style={styles.celest}>
            <PixelIcon
              name={theme.celest}
              size={theme.celest === 'cloud' ? ICON_SIZE.xxl : ICON_SIZE.xl}
              color={theme.night ? theme.ink : sunny ? '#F3D27A' : theme.inkSoft}
            />
          </View>
          {theme.mood === 'sad' && (
            <View style={StyleSheet.absoluteFill}>
              {[20, 44, 68, 32, 56, 80].map((x, i) => (
                <Raindrop key={i} x={x} index={i} />
              ))}
            </View>
          )}
        </View>
      </View>

      {/* plants */}
      <View style={[styles.plant, styles.plantL]}>
        <PixelIcon name="leaf" size={ICON_SIZE.xl} color={theme.floorEdge} />
      </View>
      <View style={[styles.plant, styles.plantR]}>
        <PixelIcon name="flower" size={ICON_SIZE.lg} color={theme.accent} />
      </View>

      {/* floor glow */}
      <View style={styles.glowBox} pointerEvents="none">
        <RadialBg
          colors={[theme.glow, fadeOut(theme.glow)]}
          center={{ x: 0.5, y: 0.5 }}
          radius={0.5}
          positions={[0, 0.64]}
        />
      </View>

      {/* floor */}
      <View style={styles.floor}>
        <LinearBg colors={[theme.floor, theme.floorEdge]} />
        <View style={styles.floorLine} />
      </View>

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    minHeight: 0,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    marginHorizontal: SPACING.xxs,
  },
  window: {
    position: 'absolute',
    top: 20,
    alignSelf: 'center',
    width: WINDOW_W,
    height: 104,
    borderTopLeftRadius: WINDOW_W / 2,
    borderTopRightRadius: WINDOW_W / 2,
    borderBottomLeftRadius: RADIUS.lg,
    borderBottomRightRadius: RADIUS.lg,
    backgroundColor: 'rgba(0,0,0,0.13)', // the rim
    overflow: 'hidden',
  },
  windowInner: {
    flex: 1,
    margin: WINDOW_RIM,
    borderTopLeftRadius: WINDOW_W / 2 - WINDOW_RIM,
    borderTopRightRadius: WINDOW_W / 2 - WINDOW_RIM,
    borderBottomLeftRadius: RADIUS.lg - WINDOW_RIM,
    borderBottomRightRadius: RADIUS.lg - WINDOW_RIM,
    overflow: 'hidden',
  },
  celest: {
    position: 'absolute',
    top: '18%',
    alignSelf: 'center',
  },
  plant: {
    position: 'absolute',
    bottom: '30%',
  },
  plantL: {
    left: '9%',
    transform: [{ rotate: '-8deg' }],
  },
  plantR: {
    right: '11%',
    bottom: '31%',
    transform: [{ rotate: '6deg' }],
  },
  glowBox: {
    position: 'absolute',
    bottom: '5%',
    alignSelf: 'center',
    width: 220,
    height: 160,
    // additive light, like the design's `mix-blend-mode: screen` — a plain
    // alpha overlay would paint cream fog over the window and wall
    mixBlendMode: 'screen',
  },
  floor: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '32%',
    borderTopWidth: BORDER_WIDTH.bold,
    borderTopColor: 'rgba(0,0,0,0.12)',
    overflow: 'hidden',
  },
  floorLine: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
});
