import type { CharacterClass } from './character';

export interface Spell {
  key: string;
  name: string;
  level: number;
  school: string;
  classes: CharacterClass[];
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  concentration: boolean;
  ritual: boolean;
  description: string;
  higherLevel?: string;
}
