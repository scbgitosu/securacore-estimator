'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import type { SystemConfig } from '@/types';
import { buildEquipment } from '@/lib/equipment';
import { computeBasePricing, computeAdjustedPricing } from '@/lib/pricing';
import { MONITORING_RANGE } from '@/pricing-config';

const HOME_TYPE_LABELS: Record<string, string> = {
  'single-family': 'Single Family',
  'condo':         'Condo',
  'townhouse':     'Townhouse',
  'business':      'Business',
};

const CAMERA_SCOPE_LABELS: Record<string, string> = {
  'front-only':    'Front / Entrance Only',
  'perimeter':     'Perimeter Coverage',
  'full-coverage': 'Full Interior / Exterior',
};

interface Props {
  cfg: SystemConfig;
  onRequestQuote: () => void;
}

export function Step4InvestmentSummary({ cfg, onRequestQuote }: Props) {
  const equipment = buildEquipment(cfg);
  const basePricing = computeBasePricing(cfg)!;

  const equipKey = equipment.map(e => e.name).join('|');

  const [qtys, setQtys] = useState<Record<number, number>>(() =>
    Object.fromEntries(equipment.map((item, i) => [i, item.baseQty]))
  );

  useEffect(() => {
    setQtys(Object.fromEntries(equipment.map((item, i) => [i, item.baseQty])));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [equipKey]);

  const adjustedPricing = useMemo(
    () => computeAdjustedPricing(basePricing, equipment, qtys),
    [qtys, equipKey, basePricing]
  );

  const priceChanged =
    adjustedPricing.low !== basePricing.low || adjustedPricing.high !== basePricing.high;

  function setQty(i: number, val: number) {
    setQtys(p => ({ ...p, [i]: Math.max(0, val) }));
  }

  return (
    <div>
      <div className="summary-header">
        <div>
          <p className="step-eyebrow">Your System Design</p>
          <h2 className="step-title">{cfg.tier} Package</h2>
          <div className="config-chips">
            <span className="config-chip">{HOME_TYPE_LABELS[cfg.homeType!] ?? '—'}</span>
            <span className="config-chip">
              {cfg.doors}{cfg.doors !== 1 ? ' Doors' : ' Door'} · {cfg.windows}{cfg.windows !== 1 ? ' Windows' : ' Window'}
            </span>
            <span className="config-chip">{CAMERA_SCOPE_LABELS[cfg.cameraScope!] ?? '—'}</span>
          </div>
        </div>
        <Image src="/assets/logo-mark.png" alt="SecuraCore" width={48} height={48} className="summary-mark" />
      </div>

      <div className="summary-body">
        <div className="summary-section">
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
            <div className="summary-section-label" style={{ marginBottom: 0 }}>Equipment Included</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--sc-grey-400)', fontStyle: 'italic' }}>
              Adjust quantities or set to 0 to remove
            </div>
          </div>
          <div className="equipment-list">
            {equipment.map((item, i) => {
              const qty = qtys[i] ?? item.baseQty;
              const removed = qty === 0;
              return (
                <div
                  key={i}
                  className="equipment-row"
                  style={{ opacity: removed ? 0.35 : 1, transition: 'opacity .2s' }}
                >
                  <div className="equipment-row-left">
                    <div className="equipment-dot" style={{ background: removed ? 'var(--sc-grey-300)' : 'var(--sc-orange)' }} />
                    <div className="equipment-name" style={{ textDecoration: removed ? 'line-through' : 'none', color: removed ? 'var(--sc-grey-400)' : 'var(--sc-ink)' }}>
                      {item.name}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', overflow: 'hidden', flexShrink: 0 }}>
                    <QtyBtn onClick={() => setQty(i, qty - 1)} label="−" />
                    <span style={{ minWidth: 28, textAlign: 'center', fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: removed ? 'var(--sc-grey-400)' : 'var(--sc-ink)', padding: '0 4px' }}>
                      {qty}
                    </span>
                    <QtyBtn onClick={() => setQty(i, qty + 1)} label="+" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pricing-block">
          <div className="pricing-range-label">
            Estimated Investment — Professional Installation Included
            {priceChanged && (
              <span style={{ marginLeft: 8, color: 'var(--sc-orange)', fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, textTransform: 'none', letterSpacing: 0 }}>
                · adjusted
              </span>
            )}
          </div>
          <div className="pricing-range">
            ${adjustedPricing.low.toLocaleString()} – ${adjustedPricing.high.toLocaleString()}
          </div>
          <div className="pricing-note">
            Equipment + labor. Final investment determined at your on-site assessment.
          </div>
          <div className="monitoring-pill">
            <div className="monitoring-pill-dot" />
            <div className="monitoring-pill-text">
              Alarm.com monitoring: <strong>${MONITORING_RANGE.low.toFixed(2)}–${MONITORING_RANGE.high.toFixed(2)} / month</strong> after installation
            </div>
          </div>
        </div>

        <div className="cta-block">
          <div className="cta-note">
            Ready for exact numbers? Our team will visit your property, walk every entry point, and provide a formal written quote.
          </div>
          <button className="btn-cta" onClick={onRequestQuote}>
            Request Formal Quote →
          </button>
        </div>
      </div>
    </div>
  );
}

function QtyBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 30, height: 30,
        background: 'var(--sc-grey-100)',
        border: 'none', cursor: 'pointer',
        fontSize: 16, color: 'var(--sc-ink)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background .15s',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--sc-grey-200)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'var(--sc-grey-100)')}
      aria-label={label === '−' ? 'Decrease' : 'Increase'}
    >
      {label}
    </button>
  );
}
