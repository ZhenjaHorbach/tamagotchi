// The toy shell is the shared layout: the room, the plastic handheld and its
// three chin-button tabs persist while routes swap inside the inset screen.

import { Slot, usePathname, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { deriveMood } from '@/core';
import { usePetStore } from '@/state/pet-store';
import { RadialBg } from '@/ui/components/gradient-bg';
import { ToyFrame, TOY_WIDTH } from '@/ui/components/toy-frame';
import { LETTER_SPACING, MOOD_META, moodTheme, shared, SPACING, ThemeProvider } from '@/ui/theme';

const TOY_NATURAL_HEIGHT = 716;

export default function ToyLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const pet = usePetStore((s) => s.pet);

  const mood = pet ? deriveMood(pet) : 'neutral';
  const theme = useMemo(() => moodTheme(mood), [mood]);

  // fit the fixed-size toy into the phone
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const scale = Math.min(
    (width - 16) / (TOY_WIDTH + 8),
    (height - insets.top - insets.bottom - 24) / TOY_NATURAL_HEIGHT,
    1.06,
  );

  const onSettings = pathname === '/settings' || pathname === '/ai-lab';

  return (
    <ThemeProvider value={theme}>
      <View style={styles.stage}>
        <StatusBar style={theme.night ? 'light' : 'dark'} />
        <RadialBg colors={[theme.room1, theme.room2]} center={{ x: 0.5, y: 0.08 }} radius={1.1} />
        <View style={{ transform: [{ scale }] }}>
          <ToyFrame
            hw={[
              {
                icon: 'home',
                label: 'home',
                onPress: () => router.replace('/shelf'),
                active: pathname === '/shelf',
              },
              {
                icon: 'dome',
                label: 'habitat',
                onPress: () => router.replace('/'),
                active: pathname === '/',
              },
              {
                icon: 'cog',
                label: 'settings',
                onPress: () => router.replace('/settings'),
                active: onSettings,
              },
            ]}>
            {pet ? <Slot /> : null}
          </ToyFrame>
        </View>
        <Text style={[shared.pixelLabel, styles.tagline, { color: theme.inkFaint }]}>
          {MOOD_META[mood].tagline}
        </Text>
      </View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  stage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagline: {
    position: 'absolute',
    bottom: SPACING.lg,
    letterSpacing: LETTER_SPACING.wide,
  },
});
