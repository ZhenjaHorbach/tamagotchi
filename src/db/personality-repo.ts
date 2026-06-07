// Single-row store for the generated personality card. Tagged with the pet's
// bornAt so a reset (new pet, new bornAt) invalidates the old card.

import type { Personality } from '@/ai/personality';

import { getDatabase } from './database';

type Row = { json: string; born_at: number };

/** Load the card for this pet, or null if none / it belongs to an older pet. */
export async function getPersonality(bornAt: number): Promise<Personality | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<Row>('SELECT json, born_at FROM personality WHERE id = 1');
  if (!row || row.born_at !== bornAt) return null;
  try {
    return JSON.parse(row.json) as Personality;
  } catch {
    return null;
  }
}

export async function savePersonality(bornAt: number, personality: Personality): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO personality (id, json, born_at) VALUES (1, $json, $bornAt)
     ON CONFLICT(id) DO UPDATE SET json = excluded.json, born_at = excluded.born_at`,
    { $json: JSON.stringify(personality), $bornAt: bornAt },
  );
}

export async function clearPersonality(): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM personality WHERE id = 1');
}
