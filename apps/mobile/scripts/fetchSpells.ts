import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { CharacterClass, Spell } from '@dungeon-tools/shared';

const SOURCE_URL =
  'https://raw.githubusercontent.com/5e-bits/5e-database/main/src/2014/en/5e-SRD-Spells.json';

interface RawSpell {
  index: string;
  name: string;
  level: number;
  desc: string[];
  higher_level?: string[];
  range: string;
  components: string[];
  material?: string;
  ritual: boolean;
  duration: string;
  concentration: boolean;
  casting_time: string;
  school: { index: string; name: string };
  classes: { index: string; name: string }[];
}

function formatComponents(components: string[], material?: string): string {
  const base = components.join(', ');
  return material ? `${base} (${material})` : base;
}

function normalize(raw: RawSpell): Spell {
  const higher = raw.higher_level?.join('\n\n');
  return {
    key: raw.index,
    name: raw.name,
    level: raw.level,
    school: raw.school.name,
    classes: raw.classes.map((c) => c.index.toLowerCase() as CharacterClass),
    castingTime: raw.casting_time,
    range: raw.range,
    components: formatComponents(raw.components, raw.material),
    duration: raw.duration,
    concentration: raw.concentration,
    ritual: raw.ritual,
    description: raw.desc.join('\n\n'),
    ...(higher ? { higherLevel: higher } : {}),
  };
}

async function main() {
  const here = dirname(fileURLToPath(import.meta.url));
  const outPath = resolve(here, '..', 'assets', 'spells', 'srd-5.1-spells.json');

  console.log(`Fetching ${SOURCE_URL} ...`);
  const res = await fetch(SOURCE_URL);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} fetching SRD spells`);
  }
  const raw = (await res.json()) as RawSpell[];

  console.log(`Normalizing ${raw.length} spells...`);
  const spells = raw.map(normalize).sort((a, b) => a.key.localeCompare(b.key));

  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, JSON.stringify(spells, null, 2) + '\n', 'utf8');

  console.log(`Wrote ${spells.length} spells to ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
