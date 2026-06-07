import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
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
import { FONTS, useTheme } from '@/ui/theme';

function ThinkingDot({ delay, color }: { delay: number; color: string }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 585, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 715, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
      ),
    );
  }, [delay, t]);
  const style = useAnimatedStyle(() => ({
    opacity: 0.3 + t.value * 0.7,
    transform: [{ translateY: -3 * t.value }, { scale: 0.85 + t.value * 0.2 }],
  }));
  return <Animated.View style={[styles.dot, { backgroundColor: color }, style]} />;
}

export function ThinkingCue() {
  const theme = useTheme();
  return (
    <View style={styles.think}>
      <ThinkingDot delay={0} color={theme.accent} />
      <ThinkingDot delay={180} color={theme.accent} />
      <ThinkingDot delay={360} color={theme.accent} />
    </View>
  );
}

function Caret({ color }: { color: string }) {
  const on = useSharedValue(1);
  useEffect(() => {
    on.value = withRepeat(
      withSequence(withTiming(1, { duration: 500, easing: Easing.steps(1) }), withTiming(0, { duration: 500, easing: Easing.steps(1) })),
      -1,
    );
  }, [on]);
  const style = useAnimatedStyle(() => ({ opacity: on.value }));
  return <Animated.View style={[styles.caret, { backgroundColor: color }, style]} />;
}

type Props = {
  name: string;
  shown: string;
  done: boolean;
  thinking: boolean;
};

export function SpeechBubble({ name, shown, done, thinking }: Props) {
  const theme = useTheme();
  return (
    <View>
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: theme.bubbleBg,
            borderColor: theme.bubbleLine,
            shadowColor: theme.panelDeep,
          },
        ]}>
        <View style={styles.nameRow}>
          <PixelIcon name="sparkle" size={11} color={theme.accent} />
          <Text style={[styles.name, { color: theme.accent }]}>{name.toLowerCase()}</Text>
        </View>
        <View style={styles.body}>
          {thinking ? (
            <ThinkingCue />
          ) : (
            <Text style={[styles.text, { color: theme.ink }]}>
              {shown}
              {!done && <Caret color={theme.accent} />}
            </Text>
          )}
        </View>
      </View>
      {/* tail */}
      <View
        style={[
          styles.tail,
          { backgroundColor: theme.bubbleBg, borderColor: theme.bubbleLine },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    borderWidth: 1.5,
    borderRadius: 14,
    borderBottomLeftRadius: 5,
    paddingTop: 9,
    paddingHorizontal: 13,
    paddingBottom: 11,
    marginHorizontal: 2,
  },
  tail: {
    position: 'absolute',
    left: 18,
    bottom: -6,
    width: 12,
    height: 12,
    borderRightWidth: 1.5,
    borderBottomWidth: 1.5,
    borderBottomRightRadius: 3,
    transform: [{ rotate: '45deg' }],
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  name: {
    fontFamily: FONTS.pixel,
    fontSize: 8,
    letterSpacing: 0.8,
  },
  body: {
    minHeight: 40,
    justifyContent: 'center',
  },
  text: {
    fontFamily: FONTS.display,
    fontSize: 17,
    lineHeight: 22,
  },
  think: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 20,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 3,
  },
  caret: {
    width: 8,
    height: 15,
    marginLeft: 2,
    marginBottom: -2,
  },
});
