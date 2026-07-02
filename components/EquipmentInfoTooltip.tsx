'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const TOOLTIP_MAX_WIDTH = 260;
const VIEWPORT_PAD = 8;

interface Props {
  label: string;
  description: string;
}

export function EquipmentInfoTooltip({ label, description }: Props) {
  const tooltipId = useId();
  const btnRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, above: false });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = useCallback(() => {
    const btn = btnRef.current;
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let left = rect.left + rect.width / 2 - TOOLTIP_MAX_WIDTH / 2;
    left = Math.max(VIEWPORT_PAD, Math.min(left, vw - TOOLTIP_MAX_WIDTH - VIEWPORT_PAD));

    const spaceBelow = vh - rect.bottom;
    const above = spaceBelow < 120 && rect.top > spaceBelow;
    const top = above ? rect.top - VIEWPORT_PAD : rect.bottom + VIEWPORT_PAD;

    setPos({ top, left, above });
  }, []);

  const show = useCallback(() => {
    updatePosition();
    setOpen(true);
  }, [updatePosition]);

  const hide = useCallback(() => {
    if (pinned) return;
    setOpen(false);
  }, [pinned]);

  useEffect(() => {
    if (!open) return;

    const handleReposition = () => updatePosition();
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (btnRef.current?.contains(target)) return;
      setOpen(false);
      setPinned(false);
    };

    window.addEventListener('scroll', handleReposition, true);
    window.addEventListener('resize', handleReposition);
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleReposition, true);
      window.removeEventListener('resize', handleReposition);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [open, updatePosition]);

  function handleClick() {
    if (open && pinned) {
      setOpen(false);
      setPinned(false);
      return;
    }
    updatePosition();
    setOpen(true);
    setPinned(true);
  }

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        className="equipment-info-btn"
        aria-label={`More info about ${label}`}
        aria-describedby={open ? tooltipId : undefined}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={() => {
          if (!pinned) setOpen(false);
        }}
        onClick={handleClick}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
          <circle cx="5" cy="5" r="4.25" stroke="currentColor" strokeWidth="1.2" />
          <path d="M5 4.2V7.2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="5" cy="2.6" r="0.55" fill="currentColor" />
        </svg>
      </button>

      {mounted && open &&
        createPortal(
          <div
            id={tooltipId}
            role="tooltip"
            className="equipment-info-tooltip"
            style={{
              top: pos.top,
              left: pos.left,
              maxWidth: TOOLTIP_MAX_WIDTH,
              transform: pos.above ? 'translateY(-100%)' : undefined,
            }}
          >
            {description}
          </div>,
          document.body
        )}
    </>
  );
}
