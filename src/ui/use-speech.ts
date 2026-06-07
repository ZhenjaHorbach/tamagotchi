import { useCallback, useEffect, useRef, useState } from 'react';

import { LINES, type LineKey } from './lines';
import { useTypewriter } from './components/use-typewriter';

export function useSpeech() {
  const [text, setText] = useState('');
  const [gen, setGen] = useState(0);
  const [thinking, setThinking] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastLine = useRef('');

  const speak = useCallback((key: LineKey) => {
    const pool = LINES[key];
    let line: string;
    do {
      line = pool[Math.floor(Math.random() * pool.length)];
    } while (pool.length > 1 && line === lastLine.current);
    lastLine.current = line;

    if (timer.current) clearTimeout(timer.current);
    setThinking(true);
    timer.current = setTimeout(
      () => {
        setThinking(false);
        setText(line);
        setGen((g) => g + 1);
      },
      620 + Math.random() * 520,
    );
  }, []);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const typed = useTypewriter(text, { active: !thinking, gen });
  return {
    speak,
    speech: { shown: thinking ? '' : typed.shown, done: typed.done, thinking },
  };
}
