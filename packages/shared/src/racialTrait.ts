import type { CharacterRace } from './character';

export interface RacialTrait {
  key: string;
  name: string;
  body: string;
  race: CharacterRace;
}
