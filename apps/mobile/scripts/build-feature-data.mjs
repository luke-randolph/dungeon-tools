#!/usr/bin/env node
// Generates static feature/trait JSON assets from the SRD source.
// Inputs:
//   assets/srd/srd-5.1.json     — feature/trait prose (already pre-filtered to
//                                  drop subclass entries and subclass-bound
//                                  features)
//   scripts/feature-levels.json — { index → level } map sourced from dnd5eapi
//                                  (5e-bits/5e-database). Authoritative for
//                                  level requirements, since the SRD prose
//                                  doesn't expose them as structured data.
// Outputs:
//   assets/srd/class-features.json  ({ key, name, body, class, level }[])
//   assets/srd/racial-traits.json   ({ key, name, body, race }[])
// Re-run when any input changes:
//   node apps/mobile/scripts/build-feature-data.mjs

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRD_PATH = join(__dirname, '../assets/srd/srd-5.1.json');
const OUT_FEATURES = join(__dirname, '../assets/srd/class-features.json');
const OUT_TRAITS = join(__dirname, '../assets/srd/racial-traits.json');
const LEVELS_PATH = join(__dirname, 'feature-levels.json');

const ALL_CLASSES = new Set([
  'barbarian',
  'bard',
  'cleric',
  'druid',
  'fighter',
  'monk',
  'paladin',
  'ranger',
  'rogue',
  'sorcerer',
  'warlock',
  'wizard',
]);

const ALL_RACES = new Set([
  'dragonborn',
  'dwarf',
  'elf',
  'gnome',
  'half-elf',
  'half-orc',
  'halfling',
  'human',
  'tiefling',
]);

function pickClass(tags) {
  for (const t of tags) if (ALL_CLASSES.has(t)) return t;
  return null;
}

// Tag forms: "dragonborn", "halfling", "rock gnome", "high elf", "half-elf".
// Last whitespace-separated token names the race; "half-elf" stays one token
// because of the hyphen, so it doesn't bleed into "elf".
function pickRace(tags) {
  for (const t of tags) {
    if (ALL_RACES.has(t)) return t;
    const last = t.split(/\s+/).pop();
    if (last && ALL_RACES.has(last)) return last;
  }
  return null;
}

function main() {
  const raw = JSON.parse(readFileSync(SRD_PATH, 'utf8'));
  const levels = JSON.parse(readFileSync(LEVELS_PATH, 'utf8'));
  const features = [];
  const traits = [];
  const skipped = { noClass: 0, noRace: 0, noLevel: 0 };

  for (const e of raw) {
    if (e.category === 'class-feature') {
      const cls = pickClass(e.tags || []);
      if (!cls) {
        skipped.noClass++;
        continue;
      }
      const level = levels[e.index];
      if (level == null) {
        skipped.noLevel++;
        continue;
      }
      features.push({
        key: e.index,
        name: e.name,
        body: e.body,
        class: cls,
        level,
      });
    } else if (e.category === 'racial-trait') {
      const race = pickRace(e.tags || []);
      if (!race) {
        skipped.noRace++;
        continue;
      }
      traits.push({ key: e.index, name: e.name, body: e.body, race });
    }
  }

  features.sort(
    (a, b) =>
      a.class.localeCompare(b.class) ||
      a.level - b.level ||
      a.name.localeCompare(b.name),
  );
  traits.sort(
    (a, b) => a.race.localeCompare(b.race) || a.name.localeCompare(b.name),
  );

  writeFileSync(OUT_FEATURES, JSON.stringify(features, null, 2));
  writeFileSync(OUT_TRAITS, JSON.stringify(traits, null, 2));

  console.log(`class-features.json: ${features.length} entries`);
  const byClass = {};
  for (const f of features) byClass[f.class] = (byClass[f.class] || 0) + 1;
  for (const [c, n] of Object.entries(byClass).sort())
    console.log(`  ${c.padEnd(10)} ${n}`);
  console.log(`racial-traits.json: ${traits.length} entries`);
  const byRace = {};
  for (const t of traits) byRace[t.race] = (byRace[t.race] || 0) + 1;
  for (const [r, n] of Object.entries(byRace).sort())
    console.log(`  ${r.padEnd(10)} ${n}`);
  console.log('skipped:', skipped);
}

main();
