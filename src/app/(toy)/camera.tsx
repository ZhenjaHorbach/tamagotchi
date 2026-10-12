// Camera "show me" mode — opened from the small affordance on Habitat. The
// classifier and LLM live in global stores, so navigating here never interrupts
// a download or generation.

import { useRouter } from 'expo-router';

import { usePetName } from '@/ai/personality-store';
import { deriveMood } from '@/core';
import { hashSeed } from '@/render/sprite-gen';
import { usePetStore } from '@/state/pet-store';
import { CameraScreen } from '@/ui/screens/camera-screen';

export default function CameraRoute() {
  const router = useRouter();
  const name = usePetName();
  const pet = usePetStore((s) => s.pet);
  const mood = pet ? deriveMood(pet) : 'neutral';
  return (
    <CameraScreen name={name} seed={hashSeed(name)} mood={mood} onBack={() => router.back()} />
  );
}
