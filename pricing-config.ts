// ─────────────────────────────────────────────────────────────────────────────
// SecuraCore Estimator — Pricing Configuration
//
// Edit this file to adjust all pricing shown to customers.
// Changes here flow through to the live estimate automatically.
// ─────────────────────────────────────────────────────────────────────────────

// ── Base price ranges by security tier ────────────────────────────────────────
export const BASE_PRICES = {
  Essential: { low: 800,  high: 1100 },
  Complete:  { low: 1200, high: 1600 },
  Ultimate:  { low: 1900, high: 2600 },
} as const;

// ── Camera coverage adders (added on top of base tier price) ──────────────────
export const CAMERA_ADDERS = {
  'front-only':    { low: 300,  high: 450  },
  'perimeter':     { low: 600,  high: 850  },
  'full-coverage': { low: 950,  high: 1400 },
} as const;

// ── Entry point adders ────────────────────────────────────────────────────────
// Applied per unit beyond the baseline (1 door, 2 windows)
export const ENTRY_POINT_ADDERS = {
  door:   { low: 35, high: 55 },  // per exterior door beyond 1
  window: { low: 25, high: 40 },  // per ground-floor window beyond 2
} as const;

// ── Monthly monitoring range ───────────────────────────────────────────────────
export const MONITORING_RANGE = { low: 49.99, high: 89.99 } as const;

// ── Per-unit price estimates for the live quantity adjustment in Step 4 ────────
// When a customer adjusts equipment quantities, the estimate shifts by these
// per-unit amounts. Items with low/high of 0 are included at no extra cost.
export const UNIT_PRICES: Record<string, { low: number; high: number }> = {
  'Central Control Panel':          { low: 250, high: 350 },
  'Door Sensor':                    { low: 30,  high: 50  },
  'Door Sensors':                   { low: 30,  high: 50  },
  'Window Sensor':                  { low: 22,  high: 38  },
  'Window Sensors':                 { low: 22,  high: 38  },
  '4K Outdoor Camera — Front':      { low: 180, high: 260 },
  '4K Outdoor Camera — Perimeter':  { low: 180, high: 260 },
  '4K Indoor Camera':               { low: 140, high: 200 },
  '4K Video Doorbell':              { low: 220, high: 320 },
  'Motion Detector':                { low: 60,  high: 90  },
  'Motion Detectors':               { low: 60,  high: 90  },
  'Smart Lock':                     { low: 280, high: 400 },
  'Smart Home Hub':                 { low: 180, high: 260 },
  'Mobile App & Remote Access':     { low: 0,   high: 0   },
  'Alarm.com Premium Integration':  { low: 0,   high: 0   },
  'Smoke / CO Detector':            { low: 80,  high: 120 },
  'Water Leak Sensor':              { low: 55,  high: 85  },
};

// Fallback price for any equipment item not explicitly listed above
export const DEFAULT_UNIT_PRICE = { low: 80, high: 140 };
