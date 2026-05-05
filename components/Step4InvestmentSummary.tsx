'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import type { SystemConfig } from '@/types';
import { buildFullEquipmentCatalog } from '@/lib/equipment';
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
  'no-surveillance': 'No Surveillance',
};

const HOME_SIZE_LABELS: Record<string, string> = {
  small:  'Small (1500–2500 sq ft)',
  medium: 'Medium (2500–3500 sq ft)',
  large:  'Large (exceeds 3500 sq ft)',
};

// Sanity ceiling on per-item quantity — prevents accidental ballooning of the
// estimate (e.g. user holding the "+" button) and silly screenshots.
const MAX_ITEM_QTY = 25;

interface Props {
  cfg: SystemConfig;
  onRequestQuote: (equipmentList: string) => void;
}

export function Step4InvestmentSummary({ cfg, onRequestQuote }: Props) {
  const equipment = useMemo(
    () => buildFullEquipmentCatalog(cfg),
    [cfg.tier, cfg.cameraScope, cfg.doors]
  );

  // Defensive fallback: the wizard guards us from getting here without tier
  // and cameraScope set, but a deep link or future routing change could land
  // a user here directly. Render a zeroed estimate instead of crashing.
  const basePricing = useMemo(
    () => computeBasePricing(cfg) ?? { low: 0, high: 0 },
    [cfg.tier, cfg.cameraScope, cfg.doors]
  );

  const equipKey = equipment.map(e => `${e.name}:${e.baseQty}`).join('|');

  const [qtys, setQtys] = useState<Record<string, number>>(() =>
    Object.fromEntries(equipment.map(item => [item.name, item.baseQty]))
  );

  useEffect(() => {
    setQtys(Object.fromEntries(equipment.map(item => [item.name, item.baseQty])));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [equipKey]);

  // Depend on the primitive bounds rather than the basePricing object —
  // computeBasePricing returns a fresh reference on every call, which would
  // otherwise bust this memo on every render.
  const adjustedPricing = useMemo(
    () => computeAdjustedPricing(basePricing, equipment, qtys),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [qtys, equipment, basePricing.low, basePricing.high]
  );

  const sortedEquipment = useMemo(() => {
    const catalogOrder = new Map(equipment.map((item, i) => [item.name, i]));
    return [...equipment].sort((a, b) => {
      const qa = qtys[a.name] ?? a.baseQty;
      const qb = qtys[b.name] ?? b.baseQty;
      const unusedA = qa === 0 ? 1 : 0;
      const unusedB = qb === 0 ? 1 : 0;
      if (unusedA !== unusedB) return unusedA - unusedB;
      return (catalogOrder.get(a.name) ?? 0) - (catalogOrder.get(b.name) ?? 0);
    });
  }, [equipment, qtys]);

  const priceChanged =
    adjustedPricing.low !== basePricing.low || adjustedPricing.high !== basePricing.high;

  function setQty(name: string, val: number) {
    setQtys(p => ({ ...p, [name]: Math.max(0, Math.min(MAX_ITEM_QTY, val)) }));
  }

  function buildEquipmentListText() {
    const selectedItems = equipment
      .map(item => ({ name: item.name, qty: qtys[item.name] ?? item.baseQty }))
      .filter(item => item.qty > 0)
      .map(item => `${item.name} x${item.qty}`);

    return selectedItems.length > 0 ? selectedItems.join(', ') : 'None selected';
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
              {cfg.doors}{cfg.doors !== 1 ? ' Doors' : ' Door'}
            </span>
            <span className="config-chip">
              {cfg.homeSize ? HOME_SIZE_LABELS[cfg.homeSize] ?? cfg.homeSize : '—'}
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
            {sortedEquipment.map(item => {
              const qty = qtys[item.name] ?? item.baseQty;
              const removed = qty === 0;
              return (
                <div
                  key={item.name}
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
                    <QtyBtn onClick={() => setQty(item.name, qty - 1)} label="−" disabled={qty <= 0} />
                    <span style={{ minWidth: 28, textAlign: 'center', fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: removed ? 'var(--sc-grey-400)' : 'var(--sc-ink)', padding: '0 4px' }}>
                      {qty}
                    </span>
                    <QtyBtn onClick={() => setQty(item.name, qty + 1)} label="+" disabled={qty >= MAX_ITEM_QTY} />
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
          <button className="btn-cta" onClick={() => onRequestQuote(buildEquipmentListText())}>
            Request Quote
          </button>
        </div>
      </div>
    </div>
  );
}

function QtyBtn({ onClick, label, disabled }: { onClick: () => void; label: string; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 30, height: 30,
        background: 'var(--sc-grey-100)',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        fontSize: 16, color: 'var(--sc-ink)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background .15s, opacity .15s',
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = 'var(--sc-grey-200)'; }}
      onMouseLeave={e => { if (!disabled) e.currentTarget.style.background = 'var(--sc-grey-100)'; }}
      aria-label={label === '−' ? 'Decrease' : 'Increase'}
    >
      {label}
    </button>
  );
}
