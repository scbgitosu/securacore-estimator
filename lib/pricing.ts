import {
  TIER_LABOR,
  CAMERA_SCOPE_LABOR,
  EXTRA_DOOR_LABOR,
  UNIT_PRICES,
  DEFAULT_UNIT_PRICE,
} from '@/pricing-config';
import type { SystemConfig, EquipmentItem } from '@/types';

// Round the displayed range so that it always brackets the underlying number:
// floor the low bound to the nearest $100, ceil the high bound. This avoids
// quoting a "starts at" price that is actually higher than the real low.
function floorTo100(n: number): number {
  return Math.floor(n / 100) * 100;
}
function ceilTo100(n: number): number {
  return Math.ceil(n / 100) * 100;
}

/** Labor only: tier baseline + surveillance-scope labor + extra-door labor. */
export function computeLaborPricing(cfg: SystemConfig): { low: number; high: number } | null {
  if (!cfg.tier || !cfg.cameraScope) return null;

  const tier = TIER_LABOR[cfg.tier];
  const scope = CAMERA_SCOPE_LABOR[cfg.cameraScope];
  const extraDoors = Math.max(0, (cfg.doors || 1) - 1);

  const low = tier.low + scope.low + extraDoors * EXTRA_DOOR_LABOR.door.low;
  const high = tier.high + scope.high + extraDoors * EXTRA_DOOR_LABOR.door.high;

  return {
    low: floorTo100(low),
    high: ceilTo100(high),
  };
}

export function getUnitPrice(name: string): { low: number; high: number } {
  return UNIT_PRICES[name] ?? DEFAULT_UNIT_PRICE;
}

/** Sum of (quantity × unit price) for every catalog line with quantity > 0. */
export function computeMaterialsCost(
  equipment: EquipmentItem[],
  qtys: Record<string, number>
): { low: number; high: number } {
  let low = 0;
  let high = 0;

  for (const item of equipment) {
    const q = qtys[item.name] ?? item.baseQty;
    if (q <= 0) continue;
    const up = getUnitPrice(item.name);
    low += q * up.low;
    high += q * up.high;
  }

  return { low, high };
}

/** Labor (rounded band) + materials; final range bracketed to $100. */
export function computeTotalEstimate(
  labor: { low: number; high: number },
  equipment: EquipmentItem[],
  qtys: Record<string, number>
): { low: number; high: number } {
  const mat = computeMaterialsCost(equipment, qtys);
  const low = Math.max(0, floorTo100(labor.low + mat.low));
  const highRaw = Math.max(0, ceilTo100(labor.high + mat.high));
  return { low, high: Math.max(low, highRaw) };
}
