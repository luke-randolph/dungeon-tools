import type { ClassFeature } from '@dungeon-tools/shared';
import {
  getChildren,
  isParent,
  resolveScalingTier,
} from '@dungeon-tools/shared';

import { ALL_CLASS_FEATURES } from '@/data/classFeatures';
import { levelLabel, levelListLabel } from '@/utils/levelLabel';

/**
 * The variant of a scaling feature to show given the character's level.
 *
 * Falls back to the lowest tier when the character does not yet qualify
 * for any — that tier renders as a locked preview row.
 */
export function resolveDisplayFeature(
  feature: ClassFeature,
  characterLevel: number,
): ClassFeature {
  if (!feature.scalingKey) return feature;
  const tier = resolveScalingTier(
    feature.scalingKey,
    characterLevel,
    ALL_CLASS_FEATURES,
  );
  if (tier) return tier;
  return lowestTier(feature.scalingKey) ?? feature;
}

/**
 * Replace each scaling chain in the input with a single representative
 * variant (the one the character qualifies for, or the lowest tier if
 * none yet). Order is preserved from the input.
 */
export function collapseScalingChains(
  features: ClassFeature[],
  characterLevel: number,
): ClassFeature[] {
  const seenChains = new Set<string>();
  const out: ClassFeature[] = [];
  for (const f of features) {
    if (!f.scalingKey) {
      out.push(f);
      continue;
    }
    if (seenChains.has(f.scalingKey)) continue;
    seenChains.add(f.scalingKey);
    out.push(resolveDisplayFeature(f, characterLevel));
  }
  return out;
}

/**
 * True when this feature, or any other tier in its scaling chain, is in
 * the starred set. Lets a row appear starred even when the DB holds a
 * different tier than the one currently displayed.
 */
export function isFeatureInList(
  feature: ClassFeature,
  starred: ReadonlySet<string>,
): boolean {
  if (starred.has(feature.key)) return true;
  if (!feature.scalingKey) return false;
  return ALL_CLASS_FEATURES.some(
    (f) => f.scalingKey === feature.scalingKey && starred.has(f.key),
  );
}

/** All keys belonging to the same scaling chain as `feature`. */
export function scalingChainKeys(feature: ClassFeature): string[] {
  if (!feature.scalingKey) return [feature.key];
  return ALL_CLASS_FEATURES.filter(
    (f) => f.scalingKey === feature.scalingKey,
  ).map((f) => f.key);
}

function lowestTier(scalingKey: string): ClassFeature | undefined {
  let best: ClassFeature | undefined;
  for (const f of ALL_CLASS_FEATURES) {
    if (f.scalingKey !== scalingKey) continue;
    if (!best || f.level < best.level) best = f;
  }
  return best;
}

export function featureLevelLabel(feature: ClassFeature): string {
  if (!feature.scalingKey) return levelLabel(feature.level);
  const tierLevels = ALL_CLASS_FEATURES.filter(
    (f) => f.scalingKey === feature.scalingKey,
  ).map((f) => f.level);
  return levelListLabel(tierLevels);
}

/**
 * Display name with the parent's prefix stripped. Detail screens keep
 * the full name; this is for rows shown inside their parent's accordion.
 *
 * Strips a `"Parent: Variant"` prefix or a `"Parent (Variant)"` suffix.
 */
export function childDisplayName<T extends { name: string }>(child: T): string {
  const colon = child.name.indexOf(': ');
  if (colon !== -1) return child.name.slice(colon + 2);
  const paren = child.name.lastIndexOf(' (');
  if (paren !== -1 && child.name.endsWith(')')) {
    return child.name.slice(paren + 2, -1);
  }
  return child.name;
}

export type FeatureListItem =
  | { kind: 'feature'; feature: ClassFeature }
  | { kind: 'group'; parent: ClassFeature; children: ClassFeature[] };

/**
 * Turn a flat feature list into a sequence of row items. Each parent
 * present becomes a group item carrying ALL its children (not just the
 * ones that survived filtering), so the accordion can offer the full
 * pick list. Lone children whose parent is filtered out get pulled back
 * under their parent automatically.
 */
export function buildFeatureItems(features: ClassFeature[]): FeatureListItem[] {
  const items: FeatureListItem[] = [];
  const emittedParents = new Set<string>();

  const emitGroup = (parent: ClassFeature) => {
    if (emittedParents.has(parent.key)) return;
    emittedParents.add(parent.key);
    items.push({
      kind: 'group',
      parent,
      children: getChildren(parent, ALL_CLASS_FEATURES),
    });
  };

  for (const f of features) {
    if (isParent(f)) {
      emitGroup(f);
    } else if (f.parentKey) {
      const parent = ALL_CLASS_FEATURES.find((p) => p.key === f.parentKey);
      if (parent) {
        emitGroup(parent);
      } else {
        items.push({ kind: 'feature', feature: f });
      }
    } else {
      items.push({ kind: 'feature', feature: f });
    }
  }

  return items;
}
