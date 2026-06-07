import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { PixelIcon } from '@/render/pixel-icon';
import type { IconName } from '@/render/pixel-bitmaps';
import { FONTS, PLASTIC, SURF_RADIUS, useTheme } from '@/ui/theme';

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
  return (
    <View style={[styles.rowIco, { backgroundColor: theme.bubbleBg, borderColor: theme.panelLine }]}>
      <PixelIcon name={name} size={15} color={theme.accent} />
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
};

export function SettingsScreen({ name, onReset }: Props) {
  const theme = useTheme();
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
    <View style={styles.root}>
      <Text style={[styles.head, { color: theme.ink }]}>Settings</Text>

      <View style={[styles.privacy, { backgroundColor: theme.accentSoft, borderColor: theme.panelLine }]}>
        <View style={[styles.privacyIco, { backgroundColor: theme.bubbleBg, borderColor: theme.panelLine }]}>
          <PixelIcon name="shield" size={24} color={theme.accent} />
        </View>
        <View style={styles.privacyBody}>
          <Text style={[styles.privacyTitle, { color: theme.ink }]}>Everything runs on your device</Text>
          <Text style={[styles.privacySub, { color: theme.inkSoft }]}>
            {name}’s mind, memories and replies never leave this phone. No account, no cloud — it
            works in airplane mode.
          </Text>
        </View>
      </View>

      <View style={[styles.group, { backgroundColor: theme.panel, borderColor: theme.panelLine }]}>
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

      <View style={[styles.group, { backgroundColor: theme.panel, borderColor: theme.panelLine }]}>
        <Pressable
          style={({ pressed }) => [styles.row, pressed && { backgroundColor: theme.accentSoft }]}
          onPress={() => setAbout((a) => !a)}>
          <RowIcon name="sparkle" />
          <View style={styles.rowMain}>
            <Text style={[styles.rowTitle, { color: theme.ink }]}>How {name} thinks</Text>
            <Text style={[styles.rowSub, { color: theme.inkSoft }]}>about the little on-device mind</Text>
          </View>
          <View style={{ transform: [{ rotate: about ? '90deg' : '0deg' }] }}>
            <PixelIcon name="chevR" size={10} color={theme.inkFaint} />
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
      </View>

      <Pressable
        onPress={onResetPress}
        style={[
          styles.reset,
          armed
            ? { backgroundColor: theme.accent, borderColor: 'transparent' }
            : { backgroundColor: theme.panel, borderColor: theme.panelLine },
        ]}>
        <PixelIcon name="egg" size={15} color={armed ? PLASTIC.cream : theme.inkSoft} />
        <Text style={[styles.resetText, { color: armed ? PLASTIC.cream : theme.inkSoft }]}>
          {armed ? `tap again — this says goodbye to ${name}` : 'Reset & hatch a new pet'}
        </Text>
      </Pressable>

      <Text style={[styles.foot, { color: theme.inkFaint }]}>
        POCKET TERRARIUM · V0.1 · MADE FOR {name.toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingTop: 16,
    paddingHorizontal: 15,
    paddingBottom: 14,
    gap: 11,
  },
  head: {
    fontFamily: FONTS.display,
    fontSize: 25,
  },
  privacy: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 11,
    padding: 13,
    borderRadius: SURF_RADIUS,
    borderWidth: 1,
  },
  privacyIco: {
    width: 40,
    height: 40,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  privacyBody: {
    flex: 1,
  },
  privacyTitle: {
    fontFamily: FONTS.display,
    fontSize: 16,
  },
  privacySub: {
    fontFamily: FONTS.ui,
    fontSize: 11.5,
    lineHeight: 16,
    marginTop: 4,
  },
  group: {
    borderRadius: SURF_RADIUS,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingVertical: 12,
    paddingHorizontal: 13,
  },
  divider: {
    height: 1,
  },
  rowIco: {
    width: 30,
    height: 30,
    borderRadius: 9,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowMain: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    fontFamily: FONTS.uiHeavy,
    fontSize: 13.5,
  },
  rowSub: {
    fontFamily: FONTS.ui,
    fontSize: 11,
  },
  toggle: {
    width: 46,
    height: 26,
    borderRadius: 7,
    padding: 3,
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 5,
  },
  about: {
    paddingHorizontal: 14,
    paddingBottom: 13,
    paddingTop: 11,
    borderTopWidth: 1,
  },
  aboutText: {
    fontFamily: FONTS.ui,
    fontSize: 12,
    lineHeight: 18,
  },
  reset: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: SURF_RADIUS,
    borderWidth: 1.5,
  },
  resetText: {
    fontFamily: FONTS.uiHeavy,
    fontSize: 13,
  },
  foot: {
    textAlign: 'center',
    fontFamily: FONTS.pixel,
    fontSize: 8,
    letterSpacing: 0.5,
    paddingTop: 2,
    marginTop: 'auto',
  },
});
