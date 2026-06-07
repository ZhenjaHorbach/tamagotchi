import type en from './en';

const pl: typeof en = {
  nav: {
    home: 'Dom',
    habitat: 'Habitat',
    settings: 'Ustawienia',
  },
  common: {
    settings: 'Ustawienia',
  },
  mood: {
    happy: { label: 'Zadowolony', tagline: 'wygrzewa się' },
    neutral: { label: 'Spokojny', tagline: 'krząta się po swojemu' },
    sad: { label: 'Samotny', tagline: 'trochę smutny' },
    sleepy: { label: 'Śpiący', tagline: 'przysypia' },
    hungry: { label: 'Głodny', tagline: 'burczy mu w brzuszku' },
  },
  habitat: {
    hunger: 'Głód',
    joy: 'Radość',
    energy: 'Energia',
    feed: 'Nakarm',
    play: 'Baw się',
    sleep: 'Śpij',
  },
  shelf: {
    title: 'Twoja kieszeń',
    sub: 'jedno stworzonko i miejsce na więcej',
    empty: 'pusto',
    hatchOne: 'wykluj',
    footer: 'każde stworzonko mieszka na tym urządzeniu',
  },
  settings: {
    title: 'Ustawienia',
    privacyTitle: 'Wszystko działa na twoim urządzeniu',
    privacyBody:
      'Myśli, wspomnienia i odpowiedzi {{name}} nigdy nie opuszczają tego telefonu. Bez konta, bez chmury — działa w trybie samolotowym.',
    reminders: 'Przypomnienia',
    remindersSub: 'niech {{name}} da znać, gdy zgłodnieje',
    sound: 'Dźwięk i haptyka',
    soundSub: 'ciche piski i delikatne stuknięcia',
    how: 'Jak myśli {{name}}',
    howSub: 'o małym umyśle w urządzeniu',
    aboutText:
      'Osobowość i odpowiedzi {{name}} wymyśla mały model językowy działający w całości na twoim telefonie. Im więcej czasu spędzacie razem, tym wyraźniejszy staje się jego charakter — i nic z tego nigdzie nie jest wysyłane.',
    aiLab: 'Laboratorium AI',
    aiLabSub: 'porozmawiaj z małym umysłem bezpośrednio',
    language: 'Język',
    languageSub: 'jak mówi do ciebie {{name}}',
    reset: 'Zresetuj i wyklatuj nowego',
    resetArmed: 'stuknij jeszcze raz — to pożegnanie z {{name}}',
  },
  language: {
    title: 'Język',
    sub: 'wybierz słowa swojego świata',
  },
  ailab: {
    statusError: 'nie udało się wczytać modelu',
    statusFetching: 'pobieram mały umysł… {{pct}}%',
    statusWaking: 'budzę mały umysł…',
    statusThinking: 'myślę…',
    statusReady: 'na urządzeniu · gotowy',
    placeholder: 'zapytaj {{name}} o cokolwiek…',
    ask: 'Zapytaj',
    stop: 'Stop',
  },
};

export default pl;
