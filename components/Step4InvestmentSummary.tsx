'use client';

import { useMemo, useRef } from 'react';
import Image from 'next/image';
import type { SystemConfig, EquipmentItem } from '@/types';
import { MAX_ITEM_QTY } from '@/lib/equipment';
import { computeLaborPricing, computeTotalEstimate } from '@/lib/pricing';
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

// Fake ranges for the gated teaser — not derived from real pricing, so the
// locked DOM never contains the customer's actual estimate.
const PLACEHOLDER_BY_TIER: Record<string, { low: string; high: string }> = {
  Essential: { low: '3,500', high: '7,500' },
  Complete:  { low: '5,000', high: '10,500' },
  Ultimate:  { low: '7,500', high: '14,000' },
};
const DEFAULT_PLACEHOLDER = { low: '4,500', high: '9,200' };

interface Props {
  cfg: SystemConfig;
  equipment: EquipmentItem[];
  qtys: Record<string, number>;
  setQty: (name: string, val: number) => void;
  estimateUnlocked: boolean;
  onSeeEstimate: (
    equipmentList: string,
    estimate: { low: number; high: number },
    anchorEl: HTMLElement
  ) => void;
}

export function Step4InvestmentSummary({ cfg, equipment, qtys, setQty, estimateUnlocked, onSeeEstimate }: Props) {
  const ctaRef = useRef<HTMLButtonElement>(null);

  // Labor is now per-equipment, so it tracks the live quantities.
  const laborPricing = useMemo(
    () => computeLaborPricing(equipment, qtys),
    [equipment, qtys]
  );

  // Depend on primitive bounds — memo deps stay stable across renders.
  const totalEstimate = useMemo(
    () => computeTotalEstimate(laborPricing, equipment, qtys),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [qtys, equipment, laborPricing.low, laborPricing.high]
  );

  // Baseline (unedited) total, used to detect the "· adjusted" badge. Labor
  // depends on quantities now, so it must be computed from the defaults too.
  const catalogDefaultTotal = useMemo(() => {
    const defaults = Object.fromEntries(equipment.map(item => [item.name, item.baseQty]));
    const defaultLabor = computeLaborPricing(equipment, defaults);
    return computeTotalEstimate(defaultLabor, equipment, defaults);
  }, [equipment]);

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

  // Custom builds have no tier-suggested baseline (every baseQty is 0), so
  // there's nothing to have been "adjusted" from — only show the badge when
  // there was an actual suggested catalog to diverge from.
  const priceChanged =
    !!cfg.tier &&
    (totalEstimate.low !== catalogDefaultTotal.low ||
      totalEstimate.high !== catalogDefaultTotal.high);

  const hasSelection = equipment.some(item => (qtys[item.name] ?? item.baseQty) > 0);

  // Live count, not cfg.doors: "Door Sensors" is independently editable via
  // its own qty stepper below, so the header chip must track that value or
  // it can disagree with what's actually priced and sent to the CRM.
  const doorCount = qtys['Door Sensors'] ?? equipment.find(item => item.name === 'Door Sensors')?.baseQty ?? 0;

  const placeholder =
    (cfg.tier && PLACEHOLDER_BY_TIER[cfg.tier]) || DEFAULT_PLACEHOLDER;

  function buildEquipmentListText() {
    const selectedItems = equipment
      .map(item => ({ name: item.name, qty: qtys[item.name] ?? item.baseQty }))
      .filter(item => item.qty > 0)
      .map(item => `${item.name} x${item.qty}`);

    return selectedItems.length > 0 ? selectedItems.join('\n') : 'None selected';
  }

  function handleRevealClick() {
    const el = ctaRef.current;
    if (!el) return;
    onSeeEstimate(buildEquipmentListText(), totalEstimate, el);
  }

  return (
    <div>
      <div className="summary-header">
        <div>
          <p className="step-eyebrow">Your System Design</p>
          <h2 className="step-title">{cfg.tier ? `${cfg.tier} Package` : 'Custom System'}</h2>
          <div className="config-chips">
            <span className="config-chip">{HOME_TYPE_LABELS[cfg.homeType!] ?? '—'}</span>
            <span className="config-chip">
              {doorCount}{doorCount !== 1 ? ' Doors' : ' Door'}
            </span>
            <span className="config-chip">
              {cfg.homeSize ? HOME_SIZE_LABELS[cfg.homeSize] ?? cfg.homeSize : '—'}
            </span>
            {cfg.cameraScope && (
              <span className="config-chip">{CAMERA_SCOPE_LABELS[cfg.cameraScope] ?? '—'}</span>
            )}
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

        {estimateUnlocked ? (
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
              ${totalEstimate.low.toLocaleString()} – ${totalEstimate.high.toLocaleString()}
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
        ) : (
          <div className="pricing-block pricing-block--gated">
            <div className="pricing-range-label">
              Estimated Investment — Professional Installation Included
            </div>
            <div className="pricing-range pricing-range--blurred" aria-hidden="true">
              ${placeholder.low} – ${placeholder.high}
            </div>
            <p className="pricing-gate-hint">
              Enter your contact info to reveal your personalized estimate.
            </p>
          </div>
        )}

        <div className="cta-block">
          {estimateUnlocked ? (
            <p className="cta-note cta-note--unlocked">
              Want a formal written quote? We&apos;ll confirm every detail during your on-site assessment.
            </p>
          ) : (
            <>
              <p className="cta-note">
                {hasSelection
                  ? 'Your custom estimate is ready. Share your contact details to see your investment range instantly.'
                  : 'Select at least one item above to see your investment range.'}
              </p>
              <button
                ref={ctaRef}
                type="button"
                className="btn-cta"
                onClick={handleRevealClick}
                disabled={!hasSelection}
              >
                Reveal My Estimate
              </button>
            </>
          )}
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
