export type HomeType = 'single-family' | 'condo' | 'townhouse' | 'business';
export type HomeSize = 'small' | 'medium' | 'large';
export type CameraScope = 'front-only' | 'perimeter' | 'full-coverage' | 'no-surveillance';
export type Tier = 'Essential' | 'Complete' | 'Ultimate';

export interface SystemConfig {
  homeType: HomeType | null;
  doors: number;
  homeSize: HomeSize | null;
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
