// Home tab — the pet shelf.

import { useRouter } from 'expo-router';

import { deriveMood } from '@/core';
import { usePetStore } from '@/state/pet-store';
import { PET_NAME } from '@/ui/pet-identity';
import { ShelfScreen } from '@/ui/screens/shelf-screen';

export default function ShelfRoute() {
  const router = useRouter();
  const pet = usePetStore((s) => s.pet);
  if (!pet) return null;
  return (
    <ShelfScreen name={PET_NAME} mood={deriveMood(pet)} onEnterPet={() => router.replace('/')} />
  );
}
