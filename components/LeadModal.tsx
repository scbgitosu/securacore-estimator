'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { SystemConfig } from '@/types';

interface FormData {
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface Props {
  cfg: SystemConfig;
  equipmentList: string;
  estimateLow: number;
  estimateHigh: number;
  anchorEl: HTMLElement | null;
  onUnlockEstimate: () => void;
  onClose: () => void;
}

const VIEWPORT_PAD = 16;
const ANCHOR_GAP = 12;

function formatRange(low: number, high: number) {
  return `$${low.toLocaleString()} – $${high.toLocaleString()}`;
}

export function LeadModal({
  cfg,
  equipmentList,
  estimateLow,
  estimateHigh,
  anchorEl,
  onUnlockEstimate,
  onClose,
}: Props) {
  const [form, setForm] = useState<FormData>({ name: '', email: '', phone: '', address: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [cardStyle, setCardStyle] = useState<CSSProperties>({});
  const cardRef = useRef<HTMLDivElement>(null);
  const set = (k: keyof FormData, v: string) => setForm(p => ({ ...p, [k]: v }));
  const valid = form.name.trim() && form.email.trim() && form.phone.trim();
  const anchored = !!anchorEl;

  const updatePosition = useCallback(() => {
    if (!anchorEl || !cardRef.current) {
      setCardStyle({});
      return;
    }

    const anchor = anchorEl.getBoundingClientRect();
    const card = cardRef.current;
    const cardH = card.getBoundingClientRect().height || card.offsetHeight || 400;
    const vh = window.visualViewport?.height ?? window.innerHeight;

    let top = anchor.top - cardH - ANCHOR_GAP;
    if (top < VIEWPORT_PAD) {
      top = anchor.bottom + ANCHOR_GAP;
    }
    if (top + cardH > vh - VIEWPORT_PAD) {
      top = Math.max(VIEWPORT_PAD, vh - VIEWPORT_PAD - cardH);
    }

    // Horizontal centering is handled in CSS so the card never exceeds iframe width.
    setCardStyle({ top });
  }, [anchorEl]);

  useLayoutEffect(() => {
    if (!anchorEl) return;

    anchorEl.scrollIntoView({ block: 'center', behavior: 'smooth' });

    const run = () => {
      updatePosition();
      window.dispatchEvent(new Event('wizard:layout-change'));
    };

    const t = window.setTimeout(run, 120);
    const raf = window.requestAnimationFrame(run);

    return () => {
      window.clearTimeout(t);
      window.cancelAnimationFrame(raf);
    };
  }, [anchorEl, status, updatePosition]);

  useEffect(() => {
    if (!anchorEl) return;

    const onReflow = () => updatePosition();
    window.addEventListener('resize', onReflow);
    window.addEventListener('scroll', onReflow, true);
    const vp = window.visualViewport;
    vp?.addEventListener('resize', onReflow);
    vp?.addEventListener('scroll', onReflow);

    const ro = cardRef.current ? new ResizeObserver(onReflow) : null;
    if (cardRef.current) ro?.observe(cardRef.current);

    return () => {
      window.removeEventListener('resize', onReflow);
      window.removeEventListener('scroll', onReflow, true);
      vp?.removeEventListener('resize', onReflow);
      vp?.removeEventListener('scroll', onReflow);
      ro?.disconnect();
    };
  }, [anchorEl, status, updatePosition]);

  useEffect(() => {
    window.dispatchEvent(new Event('wizard:layout-change'));
  }, [status]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || status === 'submitting') return;

    setStatus('submitting');

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          systemConfig: cfg,
          estimateLow,
          estimateHigh,
          equipmentList,
        }),
      });

      if (!res.ok) throw new Error('Submission failed');
      onUnlockEstimate();
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  const overlayClass = anchored
    ? 'modal-overlay modal-overlay--anchored'
    : 'modal-overlay';
  const cardClass = anchored
    ? 'modal-card modal-card--anchored'
    : 'modal-card';

  return (
    <div
      className={overlayClass}
      onClick={e => e.target === e.currentTarget && onClose()}
      role="presentation"
    >
      <div
        ref={cardRef}
        className={cardClass}
        style={anchored ? cardStyle : undefined}
        role="dialog"
        aria-modal="true"
        aria-labelledby="lead-modal-title"
      >
        {status === 'success' ? (
          <div className="success-body">
            <div className="success-check">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M7 16l6 6 12-12" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="success-title" id="lead-modal-title">You&apos;re All Set</div>
            <div className="success-estimate">{formatRange(estimateLow, estimateHigh)}</div>
            <p className="success-estimate-label">Estimated investment — installation included</p>
            <div className="success-msg">
              Thank you. A team member may follow up to schedule an on-site assessment for a formal written quote.
            </div>
            <button type="button" className="btn-done" onClick={onClose}>
              View My Estimate
            </button>
          </div>
        ) : (
          <>
            <div className="modal-head">
              <p className="step-eyebrow">Your Estimate Is Ready</p>
              <h2 id="lead-modal-title">See Your Estimate</h2>
              <button type="button" className="btn-modal-close" onClick={onClose} aria-label="Close">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M1 1l12 12M13 1L1 13"/>
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="lead-name">Full Name *</label>
                    <input
                      id="lead-name"
                      type="text"
                      placeholder="Jane Smith"
                      value={form.name}
                      onChange={e => set('name', e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="lead-phone">Phone *</label>
                    <input
                      id="lead-phone"
                      type="tel"
                      placeholder="(541) 555-0100"
                      value={form.phone}
                      onChange={e => set('phone', e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group full">
                    <label htmlFor="lead-email">Email Address *</label>
                    <input
                      id="lead-email"
                      type="email"
                      placeholder="jane@example.com"
                      value={form.email}
                      onChange={e => set('email', e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group full">
                    <label htmlFor="lead-address">Project Address</label>
                    <input
                      id="lead-address"
                      type="text"
                      placeholder="123 Cascade Ave, Bend, OR 97701"
                      value={form.address}
                      onChange={e => set('address', e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-foot">
                {status === 'error' && (
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--color-danger)', textAlign: 'center', margin: '0 0 4px' }}>
                    Something went wrong. Please try again or call us directly.
                  </p>
                )}
                <button type="submit" className="btn-submit" disabled={!valid || status === 'submitting'}>
                  {status === 'submitting' ? 'Sending…' : 'Show My Estimate'}
                </button>
                <div className="modal-privacy">
                  Your information is never shared. We&apos;ll contact you within one business day.
                </div>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
