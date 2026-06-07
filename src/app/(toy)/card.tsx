// Personality card — opened by tapping the nameplate on the habitat.

import { useRouter } from 'expo-router';

import { usePersonalityStore } from '@/ai/personality-store';
import { usePetStore } from '@/state/pet-store';
import { PersonalityCardScreen } from '@/ui/screens/personality-card-screen';

export default function CardRoute() {
  const router = useRouter();
  const card = usePersonalityStore((s) => s.card);
  const bornAt = usePetStore((s) => s.pet?.bornAt ?? 0);

  if (!card) return null;
  return <PersonalityCardScreen card={card} bornAt={bornAt} onBack={() => router.back()} />;
}
