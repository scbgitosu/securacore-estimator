import type { SystemConfig, EquipmentItem } from '@/types';

export function buildEquipment(cfg: SystemConfig): EquipmentItem[] {
  if (!cfg.tier) return [];

  const items: EquipmentItem[] = [];
  const doors = cfg.doors || 1;
  const windows = cfg.windows || 2;

  items.push({ name: 'Central Control Panel', baseQty: 1 });
  items.push({ name: doors > 1 ? 'Door Sensors' : 'Door Sensor', baseQty: doors });
  if (windows > 0) {
    items.push({ name: windows > 1 ? 'Window Sensors' : 'Window Sensor', baseQty: windows });
  }

  if (cfg.cameraScope === 'front-only') {
    items.push({ name: '4K Outdoor Camera — Front', baseQty: 1 });
  } else if (cfg.cameraScope === 'perimeter') {
    items.push({ name: '4K Outdoor Camera — Perimeter', baseQty: 4 });
  } else if (cfg.cameraScope === 'full-coverage') {
    items.push({ name: '4K Outdoor Camera — Perimeter', baseQty: 4 });
    items.push({ name: '4K Indoor Camera', baseQty: 2 });
  }

  if (cfg.tier === 'Complete' || cfg.tier === 'Ultimate') {
    items.push({ name: '4K Video Doorbell', baseQty: 1 });
    items.push({
      name: windows > 2 ? 'Motion Detectors' : 'Motion Detector',
      baseQty: Math.max(1, Math.ceil(windows / 3)),
    });
  }

  if (cfg.tier === 'Ultimate') {
    items.push({ name: 'Smart Lock', baseQty: 1 });
    items.push({ name: 'Mobile App & Remote Access', baseQty: 1 });
    items.push({ name: 'Alarm.com Premium Integration', baseQty: 1 });
    items.push({ name: 'Smoke / CO Detector', baseQty: 1 });
    items.push({ name: 'Water Leak Sensor', baseQty: 1 });
  }

  return items;
}
