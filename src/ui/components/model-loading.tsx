// Shared "the little mind is loading" panel: a status line + segmented download
// bar driven by the global LLM store. Renders nothing once the model is ready.
// Used on the AI Lab and during the first hatch so the ~2 GB download is visible.

import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { useLlmStore } from '@/ai/llm-store';
import { PixelIcon } from '@/render/pixel-icon';
import { FONT_SIZE, FONTS, ICON_SIZE, shared, SPACING, useSurfaces, useTheme } from '@/ui/theme';

const SEGMENTS = 10;

function DownloadBar({ progress }: { progress: number }) {
  const theme = useTheme();
  const filled = Math.round(progress * SEGMENTS);
  return (
    <View style={styles.dlTrack}>
      {Array.from({ length: SEGMENTS }).map((_, i) => (
        <View
          key={i}
          style={[styles.dlSeg, { backgroundColor: i < filled ? theme.accent : theme.track }]}
        />
      ))}
    </View>
  );
}

/** Status pill + (while downloading) progress bar. Null when ready. */
export function ModelLoadingBar() {
  const { t } = useTranslation();
  const theme = useTheme();
  const surfaces = useSurfaces();
  const status = useLlmStore((s) => s.status);
  const progress = useLlmStore((s) => s.downloadProgress);
  const error = useLlmStore((s) => s.error);

  if (status === 'ready') return null;

  const downloading = status !== 'error';
  const label = error
    ? t('ailab.statusError')
    : progress > 0
      ? t('ailab.statusFetching', { pct: Math.round(progress * 100) })
      : t('ailab.statusWaking');

  return (
    <View style={styles.wrap}>
      <View style={[shared.row, surfaces.panel, styles.statusRow]}>
        <PixelIcon name={error ? 'bang' : 'scan'} size={ICON_SIZE.sm} color={theme.accent} />
        <Text style={[styles.statusText, { color: theme.inkSoft }]}>{label}</Text>
      </View>
      {downloading && progress > 0 && <DownloadBar progress={progress} />}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'stretch',
    gap: SPACING.sm,
  },
  statusRow: {
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  statusText: {
    fontFamily: FONTS.uiBold,
    fontSize: FONT_SIZE.caption,
    flex: 1,
  },
  dlTrack: {
    flexDirection: 'row',
    gap: SPACING.xxs,
  },
  dlSeg: {
    flex: 1,
    height: 9,
    borderRadius: 3,
  },
});
