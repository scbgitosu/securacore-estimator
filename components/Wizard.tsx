'use client';

import { useState, useEffect } from 'react';
import type { SystemConfig } from '@/types';
import { Step1PropertyProfile } from './Step1PropertyProfile';
import { Step2SurveillanceScope } from './Step2SurveillanceScope';
import { Step3SecurityTier } from './Step3SecurityTier';
import { Step4InvestmentSummary } from './Step4InvestmentSummary';
import { LeadModal } from './LeadModal';

const STEPS = [
  { label: ['Property', 'Profile'],    short: '01' },
  { label: ['Surveillance', 'Scope'],  short: '02' },
  { label: ['Security', 'Tier'],       short: '03' },
  { label: ['Investment', 'Summary'],  short: '04' },
];

const DEFAULT_CONFIG: SystemConfig = {
  homeType:    null,
  doors:       2,
  windows:     4,
  cameraScope: null,
  tier:        null,
};

function canAdvance(step: number, cfg: SystemConfig): boolean {
  if (step === 0) return !!cfg.homeType;
  if (step === 1) return !!cfg.cameraScope;
  if (step === 2) return !!cfg.tier;
  return true;
}

function ArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 10h12M11 4l6 6-6 6"/>
    </svg>
  );
}

function ArrowLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 10H4M9 16l-6-6 6-6"/>
    </svg>
  );
}

function CheckDone() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function Wizard() {
  const [step, setStep] = useState(0);
  const [cfg, setCfg] = useState<SystemConfig>(DEFAULT_CONFIG);
  const [showModal, setShowModal] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    let frameId: number | null = null;
    let settleTimerId: number | null = null;

    const getDocumentHeight = () => {
      const body = document.body;
      const html = document.documentElement;

      const documentHeight = Math.max(
        body?.scrollHeight ?? 0,
        body?.offsetHeight ?? 0,
        html.scrollHeight,
        html.offsetHeight
      );

      const viewportHeight = Math.ceil(
        Math.max(
          window.innerHeight || 0,
          window.visualViewport?.height || 0
        )
      );

      // Fixed-position layers (like the lead modal) may not affect scrollHeight.
      return Math.max(documentHeight, viewportHeight);
    };

    const sendHeight = () => {
      window.parent.postMessage(
        { type: 'setHeight', height: getDocumentHeight() },
        '*'
      );
    };

    const scheduleHeight = () => {
      if (frameId !== null) return;
      frameId = window.requestAnimationFrame(() => {
        frameId = null;
        sendHeight();
      });
    };

    const observer = new ResizeObserver(scheduleHeight);
    observer.observe(document.documentElement);
    if (document.body) observer.observe(document.body);

    const viewport = window.visualViewport;
    window.addEventListener('resize', scheduleHeight);
    window.addEventListener('wizard:layout-change', scheduleHeight);
    viewport?.addEventListener('resize', scheduleHeight);
    viewport?.addEventListener('scroll', scheduleHeight);

    scheduleHeight();

    // Step transitions and modal open/close can finish after first paint.
    settleTimerId = window.setTimeout(scheduleHeight, 250);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', scheduleHeight);
      window.removeEventListener('wizard:layout-change', scheduleHeight);
      viewport?.removeEventListener('resize', scheduleHeight);
      viewport?.removeEventListener('scroll', scheduleHeight);
      if (frameId !== null) window.cancelAnimationFrame(frameId);
      if (settleTimerId !== null) window.clearTimeout(settleTimerId);
    };
  }, [step, showModal]);

  function goNext() {
    if (step < 3 && canAdvance(step, cfg)) {
      setStep(s => s + 1);
      setAnimKey(k => k + 1);
    }
  }

  function goBack() {
    if (step > 0) {
      setStep(s => s - 1);
      setAnimKey(k => k + 1);
    }
  }

  function restart() {
    setCfg(DEFAULT_CONFIG);
    setStep(0);
    setAnimKey(k => k + 1);
  }

  const fillPct = (step / (STEPS.length - 1)) * 100;

  return (
    <>
      <main className="wiz-page">
        {/* Progress bar */}
        <div className="wiz-progress-wrap">
          <div className="wiz-step-labels">
            {STEPS.map((s, i) => (
              <div
                key={i}
                className={`wiz-step-label${i === step ? ' active' : i < step ? ' done' : ''}`}
              >
                <div className="wiz-step-dot">
                  {i < step ? <CheckDone /> : s.short}
                </div>
                {s.label.map((ln, j) => <span key={j}>{ln}</span>)}
              </div>
            ))}
          </div>
          <div className="wiz-progress-track">
            <div className="wiz-progress-fill" style={{ width: `${fillPct}%` }} />
          </div>
        </div>

        {/* Step content */}
        <div className="wiz-card" key={animKey}>
          {step === 0 && <Step1PropertyProfile cfg={cfg} setCfg={setCfg} />}
          {step === 1 && <Step2SurveillanceScope cfg={cfg} setCfg={setCfg} />}
          {step === 2 && <Step3SecurityTier cfg={cfg} setCfg={setCfg} />}
          {step === 3 && <Step4InvestmentSummary cfg={cfg} onRequestQuote={() => setShowModal(true)} />}

          {/* Navigation */}
          {step < 3 ? (
            <div className="wiz-nav-btns">
              <button className="btn-back" onClick={goBack} style={{ visibility: step === 0 ? 'hidden' : 'visible' }}>
                <ArrowLeft />
                Back
              </button>
              <button className="btn-next" onClick={goNext} disabled={!canAdvance(step, cfg)}>
                Continue
                <ArrowRight />
              </button>
            </div>
          ) : (
            <div className="wiz-nav-btns">
              <button className="btn-back" onClick={goBack}>
                <ArrowLeft />
                Edit Selections
              </button>
              <button className="btn-next" style={{ background: 'var(--sc-ink)' }} onClick={restart}>
                Start Over
              </button>
            </div>
          )}
        </div>
      </main>

      {showModal && <LeadModal cfg={cfg} onClose={() => setShowModal(false)} />}
    </>
  );
}
