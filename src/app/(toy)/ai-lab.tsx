// AI Lab — opened from Settings. The model itself lives in the global LLM
// store, so navigating away never interrupts a download or generation.

import { useRouter } from 'expo-router';

import { PET_NAME } from '@/ui/pet-identity';
import { AiLabScreen } from '@/ui/screens/ai-lab-screen';

export default function AiLabRoute() {
  const router = useRouter();
  return <AiLabScreen name={PET_NAME} onBack={() => router.back()} />;
}
