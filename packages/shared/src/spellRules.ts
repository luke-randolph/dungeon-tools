import { CLASS_LABELS, type Character } from './character';
import type { Spell } from './spell';

export function minCharLevelForSpell(spellLevel: number): number {
  if (spellLevel <= 1) return 1;
  return 2 * spellLevel - 1;
}

export function classMismatch(
  character: Pick<Character, 'class'>,
  spell: Pick<Spell, 'classes'>,
): boolean {
  return !spell.classes.includes(character.class);
}

export function levelTooHigh(
  character: Pick<Character, 'level'>,
  spell: Pick<Spell, 'level'>,
): boolean {
  return character.level < minCharLevelForSpell(spell.level);
}

export interface SpellWarning {
  kind: 'class' | 'level';
  message: string;
}

export function spellWarnings(
  character: Pick<Character, 'name' | 'class' | 'level'>,
  spell: Pick<Spell, 'name' | 'level' | 'classes'>,
): SpellWarning[] {
  const out: SpellWarning[] = [];
  if (classMismatch(character, spell)) {
    out.push({
      kind: 'class',
      message: `${spell.name} isn't on the ${CLASS_LABELS[character.class]} spell list.`,
    });
  }
  if (levelTooHigh(character, spell)) {
    const required = minCharLevelForSpell(spell.level);
    out.push({
      kind: 'level',
      message: `${character.name} is level ${character.level}; ${spell.name} (level ${spell.level}) typically requires character level ${required}.`,
    });
  }
  return out;
}
