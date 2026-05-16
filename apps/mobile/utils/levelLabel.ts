function ordinal(n: number): string {
  if (n === 1) return '1st';
  if (n === 2) return '2nd';
  if (n === 3) return '3rd';
  return `${n}th`;
}

export interface LevelLabelOptions {
  /** Render level 0 as "Cantrip" (spells only — class features start at 1). */
  cantrip?: boolean;
  /** Hyphenate for adjective use, e.g. "1st-level evocation". */
  hyphenated?: boolean;
}

export function levelLabel(
  level: number,
  opts: LevelLabelOptions = {},
): string {
  if (level === 0 && opts.cantrip) return 'Cantrip';
  return `${ordinal(level)}${opts.hyphenated ? '-' : ' '}level`;
}
