'use client';

import type { SystemConfig, Tier } from '@/types';

const TIERS: { id: Tier; tagline: string; popular: boolean; features: string[] }[] = [
  {
    id: 'Essential',
    tagline: 'Core protection for every entry point.',
    popular: false,
    features: [
      '7 inch wall/counter security control panel',
      'Door sensors',
      'Motion Detectors',
      '24/7 Professional monitoring',
      'System control, mobile alerts & remote arm/disarm (alarm.com)',
    ],
  },
  {
    id: 'Complete',
    tagline: 'Adds life safety protection.',
    popular: true,
    features: [
      'Everything in Essential Tier',
      'Smoke detection',
      'Carbon monoxide detection',
    ],
  },
  {
    id: 'Ultimate',
    tagline: 'Adds home automation.',
    popular: false,
    features: [
      'Everything in Complete Tier',
      'Smart lock & keyless entry',
      'Garage door control & notification',
      'Water leak detection',
    ],
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

export function Step3SecurityTier({ cfg, setCfg }: Props) {
  const set = <K extends keyof SystemConfig>(k: K, v: SystemConfig[K]) =>
    setCfg(p => ({ ...p, [k]: v }));

  return (
    <div>
      <p className="step-eyebrow">Step 2 of 4</p>
      <h2 className="step-title">Security Tier</h2>
      <p className="step-subtitle">
        Select the level of protection and smart home integration that fits your lifestyle.
        <em className="step-subtitle-secondary">
          These selections are flexible, and you can adjust quantities at the end before finalizing.
        </em>
      </p>

      <div className="option-grid cols-3">
        {TIERS.map(t => {
          const selected = cfg.tier === t.id;
          return (
            <div
              key={t.id}
              className={`tier-card${t.popular ? ' popular' : ''}${selected ? ' selected' : ''}`}
              onClick={() => set('tier', t.id)}
            >
              <div className="tier-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div>
                    <div className="tier-name">{t.id}</div>
                    <div className="tier-tagline">{t.tagline}</div>
                  </div>
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%', flexShrink: 0, marginTop: 2,
                    border: `2px solid ${selected ? 'var(--sc-orange)' : 'var(--border-default)'}`,
                    background: selected ? 'var(--sc-orange)' : '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all .2s',
                  }}>
                    {selected && <CheckIcon />}
                  </div>
                </div>
              </div>
              <div className="tier-body">
                {t.features.map(f => (
                  <div key={f} className="tier-feature">
                    <div className="tier-feature-dot">
                      <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2 2 4-4" stroke="var(--sc-orange)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    {f}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
