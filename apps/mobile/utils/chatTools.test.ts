import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SRDEntry, Spell } from '@dungeon-tools/shared';

const { SRD_FIXTURE } = vi.hoisted(() => {
  const fixture: SRDEntry[] = [
    {
      category: 'condition',
      index: 'blinded',
      name: 'Blinded',
      body: 'A blinded creature cannot see.',
      tags: ['blinded', 'condition'],
    },
    {
      category: 'class-feature',
      index: 'sneak-attack',
      name: 'Sneak Attack',
      body: 'Once per turn, you can deal extra damage with a finesse weapon.',
      tags: ['sneak attack', 'rogue', 'class feature'],
    },
    {
      category: 'class-feature',
      index: 'cunning-action',
      name: 'Cunning Action',
      body: 'Take Dash, Disengage, or Hide as a bonus action.',
      tags: ['cunning action', 'rogue', 'class feature'],
    },
    {
      category: 'racial-trait',
      index: 'darkvision',
      name: 'Darkvision',
      body: 'You can see in darkness up to 60 feet.',
      tags: ['darkvision', 'elf', 'dwarf', 'racial trait'],
    },
    {
      category: 'rule-section',
      index: 'sneaking',
      name: 'Sneaking',
      body: 'Stealth rules. Includes how a sneak attack interacts.',
      tags: ['stealth', 'sneaking', 'rule'],
    },
  ];
  return { SRD_FIXTURE: fixture };
});

const FIREBALL: Spell = {
  key: 'fireball',
  name: 'Fireball',
  level: 3,
  school: 'Evocation',
  classes: ['wizard', 'sorcerer'],
  castingTime: '1 action',
  range: '150 feet',
  components: 'V, S, M',
  duration: 'Instantaneous',
  concentration: false,
  ritual: false,
  description: 'A bright streak flashes from your finger...',
};

const MAGIC_MISSILE: Spell = {
  ...FIREBALL,
  key: 'magic-missile',
  name: 'Magic Missile',
  level: 1,
  description: 'You create three glowing darts of magical force.',
};

vi.mock('@/assets/srd/srd-5.1.json', () => ({ default: SRD_FIXTURE }));

vi.mock('@/data/spells', () => ({
  getSpell: vi.fn(),
  searchSpells: vi.fn(),
}));

vi.mock('@/db/queries', () => ({
  listSpellListKeys: vi.fn(),
}));

import { runTool, buildActiveCharacterSummary } from './chatTools';
import { getSpell, searchSpells } from '@/data/spells';
import { listSpellListKeys } from '@/db/queries';
import { useCharacters } from '@/stores/characters';
import { useSpellList } from '@/stores/spellList';

const wizard = {
  id: 7,
  name: 'Eldrin',
  race: 'elf' as const,
  class: 'wizard' as const,
  level: 5,
  createdAt: 0,
  updatedAt: 0,
};

beforeEach(() => {
  vi.clearAllMocks();
  useCharacters.setState({ character: null, characters: [], loaded: false });
  useSpellList.setState({ keys: new Set(), loadedForCharacterId: null });
});

describe('runTool > searchSpells', () => {
  it('forwards the query to searchSpells and wraps the result', async () => {
    vi.mocked(searchSpells).mockReturnValue([FIREBALL, MAGIC_MISSILE]);
    const result = await runTool('searchSpells', {
      query: 'fire',
      level: 3,
      charClass: 'wizard',
    });
    expect(searchSpells).toHaveBeenCalledWith({
      query: 'fire',
      level: 3,
      charClass: 'wizard',
    });
    expect(result).toEqual({
      count: 2,
      truncated: false,
      spells: [FIREBALL, MAGIC_MISSILE],
    });
  });

  it('normalises missing fields and uses null instead of undefined', async () => {
    vi.mocked(searchSpells).mockReturnValue([]);
    await runTool('searchSpells', {});
    expect(searchSpells).toHaveBeenCalledWith({
      query: undefined,
      level: null,
      charClass: null,
    });
  });

  it('truncates large result sets at the spell limit', async () => {
    const big = Array.from({ length: 40 }, (_, i) => ({
      ...FIREBALL,
      key: `spell-${i}`,
      name: `Spell ${i}`,
    }));
    vi.mocked(searchSpells).mockReturnValue(big);
    const result = (await runTool('searchSpells', {})) as {
      count: number;
      truncated: boolean;
      spells: Spell[];
    };
    expect(result.count).toBe(40);
    expect(result.truncated).toBe(true);
    expect(result.spells).toHaveLength(35);
  });
});

describe('runTool > searchSRD', () => {
  it('returns an empty result for a blank query', async () => {
    expect(await runTool('searchSRD', { query: '   ' })).toEqual({
      count: 0,
      truncated: false,
      entries: [],
    });
  });

  it('ranks an exact name match above a body-only match', async () => {
    const result = (await runTool('searchSRD', { query: 'sneak attack' })) as {
      entries: SRDEntry[];
    };
    expect(result.entries[0].index).toBe('sneak-attack');
    expect(result.entries.map((e) => e.index)).toContain('sneaking');
    expect(
      result.entries.findIndex((e) => e.index === 'sneak-attack'),
    ).toBeLessThan(result.entries.findIndex((e) => e.index === 'sneaking'));
  });

  it('matches tag entries', async () => {
    const result = (await runTool('searchSRD', { query: 'rogue' })) as {
      entries: SRDEntry[];
    };
    const indices = result.entries.map((e) => e.index);
    expect(indices).toContain('sneak-attack');
    expect(indices).toContain('cunning-action');
  });

  it('filters by category when supplied', async () => {
    const result = (await runTool('searchSRD', {
      query: 'rogue',
      category: 'class-feature',
    })) as { entries: SRDEntry[] };
    expect(result.entries.every((e) => e.category === 'class-feature')).toBe(
      true,
    );
  });

  it('returns no matches for a string nothing contains', async () => {
    const result = (await runTool('searchSRD', { query: 'xyzzy' })) as {
      count: number;
      entries: SRDEntry[];
    };
    expect(result.count).toBe(0);
    expect(result.entries).toEqual([]);
  });
});

describe('runTool > getActiveCharacter', () => {
  it('returns null when there is no active character', async () => {
    expect(await runTool('getActiveCharacter', {})).toEqual({
      character: null,
    });
  });

  it('returns the active character from the store', async () => {
    useCharacters.setState({ character: wizard });
    expect(await runTool('getActiveCharacter', {})).toEqual({
      character: wizard,
    });
  });
});

describe('runTool > listCharacterSpells', () => {
  it('returns empty when there is no active character', async () => {
    expect(await runTool('listCharacterSpells', {})).toEqual({
      character: null,
      spells: [],
    });
    expect(listSpellListKeys).not.toHaveBeenCalled();
  });

  it('uses the in-memory spell list when already loaded for the active character', async () => {
    useCharacters.setState({ character: wizard });
    useSpellList.setState({
      keys: new Set(['fireball', 'magic-missile']),
      loadedForCharacterId: wizard.id,
    });
    vi.mocked(getSpell).mockImplementation((k) =>
      k === 'fireball'
        ? FIREBALL
        : k === 'magic-missile'
          ? MAGIC_MISSILE
          : undefined,
    );

    const result = (await runTool('listCharacterSpells', {})) as {
      character: { name: string; level: number };
      spells: Spell[];
    };

    expect(listSpellListKeys).not.toHaveBeenCalled();
    expect(result.character).toEqual({
      name: 'Eldrin',
      race: 'elf',
      class: 'wizard',
      level: 5,
    });
    expect(result.spells.map((s) => s.key).sort()).toEqual([
      'fireball',
      'magic-missile',
    ]);
  });

  it('falls back to the DB when the store has not loaded the active character yet', async () => {
    useCharacters.setState({ character: wizard });
    useSpellList.setState({ keys: new Set(), loadedForCharacterId: null });
    vi.mocked(listSpellListKeys).mockResolvedValue(['fireball']);
    vi.mocked(getSpell).mockImplementation((k) =>
      k === 'fireball' ? FIREBALL : undefined,
    );

    const result = (await runTool('listCharacterSpells', {})) as {
      spells: Spell[];
    };

    expect(listSpellListKeys).toHaveBeenCalledWith(wizard.id);
    expect(result.spells).toEqual([FIREBALL]);
  });

  it('drops keys that do not resolve to a known spell', async () => {
    useCharacters.setState({ character: wizard });
    useSpellList.setState({
      keys: new Set(['fireball', 'missing-spell']),
      loadedForCharacterId: wizard.id,
    });
    vi.mocked(getSpell).mockImplementation((k) =>
      k === 'fireball' ? FIREBALL : undefined,
    );

    const result = (await runTool('listCharacterSpells', {})) as {
      spells: Spell[];
    };
    expect(result.spells).toEqual([FIREBALL]);
  });
});

describe('runTool > unknown tool', () => {
  it('throws for an unknown tool name', async () => {
    await expect(runTool('nonexistent' as never, {})).rejects.toThrow(
      /Unknown tool/,
    );
  });
});

describe('buildActiveCharacterSummary', () => {
  it('returns undefined when no character is active', () => {
    expect(buildActiveCharacterSummary()).toBeUndefined();
  });

  it('formats name, level, race, and class', () => {
    useCharacters.setState({ character: wizard });
    expect(buildActiveCharacterSummary()).toBe('Eldrin, level 5 elf wizard');
  });
});
