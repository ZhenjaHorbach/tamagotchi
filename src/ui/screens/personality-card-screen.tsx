// Personality card — the creature's keepsake ID. Reached by tapping the
// nameplate on the habitat. Shows the generated character: portrait, name,
// temperament/boldness, the mechanical traits, loves/dislikes, quirk.

import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { Personality } from '@/ai/personality';
import { PixelIcon } from '@/render/pixel-icon';
import { hashSeed } from '@/render/sprite-gen';
import { SpritePlayer } from '@/render/sprite-player';
import {
  FONT_SIZE,
  FONTS,
  ICON_SIZE,
  LETTER_SPACING,
  shared,
  SPACING,
  useSurfaces,
  useTheme,
} from '@/ui/theme';

// map a personality axis → its i18n value label
const AXIS_LABEL: { key: string; field: keyof Personality; tk: string }[] = [
  { key: 'energy', field: 'energyType', tk: 'energy' },
  { key: 'appetite', field: 'appetite', tk: 'appetite' },
  { key: 'social', field: 'neediness', tk: 'social' },
  { key: 'play', field: 'playfulness', tk: 'play' },
  { key: 'rhythm', field: 'rhythm', tk: 'rhythm' },
];

type Props = {
  card: Personality;
  bornAt: number;
  onBack: () => void;
};

export function PersonalityCardScreen({ card, bornAt, onBack }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const surfaces = useSurfaces();

  const serial = String(Math.abs(bornAt) % 10000).padStart(4, '0');

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
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
          <Text style={[styles.backText, { color: theme.inkSoft }]}> {t('nav.habitat')}</Text>
        </Pressable>
        <Text style={[shared.pixelLabel, { color: theme.inkSoft }]}>{t('card.id')}</Text>
        <PixelIcon name="sparkle" size={ICON_SIZE.sm} color={theme.accent} />
      </View>

      {/* header: portrait + name + serial + temperament/boldness chips */}
      <View style={[surfaces.panel, styles.headerCard]}>
        <View style={[surfaces.field, styles.portrait]}>
          <SpritePlayer mood="happy" seed={hashSeed(card.name)} size={68} />
        </View>
        <View style={styles.headId}>
          <Text style={[styles.name, { color: theme.ink }]}>{card.name}</Text>
          <Text style={[shared.pixelLabel, { color: theme.inkFaint }]}>
            {t('card.serial')} {serial}
          </Text>
          <View style={styles.chips}>
            <Chip label={t(`trait.temperament.${card.temperament}`)} />
            <Chip label={t(`trait.boldness.${card.boldness}`)} />
          </View>
        </View>
      </View>

      {/* traits grid */}
      <View style={[surfaces.panel, styles.section]}>
        <Text style={[styles.sectionTitle, { color: theme.accent }]}>{t('card.traits')}</Text>
        <View style={styles.traitGrid}>
          {AXIS_LABEL.map((a) => (
            <View key={a.key} style={styles.trait}>
              <Text style={[styles.traitKey, { color: theme.inkFaint }]}>
                {t(`card.${a.key}`) || a.key}
              </Text>
              <Text style={[styles.traitVal, { color: theme.ink }]}>
                {t(`trait.${a.tk}.${card[a.field]}`)}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* loves / dislikes */}
      <View style={styles.twoCol}>
        <View style={[surfaces.panel, styles.section, styles.col]}>
          <Text style={[styles.sectionTitle, { color: theme.accent }]}>{t('card.loves')}</Text>
          {card.likesFood.map((f) => (
            <Text key={f} style={[styles.listItem, { color: theme.inkSoft }]}>
              <PixelIcon name="heart" size={ICON_SIZE.xs} color={theme.accent} />{' '}
              {t(`food.${f}`, f)}
            </Text>
          ))}
        </View>
        <View style={[surfaces.panel, styles.section, styles.col]}>
          <Text style={[styles.sectionTitle, { color: theme.accent }]}>{t('card.dislikes')}</Text>
          {card.dislikes.length ? (
            card.dislikes.map((d) => (
              <Text key={d} style={[styles.listItem, { color: theme.inkSoft }]}>
                <PixelIcon name="bang" size={ICON_SIZE.xs} color={theme.inkFaint} />{' '}
                {t(`food.${d}`, d)}
              </Text>
            ))
          ) : (
            <Text style={[styles.listItem, { color: theme.inkFaint }]}>—</Text>
          )}
        </View>
      </View>

      {/* quirk */}
      <View style={[surfaces.panel, styles.section]}>
        <Text style={[styles.sectionTitle, { color: theme.accent }]}>{t('card.quirk')}</Text>
        <Text style={[styles.quirk, { color: theme.inkSoft }]}>{card.quirk}</Text>
      </View>

      <View style={styles.foot}>
        <PixelIcon name="moon" size={ICON_SIZE.sm} color={theme.inkFaint} />
        <Text style={[shared.pixelLabel, { color: theme.inkFaint }]}> {t('card.offline')}</Text>
      </View>
    </ScrollView>
  );
}

function Chip({ label }: { label: string }) {
  const theme = useTheme();
  const surfaces = useSurfaces();
  return (
    <View style={[surfaces.field, styles.chip]}>
      <Text style={[styles.chipText, { color: theme.inkSoft }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    flexGrow: 1,
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
  backText: { fontFamily: FONTS.uiBold, fontSize: FONT_SIZE.body },
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.md,
  },
  portrait: {
    width: 84,
    height: 84,
    borderRadius: SPACING.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  headId: { flex: 1, gap: SPACING.xs },
  name: { fontFamily: FONTS.display, fontSize: FONT_SIZE.title },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs, marginTop: SPACING.xxs },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: SPACING.xxs,
    paddingHorizontal: SPACING.sm,
  },
  chipText: { fontFamily: FONTS.uiBold, fontSize: FONT_SIZE.pixelLg },
  section: { padding: SPACING.md, gap: SPACING.sm },
  sectionTitle: {
    fontFamily: FONTS.pixel,
    fontSize: FONT_SIZE.pixel,
    letterSpacing: LETTER_SPACING.base,
    textTransform: 'uppercase',
  },
  traitGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  trait: { width: '45%', gap: SPACING.xxs },
  traitKey: {
    fontFamily: FONTS.pixel,
    fontSize: FONT_SIZE.pixel,
    letterSpacing: LETTER_SPACING.tight,
    textTransform: 'uppercase',
  },
  traitVal: { fontFamily: FONTS.uiBold, fontSize: FONT_SIZE.body },
  twoCol: { flexDirection: 'row', gap: SPACING.md },
  col: { flex: 1 },
  listItem: { fontFamily: FONTS.ui, fontSize: FONT_SIZE.body },
  quirk: { fontFamily: FONTS.display, fontSize: FONT_SIZE.subtitle, lineHeight: 22 },
  foot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.xs,
  },
});
