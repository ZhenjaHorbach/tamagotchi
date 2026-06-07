// Settings tab.

import { useRouter } from 'expo-router';

import { usePetStore } from '@/state/pet-store';
import { usePetName } from '@/ai/personality-store';
import { SettingsScreen } from '@/ui/screens/settings-screen';

export default function SettingsRoute() {
  const router = useRouter();
  const reset = usePetStore((s) => s.reset);
  const name = usePetName();

  return (
    <SettingsScreen
      name={name}
      onReset={async () => {
        await reset();
        router.replace('/shelf'); // no pet now → home shelf, hatch a new one
      }}
      onOpenAiLab={() => router.push('/ai-lab')}
      onOpenLanguage={() => router.push('/language')}
    />
  );
}
