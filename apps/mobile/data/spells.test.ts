import { describe, expect, it, vi } from 'vitest';
import type { Spell } from '@dungeon-tools/shared';

const { SPELL_FIXTURE } = vi.hoisted(() => {
  const base = {
    school: 'Evocation',
    castingTime: '1 action',
    range: '150 feet',
    components: 'V, S, M',
    duration: 'Instantaneous',
    concentration: false,
    ritual: false,
    description: '...',
  };
  const fixture: Spell[] = [
    { ...base, key: 'fireball', name: 'Fireball', level: 3, classes: ['wizard', 'sorcerer'] },
    { ...base, key: 'fire-bolt', name: 'Fire Bolt', level: 0, classes: ['wizard'] },
    {
      ...base,
      key: 'delayed-blast-fireball',
      name: 'Delayed Blast Fireball',
      level: 7,
      classes: ['wizard'],
    },
    { ...base, key: 'magic-missile', name: 'Magic Missile', level: 1, classes: ['wizard'] },
  ];
  return { SPELL_FIXTURE: fixture };
});

vi.mock('@/assets/spells/srd-5.1-spells.json', () => ({ default: SPELL_FIXTURE }));

import { searchSpells } from './spells';

describe('searchSpells', () => {
  it('finds a spell when the query omits an inner word', () => {
    const names = searchSpells({ query: 'delayed fireball' }).map((s) => s.name);
    expect(names).toEqual(['Delayed Blast Fireball']);
  });

  it('ignores word order', () => {
    const names = searchSpells({ query: 'fireball delayed' }).map((s) => s.name);
    expect(names).toEqual(['Delayed Blast Fireball']);
  });

  it('ranks an exact name match ahead of a looser one', () => {
    const names = searchSpells({ query: 'fireball' }).map((s) => s.name);
    expect(names).toEqual(['Fireball', 'Delayed Blast Fireball']);
  });

  it('still matches a single-word query as a substring', () => {
    const names = searchSpells({ query: 'fire' }).map((s) => s.name);
    expect(names).toEqual(
      expect.arrayContaining(['Fireball', 'Fire Bolt', 'Delayed Blast Fireball']),
    );
  });

  it('returns nothing when a query word matches no spell', () => {
    expect(searchSpells({ query: 'delayed lightning' })).toEqual([]);
  });

  it('applies level and class filters alongside the query', () => {
    expect(searchSpells({ query: 'fire', level: 3 }).map((s) => s.name)).toEqual([
      'Fireball',
    ]);
    expect(searchSpells({ query: 'fire', charClass: 'sorcerer' }).map((s) => s.name)).toEqual(
      ['Fireball'],
    );
  });

  it('returns every spell for an empty query', () => {
    expect(searchSpells()).toHaveLength(SPELL_FIXTURE.length);
  });
});
