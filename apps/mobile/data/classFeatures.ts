import type { CharacterClass, ClassFeature } from '@dungeon-tools/shared';
import raw from '@/assets/srd/class-features.json';

export const ALL_CLASS_FEATURES: readonly ClassFeature[] =
  raw as ClassFeature[];

const BY_KEY = new Map(ALL_CLASS_FEATURES.map((f) => [f.key, f]));

export function getClassFeature(key: string): ClassFeature | undefined {
  return BY_KEY.get(key);
}

export interface ClassFeatureQuery {
  query?: string;
  charClass?: CharacterClass | null;
}

export function searchClassFeatures(
  opts: ClassFeatureQuery = {},
): ClassFeature[] {
  const q = opts.query?.toLowerCase().trim();
  return ALL_CLASS_FEATURES.filter((f) => {
    if (q && !f.name.toLowerCase().includes(q)) return false;
    if (opts.charClass && f.class !== opts.charClass) return false;
    return true;
  });
}
