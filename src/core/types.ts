export type Mood = 'happy' | 'neutral' | 'sad' | 'sleepy' | 'hungry';

export type PetState = {
  hunger: number; // 0..100, higher = hungrier
  joy: number; // 0..100
  energy: number; // 0..100
  lastSeenAt: number; // epoch ms
  bornAt: number; // epoch ms
};
