import '@/ai/init';
import '@/i18n';
import { Stack } from 'expo-router';

import { useAppFonts } from '@/hooks/use-app-fonts';
import { usePetLifecycle } from '@/hooks/use-pet-lifecycle';

export default function RootLayout() {
  usePetLifecycle();
  useAppFonts();

  return <Stack screenOptions={{ headerShown: false }} />;
}
