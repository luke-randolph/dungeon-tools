import type { CharacterClass } from './character';

export interface ClassFeature {
  key: string;
  name: string;
  body: string;
  class: CharacterClass;
  level: number;
}
