// Global on-device LLM controller. The model is a singleton living outside
// any screen: navigation can never interrupt a download or a generation.
// Built on the hookless LLMModule API of react-native-executorch.

import { LLMModule, models } from 'react-native-executorch';
import { create } from 'zustand';

/**
 * Qwen3 1.7B — a step up from 0.6B, which streamed ~85 tok/s in the simulator.
 * Bigger download (~2 GB) and more memory use, but should still run on-device in a few seconds and stream at a decent clip.
 */
const MODEL = models.llm.qwen3_1_7b();

/** Model id straight from the library config, shown in the AI Lab. */
export const MODEL_LABEL = MODEL.modelName;

export type GenMetrics = {
  /** ms from generate() to the first streamed token */
  ttftMs: number | null;
  /** total generation wall time, ms */
  totalMs: number | null;
  tokens: number;
  tokensPerSec: number | null;
};

const EMPTY_METRICS: GenMetrics = { ttftMs: null, totalMs: null, tokens: 0, tokensPerSec: null };

type LlmStatus = 'idle' | 'loading' | 'ready' | 'error';

type LlmStore = {
  status: LlmStatus;
  downloadProgress: number; // 0..1
  generating: boolean;
  /** streamed text of the current/last generation (raw, incl. think tags) */
  rawResponse: string;
  error: string | null;
  metrics: GenMetrics;
  /** Download (once) and load the model. Safe to call repeatedly. */
  load: () => Promise<void>;
  /** Stream a reply for a single user prompt. Resolves with the full text. */
  generate: (prompt: string) => Promise<string | null>;
  interrupt: () => void;
};

// The native module handle and timing live outside the store state — they are
// not serializable and never drive renders directly.
let llm: Awaited<ReturnType<typeof LLMModule.fromModelName>> | null = null;
let timing = { startedAt: 0, firstTokenAt: 0, tokens: 0 };

export const useLlmStore = create<LlmStore>((set, get) => ({
  status: 'idle',
  downloadProgress: 0,
  generating: false,
  rawResponse: '',
  error: null,
  metrics: EMPTY_METRICS,

  load: async () => {
    const { status } = get();
    if (status === 'loading' || status === 'ready') return;
    set({ status: 'loading', error: null });
    try {
      llm = await LLMModule.fromModelName(
        MODEL,
        (progress: number) => set({ downloadProgress: progress }),
        (token: string) => {
          timing.tokens += 1;
          if (!timing.firstTokenAt) {
            timing.firstTokenAt = Date.now();
            set((s) => ({
              metrics: { ...s.metrics, ttftMs: timing.firstTokenAt - timing.startedAt },
            }));
          }
          set((s) => ({ rawResponse: s.rawResponse + token }));
        },
      );
      set({ status: 'ready' });
    } catch (e) {
      set({ status: 'error', error: String(e) });
    }
  },

  generate: async (prompt: string) => {
    if (!llm || get().generating) return null;
    timing = { startedAt: Date.now(), firstTokenAt: 0, tokens: 0 };
    set({ generating: true, rawResponse: '', metrics: EMPTY_METRICS });
    try {
      const text = await llm.generate([{ role: 'user', content: prompt }]);
      const totalMs = Date.now() - timing.startedAt;
      const genMs = timing.firstTokenAt ? Date.now() - timing.firstTokenAt : totalMs;
      set({
        metrics: {
          ttftMs: timing.firstTokenAt ? timing.firstTokenAt - timing.startedAt : null,
          totalMs,
          tokens: timing.tokens,
          tokensPerSec: genMs > 0 ? Math.round((timing.tokens / genMs) * 10000) / 10 : null,
        },
      });
      return text;
    } catch (e) {
      set({ error: String(e) });
      return null;
    } finally {
      set({ generating: false });
    }
  },

  interrupt: () => {
    llm?.interrupt();
  },
}));
