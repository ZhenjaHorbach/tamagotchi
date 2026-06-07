import { Stack } from 'expo-router';

import { usePetLifecycle } from '@/hooks/use-pet-lifecycle';

export default function RootLayout() {
  usePetLifecycle();
  return <Stack screenOptions={{ headerShown: false }} />;
}
