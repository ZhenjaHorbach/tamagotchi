// Hatch ceremony — reached from the home shelf's empty slot (or first launch).
// The personality (name + traits) is generated when the egg bursts and shown
// on the reveal; "Say hello" gives birth and persists that card.

import { useRouter } from 'expo-router';
import { useState } from 'react';

import { usePersonalityStore } from '@/ai/personality-store';
import type { Personality } from '@/ai/personality';
import { usePetStore } from '@/state/pet-store';
import { HatchScreen } from '@/ui/screens/hatch-screen';

export default function HatchRoute() {
  const router = useRouter();
  const hatch = usePetStore((s) => s.hatch);
  const prepare = usePersonalityStore((s) => s.prepare);
  const [card, setCard] = useState<Personality | null>(null);

  return (
    <HatchScreen
      card={card}
      onReveal={async () => setCard(await prepare())}
      onComplete={async () => {
        await hatch();
        router.replace('/'); // into the habitat with the newborn
      }}
    />
  );
}
