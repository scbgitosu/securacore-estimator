'use client';

import type { SystemConfig, HomeType } from '@/types';

const HOME_TYPES: { id: HomeType; label: string; desc: string }[] = [
  { id: 'single-family', label: 'Single Family', desc: 'Detached house with yard' },
  { id: 'condo',         label: 'Condo',         desc: 'Shared-building unit' },
  { id: 'townhouse',     label: 'Townhouse',      desc: 'Multi-floor attached' },
  { id: 'business',      label: 'Business',       desc: 'Commercial property' },
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

export function Step1PropertyProfile({ cfg, setCfg }: Props) {
  const set = <K extends keyof SystemConfig>(k: K, v: SystemConfig[K]) =>
    setCfg(p => ({ ...p, [k]: v }));

  return (
    <div>
      <p className="step-eyebrow">Step 1 of 4</p>
      <h2 className="step-title">Property Profile</h2>
      <p className="step-subtitle">Tell us about your property so we can right-size your system from the start.</p>

      <div style={{ marginBottom: 8 }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: 'var(--tracking-eyebrow)', textTransform: 'uppercase', color: 'var(--sc-grey-700)', marginBottom: 12 }}>
          Home Type
        </p>
        <div className="option-grid cols-2">
          {HOME_TYPES.map(t => (
            <div
              key={t.id}
              className={`option-card${cfg.homeType === t.id ? ' selected' : ''}`}
              onClick={() => set('homeType', t.id)}
            >
              <div className="check-ring">{cfg.homeType === t.id && <CheckIcon />}</div>
              <div className="option-label">{t.label}</div>
              <div className="option-desc">{t.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="input-row">
        <div className="input-group">
          <label>Exterior Doors</label>
          <div className="input-stepper">
            <button className="stepper-btn" disabled={cfg.doors <= 1} onClick={() => set('doors', cfg.doors - 1)}>−</button>
            <span className="stepper-val">{cfg.doors}</span>
            <button className="stepper-btn" onClick={() => set('doors', cfg.doors + 1)}>+</button>
          </div>
        </div>
        <div className="input-group">
          <label>Ground Floor Windows</label>
          <div className="input-stepper">
            <button className="stepper-btn" disabled={cfg.windows <= 0} onClick={() => set('windows', cfg.windows - 1)}>−</button>
            <span className="stepper-val">{cfg.windows}</span>
            <button className="stepper-btn" onClick={() => set('windows', cfg.windows + 1)}>+</button>
          </div>
        </div>
      </div>
    </div>
  );
}
