// AI Lab — opened from Settings. The model itself lives in the global LLM
// store, so navigating away never interrupts a download or generation.

import { useRouter } from 'expo-router';

import { usePetName } from '@/ai/personality-store';
import { AiLabScreen } from '@/ui/screens/ai-lab-screen';

export default function AiLabRoute() {
  const router = useRouter();
  const name = usePetName();
  return <AiLabScreen name={name} onBack={() => router.back()} />;
}
