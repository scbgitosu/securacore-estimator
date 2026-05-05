import {
  BASE_PRICES,
  CAMERA_ADDERS,
  ENTRY_POINT_ADDERS,
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

export function computeBasePricing(cfg: SystemConfig): { low: number; high: number } | null {
  if (!cfg.tier || !cfg.cameraScope) return null;

  const base = BASE_PRICES[cfg.tier];
  const cam = CAMERA_ADDERS[cfg.cameraScope];
  const extraDoors = Math.max(0, (cfg.doors || 1) - 1);

  const low =
    base.low +
    cam.low +
    extraDoors * ENTRY_POINT_ADDERS.door.low;

  const high =
    base.high +
    cam.high +
    extraDoors * ENTRY_POINT_ADDERS.door.high;

  return {
    low: floorTo100(low),
    high: ceilTo100(high),
  };
}

export function getUnitPrice(name: string): { low: number; high: number } {
  return UNIT_PRICES[name] ?? DEFAULT_UNIT_PRICE;
}

export function computeAdjustedPricing(
  basePricing: { low: number; high: number },
  equipment: EquipmentItem[],
  qtys: Record<string, number>
): { low: number; high: number } {
  let extraLow = 0;
  let extraHigh = 0;

  equipment.forEach(item => {
    const diff = (qtys[item.name] ?? item.baseQty) - item.baseQty;
    if (diff !== 0) {
      const up = getUnitPrice(item.name);
      extraLow += diff * up.low;
      extraHigh += diff * up.high;
    }
  });

  const low = Math.max(0, floorTo100(basePricing.low + extraLow));
  const highRaw = Math.max(0, ceilTo100(basePricing.high + extraHigh));
  // Guarantee high >= low after rounding (e.g. when items are removed).
  return { low, high: Math.max(low, highRaw) };
}
