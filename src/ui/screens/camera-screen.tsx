// Camera "show me" mode (design: a cozy, contained viewfinder — never a generic
// stock camera UI). The pet rides along as a small companion; point at a real
// thing and tap the shutter. The frame is classified on device and the pet
// reacts in character. Three phases: aim → scanning → seen.

import { CameraView, useCameraPermissions } from 'expo-camera';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useSightReaction } from '@/ai/use-sight';
import { playSfx } from '@/audio/sfx';
import type { Mood } from '@/core';
import { PixelIcon } from '@/render/pixel-icon';
import { PetSlot } from '@/ui/components/pet-slot';
import {
  BORDER_WIDTH,
  FONT_SIZE,
  FONTS,
  ICON_SIZE,
  LETTER_SPACING,
  PLASTIC,
  RADIUS,
  SPACING,
  useTheme,
} from '@/ui/theme';

// viewfinder chrome geometry (component-specific, not on a shared scale)
const BRACKET = 22;
const BRACKET_BORDER = 3;
const SHUTTER = 62;
const SHUTTER_RING = 46;
const COMPANION_PET = 48;
const RESULT_PET = 40;

// overlay tints sit over live video, so they're intrinsic, not theme surfaces
const SCRIM = 'rgba(18,15,10,0.84)';
const HAIRLINE = 'rgba(255,255,255,0.14)';
const REC_RED = '#E05A3A';
const ON_DARK = 'rgba(255,255,255,0.72)';
const ON_DARK_SOFT = 'rgba(255,255,255,0.6)';

type Props = {
  name: string;
  seed: number;
  mood: Mood;
  onBack: () => void;
};

function Bracket({ corner }: { corner: 'tl' | 'tr' | 'bl' | 'br' }) {
  const theme = useTheme();
  const top = corner[0] === 't';
  const left = corner[1] === 'l';
  return (
    <View
      style={[
        styles.bracket,
        {
          borderColor: theme.accent,
          [top ? 'top' : 'bottom']: SPACING.md,
          [left ? 'left' : 'right']: SPACING.md,
          borderTopWidth: top ? BRACKET_BORDER : 0,
          borderBottomWidth: top ? 0 : BRACKET_BORDER,
          borderLeftWidth: left ? BRACKET_BORDER : 0,
          borderRightWidth: left ? 0 : BRACKET_BORDER,
        },
      ]}
    />
  );
}

/** Three softly pulsing dots — the pet "having a look". */
function ThinkingDots() {
  const o = useSharedValue(0.3);
  useEffect(() => {
    o.value = withRepeat(withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [o]);
  const style = useAnimatedStyle(() => ({ opacity: o.value }));
  return <Animated.Text style={[styles.dots, { color: PLASTIC.cream }, style]}>● ● ●</Animated.Text>;
}

export function CameraScreen({ name, seed, mood, onBack }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const camRef = useRef<CameraView>(null);
  const { phase, run, reset, bubble } = useSightReaction();

  // animated scan sweep while the classifier + model are thinking
  const scan = useSharedValue(0);
  useEffect(() => {
    if (phase === 'scanning') {
      scan.value = 0;
      scan.value = withRepeat(withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.ease) }), -1, false);
    }
  }, [phase, scan]);
  const scanStyle = useAnimatedStyle(() => ({ opacity: phase === 'scanning' ? 0.55 : 0, top: `${scan.value * 100}%` }));

  const onShutter = async () => {
    if (phase !== 'aim' || !camRef.current) return;
    playSfx('tap');
    try {
      const pic = await camRef.current.takePictureAsync({ quality: 0.6, skipProcessing: true });
      if (pic?.uri) run(pic.uri);
    } catch {
      // capture hiccup — stay on aim, let them try again
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.topbar}>
        <Pressable
          style={({ pressed }) => [styles.ghost, pressed && { opacity: 0.6 }]}
          onPress={onBack}
        >
          <PixelIcon name="chevL" size={ICON_SIZE.sm} color={theme.inkSoft} />
          <Text style={[styles.ghostText, { color: theme.inkSoft }]}>{t('nav.habitat')}</Text>
        </Pressable>
        <View style={[styles.privacy, { backgroundColor: theme.panel, borderColor: theme.panelLine }]}>
          <PixelIcon name="moon" size={ICON_SIZE.xs} color={theme.inkSoft} />
          <Text style={[styles.privacyText, { color: theme.inkSoft }]}>{t('camera.privacy')}</Text>
        </View>
      </View>

      <View style={[styles.viewfinder, { borderColor: theme.screen2 }]}>
        {permission?.granted ? (
          <CameraView
            ref={camRef}
            style={StyleSheet.absoluteFill}
            facing="back"
            mode="picture"
            mute
          />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.permission]}>
            <PixelIcon name="camera" size={ICON_SIZE.xl} color={ON_DARK} />
            <Text style={[styles.permText, { color: PLASTIC.cream }]}>
              {t('camera.permission', { name })}
            </Text>
            <Pressable
              style={[styles.allow, { backgroundColor: theme.accent }]}
              onPress={() => requestPermission()}
            >
              <Text style={[styles.allowText, { color: PLASTIC.cream }]}>{t('camera.allow')}</Text>
            </Pressable>
          </View>
        )}

        {/* viewfinder chrome */}
        <Bracket corner="tl" />
        <Bracket corner="tr" />
        <Bracket corner="bl" />
        <Bracket corner="br" />
        <View style={styles.rec}>
          <View style={[styles.recDot, { backgroundColor: REC_RED }]} />
          <Text style={[styles.recText, { color: ON_DARK }]}>{t('camera.rec')}</Text>
        </View>
        <Animated.View style={[styles.scan, { backgroundColor: theme.accent }, scanStyle]} />

        {permission?.granted && phase === 'aim' && (
          <>
            <View style={styles.companion}>
              <PetSlot mood={mood} seed={seed} size={COMPANION_PET} />
            </View>
            <Text
              style={[styles.hint, { color: PLASTIC.cream }]}
              numberOfLines={2}
              adjustsFontSizeToFit
              minimumFontScale={0.6}
            >
              {t('camera.hint', { name })}
            </Text>
          </>
        )}

        {permission?.granted && phase !== 'aim' && (
          <View style={[styles.result, { borderColor: HAIRLINE }]}>
            <View style={styles.resultPet}>
              <PetSlot mood={mood} seed={seed} size={RESULT_PET} />
            </View>
            <View style={styles.resultBody}>
              {phase === 'scanning' ? (
                <View style={styles.looking}>
                  <Text style={[styles.lookingText, { color: PLASTIC.cream }]}>
                    {t('camera.looking', { name })}
                  </Text>
                  <ThinkingDots />
                </View>
              ) : (
                <>
                  <Text style={[styles.resultName, { color: theme.accent }]}>
                    {name.toLowerCase()}
                  </Text>
                  <Text style={[styles.resultLine, { color: PLASTIC.cream }]}>{bubble.shown}</Text>
                  {bubble.done && (
                    <View style={styles.conf}>
                      <PixelIcon name="check" size={ICON_SIZE.xs} color={theme.accent} />
                      <Text style={[styles.confText, { color: ON_DARK_SOFT }]}>
                        {t('camera.recognised')}
                      </Text>
                    </View>
                  )}
                </>
              )}
            </View>
          </View>
        )}
      </View>

      <View style={styles.tray}>
        {phase === 'seen' ? (
          <Pressable
            style={({ pressed }) => [
              styles.again,
              { backgroundColor: theme.accent },
              pressed && { transform: [{ translateY: 2 }] },
            ]}
            onPress={reset}
          >
            <Text style={[styles.againText, { color: PLASTIC.cream }]}>
              {t('camera.again', { name })}
            </Text>
          </Pressable>
        ) : (
          <Pressable
            style={({ pressed }) => [
              styles.shutter,
              { backgroundColor: PLASTIC.toy1, borderColor: PLASTIC.toy3 },
              phase !== 'aim' && styles.shutterOff,
              pressed && phase === 'aim' && { transform: [{ translateY: 3 }] },
            ]}
            onPress={onShutter}
            disabled={phase !== 'aim'}
            accessibilityLabel={t('camera.shutterA11y', { name })}
          >
            <View style={[styles.shutterRing, { backgroundColor: theme.accent, borderColor: PLASTIC.cream }]} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ghost: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.xs,
  },
  ghostText: {
    fontFamily: FONTS.uiHeavy,
    fontSize: FONT_SIZE.button,
  },
  privacy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.pill,
    borderWidth: BORDER_WIDTH.hairline,
  },
  privacyText: {
    fontFamily: FONTS.uiHeavy,
    fontSize: FONT_SIZE.caption,
  },
  viewfinder: {
    flex: 1,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: BORDER_WIDTH.bold,
    backgroundColor: '#14110c',
  },
  permission: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
    padding: SPACING.lg,
  },
  permText: {
    fontFamily: FONTS.ui,
    fontSize: FONT_SIZE.body,
    textAlign: 'center',
    lineHeight: 18,
  },
  allow: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
  },
  allowText: {
    fontFamily: FONTS.uiHeavy,
    fontSize: FONT_SIZE.button,
  },
  bracket: {
    position: 'absolute',
    width: BRACKET,
    height: BRACKET,
  },
  rec: {
    position: 'absolute',
    top: SPACING.md,
    alignSelf: 'center',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  recDot: {
    width: 7,
    height: 7,
    borderRadius: RADIUS.pill,
  },
  recText: {
    fontFamily: FONTS.pixel,
    fontSize: FONT_SIZE.pixel,
    letterSpacing: LETTER_SPACING.wide,
  },
  scan: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
  },
  companion: {
    position: 'absolute',
    left: SPACING.sm,
    bottom: SPACING.md,
    width: 58,
    height: 72,
    overflow: 'hidden',
  },
  hint: {
    position: 'absolute',
    // start past the corner companion so the line never sits under the pet
    left: 74,
    right: SPACING.md,
    bottom: SPACING.sm,
    textAlign: 'center',
    fontFamily: FONTS.uiHeavy,
    fontSize: FONT_SIZE.caption,
  },
  result: {
    position: 'absolute',
    left: SPACING.sm,
    right: SPACING.sm,
    bottom: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: BORDER_WIDTH.hairline,
    backgroundColor: SCRIM,
  },
  resultPet: {
    width: 48,
    height: 56,
    overflow: 'hidden',
  },
  resultBody: {
    flex: 1,
    minWidth: 0,
  },
  looking: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  lookingText: {
    fontFamily: FONTS.display,
    fontSize: FONT_SIZE.subtitle,
  },
  dots: {
    fontSize: FONT_SIZE.caption,
  },
  resultName: {
    fontFamily: FONTS.pixel,
    fontSize: FONT_SIZE.pixel,
    letterSpacing: LETTER_SPACING.base,
    marginBottom: SPACING.xxs,
  },
  resultLine: {
    fontFamily: FONTS.ui,
    fontSize: FONT_SIZE.body,
    lineHeight: 19,
  },
  conf: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
  },
  confText: {
    fontFamily: FONTS.uiHeavy,
    fontSize: FONT_SIZE.caption,
  },
  tray: {
    minHeight: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutter: {
    width: SHUTTER,
    height: SHUTTER,
    borderRadius: SHUTTER / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 4,
  },
  shutterOff: {
    opacity: 0.55,
  },
  shutterRing: {
    width: SHUTTER_RING,
    height: SHUTTER_RING,
    borderRadius: SHUTTER_RING / 2,
    borderWidth: BORDER_WIDTH.bold,
  },
  again: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.md,
  },
  againText: {
    fontFamily: FONTS.uiHeavy,
    fontSize: FONT_SIZE.button,
  },
});
