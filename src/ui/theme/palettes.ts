export type Palette = {
  cream: string;
  sand: string;
  gold: string;
  rust: string;
  olive: string;
  ink: string;
  nightBg: string;
  nightInk: string;
  nightAcc: string;
};

export const PALETTES: Record<string, Palette> = {
  earth: {
    cream: '#F1E8D5',
    sand: '#E3D4B4',
    gold: '#C9A24B',
    rust: '#A6552F',
    olive: '#6E7E55',
    ink: '#33291A',
    nightBg: '#20212E',
    nightInk: '#E6DFEE',
    nightAcc: '#8E86B4',
  },
  clay: {
    cream: '#F4E6D2',
    sand: '#EAD6BC',
    gold: '#E0985F',
    rust: '#C56A4E',
    olive: '#7A8B6F',
    ink: '#3A2A20',
    nightBg: '#222232',
    nightInk: '#EADFE6',
    nightAcc: '#9488AC',
  },
  orchard: {
    cream: '#F1E7D6',
    sand: '#E6D6BE',
    gold: '#D98C5F',
    rust: '#B5495B',
    olive: '#5E8C7D',
    ink: '#34232A',
    nightBg: '#1F2230',
    nightInk: '#E6DDE8',
    nightAcc: '#7E8FB0',
  },
  dusk: {
    cream: '#F3E4DA',
    sand: '#ECD4C6',
    gold: '#E0856E',
    rust: '#C26A88',
    olive: '#8A7BA8',
    ink: '#3A2A2E',
    nightBg: '#24222E',
    nightInk: '#ECDEEA',
    nightAcc: '#A586B0',
  },
};

export const DEFAULT_PALETTE = PALETTES.earth;
