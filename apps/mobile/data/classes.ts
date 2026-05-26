import type { CharacterClass } from '@dungeon-tools/shared';
import raw from '@/assets/srd/classes.json';

export interface ClassDetail {
  key: CharacterClass;
  name: string;
  hitDie: string;
  savingThrows: string[];
  proficiencies: string[];
}

const BY_KEY = new Map<string, ClassDetail>(
  (raw as ClassDetail[]).map((c) => [c.key, c]),
);

export function getClassDetail(
  charClass: CharacterClass,
): ClassDetail | undefined {
  return BY_KEY.get(charClass);
}
