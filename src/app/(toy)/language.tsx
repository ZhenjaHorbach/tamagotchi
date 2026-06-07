// Language picker — opened from Settings.

import { useRouter } from 'expo-router';

import { LanguageScreen } from '@/ui/screens/language-screen';

export default function LanguageRoute() {
  const router = useRouter();
  return <LanguageScreen onBack={() => router.back()} />;
}
