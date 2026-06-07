// English — the source locale. Keys mirror the screen structure.
// Note: pixel-font (Silkscreen) chrome strings (TERRA·POCKET, AI LAB, tab
// labels, metrics) stay untranslated by design — they're molded into the toy.

const en = {
  nav: {
    home: 'Home',
    habitat: 'Habitat',
    settings: 'Settings',
  },
  common: {
    settings: 'Settings',
  },
  mood: {
    happy: { label: 'Content', tagline: 'basking' },
    neutral: { label: 'Calm', tagline: 'pottering about' },
    sad: { label: 'Lonely', tagline: 'a little blue' },
    sleepy: { label: 'Sleepy', tagline: 'dozing off' },
    hungry: { label: 'Peckish', tagline: 'tummy rumbling' },
  },
  habitat: {
    hunger: 'Hunger',
    joy: 'Joy',
    energy: 'Energy',
    feed: 'Feed',
    play: 'Play',
    sleep: 'Sleep',
  },
  shelf: {
    title: 'Your pocket',
    sub: 'one little creature, and room for more',
    empty: 'empty',
    hatchOne: 'hatch one',
    footer: 'every creature lives on this device',
  },
  settings: {
    title: 'Settings',
    privacyTitle: 'Everything runs on your device',
    privacyBody:
      '{{name}}’s mind, memories and replies never leave this phone. No account, no cloud — it works in airplane mode.',
    reminders: 'Reminders',
    remindersSub: 'let {{name}} nudge you when it’s peckish',
    sound: 'Sound & haptics',
    soundSub: 'little chirps and gentle taps',
    how: 'How {{name}} thinks',
    howSub: 'about the little on-device mind',
    aboutText:
      '{{name}}’s personality and replies are dreamed up by a small language model running entirely on your phone. The more time you spend together, the more it settles into its own little self — and none of it is ever uploaded.',
    aiLab: 'AI Lab',
    aiLabSub: 'talk to the little mind directly',
    language: 'Language',
    languageSub: 'how {{name}} talks to you',
    reset: 'Reset & hatch a new pet',
    resetArmed: 'tap again — this says goodbye to {{name}}',
  },
  language: {
    title: 'Language',
    sub: 'pick the words for your world',
  },
  ailab: {
    statusError: 'model failed to load',
    statusFetching: 'fetching the little mind… {{pct}}%',
    statusWaking: 'waking the little mind…',
    statusThinking: 'thinking…',
    statusReady: 'on-device · ready',
    placeholder: 'ask {{name}} anything…',
    ask: 'Ask',
    stop: 'Stop',
  },
};

export default en;
