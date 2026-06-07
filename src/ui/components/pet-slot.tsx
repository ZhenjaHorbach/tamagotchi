import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import type { Mood } from '@/core';
import { PixelIcon } from '@/render/pixel-icon';
import { SpritePlayer } from '@/render/sprite-player';
import { RadialBg } from '@/ui/components/gradient-bg';
import { fadeOut, ICON_SIZE, RADIUS, useTheme } from '@/ui/theme';

const SIZE = 98;

function Zzz() {
  const theme = useTheme();
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) }), -1);
  }, [t]);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: -12 * t.value }],
    opacity: t.value < 0.3 ? t.value / 0.3 : 1 - (t.value - 0.3) / 0.7,
  }));
  return (
    <Animated.View style={styles.zzz}>
      <Animated.View style={style}>
        <PixelIcon name="zzz" size={ICON_SIZE.lg} color={theme.inkSoft} />
      </Animated.View>
    </Animated.View>
  );
}

export function PetSlot({ mood }: { mood: Mood }) {
  const theme = useTheme();
  const asleep = mood === 'sleepy';
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = 0;
    t.value = withRepeat(
      withSequence(
        withTiming(1, { duration: asleep ? 2200 : 1700, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: asleep ? 2200 : 1700, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
    );
  }, [asleep, t]);

  const bob = useAnimatedStyle(() =>
    asleep
      ? { transform: [{ translateY: -2 * t.value }, { rotate: `${-1.5 + 3 * t.value}deg` }] }
      : { transform: [{ translateY: -7 * t.value }] },
  );
  const shadow = useAnimatedStyle(() => ({
    transform: [{ scaleX: 1 - 0.16 * t.value }],
    opacity: 0.9 - 0.3 * t.value,
  }));

  return (
    <View style={styles.root} pointerEvents="none">
      <View style={styles.aura}>
        <RadialBg colors={[theme.glow, fadeOut(theme.glow)]} radius={0.5} positions={[0, 0.66]} />
      </View>
      <Animated.View style={bob}>
        <SpritePlayer mood={mood} size={SIZE} />
        {asleep && <Zzz />}
      </Animated.View>
      <Animated.View style={[styles.shadow, shadow]} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    bottom: '20%',
    alignSelf: 'center',
    alignItems: 'center',
  },
  aura: {
    position: 'absolute',
    width: 150,
    height: 150,
    top: -20,
    alignSelf: 'center',
    // brighten what's behind instead of painting over it (see habitat glow)
    mixBlendMode: 'screen',
  },
  shadow: {
    width: 74,
    height: 13,
    borderRadius: RADIUS.pill,
    backgroundColor: 'rgba(0,0,0,0.22)',
    marginTop: 2,
  },
  zzz: {
    position: 'absolute',
    top: -6,
    right: -14,
  },
});
