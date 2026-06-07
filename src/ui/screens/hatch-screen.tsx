// Birth ceremony (design: Hatching). Tap the egg to warm it — it cracks and
// shudders, bursts in a flash, then reveals the creature with a typed welcome.
// "Say hello" gives birth (createPet) and enters the habitat.

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import type { Personality } from '@/ai/personality';
import { PixelIcon } from '@/render/pixel-icon';
import { SpritePlayer } from '@/render/sprite-player';
import { RadialBg } from '@/ui/components/gradient-bg';
import { ThinkingCue } from '@/ui/components/speech-bubble';
import {
  BORDER_WIDTH,
  fadeOut,
  FONT_SIZE,
  FONTS,
  ICON_SIZE,
  LETTER_SPACING,
  RADIUS,
  SPACING,
  useTheme,
} from '@/ui/theme';

const TAPS_TO_HATCH = 4;

// egg shape geometry (kept as named constants, like the dome/window widths)
const EGG_W = 122;
const EGG_H = 152;
const EGG_R_TOP = 58;
const EGG_R_BOTTOM = 56;

type Phase = 'egg' | 'burst' | 'reveal';

type Props = {
  /** card built for this hatch (name + traits); null while still generating */
  card: Personality | null;
  /** called when the egg bursts — kicks off personality generation */
  onReveal: () => void;
  onComplete: () => void;
};

export function HatchScreen({ card, onReveal, onComplete }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();

  const [taps, setTaps] = useState(0);
  const [phase, setPhase] = useState<Phase>('egg');

  const wobble = useSharedValue(0); // -1..1 shudder on tap
  const idle = useSharedValue(0); // gentle rock

  useEffect(() => {
    idle.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
        withTiming(-1, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, [idle]);

  const tap = () => {
    if (phase !== 'egg') return;
    wobble.value = withSequence(
      withTiming(-1, { duration: 70 }),
      withTiming(1, { duration: 90 }),
      withTiming(0, { duration: 80 }),
    );
    const next = taps + 1;
    setTaps(next);
    if (next >= TAPS_TO_HATCH) {
      setPhase('burst');
      onReveal(); // start generating the personality during the flash
      setTimeout(() => setPhase('reveal'), 720);
    }
  };

  const eggStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${idle.value * 2 + wobble.value * 4}deg` }, { translateX: wobble.value * 5 }],
  }));

  const cracks = Math.min(3, taps);

  return (
    <View style={styles.root}>
      <View style={styles.aura} pointerEvents="none">
        <RadialBg colors={[theme.glow, fadeOut(theme.glow)]} radius={0.5} positions={[0, 0.66]} />
      </View>

      {phase !== 'reveal' && (
        <View style={styles.stage}>
          <Text style={[styles.kicker, { color: theme.inkSoft }]}>{t('hatch.firstLight')}</Text>

          <Pressable onPress={tap}>
            <Animated.View
              style={[styles.egg, { backgroundColor: theme.bubbleBg, borderColor: theme.panelLine }, eggStyle]}
            >
              <View style={[styles.eggShine]} />
              {cracks >= 1 && <View style={[styles.crack, styles.crack1, { backgroundColor: theme.inkSoft }]} />}
              {cracks >= 2 && <View style={[styles.crack, styles.crack2, { backgroundColor: theme.inkSoft }]} />}
              {cracks >= 3 && <View style={[styles.crack, styles.crack3, { backgroundColor: theme.inkSoft }]} />}
            </Animated.View>
          </Pressable>

          <Text style={[styles.hint, { color: theme.inkSoft }]}>
            {phase === 'burst' ? t('hatch.oh') : taps === 0 ? t('hatch.stirring') : t('hatch.warm')}
          </Text>

          <View style={styles.warmth}>
            {Array.from({ length: TAPS_TO_HATCH }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.warmthDot,
                  { backgroundColor: i < taps ? theme.accent : theme.inkGhost },
                  i < taps && { shadowColor: theme.accent, shadowOpacity: 1, shadowRadius: 5 },
                ]}
              />
            ))}
          </View>
        </View>
      )}

      {phase === 'reveal' && <Reveal card={card} onComplete={onComplete} />}
    </View>
  );
}

function Reveal({ card, onComplete }: { card: Personality | null; onComplete: () => void }) {
  const { t } = useTranslation();
  const theme = useTheme();

  const pop = useSharedValue(0);
  const rays = useSharedValue(0);
  useEffect(() => {
    pop.value = withSequence(
      withTiming(1.12, { duration: 360, easing: Easing.out(Easing.back(2)) }),
      withTiming(1, { duration: 220 }),
    );
    rays.value = withRepeat(withTiming(1, { duration: 24000, easing: Easing.linear }), -1);
  }, [pop, rays]);

  const popStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));
  const raysStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${rays.value * 360}deg` }] }));

  const summary = card
    ? `${t(`trait.temperament.${card.temperament}`)} · ${t(`trait.boldness.${card.boldness}`)}`
    : '';

  return (
    <View style={styles.reveal}>
      <Animated.View style={[styles.rays, raysStyle]} pointerEvents="none">
        <RadialBg colors={[theme.accentSoft, fadeOut(theme.accentSoft)]} radius={0.5} positions={[0, 0.7]} />
      </Animated.View>

      <Animated.View style={popStyle}>
        <SpritePlayer mood="happy" size={108} />
      </Animated.View>

      <Text style={[styles.meet, { color: theme.inkSoft }]}>{t('hatch.meet')}</Text>

      {card ? (
        <>
          <Text style={[styles.name, { color: theme.ink }]}>{card.name}</Text>
          <View style={styles.lineRow}>
            <PixelIcon name="sparkle" size={ICON_SIZE.sm} color={theme.accent} />
            <Text style={[styles.line, { color: theme.inkSoft }]}>{summary}</Text>
          </View>
          {card.quirk ? (
            <Text style={[styles.quirk, { color: theme.inkFaint }]}>{card.quirk}</Text>
          ) : null}
        </>
      ) : (
        // personality is still being dreamt up by the model
        <View style={styles.loading}>
          <ThinkingCue />
          <Text style={[styles.quirk, { color: theme.inkFaint }]}>{t('hatch.summoning')}</Text>
        </View>
      )}

      <Pressable
        onPress={onComplete}
        disabled={!card}
        style={[styles.btn, { backgroundColor: theme.accent }, !card && styles.btnOff]}
      >
        <Text style={[styles.btnText, { color: theme.btnInk }]}>{t('hatch.sayHello')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  aura: {
    position: 'absolute',
    width: 240,
    height: 240,
    top: '24%',
    mixBlendMode: 'screen',
  },
  stage: {
    alignItems: 'center',
    gap: SPACING.lg,
  },
  kicker: {
    fontFamily: FONTS.display,
    fontSize: FONT_SIZE.pixelLg,
    letterSpacing: LETTER_SPACING.wide,
    textTransform: 'uppercase',
  },
  egg: {
    width: EGG_W,
    height: EGG_H,
    borderWidth: BORDER_WIDTH.regular,
    borderTopLeftRadius: EGG_R_TOP,
    borderTopRightRadius: EGG_R_TOP,
    borderBottomLeftRadius: EGG_R_BOTTOM,
    borderBottomRightRadius: EGG_R_BOTTOM,
    overflow: 'hidden',
  },
  eggShine: {
    position: 'absolute',
    top: '16%',
    left: '22%',
    width: 24,
    height: 32,
    borderRadius: RADIUS.lg,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  crack: {
    position: 'absolute',
    width: 2,
    opacity: 0.5,
  },
  crack1: { left: '50%', top: '14%', height: 36, transform: [{ rotate: '8deg' }] },
  crack2: { left: '42%', top: '30%', height: 30, transform: [{ rotate: '-14deg' }] },
  crack3: { left: '60%', top: '24%', height: 34, transform: [{ rotate: '20deg' }] },
  hint: {
    fontFamily: FONTS.uiBold,
    fontSize: FONT_SIZE.button,
    textAlign: 'center',
  },
  warmth: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  warmthDot: {
    width: 9,
    height: 9,
    borderRadius: RADIUS.pill,
  },
  reveal: {
    alignItems: 'center',
    gap: SPACING.xs,
    padding: SPACING.sm,
  },
  rays: {
    position: 'absolute',
    width: 260,
    height: 260,
    top: '6%',
  },
  meet: {
    fontFamily: FONTS.display,
    fontSize: FONT_SIZE.pixel,
    letterSpacing: LETTER_SPACING.wide,
    textTransform: 'uppercase',
    marginTop: SPACING.sm,
  },
  name: {
    fontFamily: FONTS.display,
    fontSize: FONT_SIZE.hero,
  },
  lineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.xs,
    maxWidth: 280,
    minHeight: 44,
    marginTop: SPACING.xs,
  },
  line: {
    flex: 1,
    fontFamily: FONTS.display,
    fontSize: FONT_SIZE.subtitle,
    lineHeight: 20,
  },
  quirk: {
    maxWidth: 280,
    textAlign: 'center',
    fontFamily: FONTS.ui,
    fontSize: FONT_SIZE.caption,
    lineHeight: 16,
  },
  loading: {
    minHeight: 92, // hold the button's place while name/summary are generating
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  btn: {
    marginTop: SPACING.sm,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xxl,
    borderRadius: RADIUS.md,
  },
  btnOff: {
    opacity: 0.4,
  },
  btnText: {
    fontFamily: FONTS.uiBold,
    fontSize: FONT_SIZE.input,
  },
});
