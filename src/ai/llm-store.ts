// Global on-device LLM controller. The model is a singleton living outside
// any screen: navigation can never interrupt a download or a generation.
// Built on the hookless LLMModule API of react-native-executorch.

import * as Device from 'expo-device';
import { LLMModule, models } from 'react-native-executorch';
import { create } from 'zustand';

const GB = 1024 ** 3;

/**
 * Pick the model for THIS device by available RAM — smaller models are far
 * lighter and noticeably faster, so only roomy phones get the smartest one.
 * Three tiers, all quantized (smaller download + memory, faster inference):
 *   ≥ 6 GB → qwen3-1.7b      (smartest)
 *   ≥ 4 GB → qwen3.5-0.8b    (newer, balanced)
 *   else   → qwen3-0.6b      (most primitive, lightest)
 * `totalMemory` is null on web/unknown → assume the weakest tier.
 */
function pickModel() {
  const mem = Device.totalMemory ?? 0;
  if (mem >= 6 * GB) return models.llm.qwen3_1_7b({ quant: true });
  if (mem >= 4 * GB) return models.llm.qwen3_5_0_8b({ quant: true });
  return models.llm.qwen3_0_6b({ quant: true });
}

const MODEL = pickModel();

/** Model id straight from the library config, shown in the AI Lab. */
export const MODEL_LABEL = MODEL.modelName;

/** Generation settings (model default temperature is 0.6). */
export type GenConfig = {
  temperature?: number;
  topP?: number;
  minP?: number;
  repetitionPenalty?: number;
  maxTokens?: number;
};

// High temperature for variety; minP trims the incoherent long tail so the
// extra randomness stays funny rather than gibberish. maxTokens caps a one-line
// reply (~24 words) so generation can't run away on a low-end device.
export const REPLY_CONFIG: GenConfig = {
  temperature: 1.1,
  topP: 0.95,
  minP: 0.03,
  repetitionPenalty: 1.1,
  maxTokens: 128,
};
// Lower temperature → the birth JSON parses reliably (still some name/quirk flair).
export const PERSONALITY_CONFIG: GenConfig = { temperature: 0.7, topP: 0.9 };

// fallback system prompt (e.g. AI Lab free chat) so the model always gets one
const DEFAULT_SYSTEM =
  'You are a tiny pixel pet living in a pocket terrarium. Keep replies short, warm and in character. /no_think';

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
  generate: (prompt: string, config?: GenConfig, system?: string) => Promise<string | null>;
  interrupt: () => void;
};

// The native module handle and timing live outside the store state — they are
// not serializable and never drive renders directly.
let llm: Awaited<ReturnType<typeof LLMModule.fromModelName>> | null = null;
let timing = { startedAt: 0, firstTokenAt: 0, tokens: 0 };
// soft per-generation token cap (0 = unlimited); enforced in the token callback
let tokenLimit = 0;
let interrupted = false;

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
          if (tokenLimit && !interrupted && timing.tokens >= tokenLimit) {
            interrupted = true;
            llm?.interrupt();
          }
        },
      );
      set({ status: 'ready' });
    } catch (e) {
      set({ status: 'error', error: String(e) });
    }
  },

  generate: async (prompt: string, config?: GenConfig, system?: string) => {
    if (!llm || get().generating) return null;
    timing = { startedAt: Date.now(), firstTokenAt: 0, tokens: 0 };
    // split our soft cap out of the real generationConfig the model accepts
    const { maxTokens, ...genConfig } = config ?? {};
    tokenLimit = maxTokens ?? 0;
    interrupted = false;
    set({ generating: true, rawResponse: '', metrics: EMPTY_METRICS });
    try {
      if (config) llm.configure({ generationConfig: genConfig });
      const text = await llm.generate([
        { role: 'system', content: system ?? DEFAULT_SYSTEM },
        { role: 'user', content: prompt },
      ]);
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
      tokenLimit = 0;
      set({ generating: false });
    }
  },

  interrupt: () => {
    llm?.interrupt();
  },
}));
