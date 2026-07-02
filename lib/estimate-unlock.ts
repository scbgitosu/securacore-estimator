import type { SystemConfig } from '@/types';

const STORAGE_KEY = 'sc-estimate-unlocked';

// `buildId` distinguishes separate "Build My Own System" sessions. Custom
// builds always carry tier: null, cameraScope: null, so without it every
// custom build for the same home profile hashes to the same key — unlocking
// once would silently unlock every future custom build in the session.
export function configUnlockKey(cfg: SystemConfig, buildId: number): string {
  return [cfg.homeType, cfg.homeSize, cfg.tier, cfg.cameraScope, cfg.doors, buildId].join('|');
}

export function readUnlockKey(): string | null {
  if (typeof sessionStorage === 'undefined') return null;
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function writeUnlockKey(key: string): void {
  if (typeof sessionStorage === 'undefined') return;
  try {
    sessionStorage.setItem(STORAGE_KEY, key);
  } catch {
    /* ignore quota / private mode */
  }
}

export function clearUnlockKey(): void {
  if (typeof sessionStorage === 'undefined') return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function isConfigUnlocked(cfg: SystemConfig, buildId: number): boolean {
  const stored = readUnlockKey();
  if (!stored) return false;
  return stored === configUnlockKey(cfg, buildId);
}
