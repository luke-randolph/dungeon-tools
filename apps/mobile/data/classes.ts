import type { CharacterClass } from '@dungeon-tools/shared';
import raw from '@/assets/srd/srd-5.1.json';

interface SrdEntry {
  category: string;
  index: string;
  name: string;
  body: string;
  tags: string[];
}

interface ClassDetail {
  key: CharacterClass;
  name: string;
  body: string;
}

function stripDuplicateSavingThrows(body: string): string {
  return body.replace(/(, Saving Throw: \w+)+\s*$/, '');
}

const BY_KEY = new Map<string, ClassDetail>();
for (const e of raw as SrdEntry[]) {
  if (e.category !== 'class') continue;
  BY_KEY.set(e.index, {
    key: e.index as CharacterClass,
    name: e.name,
    body: stripDuplicateSavingThrows(e.body),
  });
}

export function getClassDetail(charClass: CharacterClass): ClassDetail | undefined {
  return BY_KEY.get(charClass);
}
