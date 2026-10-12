// Global on-device image classifier. A small EfficientNet (quantized) names
// what the camera sees; the LLM then reacts to that word in character. Like the
// LLM controller, the model is a singleton outside any screen so navigation
// never interrupts a download. Frames are classified locally — nothing leaves
// the device.

import { ClassificationModule, models } from 'react-native-executorch';
import { create } from 'zustand';

const MODEL = models.classification.efficientnet_v2_s({ quant: true });

type VisionStatus = 'idle' | 'loading' | 'ready' | 'error';

type VisionStore = {
  status: VisionStatus;
  downloadProgress: number; // 0..1
  error: string | null;
  /** Download (once) and load the classifier. Safe to call repeatedly. */
  load: () => Promise<void>;
  /** Classify a captured image; resolves to a human label (e.g. "broccoli"). */
  classify: (uri: string) => Promise<string | null>;
};

// ImageNet labels arrive as UPPER_SNAKE enum keys → a human phrase.
function humanize(key: string): string {
  return key.toLowerCase().replace(/_/g, ' ').trim();
}

// native handle lives outside store state (not serializable)
let model: Awaited<ReturnType<typeof ClassificationModule.fromModelName>> | null = null;

export const useVisionStore = create<VisionStore>((set, get) => ({
  status: 'idle',
  downloadProgress: 0,
  error: null,

  load: async () => {
    const { status } = get();
    if (status === 'loading' || status === 'ready') return;
    set({ status: 'loading', error: null });
    try {
      model = await ClassificationModule.fromModelName(MODEL, (p: number) =>
        set({ downloadProgress: p }),
      );
      set({ status: 'ready' });
    } catch (e) {
      set({ status: 'error', error: String(e) });
    }
  },

  classify: async (uri: string) => {
    if (!model) return null;
    try {
      const scores = (await model.forward(uri)) as Record<string, number>;
      let bestKey = '';
      let best = -Infinity;
      for (const [key, score] of Object.entries(scores)) {
        if (score > best) {
          best = score;
          bestKey = key;
        }
      }
      return bestKey ? humanize(bestKey) : null;
    } catch (e) {
      set({ error: String(e) });
      return null;
    }
  },
}));
