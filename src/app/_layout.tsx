import { Stack } from 'expo-router';

import { useAppFonts } from '@/hooks/use-app-fonts';
import { usePetLifecycle } from '@/hooks/use-pet-lifecycle';

export default function RootLayout() {
  usePetLifecycle();
  const fontsLoaded = useAppFonts();

  if (!fontsLoaded) return null;
  return <Stack screenOptions={{ headerShown: false }} />;
}
