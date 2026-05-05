'use client';

import type { SystemConfig, CameraScope } from '@/types';
import { CoverageIcon } from './CoverageIcon';

const CAMERA_OPTIONS: { id: CameraScope; label: string; cameras: string; desc: string }[] = [
  {
    id: 'front-only',
    label: 'Front / Entrance',
    cameras: '1 Camera + 1 Doorbell',
    desc: 'Outdoor surveillance camera\nCovering your driveway\nVideo doorbell',
  },
  {
    id: 'perimeter',
    label: 'Perimeter Coverage',
    cameras: '4 Cameras + 1 Doorbell',
    desc: 'Four outdoor surveillance cameras covering your perimeter\nVideo Doorbell',
  },
  {
    id: 'full-coverage',
    label: 'Full Interior / Exterior',
    cameras: '5 Cameras + 1 Doorbell',
    desc: 'Four outdoor surveillance cameras\nOne interior surveillance camera\nVideo Doorbell\n24/7 onboard recording',
  },
  {
    id: 'no-surveillance',
    label: 'No Surveillance',
    cameras: '0 Cameras',
    desc: 'Skip camera coverage and continue with intrusion-focused protection only.',
  },
];

function CheckIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
      <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

interface Props {
  cfg: SystemConfig;
  setCfg: React.Dispatch<React.SetStateAction<SystemConfig>>;
}

export function Step2SurveillanceScope({ cfg, setCfg }: Props) {
  const set = <K extends keyof SystemConfig>(k: K, v: SystemConfig[K]) =>
    setCfg(p => ({ ...p, [k]: v }));

  return (
    <div>
      <p className="step-eyebrow">Step 3 of 4</p>
      <h2 className="step-title">Surveillance Scope</h2>
      <p className="step-subtitle">
        Choose the camera coverage level that fits your property and peace of mind. Full Interior / Exterior is five cameras plus a video doorbell—four outdoor and one indoor.
        <em className="step-subtitle-secondary">
          These selections are flexible, and you can adjust quantities at the end before finalizing.
        </em>
      </p>

      <div className="option-grid cols-3">
        {CAMERA_OPTIONS.map(opt => {
          const selected = cfg.cameraScope === opt.id;
          return (
            <div
              key={opt.id}
              className={`coverage-card${selected ? ' selected' : ''}`}
              onClick={() => set('cameraScope', opt.id)}
            >
              <div className="coverage-icon-wrap">
                <CoverageIcon type={opt.id} selected={selected} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
                <div className="coverage-label">{opt.label}</div>
                <div className="coverage-count">{opt.cameras}</div>
              </div>
              <div className="coverage-desc" style={{ whiteSpace: 'pre-line' }}>{opt.desc}</div>
              <div style={{
                width: 20, height: 20, borderRadius: '50%',
                border: `2px solid ${selected ? 'var(--sc-orange)' : 'var(--border-default)'}`,
                background: selected ? 'var(--sc-orange)' : '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginTop: 4, flexShrink: 0,
                transition: 'all .2s',
              }}>
                {selected && <CheckIcon />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
