import type { CharacterClass } from './character';

export function spellListLabel(charClass: CharacterClass | null | undefined): string {
  if (!charClass) return 'Spell List';
  switch (charClass) {
    case 'wizard':
      return 'Spellbook';
    case 'cleric':
    case 'druid':
    case 'paladin':
      return 'Prepared Spells';
    case 'bard':
    case 'sorcerer':
    case 'warlock':
    case 'ranger':
      return 'Spells Known';
    default:
      return 'Spell List';
  }
}
