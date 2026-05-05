export type HomeType = 'single-family' | 'condo' | 'townhouse' | 'business';
export type CameraScope = 'front-only' | 'perimeter' | 'full-coverage';
export type Tier = 'Essential' | 'Complete' | 'Ultimate';

export interface SystemConfig {
  homeType: HomeType | null;
  doors: number;
  windows: number;
  cameraScope: CameraScope | null;
  tier: Tier | null;
}

export interface EquipmentItem {
  name: string;
  baseQty: number;
}

export interface LeadPayload {
  name: string;
  email: string;
  phone: string;
  address: string;
  systemConfig: SystemConfig;
  estimateLow: number;
  estimateHigh: number;
  equipmentList?: string;
}
