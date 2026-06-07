function hx(n: number): string {
  return Math.max(0, Math.min(255, Math.round(n)))
    .toString(16)
    .padStart(2, '0');
}

function parse(hex: string): [number, number, number] {
  let h = hex.replace('#', '');
  if (h.length === 3)
    h = h
      .split('')
      .map((c) => c + c)
      .join('');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function rgb(r: number, g: number, b: number): string {
  return '#' + hx(r) + hx(g) + hx(b);
}

/** Linear blend between two hex colors, t in 0..1. */
export function mix(a: string, b: string, t: number): string {
  const A = parse(a);
  const B = parse(b);
  return rgb(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t);
}

/** Hex → rgba() string with the given alpha. */
export function rgba(hex: string, a: number): string {
  const c = parse(hex);
  return `rgba(${c[0]},${c[1]},${c[2]},${a})`;
}

function toHsl([r, g, b]: [number, number, number]): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const mx = Math.max(r, g, b);
  const mn = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (mx + mn) / 2;
  if (mx !== mn) {
    const d = mx - mn;
    s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    switch (mx) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h /= 6;
  }
  return [h * 360, s, l];
}

function fromHsl(h: number, s: number, l: number): string {
  h = (((h % 360) + 360) % 360) / 360;
  const f = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  let r: number, g: number, b: number;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = f(p, q, h + 1 / 3);
    g = f(p, q, h);
    b = f(p, q, h - 1 / 3);
  }
  return rgb(r * 255, g * 255, b * 255);
}

/**
 * Same color with alpha 0 — gradient fades must end in a transparent version
 * of their own color: Skia interpolates straight (non-premultiplied) RGBA, so
 * fading to rgba(0,0,0,0) drags the midpoint through muddy grey.
 */
export function fadeOut(color: string): string {
  const m = color.match(/rgba?\(([^)]+)\)/);
  if (m) {
    const [r, g, b] = m[1].split(',').map((s) => s.trim());
    return `rgba(${r},${g},${b},0)`;
  }
  return rgba(color, 0);
}

/** Adjust hue / saturation / lightness deltas of a hex color. */
export function adj(
  hex: string,
  { dh = 0, ds = 0, dl = 0 }: { dh?: number; ds?: number; dl?: number } = {},
): string {
  const [h, s, l] = toHsl(parse(hex));
  return fromHsl(h + dh, Math.max(0, Math.min(1, s + ds)), Math.max(0, Math.min(1, l + dl)));
}
