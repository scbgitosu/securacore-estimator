// Customer-facing descriptions for each catalog item. Keys must match the
// exact names in lib/equipment.ts EQUIPMENT_CATALOG_ORDER and pricing-config.

export const EQUIPMENT_DESCRIPTIONS: Record<string, string> = {
  '7" Wall/Counter Security Control Panel':
    'Central touchscreen hub that arms and disarms your system, shows live camera feeds, and controls smart devices from one place.',
  'Door Sensors':
    'Detect when a door opens or closes and alert you instantly — whether you\'re home or away.',
  'Outdoor Camera':
    'Weather-rated cameras monitor entry points and outdoor areas; view live or recorded video from your phone.',
  'Indoor Camera':
    'Indoor cameras let you check in on kids, pets, or activity inside the home from anywhere.',
  '24/7 Onboard Recording':
    'Continuous video recording stored on-site so footage is available even if internet service is interrupted.',
  'Motion Detectors':
    'Sense movement in key areas and can trigger alerts, lights, or camera recording when activity is detected.',
  'Video Doorbell':
    'See and speak to visitors at your door from your phone, with motion alerts and recorded clips.',
  'Smoke Detectors':
    'Monitored smoke detection alerts you and our central station so emergency response can be dispatched quickly.',
  'Carbon Monoxide Detector':
    'Detects dangerous CO levels and sends immediate alerts to protect your household from invisible gas hazards.',
  'Smart Lock - Keyless Entry':
    'Lock and unlock your door remotely, assign codes for family or guests, and integrate with your security system.',
  'Overhead Garage Door Control':
    'Open or close your garage door from the app and include it in arm/disarm routines for added convenience.',
  'Garage Door Tilt Sensor':
    'Confirms whether the garage door is fully closed — and alerts you if it\'s left open.',
  'Glass Break Sensor':
    'Listens for the sound of breaking glass to catch intrusions that bypass door and window contacts.',
  'Mobile App & Remote Access':
    'Control your entire system, cameras, and smart devices from your smartphone — anywhere you have internet.',
  'Water Leak Sensor':
    'Detects water where it shouldn\'t be (under sinks, water heaters, etc.) and alerts you before major damage occurs.',
};

const CATALOG_NAMES = [
  '7" Wall/Counter Security Control Panel',
  'Door Sensors',
  'Outdoor Camera',
  'Indoor Camera',
  '24/7 Onboard Recording',
  'Motion Detectors',
  'Video Doorbell',
  'Smoke Detectors',
  'Carbon Monoxide Detector',
  'Smart Lock - Keyless Entry',
  'Overhead Garage Door Control',
  'Garage Door Tilt Sensor',
  'Glass Break Sensor',
  'Water Leak Sensor',
  'Mobile App & Remote Access',
] as const;

// Dev-time guard: every catalog item must have a description.
if (process.env.NODE_ENV !== 'production') {
  for (const name of CATALOG_NAMES) {
    if (!EQUIPMENT_DESCRIPTIONS[name]) {
      console.warn(`[equipment-catalog] Missing description for: ${name}`);
    }
  }
}

export function getEquipmentDescription(name: string): string | undefined {
  return EQUIPMENT_DESCRIPTIONS[name];
}
