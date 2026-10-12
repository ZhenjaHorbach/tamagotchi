import { useEffect } from 'react';
import { AppState } from 'react-native';

import { useLlmStore } from '@/ai/llm-store';
import { usePersonalityStore } from '@/ai/personality-store';
import { useVisionStore } from '@/ai/vision-store';
import { usePetStore } from '@/state/pet-store';
import { useSettingsStore } from '@/state/settings-store';

/**
 * App-level pet heartbeat: bootstrap from SQLite on mount, re-apply elapsed
 * decay when the app returns to the foreground, and make sure the pet has a
 * personality (generated once the model is ready, fallback until then).
 */
export function usePetLifecycle() {
  const bootstrap = usePetStore((s) => s.bootstrap);
  const refresh = usePetStore((s) => s.refresh);
  const bornAt = usePetStore((s) => s.pet?.bornAt);
  const ensurePersonality = usePersonalityStore((s) => s.ensure);
  const loadModel = useLlmStore((s) => s.load);
  const modelReady = useLlmStore((s) => s.status === 'ready');
  const loadVision = useVisionStore((s) => s.load);
  const cameraEnabled = useSettingsStore((s) => s.camera);

  useEffect(() => {
    bootstrap();
    loadModel();
  }, [bootstrap, loadModel]);

  useEffect(() => {
    if (cameraEnabled && modelReady) loadVision();
  }, [cameraEnabled, modelReady, loadVision]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });
    return () => subscription.remove();
  }, [refresh]);

  // ensure a card once the pet exists; re-runs when the model becomes ready so
  // an initial fallback gets upgraded to a generated card (ensure() no-ops once
  // a real card is persisted). Modifiers then take effect on the next action.
  useEffect(() => {
    if (bornAt != null) ensurePersonality(bornAt);
  }, [bornAt, modelReady, ensurePersonality]);
}
