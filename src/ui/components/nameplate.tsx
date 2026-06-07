import { Pressable, StyleSheet, Text } from 'react-native';

import type { Mood } from '@/core';
import { PixelIcon } from '@/render/pixel-icon';
import type { IconName } from '@/render/pixel-bitmaps';
import { FONTS, MOOD_META, SURF_RADIUS, useTheme } from '@/ui/theme';

type Props = {
  name: string;
  mood: Mood;
  onPress?: () => void;
};

export function Nameplate({ name, mood, onPress }: Props) {
  const theme = useTheme();
  const meta = MOOD_META[mood];
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: pressed ? theme.accentSoft : theme.panel,
          borderColor: theme.panelLine,
        },
      ]}>
      <Text style={[styles.name, { color: theme.ink }]} numberOfLines={1}>
        {name}
        {'  '}
        <Text style={[styles.mood, { color: theme.inkSoft }]}>
          <PixelIcon name={meta.glyph as IconName} size={11} color={theme.accent} /> {meta.label}
        </Text>
      </Text>
      <Text style={[styles.id, { color: theme.inkFaint }]}>
        CARD <PixelIcon name="chevR" size={9} color={theme.inkFaint} />
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
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: SURF_RADIUS,
    borderWidth: 1,
  },
  name: {
    fontFamily: FONTS.display,
    fontSize: 21,
  },
  mood: {
    fontFamily: FONTS.uiBold,
    fontSize: 11,
    textTransform: 'lowercase',
  },
  id: {
    fontFamily: FONTS.pixel,
    fontSize: 8,
    letterSpacing: 0.8,
  },
});
