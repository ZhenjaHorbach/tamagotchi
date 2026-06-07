// The toy shell is the shared layout: the room, the plastic handheld and its
// three chin-button tabs persist while routes swap inside the inset screen.

import { Stack, usePathname, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { deriveMood } from '@/core';
import { usePetStore } from '@/state/pet-store';
import { RadialBg } from '@/ui/components/gradient-bg';
import { ToyFrame, TOY_WIDTH } from '@/ui/components/toy-frame';
import { FONT_SIZE, FONTS, LETTER_SPACING, moodTheme, SPACING, ThemeProvider } from '@/ui/theme';

const TOY_NATURAL_HEIGHT = 716;

// Habitat is the anchor: cold start, reload and "back" all resolve here, so a
// Fast-Refresh never strands you on a pushed sub-screen (language / AI Lab).
export const unstable_settings = { initialRouteName: 'index' };

// tabs replace the current route (no stacking); sub-screens push (so "back"
// returns to the tab). `navigate` dedupes, so tab→tab→tab never piles up.
const TABS = [
  { id: 'home', icon: 'home', path: '/shelf' },
  { id: 'habitat', icon: 'dome', path: '/' },
  { id: 'settings', icon: 'cog', path: '/settings' },
] as const;

// which tab is highlighted for a given route (sub-screens map to their parent)
const TAB_FOR_PATH: Record<string, string> = {
  '/shelf': '/shelf',
  '/': '/',
  '/settings': '/settings',
  '/ai-lab': '/settings',
  '/language': '/settings',
};

export default function ToyLayout() {
  const { t } = useTranslation();
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

  const activeTab = TAB_FOR_PATH[pathname] ?? '/';

  return (
    <ThemeProvider value={theme}>
      <View style={styles.stage}>
        <StatusBar style={theme.night ? 'light' : 'dark'} />
        <RadialBg colors={[theme.room1, theme.room2]} center={{ x: 0.5, y: 0.08 }} radius={1.1} />
        <View style={{ transform: [{ scale }] }}>
          <ToyFrame
            hw={TABS.map((tab) => ({
              icon: tab.icon,
              id: tab.id,
              label: t(`nav.${tab.id}`),
              onPress: () => router.navigate(tab.path),
              active: activeTab === tab.path,
            }))}
          >
            <Stack
              screenOptions={{
                headerShown: false,
                animation: 'none',
                contentStyle: { backgroundColor: 'transparent' },
              }}
            />
          </ToyFrame>
        </View>
        <Text style={[styles.tagline, { color: theme.inkFaint }]}>{t(`mood.${mood}.tagline`)}</Text>
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
    // Pixelify (not Silkscreen): the tagline is translated and needs Cyrillic
    fontFamily: FONTS.display,
    fontSize: FONT_SIZE.pixelLg,
    letterSpacing: LETTER_SPACING.wide,
    textTransform: 'uppercase',
  },
});
