import type {
  CharacterClass,
  ChatToolName,
  SRDCategory,
  SRDEntry,
  Spell,
} from '@dungeon-tools/shared';

import srdData from '@/assets/srd/srd-5.1.json';
import { getSpell, searchSpells } from '@/data/spells';
import { useCharacters } from '@/stores/characters';
import { useSpellList } from '@/stores/spellList';
import { listSpellListKeys } from '@/db/queries';

const SRD_ENTRIES = srdData as SRDEntry[];
const SPELL_RESULT_LIMIT = 35;
const SRD_RESULT_LIMIT = 25;

interface SearchSpellsArgs {
  query?: string;
  level?: number;
  charClass?: CharacterClass;
}

interface SearchSRDArgs {
  query: string;
  category?: SRDCategory;
}

function rankSRD(entry: SRDEntry, q: string): number {
  const name = entry.name.toLowerCase();
  if (name === q) return 0;
  if (name.startsWith(q)) return 1;
  if (name.includes(q)) return 2;
  if (entry.tags.some((t) => t === q)) return 3;
  if (entry.tags.some((t) => t.includes(q))) return 4;
  if (entry.body.toLowerCase().includes(q)) return 5;
  return Infinity;
}

export async function runTool(
  name: ChatToolName,
  input: unknown,
): Promise<unknown> {
  switch (name) {
    case 'searchSpells': {
      const args = (input ?? {}) as SearchSpellsArgs;
      const matches = searchSpells({
        query: args.query,
        level: typeof args.level === 'number' ? args.level : null,
        charClass: args.charClass ?? null,
      });
      return {
        count: matches.length,
        truncated: matches.length > SPELL_RESULT_LIMIT,
        spells: matches.slice(0, SPELL_RESULT_LIMIT),
      };
    }

    case 'searchSRD': {
      const args = (input ?? {}) as SearchSRDArgs;
      const q = (args.query ?? '').toLowerCase().trim();
      if (!q) {
        return { count: 0, truncated: false, entries: [] };
      }
      const pool = args.category
        ? SRD_ENTRIES.filter((e) => e.category === args.category)
        : SRD_ENTRIES;
      const matches = pool
        .map((e) => ({ entry: e, rank: rankSRD(e, q) }))
        .filter((r) => Number.isFinite(r.rank))
        .sort((a, b) => a.rank - b.rank || a.entry.name.localeCompare(b.entry.name));
      const totalMatches = matches.length;
      const entries = matches.slice(0, SRD_RESULT_LIMIT).map(({ entry }) => entry);
      return {
        count: totalMatches,
        returned: entries.length,
        truncated: totalMatches > SRD_RESULT_LIMIT,
        entries,
      };
    }

    case 'getActiveCharacter': {
      const character = useCharacters.getState().character;
      return { character };
    }

    case 'listCharacterSpells': {
      const character = useCharacters.getState().character;
      if (!character) return { character: null, spells: [] };

      // The Spells screen lazy-loads keys on focus, so the store may not have
      // them yet when the goblin asks. Pull straight from SQLite if needed.
      const spellList = useSpellList.getState();
      let keys: string[];
      if (spellList.loadedForCharacterId === character.id) {
        keys = [...spellList.keys];
      } else {
        keys = await listSpellListKeys(character.id);
      }

      const spells = keys
        .map((k) => getSpell(k))
        .filter((s): s is Spell => s != null);
      return {
        character: {
          name: character.name,
          race: character.race,
          class: character.class,
          level: character.level,
        },
        spells,
      };
    }

    default: {
      const exhaustive: never = name;
      throw new Error(`Unknown tool: ${exhaustive as string}`);
    }
  }
}

export function buildActiveCharacterSummary(): string | undefined {
  const character = useCharacters.getState().character;
  if (!character) return undefined;
  return `${character.name}, level ${character.level} ${character.race} ${character.class}`;
}
