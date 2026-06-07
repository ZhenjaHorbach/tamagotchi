import type { PetState } from '@/core';

import { getDatabase } from './database';

type PetRow = {
  hunger: number;
  joy: number;
  energy: number;
  last_seen_at: number;
  born_at: number;
};

/** The pet table holds exactly one row (id = 1). */
export async function getPet(): Promise<PetState | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<PetRow>(
    'SELECT hunger, joy, energy, last_seen_at, born_at FROM pet WHERE id = 1',
  );
  if (!row) return null;
  return {
    hunger: row.hunger,
    joy: row.joy,
    energy: row.energy,
    lastSeenAt: row.last_seen_at,
    bornAt: row.born_at,
  };
}

export async function savePet(pet: PetState): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO pet (id, hunger, joy, energy, last_seen_at, born_at)
     VALUES (1, $hunger, $joy, $energy, $lastSeenAt, $bornAt)
     ON CONFLICT(id) DO UPDATE SET
       hunger = excluded.hunger,
       joy = excluded.joy,
       energy = excluded.energy,
       last_seen_at = excluded.last_seen_at,
       born_at = excluded.born_at`,
    {
      $hunger: pet.hunger,
      $joy: pet.joy,
      $energy: pet.energy,
      $lastSeenAt: pet.lastSeenAt,
      $bornAt: pet.bornAt,
    },
  );
}
