import {
  BASE_PRICES,
  CAMERA_ADDERS,
  ENTRY_POINT_ADDERS,
  UNIT_PRICES,
  DEFAULT_UNIT_PRICE,
} from '@/pricing-config';
import type { SystemConfig, EquipmentItem } from '@/types';

export function computeBasePricing(cfg: SystemConfig): { low: number; high: number } | null {
  if (!cfg.tier || !cfg.cameraScope) return null;

  const base = BASE_PRICES[cfg.tier];
  const cam = CAMERA_ADDERS[cfg.cameraScope];
  const extraDoors = Math.max(0, (cfg.doors || 1) - 1);
  const extraWindows = Math.max(0, (cfg.windows || 2) - 2);

  const low =
    base.low +
    cam.low +
    extraDoors * ENTRY_POINT_ADDERS.door.low +
    extraWindows * ENTRY_POINT_ADDERS.window.low;

  const high =
    base.high +
    cam.high +
    extraDoors * ENTRY_POINT_ADDERS.door.high +
    extraWindows * ENTRY_POINT_ADDERS.window.high;

  return {
    low: Math.round(low / 100) * 100,
    high: Math.round(high / 100) * 100,
  };
}

export function getUnitPrice(name: string): { low: number; high: number } {
  return UNIT_PRICES[name] ?? DEFAULT_UNIT_PRICE;
}

export function computeAdjustedPricing(
  basePricing: { low: number; high: number },
  equipment: EquipmentItem[],
  qtys: Record<number, number>
): { low: number; high: number } {
  let extraLow = 0;
  let extraHigh = 0;

  equipment.forEach((item, i) => {
    const diff = (qtys[i] ?? item.baseQty) - item.baseQty;
    if (diff !== 0) {
      const up = getUnitPrice(item.name);
      extraLow += diff * up.low;
      extraHigh += diff * up.high;
    }
  });

  return {
    low: Math.max(0, Math.round((basePricing.low + extraLow) / 100) * 100),
    high: Math.max(0, Math.round((basePricing.high + extraHigh) / 100) * 100),
  };
}
