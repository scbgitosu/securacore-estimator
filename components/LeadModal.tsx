'use client';

import { useState } from 'react';
import type { SystemConfig } from '@/types';
import { computeBasePricing } from '@/lib/pricing';

interface FormData {
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface Props {
  cfg: SystemConfig;
  onClose: () => void;
}

export function LeadModal({ cfg, onClose }: Props) {
  const [form, setForm] = useState<FormData>({ name: '', email: '', phone: '', address: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const set = (k: keyof FormData, v: string) => setForm(p => ({ ...p, [k]: v }));
  const valid = form.name.trim() && form.email.trim() && form.phone.trim();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || status === 'submitting') return;

    setStatus('submitting');
    const pricing = computeBasePricing(cfg);

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          systemConfig: cfg,
          estimateLow: pricing?.low ?? 0,
          estimateHigh: pricing?.high ?? 0,
        }),
      });

      if (!res.ok) throw new Error('Submission failed');
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-card">
        {status === 'success' ? (
          <div className="success-body">
            <div className="success-check">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M7 16l6 6 12-12" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="success-title">Request Received</div>
            <div className="success-msg">
              Thank you. A SecuraCore team member will reach out within one business day to schedule your on-site assessment.
            </div>
            <button className="btn-done" onClick={onClose}>Back to My Design</button>
          </div>
        ) : (
          <>
            <div className="modal-head">
              <p className="step-eyebrow">No-Cost Quote Request</p>
              <h2>Request Formal Quote</h2>
              <button className="btn-modal-close" onClick={onClose} aria-label="Close">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M1 1l12 12M13 1L1 13"/>
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      placeholder="Jane Smith"
                      value={form.name}
                      onChange={e => set('name', e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone *</label>
                    <input
                      type="tel"
                      placeholder="(541) 555-0100"
                      value={form.phone}
                      onChange={e => set('phone', e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group full">
                    <label>Email Address *</label>
                    <input
                      type="email"
                      placeholder="jane@example.com"
                      value={form.email}
                      onChange={e => set('email', e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group full">
                    <label>Project Address</label>
                    <input
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
                  {status === 'submitting' ? 'Sending…' : 'Send My Design — Request Quote'}
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
