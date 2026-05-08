import type { CharacterRace, RacialTrait } from '@dungeon-tools/shared';
import raw from '@/assets/srd/racial-traits.json';

export const ALL_RACIAL_TRAITS: readonly RacialTrait[] = raw as RacialTrait[];

export function traitsForRace(race: CharacterRace): RacialTrait[] {
  return ALL_RACIAL_TRAITS.filter((t) => t.race === race);
}
