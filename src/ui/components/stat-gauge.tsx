import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
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
import { FONTS, useTheme } from '@/ui/theme';

const SEGMENTS = 10;

type Props = {
  icon: IconName;
  label: string;
  value: number; // 0..100
  tone: string;
  alert?: boolean;
};

function AlertBang({ color }: { color: string }) {
  const y = useSharedValue(0);
  useEffect(() => {
    y.value = withRepeat(
      withSequence(
        withTiming(-2, { duration: 400, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 400, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
    );
  }, [y]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  return (
    <Animated.View style={[styles.bang, style]}>
      <PixelIcon name="bang" size={6} color={color} />
    </Animated.View>
  );
}

export function StatGauge({ icon, label, value, tone, alert }: Props) {
  const theme = useTheme();
  const filled = Math.max(0, Math.min(SEGMENTS, Math.round((value / 100) * SEGMENTS)));
  return (
    <View style={styles.row}>
      <View style={styles.ico}>
        <PixelIcon name={icon} size={16} color={tone} />
        {alert && <AlertBang color={theme.accent} />}
      </View>
      <View style={styles.track}>
        {Array.from({ length: SEGMENTS }).map((_, i) => (
          <View
            key={i}
            style={[styles.seg, { backgroundColor: i < filled ? tone : theme.track }]}
          />
        ))}
      </View>
      <Text style={[styles.cap, { color: alert ? theme.accent : theme.inkFaint }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  ico: {
    width: 18,
    alignItems: 'center',
  },
  bang: {
    position: 'absolute',
    top: -5,
    right: -5,
  },
  track: {
    flex: 1,
    flexDirection: 'row',
    gap: 3,
  },
  seg: {
    flex: 1,
    height: 13,
    borderRadius: 3,
  },
  cap: {
    fontFamily: FONTS.uiHeavy,
    fontSize: 9.5,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    width: 46,
    textAlign: 'right',
  },
});
