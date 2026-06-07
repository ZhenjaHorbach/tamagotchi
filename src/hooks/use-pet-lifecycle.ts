import { useEffect } from 'react';
import { AppState } from 'react-native';

import { usePetStore } from '@/state/pet-store';

/**
 * App-level pet heartbeat: bootstrap from SQLite on mount and re-apply
 * elapsed decay whenever the app returns to the foreground.
 */
export function usePetLifecycle() {
  const bootstrap = usePetStore((s) => s.bootstrap);
  const refresh = usePetStore((s) => s.refresh);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });
    return () => subscription.remove();
  }, [refresh]);
}
