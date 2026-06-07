import { Pressable, StyleSheet, Text } from 'react-native';

import type { Mood } from '@/core';
import { PixelIcon } from '@/render/pixel-icon';
import type { IconName } from '@/render/pixel-bitmaps';
import { FONT_SIZE, FONTS, ICON_SIZE, LETTER_SPACING, MOOD_META, SPACING, useSurfaces, useTheme } from '@/ui/theme';

type Props = {
  name: string;
  mood: Mood;
  onPress?: () => void;
};

export function Nameplate({ name, mood, onPress }: Props) {
  const theme = useTheme();
  const surfaces = useSurfaces();
  const meta = MOOD_META[mood];
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        surfaces.panel,
        styles.row,
        pressed && { backgroundColor: theme.accentSoft },
      ]}>
      <Text style={[styles.name, { color: theme.ink }]} numberOfLines={1}>
        {name}
        {'  '}
        <Text style={[styles.mood, { color: theme.inkSoft }]}>
          <PixelIcon name={meta.glyph as IconName} size={ICON_SIZE.sm} color={theme.accent} /> {meta.label}
        </Text>
      </Text>
      <Text style={[styles.id, { color: theme.inkFaint }]}>
        CARD <PixelIcon name="chevR" size={ICON_SIZE.sm} color={theme.inkFaint} />
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  name: {
    fontFamily: FONTS.display,
    fontSize: FONT_SIZE.title,
  },
  mood: {
    fontFamily: FONTS.uiBold,
    fontSize: FONT_SIZE.caption,
    textTransform: 'lowercase',
  },
  id: {
    fontFamily: FONTS.pixel,
    fontSize: FONT_SIZE.pixel,
    letterSpacing: LETTER_SPACING.base,
  },
});
