import { useEffect, useState } from 'react';

type Options = {
  speed?: number; // ms per char
  active?: boolean; // false → show instantly
  startDelay?: number;
  gen?: number; // bump to restart even if text repeats
};

type Tape = { key: string; n: number };

export function useTypewriter(text: string, { speed = 30, active = true, startDelay = 0, gen = 0 }: Options = {}) {
  const key = `${gen}:${text}`;
  const [tape, setTape] = useState<Tape>({ key, n: active ? 0 : text.length });

  // new line (or active flipped off) → reset during render, not in an effect
  if (tape.key !== key) {
    setTape({ key, n: active ? 0 : text.length });
  }

  useEffect(() => {
    if (!active || !text) return;
    let i = 0;
    let tick: ReturnType<typeof setInterval> | undefined;
    const start = setTimeout(() => {
      tick = setInterval(() => {
        i += 1;
        const n = Math.min(i, text.length);
        setTape((t) => (t.key === key ? { ...t, n } : t));
        if (i >= text.length && tick) clearInterval(tick);
      }, speed);
    }, startDelay);
    return () => {
      clearTimeout(start);
      if (tick) clearInterval(tick);
    };
  }, [key, text, speed, active, startDelay]);

  const n = tape.key === key ? tape.n : active ? 0 : text.length;
  return { shown: text.slice(0, n), done: !text || n >= text.length };
}
