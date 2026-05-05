// ─────────────────────────────────────────────────────────────────────────────
// SecuraCore Estimator — Pricing Configuration
//
// Edit this file to adjust all pricing shown to customers.
// Changes here flow through to the live estimate automatically.
//
// Model: tier + camera scope + extra doors = labor estimate; equipment lines
// from the wizard catalog add materials at UNIT_PRICES × quantity (default
// quantities come from tier, doors, and surveillance selections).
// ─────────────────────────────────────────────────────────────────────────────

import type { HomeType } from '@/types';

// ── Default exterior door count by home type (applied when user picks a type) ─
export const DOORS_BY_HOME_TYPE: Record<HomeType, number> = {
  'single-family': 4,
  condo: 2,
  townhouse: 2,
  business: 5,
};

// ── Installation labor bands by security tier ─────────────────────────────────
// Baseline programming, panel install, and typical on-site time for that tier.
// Does not include equipment cost — that comes from the catalog × UNIT_PRICES.
export const TIER_LABOR = {
  Essential: { low: 350, high: 750 },
  Complete: { low: 700, high: 1200 },
  Ultimate: { low: 1200, high: 2000 },
} as const;

// ── Additional labor by surveillance scope ────────────────────────────────────
// Extra mounting, cable pulls, and configuration when camera count / coverage
// increases. Camera hardware itself is priced via Outdoor/Indoor Camera units.
export const CAMERA_SCOPE_LABOR = {
  'front-only': { low: 149, high: 300 },
  perimeter: { low: 300, high: 600 },
  'full-coverage': { low: 650, high: 800 },
  'no-surveillance': { low: 0, high: 0 },
} as const;

// ── Labor per exterior door beyond the first ──────────────────────────────────
// Additional terminations, sensor placement, and testing per opening.
export const EXTRA_DOOR_LABOR = {
  door: { low: 45, high: 75 },
} as const;

// ── Monthly monitoring range ───────────────────────────────────────────────────
export const MONITORING_RANGE = { low: 44.99, high: 79.99 } as const;

// ── Per-unit equipment estimates (materials) ──────────────────────────────────
// Quantities default from tier, door count, and camera scope in lib/equipment.
// $0 items are bundled services / app access with no material line charge.
export const UNIT_PRICES: Record<string, { low: number; high: number }> = {
  '7" Wall/Counter Security Control Panel': { low: 500, high: 800 },
  'Door Sensors': { low: 99, high: 130 },
  'Outdoor Camera': { low: 300, high: 450 },
  'Indoor Camera': { low: 200, high: 350 },
  '24/7 Onboard Recording': { low: 0, high: 0 },
  'Video Doorbell': { low: 300, high: 450 },
  'Motion Detectors': { low: 90, high: 120 },
  'Smoke Detectors': { low: 120, high: 175 },
  'Carbon Monoxide Detector': { low: 120, high: 175 },
  'Smart Lock - Keyless Entry': { low: 280, high: 400 },
  'Overhead Garage Door Control': { low: 200, high: 350 },
  'Mobile App & Remote Access': { low: 0, high: 0 },
  'Alarm.com Premium Integration': { low: 0, high: 0 },
  'Water Leak Sensor': { low: 100, high: 250 },
};

// Fallback price for any equipment item not explicitly listed above
export const DEFAULT_UNIT_PRICE = { low: 80, high: 140 };
