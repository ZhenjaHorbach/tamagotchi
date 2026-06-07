// Settings tab.

import { useRouter } from 'expo-router';

import { usePetStore } from '@/state/pet-store';
import { PET_NAME } from '@/ui/pet-identity';
import { SettingsScreen } from '@/ui/screens/settings-screen';

export default function SettingsRoute() {
  const router = useRouter();
  const reset = usePetStore((s) => s.reset);

  return (
    <SettingsScreen
      name={PET_NAME}
      onReset={async () => {
        await reset();
        router.replace('/'); // habitat greets the newborn on focus
      }}
      onOpenAiLab={() => router.push('/ai-lab')}
    />
  );
}
