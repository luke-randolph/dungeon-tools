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

// Lower score = closer match: exact name, then verbatim substring, then loose.
function spellRank(name: string, query: string): number {
  if (name === query) return 0;
  if (name.includes(query)) return 1;
  return 2;
}

export function searchSpells(opts: SpellQuery = {}): Spell[] {
  const q = opts.query?.toLowerCase().trim();
  // Match each query word independently, so word order and gaps don't matter.
  const terms = q ? q.split(/\s+/) : [];

  const matches = ALL_SPELLS.filter((s) => {
    const name = s.name.toLowerCase();
    if (terms.length && !terms.every((t) => name.includes(t))) return false;
    if (opts.level != null && s.level !== opts.level) return false;
    if (opts.charClass && !s.classes.includes(opts.charClass)) return false;
    return true;
  });

  if (!q) return matches;
  return matches.sort(
    (a, b) =>
      spellRank(a.name.toLowerCase(), q) - spellRank(b.name.toLowerCase(), q) ||
      a.name.length - b.name.length,
  );
}
