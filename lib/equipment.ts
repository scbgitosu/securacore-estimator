import type { SystemConfig, EquipmentItem } from '@/types';

const EQUIPMENT_CATALOG_ORDER = [
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
  'Mobile App & Remote Access',
  'Alarm.com Premium Integration',
  'Water Leak Sensor',
] as const;

function normalizeEquipmentName(name: string): string {
  if (name === 'Door Sensor') return 'Door Sensors';
  return name;
}

export function buildEquipment(cfg: SystemConfig): EquipmentItem[] {
  if (!cfg.tier) return [];

  const items: EquipmentItem[] = [];
  const doors = cfg.doors || 1;

  items.push({ name: '7" Wall/Counter Security Control Panel', baseQty: 1 });
  items.push({ name: doors > 1 ? 'Door Sensors' : 'Door Sensor', baseQty: doors });

  if (cfg.cameraScope === 'front-only') {
    items.push({ name: 'Outdoor Camera', baseQty: 1 });
  } else if (cfg.cameraScope === 'perimeter') {
    items.push({ name: 'Outdoor Camera', baseQty: 4 });
  } else if (cfg.cameraScope === 'full-coverage') {
    items.push({ name: 'Outdoor Camera', baseQty: 4 });
    items.push({ name: 'Indoor Camera', baseQty: 1 });
    items.push({ name: '24/7 Onboard Recording', baseQty: 1 });
  } else if (cfg.cameraScope === 'no-surveillance') {
    // Explicitly selected no camera package.
  }

  const includeVideoDoorbell =
    cfg.cameraScope != null &&
    cfg.cameraScope !== 'no-surveillance' &&
    (cfg.tier === 'Essential' || cfg.tier === 'Complete' || cfg.tier === 'Ultimate');

  if (includeVideoDoorbell) {
    items.push({ name: 'Video Doorbell', baseQty: 1 });
  }

  if (cfg.tier === 'Essential' || cfg.tier === 'Complete' || cfg.tier === 'Ultimate') {
    items.push({ name: 'Motion Detectors', baseQty: 2 });
    items.push({ name: 'Mobile App & Remote Access', baseQty: 1 });
    items.push({ name: 'Alarm.com Premium Integration', baseQty: 1 });
  }

  if (cfg.tier === 'Complete' || cfg.tier === 'Ultimate') {
    items.push({ name: 'Smoke Detectors', baseQty: 2 });
    items.push({ name: 'Carbon Monoxide Detector', baseQty: 1 });
  }

  if (cfg.tier === 'Ultimate') {
    items.push({ name: 'Smart Lock - Keyless Entry', baseQty: 1 });
    items.push({ name: 'Overhead Garage Door Control', baseQty: 1 });
    items.push({ name: 'Water Leak Sensor', baseQty: 1 });
  }

  return items;
}

export function buildFullEquipmentCatalog(cfg: SystemConfig): EquipmentItem[] {
  const suggestedItems = buildEquipment(cfg);
  const suggestedQtyByName = new Map<string, number>();

  suggestedItems.forEach(item => {
    const key = normalizeEquipmentName(item.name);
    suggestedQtyByName.set(key, (suggestedQtyByName.get(key) ?? 0) + item.baseQty);
  });

  return EQUIPMENT_CATALOG_ORDER.map(name => ({
    name,
    baseQty: suggestedQtyByName.get(name) ?? 0,
  }));
}
