import { describe, expect, it } from 'vitest';

import type { Character } from './character';
import type { Spell } from './spell';
import {
  classMismatch,
  levelTooHigh,
  minCharLevelForSpell,
  spellWarnings,
} from './spellRules';

const wizard: Character = {
  id: 1,
  name: 'Eldrin',
  race: 'elf',
  class: 'wizard',
  level: 5,
  createdAt: 0,
  updatedAt: 0,
};

function makeSpell(over: Partial<Spell> = {}): Spell {
  return {
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
    description: '',
    ...over,
  };
}

describe('minCharLevelForSpell', () => {
  it('returns 1 for cantrips', () => {
    expect(minCharLevelForSpell(0)).toBe(1);
  });

  it('returns 1 for 1st-level spells', () => {
    expect(minCharLevelForSpell(1)).toBe(1);
  });

  it('uses 2N-1 for spells of level 2+', () => {
    expect(minCharLevelForSpell(2)).toBe(3);
    expect(minCharLevelForSpell(3)).toBe(5);
    expect(minCharLevelForSpell(4)).toBe(7);
    expect(minCharLevelForSpell(9)).toBe(17);
  });
});

describe('classMismatch', () => {
  it('is false when the class is on the spell list', () => {
    expect(classMismatch(wizard, makeSpell({ classes: ['wizard'] }))).toBe(
      false,
    );
  });

  it('is true when the class is not on the spell list', () => {
    expect(classMismatch(wizard, makeSpell({ classes: ['cleric'] }))).toBe(
      true,
    );
  });
});

describe('levelTooHigh', () => {
  it('is false when character level meets the requirement', () => {
    expect(levelTooHigh({ level: 5 }, { level: 3 })).toBe(false);
  });

  it('is false when character level exceeds the requirement', () => {
    expect(levelTooHigh({ level: 10 }, { level: 3 })).toBe(false);
  });

  it('is true when character level is just below the requirement', () => {
    expect(levelTooHigh({ level: 4 }, { level: 3 })).toBe(true);
  });

  it('treats cantrips as always reachable at level 1', () => {
    expect(levelTooHigh({ level: 1 }, { level: 0 })).toBe(false);
  });
});

describe('spellWarnings', () => {
  it('returns nothing when class and level are fine', () => {
    expect(spellWarnings(wizard, makeSpell())).toEqual([]);
  });

  it('flags a class mismatch', () => {
    const warnings = spellWarnings(
      wizard,
      makeSpell({ name: 'Cure Wounds', classes: ['cleric'] }),
    );
    expect(warnings).toHaveLength(1);
    expect(warnings[0].kind).toBe('class');
    expect(warnings[0].message).toMatch(/Cure Wounds/);
    expect(warnings[0].message).toMatch(/Wizard/);
  });

  it('flags a level requirement that the character has not yet reached', () => {
    const warnings = spellWarnings(
      { ...wizard, level: 4 },
      makeSpell({ level: 3 }),
    );
    expect(warnings).toHaveLength(1);
    expect(warnings[0].kind).toBe('level');
    expect(warnings[0].message).toMatch(/level 4/);
    expect(warnings[0].message).toMatch(/character level 5/);
  });

  it('returns both warnings when class and level are both wrong', () => {
    const warnings = spellWarnings(
      { ...wizard, level: 2 },
      makeSpell({ name: 'Spirit Guardians', level: 3, classes: ['cleric'] }),
    );
    expect(warnings.map((w) => w.kind).sort()).toEqual(['class', 'level']);
  });
});
