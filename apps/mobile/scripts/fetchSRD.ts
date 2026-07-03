import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { SRDCategory, SRDEntry } from '@dungeon-tools/shared';

const BASE =
  'https://raw.githubusercontent.com/5e-bits/5e-database/main/src/2014/en';

interface RawNamed {
  index: string;
  name: string;
}
interface RawRuleSection extends RawNamed {
  desc: string;
}
interface RawDescArray extends RawNamed {
  desc: string[];
}
interface RawSkill extends RawDescArray {
  ability_score: { name: string };
}
interface RawFeature extends RawDescArray {
  level?: number;
  class?: { index: string; name: string };
  subclass?: { index: string; name: string };
}
interface RawTrait extends RawDescArray {
  races?: { index: string; name: string }[];
  subraces?: { index: string; name: string }[];
  trait_specific?: {
    damage_type?: { index: string; name: string };
    breath_weapon?: {
      area_of_effect?: { size: number; type: string };
      dc?: { dc_type?: { index: string; name: string } };
    };
  };
}

interface DraconicAncestryRow {
  key: string;
  color: string;
  damageType: string;
  breathShape: string;
  saveType: string;
}

function breathShape(area: { size: number; type: string } | undefined): string {
  if (!area) return '';
  if (area.type === 'line') return `5 by ${area.size} ft. line`;
  if (area.type === 'cone') return `${area.size} ft. cone`;
  return `${area.size} ft. ${area.type}`;
}

function colorFromName(name: string): string {
  const match = name.match(/\(([^)]+)\)/);
  return match ? match[1] : name;
}
interface RawClass extends RawNamed {
  hit_die: number;
  proficiencies?: RawNamed[];
  saving_throws?: RawNamed[];
  starting_equipment_options?: unknown;
}
interface RawRace extends RawNamed {
  speed: number;
  ability_bonuses?: { ability_score: RawNamed; bonus: number }[];
  alignment?: string;
  age?: string;
  size?: string;
  size_description?: string;
  language_desc?: string;
  traits?: RawNamed[];
}
interface RawSubclass extends RawDescArray {
  class: RawNamed;
  subclass_flavor: string;
}

async function fetchJson<T>(file: string): Promise<T> {
  const url = `${BASE}/${file}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return (await res.json()) as T;
}

function trim(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  const slice = text.slice(0, maxChars);
  const lastBreak = Math.max(
    slice.lastIndexOf('\n\n'),
    slice.lastIndexOf('. '),
  );
  return (
    (lastBreak > maxChars * 0.6 ? slice.slice(0, lastBreak) : slice).trimEnd() +
    '…'
  );
}

function joinDesc(desc: string[] | undefined): string {
  return (desc ?? []).join('\n\n');
}

function entry(
  category: SRDCategory,
  index: string,
  name: string,
  body: string,
  tags: string[],
): SRDEntry {
  const cleanedTags = Array.from(
    new Set(
      tags
        .filter(Boolean)
        .map((t) => t.toLowerCase().trim())
        .filter((t) => t.length > 0),
    ),
  );
  return { category, index, name, body, tags: cleanedTags };
}

interface ClassSummary {
  key: string;
  name: string;
  hitDie: string;
  savingThrows: string[];
  proficiencies: string[];
}

function classSummaryBody(s: ClassSummary): string {
  return [
    `Hit Die: ${s.hitDie}`,
    s.savingThrows.length
      ? `Saving Throw Proficiencies: ${s.savingThrows.join(', ')}`
      : '',
    s.proficiencies.length
      ? `Proficiencies: ${s.proficiencies.join(', ')}`
      : '',
  ]
    .filter(Boolean)
    .join('\n\n');
}

async function main() {
  const here = dirname(fileURLToPath(import.meta.url));
  const outPath = resolve(here, '..', 'assets', 'srd', 'srd-5.1.json');
  const classesOutPath = resolve(here, '..', 'assets', 'srd', 'classes.json');
  const draconicOutPath = resolve(
    here,
    '..',
    'assets',
    'srd',
    'draconic-ancestry.json',
  );

  console.log('Fetching SRD content...');
  const [
    ruleSections,
    conditions,
    skills,
    features,
    traits,
    classes,
    races,
    subclasses,
  ] = await Promise.all([
    fetchJson<RawRuleSection[]>('5e-SRD-Rule-Sections.json'),
    fetchJson<RawDescArray[]>('5e-SRD-Conditions.json'),
    fetchJson<RawSkill[]>('5e-SRD-Skills.json'),
    fetchJson<RawFeature[]>('5e-SRD-Features.json'),
    fetchJson<RawTrait[]>('5e-SRD-Traits.json'),
    fetchJson<RawClass[]>('5e-SRD-Classes.json'),
    fetchJson<RawRace[]>('5e-SRD-Races.json'),
    fetchJson<RawSubclass[]>('5e-SRD-Subclasses.json'),
  ]);

  const out: SRDEntry[] = [];

  // Rule sections — keep generously sized; these are reference text.
  for (const s of ruleSections) {
    out.push(
      entry('rule-section', s.index, s.name, trim(s.desc, 2400), [
        s.name,
        'rule',
      ]),
    );
  }

  // Conditions — short and quoted often.
  for (const c of conditions) {
    out.push(
      entry('condition', c.index, c.name, trim(joinDesc(c.desc), 1200), [
        c.name,
        'condition',
      ]),
    );
  }

  // Skills — small.
  for (const s of skills) {
    out.push(
      entry('skill', s.index, s.name, trim(joinDesc(s.desc), 800), [
        s.name,
        s.ability_score?.name ?? '',
        'skill',
      ]),
    );
  }

  // Class features — biggest category. Includes Sneak Attack, Rage, etc.
  for (const f of features) {
    const cls = f.class?.name ?? f.subclass?.name ?? '';
    const tags = [f.name, cls, 'class feature'];
    out.push(
      entry(
        'class-feature',
        f.index,
        f.name,
        trim(joinDesc(f.desc), 1500),
        tags,
      ),
    );
  }

  // Racial traits — Stonecunning, Darkvision, Fey Ancestry, etc.
  for (const t of traits) {
    const raceTags = (t.races ?? []).map((r) => r.name);
    const subraceTags = (t.subraces ?? []).map((r) => r.name);
    out.push(
      entry('racial-trait', t.index, t.name, trim(joinDesc(t.desc), 800), [
        t.name,
        ...raceTags,
        ...subraceTags,
        'racial trait',
      ]),
    );
  }

  // Class summaries — structured records are the source of truth; the
  // assistant-grounding body string is derived from them.
  const classSummaries: ClassSummary[] = classes.map((c) => ({
    key: c.index,
    name: c.name,
    hitDie: `d${c.hit_die}`,
    savingThrows: (c.saving_throws ?? []).map((s) => s.name),
    // Upstream lists saving throws inside proficiencies too — drop those.
    proficiencies: (c.proficiencies ?? [])
      .map((p) => p.name)
      .filter((name) => !name.startsWith('Saving Throw:')),
  }));
  for (const s of classSummaries) {
    out.push(
      entry('class', s.key, s.name, classSummaryBody(s), [s.name, 'class']),
    );
  }

  // Race summaries.
  for (const r of races) {
    const bonuses = (r.ability_bonuses ?? [])
      .map((b) => `${b.ability_score.name} +${b.bonus}`)
      .join(', ');
    const body =
      `Speed: ${r.speed} ft\n\n` +
      (bonuses ? `Ability Score Increase: ${bonuses}\n\n` : '') +
      (r.size_description ? `Size: ${r.size_description}\n\n` : '') +
      (r.age ?? '') +
      (r.alignment ? `\n\n${r.alignment}` : '');
    out.push(entry('race', r.index, r.name, trim(body, 800), [r.name, 'race']));
  }

  // Subclass summaries.
  for (const sc of subclasses) {
    out.push(
      entry('subclass', sc.index, sc.name, trim(joinDesc(sc.desc), 1000), [
        sc.name,
        sc.class?.name ?? '',
        sc.subclass_flavor ?? '',
        'subclass',
      ]),
    );
  }

  out.sort((a, b) => {
    if (a.category !== b.category) return a.category.localeCompare(b.category);
    return a.index.localeCompare(b.index);
  });

  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, JSON.stringify(out) + '\n', 'utf8');

  classSummaries.sort((a, b) => a.key.localeCompare(b.key));
  await writeFile(
    classesOutPath,
    JSON.stringify(classSummaries, null, 2) + '\n',
    'utf8',
  );

  // Draconic Ancestry table — color variants carry structured breath/damage/save
  // info in `trait_specific`, which the generic racial-trait body throws away.
  const draconicRows: DraconicAncestryRow[] = traits
    .filter(
      (t) =>
        t.index.startsWith('draconic-ancestry-') &&
        t.index !== 'draconic-ancestry',
    )
    .map((t) => ({
      key: t.index,
      color: colorFromName(t.name),
      damageType: t.trait_specific?.damage_type?.name ?? '',
      breathShape: breathShape(t.trait_specific?.breath_weapon?.area_of_effect),
      saveType: t.trait_specific?.breath_weapon?.dc?.dc_type?.name ?? '',
    }))
    .sort((a, b) => a.color.localeCompare(b.color));

  await writeFile(
    draconicOutPath,
    JSON.stringify(draconicRows, null, 2) + '\n',
    'utf8',
  );

  const bytes = JSON.stringify(out).length;
  const counts: Record<string, number> = {};
  for (const e of out) counts[e.category] = (counts[e.category] ?? 0) + 1;
  console.log(
    `Wrote ${out.length} entries (${(bytes / 1024).toFixed(1)} KB) to ${outPath}`,
  );
  console.log('Per-category:', counts);
  console.log(
    `Wrote ${classSummaries.length} class summaries to ${classesOutPath}`,
  );
  console.log(
    `Wrote ${draconicRows.length} draconic ancestry rows to ${draconicOutPath}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
