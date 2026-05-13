import { CLASSES, SRD_CATEGORIES } from '@dungeon-tools/shared';
import { tool } from 'ai';
import { z } from 'zod';

/**
 * Tool schemas exposed to the model. None of them define `execute` — the
 * client runs them locally against the bundled SRD JSON / Zustand stores
 * and returns the result as a follow-up `tool` message.
 */
export const tools = {
  searchSpells: tool({
    description:
      "Search the SRD 5.1 spell catalog. Returns up to 10 matching spells with their full description, level, components, range, etc. Use this for any spell question. Example: searchSpells({ query: 'fireball' }), searchSpells({ level: 3, charClass: 'wizard' }).",
    inputSchema: z.object({
      query: z
        .string()
        .optional()
        .describe('Case-insensitive substring to match against spell names.'),
      level: z
        .number()
        .int()
        .min(0)
        .max(9)
        .optional()
        .describe('Filter by spell level (0 = cantrip, up to 9).'),
      charClass: z
        .enum([...CLASSES] as [string, ...string[]])
        .optional()
        .describe('Filter to spells available to a particular class.'),
    }),
  }),

  searchSRD: tool({
    description:
      "Search the bundled SRD 5.1 content (rules, conditions, skills, class features, racial traits, classes, races, subclasses). Returns up to 8 matching entries with their body text. Use this for rules questions, class features (e.g. 'Sneak Attack', 'Rage'), racial traits (e.g. 'Darkvision', 'Stonecunning'), conditions, and skills. Example: searchSRD({ query: 'sneak attack' }), searchSRD({ query: 'darkvision', category: 'racial-trait' }).",
    inputSchema: z.object({
      query: z
        .string()
        .min(1)
        .describe(
          'A natural-language query. Match against entry name and body. e.g. "stealth", "sneak attack", "darkvision", "advantage".',
        ),
      category: z
        .enum([...SRD_CATEGORIES] as [string, ...string[]])
        .optional()
        .describe(
          'Optional category to narrow the search. Omit to search across all categories.',
        ),
    }),
  }),

  getActiveCharacter: tool({
    description:
      "Returns the user's currently selected character (name, race, class, level). Use this when the user asks about 'my character' or you need character context. Returns null if no character is active.",
    inputSchema: z.object({}),
  }),

  listCharacterSpells: tool({
    description:
      "Returns the spell list the user has saved for their active character. Useful for 'what should I prepare' or 'what spells do I have?' questions.",
    inputSchema: z.object({}),
  }),
};
