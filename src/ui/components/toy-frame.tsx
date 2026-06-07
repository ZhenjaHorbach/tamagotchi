import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { PixelIcon } from '@/render/pixel-icon';
import type { IconName } from '@/render/pixel-bitmaps';
import { BEZEL_RADIUS, BORDER_WIDTH, FONT_SIZE, FONTS, ICON_SIZE, LETTER_SPACING, PLASTIC, RADIUS, SPACING, TOY_RADIUS, useTheme } from '@/ui/theme';
import { LinearBg } from '@/ui/components/gradient-bg';

export const TOY_WIDTH = 412;
export const SCREEN_HEIGHT = 566;

function Led() {
  const o = useSharedValue(0.65);
  useEffect(() => {
    o.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1700, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.65, { duration: 1700, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
    );
  }, [o]);
  const style = useAnimatedStyle(() => ({ opacity: o.value }));
  return <Animated.View style={[styles.led, { backgroundColor: PLASTIC.led, shadowColor: PLASTIC.led }, style]} />;
}

function Screw({ corner }: { corner: 'tl' | 'tr' | 'bl' | 'br' }) {
  const pos: Record<string, object> = {
    tl: { top: 14, left: 14 },
    tr: { top: 14, right: 14 },
    bl: { bottom: 14, left: 14 },
    br: { bottom: 14, right: 14 },
  };
  return <View style={[styles.screw, { backgroundColor: PLASTIC.toyScrew }, pos[corner]]} />;
}

function Grille() {
  return (
    <View style={styles.grille}>
      {Array.from({ length: 5 }).map((_, i) => (
        <View key={i} style={[styles.grilleBar, { backgroundColor: PLASTIC.toyLine }]} />
      ))}
    </View>
  );
}

export type HardwareAction = {
  icon: IconName;
  label: string;
  onPress: () => void;
  active?: boolean;
};

const KNOB_SIZE = 42;
const KNOB_EDGE_H = 3;

function HardwareButton({ icon, label, onPress, active }: HardwareAction) {
  const theme = useTheme();
  const [pressed, setPressed] = useState(false);
  return (
    <Pressable
      style={styles.hw}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}>
      {/* same scheme as ChunkyButton: edge sits KNOB_EDGE_H below the knob,
          pressing slides the knob down onto it — nothing peeks out */}
      <View style={styles.knobBox}>
        <View style={[styles.knobEdge, { backgroundColor: PLASTIC.toy3 }]} />
        <View
          style={[
            styles.knob,
            { backgroundColor: PLASTIC.toy1 },
            { transform: [{ translateY: pressed ? KNOB_EDGE_H : 0 }] },
          ]}>
          {/* active ring drawn outside the knob, never affects layout */}
          {active && <View style={[styles.knobRing, { borderColor: theme.accent }]} />}
          <PixelIcon name={icon} size={ICON_SIZE.md} color={active ? theme.accent : PLASTIC.knobInk} />
        </View>
      </View>
      <Text style={[styles.hwLabel, { color: PLASTIC.brand }]}>{label.toUpperCase()}</Text>
    </Pressable>
  );
}

type Props = {
  children: React.ReactNode;
  hw: HardwareAction[];
  badge?: string;
};

export function ToyFrame({ children, hw, badge }: Props) {
  const theme = useTheme();
  return (
    <View style={[styles.toy, { borderColor: PLASTIC.toyLine }]}>
      <LinearBg colors={[PLASTIC.toy1, PLASTIC.toy2, PLASTIC.toy3]} style={styles.toyBg} />
      <Screw corner="tl" />
      <Screw corner="tr" />
      <Screw corner="bl" />
      <Screw corner="br" />

      <View style={styles.top}>
        <Text style={[styles.brand, { color: PLASTIC.brand }]}>
          TERRA<Text style={{ color: PLASTIC.led }}>·</Text>POCKET
        </Text>
        <Led />
      </View>

      <View style={[styles.bezel]}>
        <LinearBg colors={[PLASTIC.bezel1, PLASTIC.bezel2]} style={styles.bezelBg} />
        <View style={styles.screen}>
          <LinearBg colors={[theme.screen1, theme.screen2]} />
          {children}
          {badge != null && (
            <View style={[styles.badge, { backgroundColor: theme.accent }]} pointerEvents="none">
              <Text style={[styles.badgeText, { color: PLASTIC.cream }]}>{badge}</Text>
            </View>
          )}
          {/* glare + vignette */}
          <LinearBg
            colors={['rgba(255,255,255,0.13)', 'rgba(255,255,255,0)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.45, y: 0.36 }}
          />
        </View>
      </View>

      <View style={styles.chin}>
        <Grille />
        <View style={styles.hwRow}>
          {hw.map((b) => (
            <HardwareButton key={b.label} {...b} />
          ))}
        </View>
        <Grille />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  toy: {
    width: TOY_WIDTH,
    paddingTop: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.md,
    borderRadius: TOY_RADIUS,
    borderWidth: BORDER_WIDTH.hairline,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 18 },
    elevation: 16,
  },
  toyBg: {
    borderRadius: TOY_RADIUS,
    overflow: 'hidden',
  },
  screw: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: RADIUS.xxs,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.sm,
    paddingTop: 2,
    paddingBottom: SPACING.sm,
  },
  brand: {
    fontFamily: FONTS.pixel,
    fontSize: FONT_SIZE.pixelLg,
    letterSpacing: LETTER_SPACING.wide,
  },
  led: {
    width: 9,
    height: 9,
    borderRadius: RADIUS.pill,

    borderWidth: BORDER_WIDTH.bold,
    borderColor: 'rgba(255,255,255,0.25)',
    shadowOpacity: 1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  bezel: {
    padding: SPACING.md,
    borderRadius: BEZEL_RADIUS,
    overflow: 'hidden',
  },
  bezelBg: {
    borderRadius: BEZEL_RADIUS,
  },
  screen: {
    height: SCREEN_HEIGHT,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: BORDER_WIDTH.regular,
    borderColor: 'rgba(0,0,0,0.35)',
  },
  badge: {
    position: 'absolute',
    top: SPACING.sm,
    alignSelf: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
  badgeText: {
    fontFamily: FONTS.pixel,
    fontSize: FONT_SIZE.pixel,
    letterSpacing: LETTER_SPACING.base,
  },
  chin: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
    paddingHorizontal: SPACING.sm,
  },
  grille: {
    gap: SPACING.xxs,
  },
  grilleBar: {
    width: 18,
    height: 3,
    borderRadius: RADIUS.xxs,
  },
  hwRow: {
    flexDirection: 'row',
    gap: SPACING.xl,
  },
  hw: {
    alignItems: 'center',
    gap: SPACING.xs,
    padding: 2,
  },
  knobBox: {
    width: KNOB_SIZE,
    // reserve room below the knob for the visible edge
    paddingBottom: KNOB_EDGE_H,
  },
  knobEdge: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: KNOB_EDGE_H,
    bottom: 0,
    borderRadius: KNOB_SIZE / 2,
  },
  knob: {
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: KNOB_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: BORDER_WIDTH.hairline,
    borderTopColor: 'rgba(255,255,255,0.5)',
  },
  knobRing: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: KNOB_SIZE / 2 + 2,
    borderWidth: BORDER_WIDTH.bold,
  },
  hwLabel: {
    fontFamily: FONTS.pixel,
    fontSize: FONT_SIZE.pixel,
    letterSpacing: LETTER_SPACING.tight,
  },
});
