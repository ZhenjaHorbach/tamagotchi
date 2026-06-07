import type en from './en';

const es: typeof en = {
  nav: {
    home: 'Inicio',
    habitat: 'Hábitat',
    settings: 'Ajustes',
  },
  common: {
    settings: 'Ajustes',
  },
  mood: {
    happy: { label: 'Contento', tagline: 'tomando el sol' },
    neutral: { label: 'Tranquilo', tagline: 'a lo suyo' },
    sad: { label: 'Solito', tagline: 'algo tristón' },
    sleepy: { label: 'Soñoliento', tagline: 'cabeceando' },
    hungry: { label: 'Hambriento', tagline: 'le ruge la pancita' },
  },
  habitat: {
    hunger: 'Hambre',
    joy: 'Alegría',
    energy: 'Energía',
    feed: 'Alimentar',
    play: 'Jugar',
    sleep: 'Dormir',
  },
  shelf: {
    title: 'Tu bolsillo',
    sub: 'una criaturita, y sitio para más',
    empty: 'vacío',
    hatchOne: 'incubar',
    footer: 'cada criatura vive en este dispositivo',
  },
  settings: {
    title: 'Ajustes',
    privacyTitle: 'Todo funciona en tu dispositivo',
    privacyBody:
      'La mente, los recuerdos y las respuestas de {{name}} nunca salen de este teléfono. Sin cuenta, sin nube — funciona en modo avión.',
    reminders: 'Recordatorios',
    remindersSub: 'deja que {{name}} te avise cuando tenga hambre',
    sound: 'Sonido y vibración',
    soundSub: 'piditos suaves y toques ligeros',
    how: 'Cómo piensa {{name}}',
    howSub: 'sobre la pequeña mente del dispositivo',
    aboutText:
      'La personalidad y las respuestas de {{name}} las imagina un pequeño modelo de lenguaje que corre por completo en tu teléfono. Cuanto más tiempo pasáis juntos, más se asienta su propio carácter — y nada de esto se sube a ningún sitio.',
    aiLab: 'Laboratorio IA',
    aiLabSub: 'habla con la pequeña mente directamente',
    language: 'Idioma',
    languageSub: 'cómo te habla {{name}}',
    reset: 'Reiniciar e incubar otro',
    resetArmed: 'toca otra vez — esto es despedirse de {{name}}',
  },
  language: {
    title: 'Idioma',
    sub: 'elige las palabras de tu mundo',
  },
  ailab: {
    statusError: 'no se pudo cargar el modelo',
    statusFetching: 'descargando la pequeña mente… {{pct}}%',
    statusWaking: 'despertando la pequeña mente…',
    statusThinking: 'pensando…',
    statusReady: 'en el dispositivo · listo',
    placeholder: 'pregúntale lo que sea a {{name}}…',
    ask: 'Preguntar',
    stop: 'Parar',
  },
};

export default es;
