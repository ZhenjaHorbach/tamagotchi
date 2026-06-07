// Chunky tactile action button — presses down onto its 3D edge like a real toy.
//
// Geometry (mirrors the design's `box-shadow: 0 edgeH 0` + `:active translateY(edgeH)`):
// the edge is the same shape as the face, offset BTN_EDGE_H lower; pressing slides
// the face down by exactly BTN_EDGE_H so it fully covers the edge — no rim peeks out.

import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PixelIcon } from '@/render/pixel-icon';
import type { IconName } from '@/render/pixel-bitmaps';
import {
  BTN_EDGE_H,
  BTN_RADIUS,
  FONT_SIZE,
  FONTS,
  ICON_SIZE,
  shared,
  SPACING,
  type ButtonTone,
} from '@/ui/theme';

type Props = {
  label: string;
  tone: ButtonTone;
  onPress: () => void;
  /** without an icon the button renders compact (e.g. AI Lab's "Ask") */
  icon?: IconName;
  disabled?: boolean;
};

export function ChunkyButton({ icon, label, tone, onPress, disabled }: Props) {
  const [pressed, setPressed] = useState(false);
  const down = pressed && !disabled;
  return (
    <Pressable
      style={[styles.root, disabled && shared.disabled]}
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
    >
      {/* the edge the face sinks into: face shape, shifted BTN_EDGE_H down */}
      <View style={[styles.edge, { backgroundColor: tone.edge }]} />
      <View
        style={[
          styles.face,
          icon ? styles.faceTall : styles.faceCompact,
          { backgroundColor: tone.face },
          { transform: [{ translateY: down ? BTN_EDGE_H : 0 }] },
        ]}
      >
        {icon && <PixelIcon name={icon} size={ICON_SIZE.lg} color={tone.ink} />}
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
  edge: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: BTN_EDGE_H,
    bottom: 0,
    borderRadius: BTN_RADIUS,
  },
  face: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xxs,
    paddingHorizontal: SPACING.xs,
    borderRadius: BTN_RADIUS,
  },
  // fixed content height so siblings with shorter icons (bowl is 8×7,
  // ball/moon are 7×7) still produce identical button heights;
  // flex:1 won't work here — inside an auto-height parent it collapses
  faceTall: {
    minHeight: 64,
    paddingVertical: SPACING.sm,
  },
  faceCompact: {
    paddingVertical: SPACING.md,
  },
  label: {
    fontFamily: FONTS.uiBold,
    fontSize: FONT_SIZE.body,
  },
});
