import { createContext, useContext } from 'react';

import { moodTheme, plasticTheme, type Theme } from './mood-theme';

export const FONTS = {
  display: 'PixelifySans_500Medium', // the pet's voice + names
  displayBold: 'PixelifySans_700Bold',
  pixel: 'Silkscreen_400Regular', // tiny mono/pixel labels
  ui: 'Nunito_600SemiBold',
  uiBold: 'Nunito_700Bold',
  uiHeavy: 'Nunito_800ExtraBold',
} as const;

export const PLASTIC = plasticTheme();

const ThemeContext = createContext<Theme>(moodTheme('neutral'));

export const ThemeProvider = ThemeContext.Provider;

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
