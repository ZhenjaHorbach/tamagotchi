import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Mood } from '@/core';
import { PixelIcon } from '@/render/pixel-icon';
import type { IconName } from '@/render/pixel-bitmaps';
import { useLlmStore } from '@/ai/llm-store';
import { hashSeed } from '@/render/sprite-gen';
import { SpritePlayer } from '@/render/sprite-player';
import { ModelLoadingBar } from '@/ui/components/model-loading';
import { LinearBg, RadialBg } from '@/ui/components/gradient-bg';
import {
  BORDER_WIDTH,
  fadeOut,
  FONT_SIZE,
  FONTS,
  ICON_SIZE,
  RADIUS,
  MOOD_META,
  shared,
  SPACING,
  useSurfaces,
  useTheme,
} from '@/ui/theme';

const DOME_W = 128;
const DOME_H = 126;

function PetDome({ name, mood, onPress }: { name: string; mood: Mood; onPress: () => void }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const meta = MOOD_META[mood];
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.dome, pressed && styles.domePressed]}
    >
      <View style={styles.glass}>
        <View style={styles.glassInner}>
          <LinearBg colors={[theme.screen1, theme.screen2]} />
          <View style={styles.domeGlow}>
            <RadialBg
              colors={[theme.glow, fadeOut(theme.glow)]}
              radius={0.5}
              positions={[0, 0.64]}
            />
          </View>
          <View style={styles.domeFloor}>
            <LinearBg colors={[theme.floor, theme.floorEdge]} />
          </View>
          <View style={styles.domePet}>
            <SpritePlayer mood={mood} seed={hashSeed(name)} size={50} />
          </View>
          <View style={styles.shine} />
        </View>
      </View>
      <View style={styles.cork}>
        <LinearBg colors={[theme.floorEdge, theme.accentDeep]} style={styles.corkBg} />
      </View>
      <View style={styles.plate}>
        <Text style={[styles.name, { color: theme.ink }]}>{name}</Text>
        <Text style={[styles.moodText, { color: theme.inkSoft }]}>
          <PixelIcon name={meta.glyph as IconName} size={ICON_SIZE.sm} color={theme.accent} />{' '}
          {t(`mood.${mood}.label`).toLowerCase()}
        </Text>
      </View>
    </Pressable>
  );
}

// `onPress` omitted when a pet already exists (slot is a future affordance).
// `large` blows it up for the centered "no pet yet" state; `waiting` shows the
// "please wait" copy while the model downloads.
function EmptyDome({
  onPress,
  large,
  waiting,
}: {
  onPress?: () => void;
  large?: boolean;
  waiting?: boolean;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const disabled = !onPress;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.dome,
        large && styles.domeLarge,
        disabled && styles.domeFaded,
        pressed && styles.domePressed,
      ]}
    >
      <View style={[styles.glass, { backgroundColor: theme.panelLine }]}>
        <View style={[styles.glassInner, styles.glassEmpty, { backgroundColor: theme.panel }]}>
          <PixelIcon name="egg" size={ICON_SIZE.xl} color={theme.inkFaint} />
        </View>
      </View>
      <View style={[styles.cork, { backgroundColor: theme.panelLine, opacity: 0.7 }]} />
      <View style={styles.plate}>
        <Text style={[styles.name, { color: theme.inkFaint }]}>{t('shelf.empty')}</Text>
        <Text style={[styles.moodText, { color: theme.inkFaint }]}>
          {waiting ? (
            t('hatch.waiting')
          ) : (
            <>
              <PixelIcon name="plus" size={ICON_SIZE.xs} color={theme.inkFaint} />{' '}
              {t('shelf.hatchOne')}
            </>
          )}
        </Text>
      </View>
    </Pressable>
  );
}

type Props = {
  pet: { name: string; mood: Mood } | null;
  onEnterPet: () => void;
  onAdopt: () => void;
};

export function ShelfScreen({ pet, onEnterPet, onAdopt }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const surfaces = useSurfaces();
  const modelReady = useLlmStore((s) => s.status === 'ready');
  // hatching is offered when the slot is free AND the model has downloaded —
  // so the first pet is born with a generated personality
  const waiting = !pet && !modelReady;
  const canAdopt = !pet && modelReady;
  return (
    <View style={styles.root}>
      <View style={styles.head}>
        <View>
          <Text style={[styles.title, { color: theme.ink }]}>{t('shelf.title')}</Text>
          <Text style={[styles.sub, { color: theme.inkSoft }]}>{t('shelf.sub')}</Text>
        </View>
        <View style={[shared.row, surfaces.panel, styles.count]}>
          <PixelIcon name="dome" size={ICON_SIZE.sm} color={theme.accent} />
          <Text style={[styles.countText, { color: theme.inkSoft }]}> {pet ? 1 : 0}</Text>
        </View>
      </View>

      <View style={styles.stage}>
        {pet ? (
          <View style={styles.row}>
            <PetDome name={pet.name} mood={pet.mood} onPress={onEnterPet} />
            <EmptyDome />
          </View>
        ) : (
          // no pet yet → a single inviting dome; while the model downloads it's
          // disabled and the progress bar shows beneath it
          <View style={styles.emptyWrap}>
            <EmptyDome onPress={canAdopt ? onAdopt : undefined} large waiting={waiting} />
            {waiting && <ModelLoadingBar />}
          </View>
        )}
      </View>

      <View style={styles.foot}>
        <PixelIcon name="moon" size={ICON_SIZE.sm} color={theme.inkFaint} />
        <Text style={[styles.footText, { color: theme.inkFaint }]}> {t('shelf.footer')}</Text>
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
  head: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: FONTS.display,
    fontSize: FONT_SIZE.display,
  },
  sub: {
    fontFamily: FONTS.ui,
    fontSize: FONT_SIZE.caption,
    marginTop: SPACING.xs,
  },
  count: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.pill,
  },
  countText: {
    fontFamily: FONTS.pixel,
    fontSize: FONT_SIZE.pixelLg,
  },
  stage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyWrap: {
    alignSelf: 'stretch',
    alignItems: 'center',
    gap: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: SPACING.lg,
    paddingHorizontal: SPACING.xs,
  },
  dome: {
    width: 138,
    alignItems: 'center',
  },
  domeLarge: {},
  domePressed: {
    transform: [{ translateY: -2 }],
  },
  domeFaded: {
    opacity: 0.55,
  },
  glass: {
    width: DOME_W,
    height: DOME_H,
    borderTopLeftRadius: DOME_W / 2,
    borderTopRightRadius: DOME_W / 2,
    borderBottomLeftRadius: RADIUS.lg,
    borderBottomRightRadius: RADIUS.lg,
    // rim via nested view, not a border: RN borders glitch into a thick cap
    // at the dome apex when the two top radii meet (radius == width/2)
    backgroundColor: 'rgba(255,255,255,0.26)',
    overflow: 'hidden',
  },
  glassInner: {
    flex: 1,
    margin: SPACING.xxs,
    borderTopLeftRadius: DOME_W / 2 - 2,
    borderTopRightRadius: DOME_W / 2 - 2,
    borderBottomLeftRadius: RADIUS.lg,
    borderBottomRightRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  glassEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  domeGlow: {
    position: 'absolute',
    left: '50%',
    bottom: -6,
    marginLeft: -39,
    width: 78,
    height: 78,
  },
  domeFloor: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '28%',
    borderTopWidth: BORDER_WIDTH.bold,
    borderTopColor: 'rgba(0,0,0,0.1)',
    overflow: 'hidden',
  },
  domePet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: '18%',
    alignItems: 'center',
  },
  shine: {
    position: 'absolute',
    top: 7,
    left: 15,
    width: 32,
    height: 48,
    borderRadius: RADIUS.xl,
    backgroundColor: 'rgba(255,255,255,0.28)',
    transform: [{ rotate: '-12deg' }],
  },
  cork: {
    width: 114,
    height: 13,
    borderBottomLeftRadius: RADIUS.sm,
    borderBottomRightRadius: RADIUS.sm,
    marginTop: -1,
    overflow: 'hidden',
  },
  corkBg: {
    borderBottomLeftRadius: RADIUS.sm,
    borderBottomRightRadius: RADIUS.sm,
  },
  plate: {
    alignItems: 'center',
    gap: SPACING.xxs,
    marginTop: SPACING.sm,
  },
  name: {
    fontFamily: FONTS.display,
    fontSize: FONT_SIZE.speech,
  },
  moodText: {
    fontFamily: FONTS.uiBold,
    fontSize: FONT_SIZE.pixelLg,
    textTransform: 'lowercase',
  },
  foot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  footText: {
    fontFamily: FONTS.uiBold,
    fontSize: FONT_SIZE.pixelLg,
  },
});
