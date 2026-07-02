'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import type { SystemConfig } from '@/types';
import {
  configUnlockKey,
  clearUnlockKey,
  isConfigUnlocked,
  writeUnlockKey,
} from '@/lib/estimate-unlock';
import { buildFullEquipmentCatalog, MAX_ITEM_QTY } from '@/lib/equipment';
import { Step1PropertyProfile } from './Step1PropertyProfile';
import { Step2SecurityTier } from './Step2SecurityTier';
import { Step3SurveillanceScope } from './Step3SurveillanceScope';
import { Step4InvestmentSummary } from './Step4InvestmentSummary';
import { LeadModal } from './LeadModal';

const STEPS = [
  { label: ['Property', 'Profile'],    short: '01' },
  { label: ['Security', 'Tier'],       short: '02' },
  { label: ['Surveillance', 'Scope'],  short: '03' },
  { label: ['Investment', 'Summary'],  short: '04' },
];

const DEFAULT_CONFIG: SystemConfig = {
  homeType:    null,
  doors:       2,
  homeSize:    null,
  cameraScope: null,
  tier:        null,
};

function canAdvance(step: number, cfg: SystemConfig): boolean {
  if (step === 0) return !!cfg.homeType && !!cfg.homeSize;
  if (step === 1) return !!cfg.tier;
  if (step === 2) return !!cfg.cameraScope;
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
  const [mode, setMode] = useState<'guided' | 'custom'>('guided');
  const [cfg, setCfg] = useState<SystemConfig>(DEFAULT_CONFIG);
  const [estimateUnlocked, setEstimateUnlocked] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalAnchor, setModalAnchor] = useState<HTMLElement | null>(null);
  const [equipmentList, setEquipmentList] = useState('');
  const [quoteEstimate, setQuoteEstimate] = useState<{ low: number; high: number }>({
    low: 0,
    high: 0,
  });
  const [animKey, setAnimKey] = useState(0);
  const maxHeightRef = useRef(0);

  // Equipment quantities live here (not in Step4) so that navigating away
  // from and back to the summary — e.g. custom builders using "Edit
  // Selections" — doesn't remount-and-discard in-progress edits.
  const equipment = useMemo(
    () => buildFullEquipmentCatalog(cfg),
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

  function setQty(name: string, val: number) {
    setQtys(p => ({ ...p, [name]: Math.max(0, Math.min(MAX_ITEM_QTY, val)) }));
  }

  const unlockKey = configUnlockKey(cfg);

  useEffect(() => {
    setEstimateUnlocked(isConfigUnlocked(cfg));
  }, [unlockKey]);

  const handleUnlockEstimate = useCallback(() => {
    writeUnlockKey(unlockKey);
    setEstimateUnlocked(true);
  }, [unlockKey]);

  // Mount-only: the ResizeObserver and listeners we install here observe
  // document/body, so they keep firing across step/modal transitions without
  // needing to be torn down and re-bound on each change. The
  // `wizard:layout-change` event lets descendants explicitly trigger a recalc.
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
      const h = getDocumentHeight();
      // Only grow the iframe container — never shrink it. This keeps the Wix
      // footer at a stable position as the user navigates through steps.
      if (h <= maxHeightRef.current) return;
      maxHeightRef.current = h;
      window.parent.postMessage({ type: 'setHeight', height: h }, '*');
    };

    const scheduleHeight = () => {
      if (frameId !== null) return;
      frameId = window.requestAnimationFrame(() => {
        frameId = null;
        sendHeight();
      });
    };

    // Forward wheel events to the parent page so Chrome doesn't swallow them
    // when the cursor is over the iframe.
    const handleWheel = (e: WheelEvent) => {
      window.parent.postMessage(
        { type: 'wheel', deltaY: e.deltaY, deltaX: e.deltaX },
        '*'
      );
    };

    const observer = new ResizeObserver(scheduleHeight);
    observer.observe(document.documentElement);
    if (document.body) observer.observe(document.body);

    const viewport = window.visualViewport;
    window.addEventListener('resize', scheduleHeight);
    window.addEventListener('wizard:layout-change', scheduleHeight);
    viewport?.addEventListener('resize', scheduleHeight);
    viewport?.addEventListener('scroll', scheduleHeight);
    document.addEventListener('wheel', handleWheel, { passive: true });

    scheduleHeight();

    // Step transitions and modal open/close can finish after first paint.
    settleTimerId = window.setTimeout(scheduleHeight, 250);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', scheduleHeight);
      window.removeEventListener('wizard:layout-change', scheduleHeight);
      viewport?.removeEventListener('resize', scheduleHeight);
      viewport?.removeEventListener('scroll', scheduleHeight);
      document.removeEventListener('wheel', handleWheel);
      if (frameId !== null) window.cancelAnimationFrame(frameId);
      if (settleTimerId !== null) window.clearTimeout(settleTimerId);
    };
  }, []);

  // After a step transition or modal toggle, give the layout a beat to settle
  // and then recalc the iframe height.
  useEffect(() => {
    const id = window.setTimeout(() => {
      window.dispatchEvent(new Event('wizard:layout-change'));
    }, 50);
    return () => window.clearTimeout(id);
  }, [step, showModal, estimateUnlocked]);

  function goNext() {
    if (step < 3 && canAdvance(step, cfg)) {
      setStep(s => s + 1);
      setAnimKey(k => k + 1);
    }
  }

  function goBack() {
    if (step > 0) {
      // Custom builders skip straight from Step 1 to the summary, so "Edit
      // Selections" returns them to Step 1 rather than the unused tier/scope steps.
      setStep(s => (mode === 'custom' ? 0 : s - 1));
      setAnimKey(k => k + 1);
    }
  }

  // "Let SecuraCore Design My System" — the guided tier → scope → summary flow.
  function startGuided() {
    setMode('guided');
    goNext();
  }

  // "Build My Own System" — jump to the equipment list with nothing preselected.
  // With no tier set, the summary renders the full catalog at qty 0 to build up.
  function startCustom() {
    if (!canAdvance(0, cfg)) return;
    // Clear any tier/scope left over from exploring the guided path so the
    // summary starts as a truly blank catalog (all quantities 0).
    setCfg(p => ({ ...p, tier: null, cameraScope: null }));
    setMode('custom');
    setStep(3);
    setAnimKey(k => k + 1);
  }

  function restart() {
    maxHeightRef.current = 0;
    clearUnlockKey();
    setEstimateUnlocked(false);
    setCfg(DEFAULT_CONFIG);
    setMode('guided');
    setStep(0);
    setAnimKey(k => k + 1);
    setShowModal(false);
    setModalAnchor(null);
  }

  function handleSeeEstimate(
    list: string,
    estimate: { low: number; high: number },
    anchorEl: HTMLElement
  ) {
    setEquipmentList(list);
    setQuoteEstimate(estimate);
    setModalAnchor(anchorEl);
    setShowModal(true);
  }

  function handleCloseModal() {
    setShowModal(false);
    setModalAnchor(null);
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
          {step === 1 && <Step2SecurityTier cfg={cfg} setCfg={setCfg} />}
          {step === 2 && <Step3SurveillanceScope cfg={cfg} setCfg={setCfg} />}
          {step === 3 && (
            <Step4InvestmentSummary
              cfg={cfg}
              equipment={equipment}
              qtys={qtys}
              setQty={setQty}
              estimateUnlocked={estimateUnlocked}
              onSeeEstimate={handleSeeEstimate}
            />
          )}

          {/* Navigation */}
          {step === 0 ? (
            <div className="wiz-choice-btns">
              <button className="btn-next" onClick={startGuided} disabled={!canAdvance(0, cfg)}>
                Let SecuraCore Design My System
                <ArrowRight />
              </button>
              <button className="btn-secondary" onClick={startCustom} disabled={!canAdvance(0, cfg)}>
                Build My Own System
              </button>
            </div>
          ) : step < 3 ? (
            <div className="wiz-nav-btns">
              <button className="btn-back" onClick={goBack}>
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

      {showModal && (
        <LeadModal
          cfg={cfg}
          equipmentList={equipmentList}
          estimateLow={quoteEstimate.low}
          estimateHigh={quoteEstimate.high}
          anchorEl={modalAnchor}
          onUnlockEstimate={handleUnlockEstimate}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}
