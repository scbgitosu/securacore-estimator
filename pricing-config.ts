// ─────────────────────────────────────────────────────────────────────────────
// SecuraCore Estimator — Pricing Configuration
//
// Edit this file to adjust all pricing shown to customers.
// Changes here flow through to the live estimate automatically.
//
// Model: labor is per-equipment — each catalog line contributes
// (quantity × LABOR_HOURS × LABOR_RATE) with a low→high band; equipment lines
// add materials at UNIT_PRICES × quantity. Default quantities come from tier,
// doors, and surveillance selections.
// ─────────────────────────────────────────────────────────────────────────────

import type { HomeType } from '@/types';

// ── Default exterior door count by home type (applied when user picks a type) ─
export const DOORS_BY_HOME_TYPE: Record<HomeType, number> = {
  'single-family': 4,
  condo: 2,
  townhouse: 2,
  business: 5,
};

// ── Installation labor (per-equipment hours model) ────────────────────────────
// Each catalog line contributes labor = quantity × its LABOR_HOURS × LABOR_RATE.
// The low bound is that figure; the high bound multiplies it by
// LABOR_HIGH_MULTIPLIER. Items not listed fall back to DEFAULT_LABOR_HOURS.
export const LABOR_RATE = 149; // $/hour
export const LABOR_HIGH_MULTIPLIER = 1.7; // high = low × this (calibrated to hold tops ≤ prior model)
export const DEFAULT_LABOR_HOURS = 0.33; // fallback for any item not listed below

// Discounts only the displayed LOW end of the range (applied to materials+labor
// before the $100 floor in computeTotalEstimate). High end and per-item costs
// are unaffected. Calibrated against a real proposal that landed ~10% below
// the quoted low — makes the "starting at" number a more enticing anchor.
export const LOW_BAND_FACTOR = 0.9;

export const LABOR_HOURS: Record<string, number> = {
  '7" Wall/Counter Security Control Panel': 1,
  'Door Sensors': 0.33,
  'Outdoor Camera': 1,
  'Indoor Camera': 0.5,
  '24/7 Onboard Recording': 0,
  'Video Doorbell': 0.5,
  'Motion Detectors': 0.33,
  'Smoke Detectors': 0.33,
  'Carbon Monoxide Detector': 0.33,
  'Smart Lock - Keyless Entry': 0.5,
  'Overhead Garage Door Control': 0.5,
  'Mobile App & Remote Access': 0,
  'Alarm.com Premium Integration': 0,
  'Water Leak Sensor': 0.33,
  'Glass Break Sensor': 0.33,
  'Garage Door Tilt Sensor': 0.33,
};

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
  'Glass Break Sensor': { low: 79, high: 179 },
  'Garage Door Tilt Sensor': { low: 49, high: 149 },
};

// Fallback price for any equipment item not explicitly listed above
export const DEFAULT_UNIT_PRICE = { low: 80, high: 140 };
