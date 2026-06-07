// Language — its own screen inside the toy, opened from Settings.
// Languages are listed in their native names; the choice persists on device.

import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { LANGUAGES, setLanguage, type LanguageCode } from '@/i18n';
import { PixelIcon } from '@/render/pixel-icon';
import { FONT_SIZE, FONTS, ICON_SIZE, shared, SPACING, useSurfaces, useTheme } from '@/ui/theme';

type Props = {
  onBack: () => void;
};

export function LanguageScreen({ onBack }: Props) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const surfaces = useSurfaces();
  const active = i18n.language as LanguageCode;

  return (
    <View style={styles.root}>
      <View style={styles.topbar}>
        <Pressable
          onPress={onBack}
          style={({ pressed }) => [
            shared.row,
            styles.back,
            pressed && { backgroundColor: theme.panel },
          ]}
        >
          <PixelIcon name="chevL" size={ICON_SIZE.sm} color={theme.inkSoft} />
          <Text style={[styles.backText, { color: theme.inkSoft }]}> {t('common.settings')}</Text>
        </Pressable>
        <Text style={[shared.pixelLabel, { color: theme.inkSoft }]}>LANG</Text>
        <PixelIcon name="globe" size={ICON_SIZE.sm} color={theme.accent} />
      </View>

      <Text style={[styles.head, { color: theme.ink }]}>{t('language.title')}</Text>
      <Text style={[shared.caption, { color: theme.inkSoft }]}>{t('language.sub')}</Text>

      <View style={[surfaces.panel, styles.group]}>
        {LANGUAGES.map((lang, i) => {
          const selected = lang.code === active;
          return (
            <View key={lang.code}>
              {i > 0 && <View style={[styles.divider, { backgroundColor: theme.panelLine }]} />}
              <Pressable
                style={({ pressed }) => [
                  shared.row,
                  styles.row,
                  pressed && { backgroundColor: theme.accentSoft },
                ]}
                onPress={() => setLanguage(lang.code)}
              >
                <Text style={[styles.rowLabel, { color: selected ? theme.ink : theme.inkSoft }]}>
                  {lang.label}
                </Text>
                <Text style={[shared.pixelLabel, { color: theme.inkFaint }]}>{lang.code}</Text>
                {selected && <PixelIcon name="check" size={ICON_SIZE.sm} color={theme.accent} />}
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  back: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: SPACING.sm,
  },
  backText: {
    fontFamily: FONTS.uiBold,
    fontSize: FONT_SIZE.body,
  },
  head: {
    fontFamily: FONTS.display,
    fontSize: FONT_SIZE.display,
  },
  group: {
    overflow: 'hidden',
  },
  row: {
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    justifyContent: 'space-between',
  },
  rowLabel: {
    flex: 1,
    fontFamily: FONTS.uiHeavy,
    fontSize: FONT_SIZE.button,
  },
  divider: {
    height: 1,
  },
});
