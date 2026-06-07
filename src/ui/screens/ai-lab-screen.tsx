// AI Lab — talk to the on-device model directly. Lives inside the toy screen
// (opened from Settings) and streams replies through the same speech bubble
// the pet uses, so the whole voice pipeline is exercised end to end.

import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { MODEL_LABEL, usePetLlm } from '@/ai/use-pet-llm';
import { PixelIcon } from '@/render/pixel-icon';
import { ChunkyButton } from '@/ui/components/chunky-button';
import { SpeechBubble } from '@/ui/components/speech-bubble';
import {
  BORDER_WIDTH,
  BTN_EDGE_H,
  BTN_RADIUS,
  FONT_SIZE,
  FONTS,
  ICON_SIZE,
  LETTER_SPACING,
  RADIUS,
  shared,
  SPACING,
  SURF_RADIUS,
  useSurfaces,
  useTheme,
} from '@/ui/theme';

// keep Qwen3 from streaming <think> blocks into the bubble
const NO_THINK = ' /no_think';

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

type Props = {
  name: string;
  onBack: () => void;
};

export function AiLabScreen({ name, onBack }: Props) {
  const theme = useTheme();
  const surfaces = useSurfaces();
  const llm = usePetLlm();
  const [input, setInput] = useState('');

  const downloading = !llm.ready && !llm.error;
  const thinking = llm.generating && !llm.response;
  const canAsk = llm.ready && !llm.generating && input.trim().length > 0;

  const ask = () => {
    if (!canAsk) return;
    llm.generate(input.trim() + NO_THINK);
  };

  const status = llm.error
    ? 'model failed to load'
    : downloading
      ? llm.downloadProgress > 0
        ? `fetching the little mind… ${Math.round(llm.downloadProgress * 100)}%`
        : 'waking the little mind…'
      : llm.generating
        ? 'thinking…'
        : 'on-device · ready';

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled">
      <View style={styles.topbar}>
        <Pressable
          onPress={onBack}
          style={({ pressed }) => [
            shared.row,
            styles.back,
            pressed && { backgroundColor: theme.panel },
          ]}>
          <PixelIcon name="chevL" size={ICON_SIZE.sm} color={theme.inkSoft} />
          <Text style={[styles.backText, { color: theme.inkSoft }]}> Settings</Text>
        </Pressable>
        <Text style={[shared.pixelLabel, styles.title, { color: theme.inkSoft }]}>AI&nbsp;LAB</Text>
        <PixelIcon name="sparkle" size={ICON_SIZE.sm} color={theme.accent} />
      </View>

      <View style={[shared.row, surfaces.panel, styles.statusRow]}>
        <PixelIcon name={llm.error ? 'bang' : 'scan'} size={ICON_SIZE.sm} color={theme.accent} />
        <Text style={[styles.statusText, { color: theme.inkSoft }]}>{status}</Text>
        <Text style={[shared.pixelLabel, { color: theme.inkFaint }]}>{MODEL_LABEL}</Text>
      </View>
      {downloading && <DownloadBar progress={llm.downloadProgress} />}
      {llm.error != null && (
        <Text style={[styles.error, { color: theme.accent }]}>{String(llm.error)}</Text>
      )}

      <TextInput
        style={[styles.input, surfaces.field, { color: theme.ink }]}
        value={input}
        onChangeText={setInput}
        placeholder={`ask ${name.toLowerCase()} anything…`}
        placeholderTextColor={theme.inkFaint}
        multiline
        editable={llm.ready && !llm.generating}
        onSubmitEditing={ask}
      />

      <View style={styles.buttons}>
        <ChunkyButton label="Ask" tone={surfaces.accentTone} onPress={ask} disabled={!canAsk} />
        <Pressable
          onPress={llm.interrupt}
          disabled={!llm.generating}
          style={[
            styles.stop,
            { borderColor: theme.panelLine },
            !llm.generating && shared.disabled,
          ]}>
          <Text style={[styles.stopText, { color: theme.inkSoft }]}>Stop</Text>
        </Pressable>
      </View>

      <SpeechBubble name={name} shown={llm.response} done={!llm.generating} thinking={thinking} />

      <View style={styles.metrics}>
        <Text style={[shared.pixelLabel, { color: theme.inkFaint }]}>
          {llm.metrics.ttftMs != null ? `FIRST ${(llm.metrics.ttftMs / 1000).toFixed(1)}S` : ''}
          {llm.metrics.tokensPerSec != null ? ` · ${llm.metrics.tokensPerSec} TOK/S` : ''}
          {llm.metrics.tokens ? ` · ${llm.metrics.tokens} TOK` : ''}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    flexGrow: 1, // keeps the metrics row pinned down when content is short
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
    borderRadius: RADIUS.sm,
  },
  backText: {
    fontFamily: FONTS.uiBold,
    fontSize: FONT_SIZE.body,
  },
  title: {
    fontSize: FONT_SIZE.pixelLg,
    letterSpacing: LETTER_SPACING.wide,
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
    borderRadius: RADIUS.xs,
  },
  error: {
    fontFamily: FONTS.ui,
    fontSize: FONT_SIZE.caption,
  },
  input: {
    minHeight: 64,
    maxHeight: 110,
    borderWidth: BORDER_WIDTH.regular,
    borderRadius: SURF_RADIUS,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.sm,
    fontFamily: FONTS.ui,
    fontSize: FONT_SIZE.input,
    textAlignVertical: 'top',
  },
  buttons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  stop: {
    paddingHorizontal: SPACING.xl,
    justifyContent: 'center',
    borderWidth: BORDER_WIDTH.regular,
    borderRadius: BTN_RADIUS,
    marginBottom: BTN_EDGE_H,
  },
  stopText: {
    fontFamily: FONTS.uiBold,
    fontSize: FONT_SIZE.button,
  },
  metrics: {
    marginTop: 'auto',
    alignItems: 'center',
  },
});
