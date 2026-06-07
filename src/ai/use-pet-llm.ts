// Screen-facing view of the global LLM store. Mounting it anywhere kicks off
// the (idempotent) model load; unmounting never cancels anything.

import { useEffect } from 'react';

import { useLlmStore } from './llm-store';

export { MODEL_LABEL } from './llm-store';
export type { GenMetrics } from './llm-store';

export function usePetLlm() {
  const status = useLlmStore((s) => s.status);
  const downloadProgress = useLlmStore((s) => s.downloadProgress);
  const generating = useLlmStore((s) => s.generating);
  const rawResponse = useLlmStore((s) => s.rawResponse);
  const error = useLlmStore((s) => s.error);
  const metrics = useLlmStore((s) => s.metrics);
  const load = useLlmStore((s) => s.load);
  const generate = useLlmStore((s) => s.generate);
  const interrupt = useLlmStore((s) => s.interrupt);

  useEffect(() => {
    load();
  }, [load]);

  return {
    ready: status === 'ready',
    generating,
    downloadProgress,
    response: stripThink(rawResponse),
    error,
    metrics,
    generate,
    interrupt,
  };
}

/**
 * Qwen3 emits a (with /no_think — empty) <think>…</think> block before the
 * reply. Hide closed blocks and any still-open block while it streams.
 */
function stripThink(text: string): string {
  return text
    .replace(/<think>[\s\S]*?<\/think>/g, '')
    .replace(/<think>[\s\S]*$/, '')
    .trimStart();
}
