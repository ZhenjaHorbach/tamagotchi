#!/usr/bin/env node
/**
 * Generates assets/sprites/pet-sheet.png — a placeholder pixel-art sprite sheet.
 *
 * Layout: 5 rows (moods: happy, neutral, sad, sleepy, hungry) × 4 columns
 * (animation frames), each frame 16×16 px. Pure Node (zlib), no native deps.
 * Real art from PixelLab drops in later with the same layout.
 */
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

const FRAME = 16;
const MOODS = ['happy', 'neutral', 'sad', 'sleepy', 'hungry'];
const FRAMES = 4;

// palette (terra: warm gold body, dark ink outline)
const C = {
  _: [0, 0, 0, 0], // transparent
  O: [0x33, 0x29, 0x1a, 255], // outline / ink
  B: [0xc9, 0xa2, 0x4b, 255], // body gold
  L: [0xe3, 0xd4, 0xb4, 255], // light belly
  R: [0xa6, 0x55, 0x2f, 255], // rust (mouth/cheeks)
  W: [0xf1, 0xe8, 0xd5, 255], // cream (eye shine / zzz)
};

function blank() {
  return Array.from({ length: FRAME }, () => Array(FRAME).fill('_'));
}

// filled ellipse centred at (cx, cy)
function ellipse(g, cx, cy, rx, ry, ch) {
  for (let y = 0; y < FRAME; y++) {
    for (let x = 0; x < FRAME; x++) {
      const dx = (x - cx) / rx;
      const dy = (y - cy) / ry;
      if (dx * dx + dy * dy <= 1) g[y][x] = ch;
    }
  }
}

function set(g, x, y, ch) {
  if (y >= 0 && y < FRAME && x >= 0 && x < FRAME) g[y][x] = ch;
}

// outline every body pixel that touches transparency
function outline(g) {
  const isBody = (x, y) => y >= 0 && y < FRAME && x >= 0 && x < FRAME && g[y][x] !== '_';
  for (let y = 0; y < FRAME; y++) {
    for (let x = 0; x < FRAME; x++) {
      if (g[y][x] === '_') continue;
      if (!isBody(x - 1, y) || !isBody(x + 1, y) || !isBody(x, y - 1) || !isBody(x, y + 1)) {
        g[y][x] = 'O';
      }
    }
  }
}

function drawFrame(mood, frame) {
  const g = blank();
  // breathing squash: frames 0,2 tall; 1 squashed; 3 stretched a hair
  const squash = frame === 1 ? 1 : frame === 3 ? -0.4 : 0;
  const ry = 5.6 - squash * 0.7;
  const cy = 9.4 + squash * 0.6;
  ellipse(g, 7.5, cy, 6.2 + squash * 0.4, ry, 'B'); // body
  ellipse(g, 7.5, cy + 2.2, 3.6, ry - 2.6, 'L'); // belly
  // little ears
  set(g, 4, Math.round(cy - ry) - 1, 'B');
  set(g, 11, Math.round(cy - ry) - 1, 'B');
  outline(g);

  const eyeY = Math.round(cy - 1.8);
  const blink = frame === 2; // blink on third frame
  const closed = mood === 'sleepy';
  for (const ex of [5, 10]) {
    if (closed || blink) {
      set(g, ex, eyeY, 'O');
      set(g, ex + (ex === 5 ? 1 : -1), eyeY, 'O');
    } else {
      set(g, ex, eyeY, 'O');
      set(g, ex, eyeY - 1, 'O');
      set(g, ex + (ex === 5 ? 1 : -1), eyeY - 1, 'W'); // shine
    }
  }

  const mouthY = eyeY + 3;
  if (mood === 'happy') {
    set(g, 6, mouthY, 'O');
    set(g, 7, mouthY + 1, 'O');
    set(g, 8, mouthY + 1, 'O');
    set(g, 9, mouthY, 'O');
    set(g, 4, mouthY, 'R'); // cheeks
    set(g, 11, mouthY, 'R');
  } else if (mood === 'neutral') {
    set(g, 7, mouthY, 'O');
    set(g, 8, mouthY, 'O');
  } else if (mood === 'sad') {
    set(g, 6, mouthY + 1, 'O');
    set(g, 7, mouthY, 'O');
    set(g, 8, mouthY, 'O');
    set(g, 9, mouthY + 1, 'O');
    if (frame % 2 === 0) set(g, 3, eyeY + 1, 'W'); // tear
  } else if (mood === 'sleepy') {
    set(g, 7, mouthY, 'O');
    // floating zzz, drifts up across frames
    const zx = 13;
    const zy = 3 - (frame % 2);
    set(g, zx, zy, 'W');
    set(g, zx - 1, zy + 1, 'W');
    set(g, zx, zy + 2, 'W');
  } else {
    // hungry: open mouth, grows with frames
    set(g, 7, mouthY, 'O');
    set(g, 8, mouthY, 'O');
    if (frame % 2 === 1) {
      set(g, 7, mouthY + 1, 'R');
      set(g, 8, mouthY + 1, 'R');
    }
  }
  return g;
}

// ── compose sheet ─────────────────────────────────────────────────────────────
const W = FRAME * FRAMES;
const H = FRAME * MOODS.length;
const px = Buffer.alloc(W * H * 4);
MOODS.forEach((mood, row) => {
  for (let f = 0; f < FRAMES; f++) {
    const g = drawFrame(mood, f);
    for (let y = 0; y < FRAME; y++) {
      for (let x = 0; x < FRAME; x++) {
        const [r, gg, b, a] = C[g[y][x]];
        const i = ((row * FRAME + y) * W + f * FRAME + x) * 4;
        px[i] = r;
        px[i + 1] = gg;
        px[i + 2] = b;
        px[i + 3] = a;
      }
    }
  }
});

// ── minimal PNG encoder ───────────────────────────────────────────────────────
function crc32(buf) {
  let c,
    table = crc32.table;
  if (!table) {
    table = crc32.table = [];
    for (let n = 0; n < 256; n++) {
      c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c >>> 0;
    }
  }
  c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0);
ihdr.writeUInt32BE(H, 4);
ihdr[8] = 8; // bit depth
ihdr[9] = 6; // color type RGBA
// scanlines with filter byte 0
const raw = Buffer.alloc(H * (W * 4 + 1));
for (let y = 0; y < H; y++) {
  px.copy(raw, y * (W * 4 + 1) + 1, y * W * 4, (y + 1) * W * 4);
}
const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', ihdr),
  chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
  chunk('IEND', Buffer.alloc(0)),
]);

const out = path.join(__dirname, '..', 'assets', 'sprites', 'pet-sheet.png');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, png);
console.log(`wrote ${out} (${W}×${H}, ${png.length} bytes)`);
