import type { CharacterClass, Spell } from '@dungeon-tools/shared';
import raw from '@/assets/spells/srd-5.1-spells.json';

export const ALL_SPELLS: readonly Spell[] = raw as Spell[];

const BY_KEY = new Map(ALL_SPELLS.map((s) => [s.key, s]));

export function getSpell(key: string): Spell | undefined {
  return BY_KEY.get(key);
}

export interface SpellQuery {
  query?: string;
  level?: number | null;
  charClass?: CharacterClass | null;
}

export function searchSpells(opts: SpellQuery = {}): Spell[] {
  const q = opts.query?.toLowerCase().trim();
  return ALL_SPELLS.filter((s) => {
    if (q && !s.name.toLowerCase().includes(q)) return false;
    if (opts.level != null && s.level !== opts.level) return false;
    if (opts.charClass && !s.classes.includes(opts.charClass)) return false;
    return true;
  });
}
