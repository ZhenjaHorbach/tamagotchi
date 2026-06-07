import { AXIS_IDS, FOOD_DISLIKES, FOOD_LIKES, selectionToModifiers } from '@/core';

import {
  buildPersonalityPrompt,
  fallbackPersonality,
  generateName,
  parsePersonality,
  type Personality,
} from '../personality';

const VALID = {
  name: 'Pip',
  temperament: 'sassy',
  boldness: 'brave',
  energyType: 'energetic',
  appetite: 'glutton',
  neediness: 'clingy',
  playfulness: 'playful',
  rhythm: 'night_owl',
  likesFood: ['fish', 'berries'],
  dislikes: ['carrots'],
  quirk: 'collects pebbles',
};

describe('parsePersonality', () => {
  it('parses clean JSON with all valid ids', () => {
    expect(parsePersonality(JSON.stringify(VALID))).toEqual(VALID);
  });

  it('extracts JSON wrapped in prose / fences / think block', () => {
    expect(parsePersonality(`bla\n${JSON.stringify(VALID)}`)?.temperament).toBe('sassy');
    expect(parsePersonality('```json\n' + JSON.stringify(VALID) + '\n```')).toEqual(VALID);
    expect(parsePersonality(`<think>...</think>${JSON.stringify(VALID)}`)).toEqual(VALID);
  });

  it('is case-insensitive on ids', () => {
    expect(parsePersonality(JSON.stringify({ ...VALID, temperament: 'SASSY' }))?.temperament).toBe(
      'sassy',
    );
  });

  it('rejects an unknown axis id', () => {
    expect(parsePersonality(JSON.stringify({ ...VALID, appetite: 'ravenous' }))).toBeNull();
  });

  it('caps likesFood at 2 and dedupes', () => {
    const p = parsePersonality(
      JSON.stringify({ ...VALID, likesFood: ['fish', 'fish', 'bread', 'honey'] }),
    );
    expect(p?.likesFood).toEqual(['fish', 'bread']);
  });

  it('drops unknown foods, keeps known ones', () => {
    const p = parsePersonality(JSON.stringify({ ...VALID, likesFood: ['pizza', 'soup'] }));
    expect(p?.likesFood).toEqual(['soup']);
  });

  it('allows empty dislikes', () => {
    const p = parsePersonality(JSON.stringify({ ...VALID, dislikes: [] }));
    expect(p?.dislikes).toEqual([]);
  });

  it('keeps a free-text quirk', () => {
    const p = parsePersonality(JSON.stringify({ ...VALID, quirk: 'sneezes glitter' }));
    expect(p?.quirk).toBe('sneezes glitter');
  });

  it('takes the first word of a messy name and capitalizes it', () => {
    expect(parsePersonality(JSON.stringify({ ...VALID, name: 'sir fluffington' }))?.name).toBe(
      'Sir',
    );
    expect(parsePersonality(JSON.stringify({ ...VALID, name: 'pip!' }))?.name).toBe('Pip');
  });

  it('rejects a missing or too-long name', () => {
    const { name, ...noName } = VALID;
    void name;
    expect(parsePersonality(JSON.stringify(noName))).toBeNull();
    expect(parsePersonality(JSON.stringify({ ...VALID, name: 'a' }))).toBeNull();
  });

  it('returns null on malformed JSON / junk / missing axis', () => {
    expect(parsePersonality('{ bad json }')).toBeNull();
    expect(parsePersonality('nothing here')).toBeNull();
    const { rhythm, ...partial } = VALID;
    void rhythm;
    expect(parsePersonality(JSON.stringify(partial))).toBeNull();
  });

  it('returns null when likesFood has no valid entry', () => {
    expect(parsePersonality(JSON.stringify({ ...VALID, likesFood: ['pizza'] }))).toBeNull();
  });

  it('produces a selection usable by the core modifier engine', () => {
    const p = parsePersonality(JSON.stringify(VALID))!;
    const m = selectionToModifiers(p);
    expect(m.hungerDecay).toBeCloseTo(1.5); // glutton
    expect(m.joyDecay).toBeCloseTo(1.4); // clingy
  });
});

describe('generateName', () => {
  it('is deterministic per seed and a valid name', () => {
    const a = generateName(1_700_000_000_000);
    expect(generateName(1_700_000_000_000)).toBe(a);
    expect(a.length).toBeGreaterThanOrEqual(2);
    expect(a[0]).toBe(a[0].toUpperCase());
  });

  it('varies across seeds', () => {
    const names = new Set([0, 1, 2, 3, 4, 5, 6, 7].map((s) => generateName(s * 1000)));
    expect(names.size).toBeGreaterThan(1);
  });
});

describe('fallbackPersonality', () => {
  it('is deterministic and always valid', () => {
    for (const born of [0, 1_700_000_000_000, 42, 999_999]) {
      const p = fallbackPersonality(born);
      expect(fallbackPersonality(born)).toEqual(p);
      expect(p.name.length).toBeGreaterThanOrEqual(2);
      expect(AXIS_IDS.temperament).toContain(p.temperament);
      expect(AXIS_IDS.appetite).toContain(p.appetite);
      expect(AXIS_IDS.rhythm).toContain(p.rhythm);
      p.likesFood.forEach((f) => expect(FOOD_LIKES).toContain(f as (typeof FOOD_LIKES)[number]));
      p.dislikes.forEach((d) =>
        expect(FOOD_DISLIKES).toContain(d as (typeof FOOD_DISLIKES)[number]),
      );
      expect(p.likesFood.length).toBeGreaterThan(0);
    }
  });

  it('round-trips through parse (the fallback is itself valid output)', () => {
    const p: Personality = fallbackPersonality(123_456);
    expect(parsePersonality(JSON.stringify(p))).toEqual(p);
  });
});

describe('buildPersonalityPrompt', () => {
  it('lists ids and names the language', () => {
    const prompt = buildPersonalityPrompt('Spanish');
    expect(prompt).toContain('Spanish');
    expect(prompt).toContain('glutton');
    expect(prompt).toMatch(/JSON/i);
  });
});
