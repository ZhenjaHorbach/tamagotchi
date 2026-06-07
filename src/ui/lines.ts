// Canned speech lines from the design prototype. On day 4 these get replaced
// by the on-device SLM; the streaming pipeline stays the same.

export const LINES = {
  greet: [
    'oh! you’re back. i kept your spot warm.',
    'hi hi hi — did you bring snacks? no? that’s okay. mostly okay.',
    'you found me. i was just… reorganising my pebbles.',
  ],
  feed: [
    'mmf— okay that’s the good stuff. toast-crumb supremacy.',
    'oh THANK you, i was about to gnaw the furniture.',
    '*happy crunching* …you didn’t see that.',
  ],
  play: [
    'again! again! okay maybe one more then i flop.',
    'i’m extremely good at this, don’t fact-check me.',
    'wheee— okay i’m a little dizzy now. worth it.',
  ],
  sleep: [
    'mmh… five more minutes. or five hundred. *yawn*',
    'tucking in. wake me if a snack situation develops.',
    'g’night — i’ll be dreaming about apricots, probably.',
  ],
  hungry: [
    'psst. tummy update: it’s rumbling. just so you know.',
    'i’m not SAYING feed me, but i’m looking at you meaningfully.',
  ],
  sad: [
    'it got a bit quiet in here… you’re still there, right?',
    'i’m okay. just a small grey-cloud kind of day.',
  ],
  happy: [
    'today feels like a sun-on-the-floor kind of day.',
    'everything is, against all odds, pretty great.',
  ],
  neutral: ['just pottering. i rearranged a leaf. big day.', 'do you ever just… vibe? i’m vibing.'],
} as const;

export type LineKey = keyof typeof LINES;
