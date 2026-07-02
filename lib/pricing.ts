import {
  LABOR_RATE,
  LABOR_HIGH_MULTIPLIER,
  LABOR_HOURS,
  DEFAULT_LABOR_HOURS,
  UNIT_PRICES,
  DEFAULT_UNIT_PRICE,
  LOW_BAND_FACTOR,
} from '@/pricing-config';
import type { EquipmentItem } from '@/types';

function floorTo100(n: number): number {
  return Math.floor(n / 100) * 100;
}
function ceilTo100(n: number): number {
  return Math.ceil(n / 100) * 100;
}

export function getUnitPrice(name: string): { low: number; high: number } {
  return UNIT_PRICES[name] ?? DEFAULT_UNIT_PRICE;
}

export function getLaborHours(name: string): number {
  return LABOR_HOURS[name] ?? DEFAULT_LABOR_HOURS;
}

/**
 * Labor only: sum of (quantity × labor hours × rate) across catalog lines.
 * The low bound is that figure; the high bound scales it by LABOR_HIGH_MULTIPLIER.
 * Final $100 bracketing is applied by computeTotalEstimate, not here.
 */
export function computeLaborPricing(
  equipment: EquipmentItem[],
  qtys: Record<string, number>
): { low: number; high: number } {
  let low = 0;

  for (const item of equipment) {
    const q = qtys[item.name] ?? item.baseQty;
    if (q <= 0) continue;
    low += q * getLaborHours(item.name) * LABOR_RATE;
  }

  return { low, high: low * LABOR_HIGH_MULTIPLIER };
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
  const rawLow = labor.low + mat.low;
  // A nonzero cost should never floor down to a $0 headline — that reads as
  // "free" for a system that includes paid equipment.
  const low = rawLow > 0 ? Math.max(100, floorTo100(rawLow * LOW_BAND_FACTOR)) : 0;
  const highRaw = Math.max(0, ceilTo100(labor.high + mat.high));
  return { low, high: Math.max(low, highRaw) };
}
