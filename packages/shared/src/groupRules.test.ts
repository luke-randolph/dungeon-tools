import { describe, expect, it } from 'vitest';

import {
  getChildren,
  getParent,
  isParent,
  resolveMaxPicks,
  resolveScalingTier,
} from './groupRules';

interface TestEntry {
  key: string;
  level: number;
  parentKey?: string;
  maxPicks?: number;
  scalingKey?: string;
}

const fightingStyle: TestEntry[] = [
  { key: 'fighter-fighting-style', level: 1, maxPicks: 1 },
  { key: 'fs-archery', level: 1, parentKey: 'fighter-fighting-style' },
  { key: 'fs-defense', level: 1, parentKey: 'fighter-fighting-style' },
  { key: 'fs-dueling', level: 1, parentKey: 'fighter-fighting-style' },
];

const actionSurge: TestEntry[] = [
  { key: 'action-surge-1-use', level: 2, scalingKey: 'action-surge' },
  { key: 'action-surge-2-uses', level: 17, scalingKey: 'action-surge' },
];

const metamagic: TestEntry[] = [
  {
    key: 'metamagic-1',
    level: 3,
    maxPicks: 2,
    scalingKey: 'metamagic',
  },
  {
    key: 'metamagic-2',
    level: 10,
    maxPicks: 3,
    scalingKey: 'metamagic',
  },
  {
    key: 'metamagic-3',
    level: 17,
    maxPicks: 4,
    scalingKey: 'metamagic',
  },
  { key: 'metamagic-careful-spell', level: 3, parentKey: 'metamagic-1' },
];

describe('getParent', () => {
  it('returns the parent entry for a child', () => {
    const child = fightingStyle[1];
    expect(getParent(child, fightingStyle)?.key).toBe('fighter-fighting-style');
  });

  it('returns undefined when the entry has no parentKey', () => {
    expect(getParent(fightingStyle[0], fightingStyle)).toBeUndefined();
  });
});

describe('getChildren', () => {
  it('returns all entries with parentKey matching the parent', () => {
    const children = getChildren(fightingStyle[0], fightingStyle);
    expect(children.map((c) => c.key).sort()).toEqual([
      'fs-archery',
      'fs-defense',
      'fs-dueling',
    ]);
  });

  it('returns an empty list for a leaf entry', () => {
    expect(getChildren(fightingStyle[1], fightingStyle)).toEqual([]);
  });
});

describe('isParent', () => {
  it('is true when maxPicks is set', () => {
    expect(isParent(fightingStyle[0])).toBe(true);
  });

  it('is false otherwise', () => {
    expect(isParent(fightingStyle[1])).toBe(false);
  });
});

describe('resolveScalingTier', () => {
  it('returns undefined when no variant qualifies', () => {
    expect(resolveScalingTier('action-surge', 1, actionSurge)).toBeUndefined();
  });

  it('returns the lowest tier when only it qualifies', () => {
    expect(resolveScalingTier('action-surge', 5, actionSurge)?.key).toBe(
      'action-surge-1-use',
    );
  });

  it('returns the highest tier whose level is at or below the character level', () => {
    expect(resolveScalingTier('action-surge', 17, actionSurge)?.key).toBe(
      'action-surge-2-uses',
    );
    expect(resolveScalingTier('action-surge', 20, actionSurge)?.key).toBe(
      'action-surge-2-uses',
    );
  });

  it('ignores entries from other chains', () => {
    const mixed: TestEntry[] = [...actionSurge, ...metamagic];
    expect(resolveScalingTier('action-surge', 20, mixed)?.key).toBe(
      'action-surge-2-uses',
    );
  });
});

describe('resolveMaxPicks', () => {
  it('returns parent.maxPicks when the parent has no scalingKey', () => {
    expect(resolveMaxPicks(fightingStyle[0], 10, fightingStyle)).toBe(1);
  });

  it('returns the current tier maxPicks when the parent scales', () => {
    expect(resolveMaxPicks(metamagic[0], 3, metamagic)).toBe(2);
    expect(resolveMaxPicks(metamagic[0], 9, metamagic)).toBe(2);
    expect(resolveMaxPicks(metamagic[0], 10, metamagic)).toBe(3);
    expect(resolveMaxPicks(metamagic[0], 17, metamagic)).toBe(4);
  });

  it('falls back to the parent maxPicks if the character does not yet qualify for any tier', () => {
    expect(resolveMaxPicks(metamagic[0], 1, metamagic)).toBe(2);
  });
});
