// ─────────────────────────────────────────────────────────────────────────────
// SecuraCore Estimator — Pricing Configuration
//
// Edit this file to adjust all pricing shown to customers.
// Changes here flow through to the live estimate automatically.
// ─────────────────────────────────────────────────────────────────────────────

import type { HomeType } from '@/types';

// ── Default exterior door count by home type (applied when user picks a type) ─
export const DOORS_BY_HOME_TYPE: Record<HomeType, number> = {
  'single-family': 4,
  condo: 2,
  townhouse: 2,
  business: 5,
};

// ── Base price ranges by security tier ────────────────────────────────────────
// These ranges include all equipment that is bundled with a tier (control
// panel, motion detectors, smoke/CO for Complete, smart lock/garage/water
// for Ultimate, etc.) plus baseline labor. Per-door adders, camera coverage
// adders, and live quantity edits in Step 4 are layered on top.
export const BASE_PRICES = {
  Essential: { low: 500,  high: 900  },
  Complete:  { low: 900,  high: 1500 },
  Ultimate:  { low: 1500, high: 2500 },
} as const;

// ── Camera coverage adders (added on top of base tier price) ──────────────────
export const CAMERA_ADDERS = {
  'front-only':    { low: 250,  high: 350  },
  'perimeter':     { low: 900,  high: 1500  },
  'full-coverage': { low: 1200,  high: 2000 },
  'no-surveillance': { low: 0, high: 0 },
} as const;

// ── Entry point adders ────────────────────────────────────────────────────────
// Applied per exterior door beyond the baseline (1 door)
export const ENTRY_POINT_ADDERS = {
  door: { low: 99, high: 130 },
} as const;

// ── Monthly monitoring range ───────────────────────────────────────────────────
export const MONITORING_RANGE = { low: 44.99, high: 79.99 } as const;

// ── Per-unit price estimates for the live quantity adjustment in Step 4 ────────
// When a customer adjusts equipment quantities, the estimate shifts by these
// per-unit amounts. Items with low/high of 0 are included at no extra cost.
export const UNIT_PRICES: Record<string, { low: number; high: number }> = {
  '7" Wall/Counter Security Control Panel': { low: 500, high: 800 },
  'Door Sensors':                   { low: 99,  high: 130 },
  'Outdoor Camera':                 { low: 300, high: 450 },
  'Indoor Camera':                  { low: 200, high: 350 },
  '24/7 Onboard Recording':         { low: 0,   high: 0   },
  'Video Doorbell':                 { low: 300, high: 450 },
  'Motion Detectors':               { low: 90, high: 120 },
  'Smoke Detectors':                { low: 120,  high: 175  },
  'Carbon Monoxide Detector':       { low: 120,  high: 175  },
  'Smart Lock - Keyless Entry':     { low: 280, high: 400 },
  'Overhead Garage Door Control':   { low: 200, high: 350 },
  'Mobile App & Remote Access':     { low: 0,   high: 0   },
  'Alarm.com Premium Integration':  { low: 0,   high: 0   },
  'Water Leak Sensor':              { low: 100,  high: 250  },
};

// Fallback price for any equipment item not explicitly listed above
export const DEFAULT_UNIT_PRICE = { low: 80, high: 140 };
