// Home tab — the pet shelf. Empty until the player hatches a pet.

import { useRouter } from 'expo-router';

import { deriveMood } from '@/core';
import { usePetName } from '@/ai/personality-store';
import { usePetStore } from '@/state/pet-store';
import { ShelfScreen } from '@/ui/screens/shelf-screen';

export default function ShelfRoute() {
  const router = useRouter();
  const pet = usePetStore((s) => s.pet);
  const name = usePetName();
  return (
    <ShelfScreen
      pet={pet ? { name, mood: deriveMood(pet) } : null}
      onEnterPet={() => router.navigate('/')}
      // one-pet MVP: hatching is only offered when there's no pet
      onAdopt={() => router.push('/hatch')}
    />
  );
}
