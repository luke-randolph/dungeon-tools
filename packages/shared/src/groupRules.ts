interface Grouped {
  key: string;
  parentKey?: string;
  maxPicks?: number;
}

interface Scaled extends Grouped {
  level: number;
  scalingKey?: string;
}

export function getParent<T extends Grouped>(
  child: T,
  all: readonly T[],
): T | undefined {
  if (!child.parentKey) return undefined;
  return all.find((f) => f.key === child.parentKey);
}

export function getChildren<T extends Grouped>(
  parent: T,
  all: readonly T[],
): T[] {
  return all.filter((f) => f.parentKey === parent.key);
}

export function isParent<T extends Grouped>(entry: T): boolean {
  return entry.maxPicks != null;
}

export function resolveScalingTier<T extends Scaled>(
  scalingKey: string,
  characterLevel: number,
  all: readonly T[],
): T | undefined {
  let best: T | undefined;
  for (const f of all) {
    if (f.scalingKey !== scalingKey) continue;
    if (f.level > characterLevel) continue;
    if (!best || f.level > best.level) best = f;
  }
  return best;
}

export function resolveMaxPicks<T extends Scaled>(
  parent: T,
  characterLevel: number,
  all: readonly T[],
): number {
  if (parent.scalingKey) {
    const tier = resolveScalingTier(parent.scalingKey, characterLevel, all);
    if (tier && tier.maxPicks != null) return tier.maxPicks;
  }
  return parent.maxPicks ?? 0;
}
