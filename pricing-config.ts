// ─────────────────────────────────────────────────────────────────────────────
// SecuraCore Estimator — Pricing Configuration
//
// Edit this file to adjust all pricing shown to customers.
// Changes here flow through to the live estimate automatically.
// ─────────────────────────────────────────────────────────────────────────────

// ── Base price ranges by security tier ────────────────────────────────────────
export const BASE_PRICES = {
  Essential: { low: 800,  high: 1200 },
  Complete:  { low: 1200, high: 1700 },
  Ultimate:  { low: 1900, high: 2700 },
} as const;

// ── Camera coverage adders (added on top of base tier price) ──────────────────
export const CAMERA_ADDERS = {
  'front-only':    { low: 300,  high: 450  },
  'perimeter':     { low: 1200,  high: 2000  },
  'full-coverage': { low: 1500,  high: 2600 },
} as const;

// ── Entry point adders ────────────────────────────────────────────────────────
// Applied per unit beyond the baseline (1 door, 2 windows)
export const ENTRY_POINT_ADDERS = {
  door:   { low: 99, high: 130 },  // per exterior door beyond 1
  window: { low: 99, high: 130 },  // per ground-floor window beyond 2
} as const;

// ── Monthly monitoring range ───────────────────────────────────────────────────
export const MONITORING_RANGE = { low: 49.99, high: 89.99 } as const;

// ── Per-unit price estimates for the live quantity adjustment in Step 4 ────────
// When a customer adjusts equipment quantities, the estimate shifts by these
// per-unit amounts. Items with low/high of 0 are included at no extra cost.
export const UNIT_PRICES: Record<string, { low: number; high: number }> = {
  'Central Control Panel':          { low: 400, high: 800 },
  'Door Sensor':                    { low: 99, high: 130 },
  'Door Sensors':                   { low: 99, high: 130 },
  'Window Sensor':                  { low: 99, high: 130 },
  'Window Sensors':                 { low: 99, high: 130 },
  '4K Outdoor Camera — Front':      { low: 300,  high: 450  },
  '4K Outdoor Camera — Perimeter':  { low: 300,  high: 450  },
  '4K Indoor Camera':               { low: 200,  high: 350  },
  '4K Video Doorbell':              { low: 300,  high: 450  },
  'Motion Detector':                { low: 130,  high: 200  },
  'Motion Detectors':               { low: 130,  high: 200  },
  'Smart Lock':                     { low: 280, high: 400 },
  'Mobile App & Remote Access':     { low: 0,   high: 0   },
  'Alarm.com Premium Integration':  { low: 0,   high: 0   },
  'Smoke / CO Detector':            { low: 120,  high: 175 },
  'Water Leak Sensor':              { low: 100,  high: 250  },
};

// Fallback price for any equipment item not explicitly listed above
export const DEFAULT_UNIT_PRICE = { low: 80, high: 140 };
