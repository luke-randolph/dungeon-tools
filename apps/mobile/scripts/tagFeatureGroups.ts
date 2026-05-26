/**
 * One-off data prep: tags entries in class-features.json and racial-traits.json
 * with `parentKey`, `maxPicks`, and `scalingKey` so the UI can render
 * single-select groups, multi-select groups, and level-scaling features
 * correctly.
 *
 * Re-run safely after a fresh `fetch-srd` to re-apply the same tags.
 *
 * Run: `npm run tag-feature-groups` (from apps/mobile/)
 */
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { ClassFeature, RacialTrait } from '@dungeon-tools/shared';

// ─── Group definitions ─────────────────────────────────────────────────────

interface Group {
  /** Parent entry. Hidden from selection rows, rendered as a section header. */
  parent: string;
  /** How many children a character may select. 1 = single-select. */
  maxPicks: number;
  /** Selectable option keys. */
  children: string[];
}

// Note: paladin's option keys are NOT prefixed with `paladin-` (data
// inconsistency; addressed by Epic 4's naming cleanup pass).
const fightingStyle = (
  parent: string,
  childPrefix: string,
  variants: string[],
): Group => ({
  parent,
  maxPicks: 1,
  children: variants.map((v) => `${childPrefix}-${v}`),
});

const ARCANE_TRADITION_SCHOOLS = [
  'Abjuration',
  'Conjuration',
  'Divination',
  'Enchantment',
  'Evocation',
  'Illusion',
  'Necromancy',
  'Transmutation',
];

const SINGLE_SELECT_GROUPS: Group[] = [
  fightingStyle('fighter-fighting-style', 'fighter-fighting-style', [
    'archery',
    'defense',
    'dueling',
    'great-weapon-fighting',
    'protection',
    'two-weapon-fighting',
  ]),
  fightingStyle('paladin-fighting-style', 'fighting-style', [
    'defense',
    'dueling',
    'great-weapon-fighting',
    'protection',
  ]),
  fightingStyle('ranger-fighting-style', 'ranger-fighting-style', [
    'archery',
    'defense',
    'dueling',
    'two-weapon-fighting',
  ]),
  {
    parent: 'pact-boon',
    maxPicks: 1,
    children: ['pact-of-the-blade', 'pact-of-the-chain', 'pact-of-the-tome'],
  },
  {
    parent: 'arcane-tradition',
    maxPicks: 1,
    children: ARCANE_TRADITION_SCHOOLS.map(
      (s) => `arcane-tradition-${s.toLowerCase()}`,
    ),
  },
];

const MULTI_SELECT_GROUPS: Group[] = [
  {
    parent: 'metamagic-1',
    maxPicks: 2,
    children: [
      'metamagic-careful-spell',
      'metamagic-distant-spell',
      'metamagic-empowered-spell',
      'metamagic-extended-spell',
      'metamagic-heightened-spell',
      'metamagic-quickened-spell',
      'metamagic-subtle-spell',
      'metamagic-twinned-spell',
    ],
  },
  // Eldritch Invocations: children are filled at runtime (every
  // `eldritch-invocation-*` feature). maxPicks here is the L2 floor;
  // resolveMaxPicks walks the scaling chain for higher tiers.
  { parent: 'eldritch-invocations', maxPicks: 2, children: [] },
];

// ─── Scaling chains ────────────────────────────────────────────────────────

interface ScalingTier {
  feature: string;
  /** Only set when the tier is also a multi-select parent (Metamagic). */
  maxPicks?: number;
}

interface ScalingChain {
  key: string;
  tiers: ScalingTier[];
}

const tiers = (...features: string[]): ScalingTier[] =>
  features.map((feature) => ({ feature }));

const SCALING_CHAINS: ScalingChain[] = [
  { key: 'action-surge', tiers: tiers('action-surge-1-use', 'action-surge-2-uses') },
  {
    key: 'indomitable',
    tiers: tiers('indomitable-1-use', 'indomitable-2-uses', 'indomitable-3-uses'),
  },
  {
    key: 'brutal-critical',
    tiers: tiers(
      'brutal-critical-1-die',
      'brutal-critical-2-dice',
      'brutal-critical-3-dice',
    ),
  },
  {
    key: 'channel-divinity-uses',
    tiers: tiers(
      'channel-divinity-1-rest',
      'channel-divinity-2-rest',
      'channel-divinity-3-rest',
    ),
  },
  {
    key: 'bardic-inspiration',
    tiers: tiers(
      'bardic-inspiration-d6',
      'bardic-inspiration-d8',
      'bardic-inspiration-d10',
      'bardic-inspiration-d12',
    ),
  },
  {
    key: 'fighter-extra-attack',
    tiers: tiers('extra-attack-1', 'extra-attack-2', 'extra-attack-3'),
  },
  {
    key: 'favored-enemy',
    tiers: tiers(
      'favored-enemy-1-type',
      'favored-enemy-2-types',
      'favored-enemy-3-enemies',
    ),
  },
  {
    key: 'natural-explorer',
    tiers: tiers(
      'natural-explorer-1-terrain-type',
      'natural-explorer-2-terrain-types',
      'natural-explorer-3-terrain-types',
    ),
  },
  {
    // Metamagic: each tier is also a multi-select parent — pick count
    // grows at L3/L10/L17.
    key: 'metamagic',
    tiers: [
      { feature: 'metamagic-1', maxPicks: 2 },
      { feature: 'metamagic-2', maxPicks: 3 },
      { feature: 'metamagic-3', maxPicks: 4 },
    ],
  },
];

// ─── Synthesized entries: Eldritch Invocations tiers ───────────────────────
//
// Warlock invocations known by warlock level: L2=2, L5=3, L7=4, L9=5,
// L12=6, L15=7, L18=8. The data ships only the L2 entry — we synthesize
// L5–L18 so the scaling resolver picks the right pick-cap by level.

interface SynthesizedInvocationTier {
  key: string;
  level: number;
  maxPicks: number;
}

const INVOCATION_TIERS: SynthesizedInvocationTier[] = [
  { key: 'eldritch-invocations-3', level: 5, maxPicks: 3 },
  { key: 'eldritch-invocations-4', level: 7, maxPicks: 4 },
  { key: 'eldritch-invocations-5', level: 9, maxPicks: 5 },
  { key: 'eldritch-invocations-6', level: 12, maxPicks: 6 },
  { key: 'eldritch-invocations-7', level: 15, maxPicks: 7 },
  { key: 'eldritch-invocations-8', level: 18, maxPicks: 8 },
];

// ─── Synthesized entries: Arcane Tradition schools ─────────────────────────
//
// The SRD ships only Evocation as a wizard subclass. We synthesize the
// other 7 schools as selectable children so the parent renders as an
// 8-option accordion. Bodies are empty — mechanics aren't in the SRD.

function synthesizeArcaneTraditions(features: ClassFeature[]): number {
  const anchorKey = 'arcane-tradition';
  const anchor = features.find((f) => f.key === anchorKey);
  if (!anchor) throw new Error(`missing feature: ${anchorKey}`);

  let inserted = 0;
  let insertAt = features.indexOf(anchor) + 1;
  for (const school of ARCANE_TRADITION_SCHOOLS) {
    const key = `${anchorKey}-${school.toLowerCase()}`;
    if (features.some((f) => f.key === key)) continue;
    features.splice(insertAt, 0, {
      key,
      name: `Arcane Tradition: ${school}`,
      body: '',
      class: anchor.class,
      level: anchor.level,
    });
    insertAt++;
    inserted++;
  }
  return inserted;
}

// ─── Racial traits ─────────────────────────────────────────────────────────

const DRACONIC_ANCESTRY: Group = {
  parent: 'draconic-ancestry',
  maxPicks: 1,
  children: [
    'black',
    'blue',
    'brass',
    'bronze',
    'copper',
    'gold',
    'green',
    'red',
    'silver',
    'white',
  ].map((color) => `draconic-ancestry-${color}`),
};

// ─── Applier ───────────────────────────────────────────────────────────────

function indexBy<T extends { key: string }>(items: T[]): Map<string, T> {
  return new Map(items.map((item) => [item.key, item]));
}

function requireEntry<T extends { key: string }>(
  index: Map<string, T>,
  key: string,
  kind: string,
): T {
  const entry = index.get(key);
  if (!entry) throw new Error(`missing ${kind}: ${key}`);
  return entry;
}

function applyGroup(group: Group, index: Map<string, ClassFeature>): void {
  requireEntry(index, group.parent, 'feature').maxPicks = group.maxPicks;
  for (const childKey of group.children) {
    requireEntry(index, childKey, 'feature').parentKey = group.parent;
  }
}

function applyScalingChain(
  chain: ScalingChain,
  index: Map<string, ClassFeature>,
): void {
  for (const tier of chain.tiers) {
    const entry = requireEntry(index, tier.feature, 'feature');
    entry.scalingKey = chain.key;
    if (tier.maxPicks !== undefined) entry.maxPicks = tier.maxPicks;
  }
}

function synthesizeInvocationTiers(features: ClassFeature[]): number {
  const anchorKey = 'eldritch-invocations';
  const anchor = features.find((f) => f.key === anchorKey);
  if (!anchor) throw new Error(`missing feature: ${anchorKey}`);

  // Anchor itself joins the scaling chain.
  anchor.scalingKey = anchorKey;

  let inserted = 0;
  let insertAt = features.indexOf(anchor) + 1;
  for (const tier of INVOCATION_TIERS) {
    if (features.some((f) => f.key === tier.key)) continue;
    features.splice(insertAt, 0, {
      key: tier.key,
      name: anchor.name,
      body: anchor.body,
      class: anchor.class,
      level: tier.level,
      maxPicks: tier.maxPicks,
      scalingKey: anchorKey,
    });
    insertAt++;
    inserted++;
  }
  return inserted;
}

function fillInvocationChildren(features: ClassFeature[]): string[] {
  return features
    .filter(
      (f) =>
        f.key.startsWith('eldritch-invocation-') &&
        !f.key.startsWith('eldritch-invocations'),
    )
    .map((f) => f.key);
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const here = dirname(fileURLToPath(import.meta.url));
  const featuresPath = resolve(here, '..', 'assets', 'srd', 'class-features.json');
  const traitsPath = resolve(here, '..', 'assets', 'srd', 'racial-traits.json');

  const features = JSON.parse(
    await readFile(featuresPath, 'utf8'),
  ) as ClassFeature[];
  const traits = JSON.parse(await readFile(traitsPath, 'utf8')) as RacialTrait[];

  // Synthesize invocation tiers BEFORE indexing so they're applier-visible.
  const synthesized = synthesizeInvocationTiers(features);
  const synthesizedSchools = synthesizeArcaneTraditions(features);

  // Populate the dynamic invocations children list.
  const invocations = MULTI_SELECT_GROUPS.find(
    (g) => g.parent === 'eldritch-invocations',
  );
  if (invocations) invocations.children = fillInvocationChildren(features);

  const featureIndex = indexBy(features);
  const traitIndex = indexBy(traits);

  for (const group of [...SINGLE_SELECT_GROUPS, ...MULTI_SELECT_GROUPS]) {
    applyGroup(group, featureIndex);
  }
  for (const chain of SCALING_CHAINS) {
    applyScalingChain(chain, featureIndex);
  }

  // Racial traits — same shape, different file.
  requireEntry(traitIndex, DRACONIC_ANCESTRY.parent, 'trait').maxPicks =
    DRACONIC_ANCESTRY.maxPicks;
  for (const childKey of DRACONIC_ANCESTRY.children) {
    requireEntry(traitIndex, childKey, 'trait').parentKey =
      DRACONIC_ANCESTRY.parent;
  }

  await writeFile(featuresPath, JSON.stringify(features, null, 2));
  await writeFile(traitsPath, JSON.stringify(traits, null, 2));

  console.log(`Synthesized ${synthesized} eldritch invocation tier(s).`);
  console.log(`Synthesized ${synthesizedSchools} arcane tradition school(s).`);
  console.log(
    `Tagged ${SINGLE_SELECT_GROUPS.length} single-select group(s), ` +
      `${MULTI_SELECT_GROUPS.length} multi-select group(s), ` +
      `${SCALING_CHAINS.length} scaling chain(s).`,
  );
  console.log(`Tagged 1 racial single-select group (Draconic Ancestry).`);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
