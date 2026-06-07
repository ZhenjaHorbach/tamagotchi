import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { PixelIcon } from '@/render/pixel-icon';
import type { IconName } from '@/render/pixel-bitmaps';
import {
  BORDER_WIDTH,
  FONT_SIZE,
  FONTS,
  ICON_SIZE,
  PLASTIC,
  RADIUS,
  shared,
  SPACING,
  SURF_RADIUS,
  useSurfaces,
  useTheme,
} from '@/ui/theme';

function PixToggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  const theme = useTheme();
  const x = useSharedValue(value ? 20 : 0);
  useEffect(() => {
    x.value = withTiming(value ? 20 : 0, { duration: 180 });
  }, [value, x]);
  const knob = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  return (
    <Pressable
      onPress={() => onChange(!value)}
      style={[styles.toggle, { backgroundColor: value ? theme.accent : theme.track }]}
    >
      <Animated.View style={[styles.toggleKnob, { backgroundColor: PLASTIC.cream }, knob]} />
    </Pressable>
  );
}

function RowIcon({ name }: { name: IconName }) {
  const theme = useTheme();
  const surfaces = useSurfaces();
  return (
    <View style={[surfaces.iconBox, styles.rowIco]}>
      <PixelIcon name={name} size={ICON_SIZE.md} color={theme.accent} />
    </View>
  );
}

function SetToggleRow({
  icon,
  title,
  sub,
  value,
  onChange,
}: {
  icon: IconName;
  title: string;
  sub: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  const theme = useTheme();
  return (
    <View style={styles.row}>
      <RowIcon name={icon} />
      <View style={styles.rowMain}>
        <Text style={[styles.rowTitle, { color: theme.ink }]}>{title}</Text>
        <Text style={[styles.rowSub, { color: theme.inkSoft }]}>{sub}</Text>
      </View>
      <PixToggle value={value} onChange={onChange} />
    </View>
  );
}

type Props = {
  name: string;
  onReset: () => void;
  /** opens the AI Lab — talk to the on-device model directly */
  onOpenAiLab?: () => void;
  /** opens the language screen */
  onOpenLanguage?: () => void;
};

export function SettingsScreen({ name, onReset, onOpenAiLab, onOpenLanguage }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const surfaces = useSurfaces();
  const [notif, setNotif] = useState(true);
  const [sound, setSound] = useState(true);
  const [about, setAbout] = useState(false);
  const [armed, setArmed] = useState(false);
  const disarm = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (disarm.current) clearTimeout(disarm.current);
    },
    [],
  );

  const onResetPress = () => {
    if (armed) {
      if (disarm.current) clearTimeout(disarm.current);
      setArmed(false);
      onReset();
    } else {
      setArmed(true);
      disarm.current = setTimeout(() => setArmed(false), 3200);
    }
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.head, { color: theme.ink }]}>{t('settings.title')}</Text>

      <View style={[surfaces.panel, styles.privacy, { backgroundColor: theme.accentSoft }]}>
        <View style={[surfaces.iconBox, styles.privacyIco]}>
          <PixelIcon name="shield" size={ICON_SIZE.lg} color={theme.accent} />
        </View>
        <View style={styles.privacyBody}>
          <Text style={[styles.privacyTitle, { color: theme.ink }]}>
            {t('settings.privacyTitle')}
          </Text>
          <Text style={[styles.privacySub, { color: theme.inkSoft }]}>
            {t('settings.privacyBody', { name })}
          </Text>
        </View>
      </View>

      <View style={[surfaces.panel, styles.group]}>
        <SetToggleRow
          icon="bell"
          title={t('settings.reminders')}
          sub={t('settings.remindersSub', { name })}
          value={notif}
          onChange={setNotif}
        />
        <View style={[styles.divider, { backgroundColor: theme.panelLine }]} />
        <SetToggleRow
          icon="sound"
          title={t('settings.sound')}
          sub={t('settings.soundSub')}
          value={sound}
          onChange={setSound}
        />
      </View>

      <View style={[surfaces.panel, styles.group]}>
        <Pressable
          style={({ pressed }) => [styles.row, pressed && { backgroundColor: theme.accentSoft }]}
          onPress={() => setAbout((a) => !a)}
        >
          <RowIcon name="sparkle" />
          <View style={styles.rowMain}>
            <Text style={[styles.rowTitle, { color: theme.ink }]}>
              {t('settings.how', { name })}
            </Text>
            <Text style={[styles.rowSub, { color: theme.inkSoft }]}>{t('settings.howSub')}</Text>
          </View>
          <View style={{ transform: [{ rotate: about ? '90deg' : '0deg' }] }}>
            <PixelIcon name="chevR" size={ICON_SIZE.sm} color={theme.inkFaint} />
          </View>
        </Pressable>
        {about && (
          <View style={[styles.about, { borderTopColor: theme.panelLine }]}>
            <Text style={[styles.aboutText, { color: theme.inkSoft }]}>
              {t('settings.aboutText', { name })}
            </Text>
          </View>
        )}
        {onOpenAiLab && (
          <>
            <View style={[styles.divider, { backgroundColor: theme.panelLine }]} />
            <Pressable
              style={({ pressed }) => [
                styles.row,
                pressed && { backgroundColor: theme.accentSoft },
              ]}
              onPress={onOpenAiLab}
            >
              <RowIcon name="scan" />
              <View style={styles.rowMain}>
                <Text style={[styles.rowTitle, { color: theme.ink }]}>{t('settings.aiLab')}</Text>
                <Text style={[styles.rowSub, { color: theme.inkSoft }]}>
                  {t('settings.aiLabSub')}
                </Text>
              </View>
              <PixelIcon name="chevR" size={ICON_SIZE.sm} color={theme.inkFaint} />
            </Pressable>
          </>
        )}
        {onOpenLanguage && (
          <>
            <View style={[styles.divider, { backgroundColor: theme.panelLine }]} />
            <Pressable
              style={({ pressed }) => [
                styles.row,
                pressed && { backgroundColor: theme.accentSoft },
              ]}
              onPress={onOpenLanguage}
            >
              <RowIcon name="globe" />
              <View style={styles.rowMain}>
                <Text style={[styles.rowTitle, { color: theme.ink }]}>
                  {t('settings.language')}
                </Text>
                <Text style={[styles.rowSub, { color: theme.inkSoft }]}>
                  {t('settings.languageSub', { name })}
                </Text>
              </View>
              <PixelIcon name="chevR" size={ICON_SIZE.sm} color={theme.inkFaint} />
            </Pressable>
          </>
        )}
      </View>

      <Pressable
        onPress={onResetPress}
        style={[
          styles.reset,
          armed
            ? { backgroundColor: theme.accent, borderColor: 'transparent' }
            : { backgroundColor: theme.panel, borderColor: theme.panelLine },
        ]}
      >
        <PixelIcon name="egg" size={ICON_SIZE.md} color={armed ? PLASTIC.cream : theme.inkSoft} />
        <Text style={[styles.resetText, { color: armed ? PLASTIC.cream : theme.inkSoft }]}>
          {armed ? t('settings.resetArmed', { name }) : t('settings.reset')}
        </Text>
      </Pressable>

      <Text style={[shared.pixelLabel, styles.foot, { color: theme.inkFaint }]}>
        Pocket Terrarium · v0.1 · made for {name}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    flexGrow: 1, // keeps the footer pinned down when content is short
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  head: {
    fontFamily: FONTS.display,
    fontSize: FONT_SIZE.display,
  },
  privacy: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    padding: SPACING.md,
  },
  privacyIco: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
  },
  privacyBody: {
    flex: 1,
  },
  privacyTitle: {
    fontFamily: FONTS.display,
    fontSize: FONT_SIZE.subtitle,
  },
  privacySub: {
    fontFamily: FONTS.ui,
    fontSize: FONT_SIZE.caption,
    lineHeight: 16,
    marginTop: SPACING.xs,
  },
  group: {
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  divider: {
    height: 1,
  },
  rowIco: {
    width: 30,
    height: 30,
    borderRadius: RADIUS.sm,
  },
  rowMain: {
    flex: 1,
    gap: SPACING.xxs,
  },
  rowTitle: {
    fontFamily: FONTS.uiHeavy,
    fontSize: FONT_SIZE.button,
  },
  rowSub: {
    fontFamily: FONTS.ui,
    fontSize: FONT_SIZE.caption,
  },
  toggle: {
    width: 46,
    height: 26,
    borderRadius: RADIUS.sm,
    padding: 3,
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: RADIUS.xs,
  },
  about: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: BORDER_WIDTH.hairline,
  },
  aboutText: {
    fontFamily: FONTS.ui,
    fontSize: FONT_SIZE.body,
    lineHeight: 18,
  },
  reset: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    borderRadius: SURF_RADIUS,
    borderWidth: BORDER_WIDTH.regular,
  },
  resetText: {
    fontFamily: FONTS.uiHeavy,
    fontSize: FONT_SIZE.button,
  },
  foot: {
    textAlign: 'center',
    paddingTop: SPACING.xxs,
    marginTop: 'auto',
  },
});
