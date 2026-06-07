import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { PixelIcon } from '@/render/pixel-icon';
import type { IconName } from '@/render/pixel-bitmaps';
import { BORDER_WIDTH, FONT_SIZE, FONTS, ICON_SIZE, PLASTIC, RADIUS, shared, SPACING, SURF_RADIUS, useSurfaces, useTheme } from '@/ui/theme';

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
      style={[styles.toggle, { backgroundColor: value ? theme.accent : theme.track }]}>
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
};

export function SettingsScreen({ name, onReset, onOpenAiLab }: Props) {
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
      showsVerticalScrollIndicator={false}>
      <Text style={[styles.head, { color: theme.ink }]}>Settings</Text>

      <View style={[surfaces.panel, styles.privacy, { backgroundColor: theme.accentSoft }]}>
        <View style={[surfaces.iconBox, styles.privacyIco]}>
          <PixelIcon name="shield" size={ICON_SIZE.lg} color={theme.accent} />
        </View>
        <View style={styles.privacyBody}>
          <Text style={[styles.privacyTitle, { color: theme.ink }]}>Everything runs on your device</Text>
          <Text style={[styles.privacySub, { color: theme.inkSoft }]}>
            {name}’s mind, memories and replies never leave this phone. No account, no cloud — it
            works in airplane mode.
          </Text>
        </View>
      </View>

      <View style={[surfaces.panel, styles.group]}>
        <SetToggleRow
          icon="bell"
          title="Reminders"
          sub={`let ${name.toLowerCase()} nudge you when it’s peckish`}
          value={notif}
          onChange={setNotif}
        />
        <View style={[styles.divider, { backgroundColor: theme.panelLine }]} />
        <SetToggleRow
          icon="sound"
          title="Sound & haptics"
          sub="little chirps and gentle taps"
          value={sound}
          onChange={setSound}
        />
      </View>

      <View style={[surfaces.panel, styles.group]}>
        <Pressable
          style={({ pressed }) => [styles.row, pressed && { backgroundColor: theme.accentSoft }]}
          onPress={() => setAbout((a) => !a)}>
          <RowIcon name="sparkle" />
          <View style={styles.rowMain}>
            <Text style={[styles.rowTitle, { color: theme.ink }]}>How {name} thinks</Text>
            <Text style={[styles.rowSub, { color: theme.inkSoft }]}>about the little on-device mind</Text>
          </View>
          <View style={{ transform: [{ rotate: about ? '90deg' : '0deg' }] }}>
            <PixelIcon name="chevR" size={ICON_SIZE.sm} color={theme.inkFaint} />
          </View>
        </Pressable>
        {about && (
          <View style={[styles.about, { borderTopColor: theme.panelLine }]}>
            <Text style={[styles.aboutText, { color: theme.inkSoft }]}>
              {name}’s personality and replies are dreamed up by a small language model running
              entirely on your phone. The more time you spend together, the more it settles into
              its own little self — and none of it is ever uploaded.
            </Text>
          </View>
        )}
        {onOpenAiLab && (
          <>
            <View style={[styles.divider, { backgroundColor: theme.panelLine }]} />
            <Pressable
              style={({ pressed }) => [styles.row, pressed && { backgroundColor: theme.accentSoft }]}
              onPress={onOpenAiLab}>
              <RowIcon name="scan" />
              <View style={styles.rowMain}>
                <Text style={[styles.rowTitle, { color: theme.ink }]}>AI Lab</Text>
                <Text style={[styles.rowSub, { color: theme.inkSoft }]}>
                  talk to the little mind directly
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
        ]}>
        <PixelIcon name="egg" size={ICON_SIZE.md} color={armed ? PLASTIC.cream : theme.inkSoft} />
        <Text style={[styles.resetText, { color: armed ? PLASTIC.cream : theme.inkSoft }]}>
          {armed ? `tap again — this says goodbye to ${name}` : 'Reset & hatch a new pet'}
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
    marginTop: 4,
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
    paddingTop: 2,
    marginTop: 'auto',
  },
});
