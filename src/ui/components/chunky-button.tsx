import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PixelIcon } from '@/render/pixel-icon';
import type { IconName } from '@/render/pixel-bitmaps';
import { BTN_EDGE_H, BTN_RADIUS, FONTS, type ButtonTone } from '@/ui/theme';

type Props = {
  icon: IconName;
  label: string;
  tone: ButtonTone;
  onPress: () => void;
  disabled?: boolean;
};

export function ChunkyButton({ icon, label, tone, onPress, disabled }: Props) {
  const [pressed, setPressed] = useState(false);
  const down = pressed && !disabled;
  return (
    <Pressable
      style={[styles.root, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}>
      {/* the edge the face sinks into: face shape, shifted BTN_EDGE_H down */}
      <View style={[styles.edge, { backgroundColor: tone.edge }]} />
      <View
        style={[
          styles.face,
          { backgroundColor: tone.face },
          { transform: [{ translateY: down ? BTN_EDGE_H : 0 }] },
        ]}>
        <PixelIcon name={icon} size={24} color={tone.ink} />
        <Text style={[styles.label, { color: tone.ink }]}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    // reserve room below the face for the visible edge
    paddingBottom: BTN_EDGE_H,
  },
  disabled: {
    opacity: 0.45,
  },
  edge: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: BTN_EDGE_H,
    bottom: 0,
    borderRadius: BTN_RADIUS,
  },
  face: {
    // fixed content height so siblings with shorter icons (bowl is 8×7,
    // ball/moon are 7×7) still produce identical button heights;
    // flex:1 won't work here — inside an auto-height parent it collapses
    minHeight: 65,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: BTN_RADIUS,
  },
  label: {
    fontFamily: FONTS.uiBold,
    fontSize: 13,
  },
});
