'use client';

import React from 'react';

export interface LegendItem {
  id: string;
  tabColor: string;
  docked: boolean;
}

export interface StoryRibbonProps {
  heading: string;
  prose: string;
  stepIndex: number;
  stepCount: number;
  legend: LegendItem[];
  onPrev: () => void;
  onNext: () => void;
  className?: string;
}

/**
 * The narrative ribbon: active beat heading + prose, Back/Next pills (≥44px),
 * and a live legend (one dot per layer; filled = docked). Floats over the
 * building's low-information margin — never a column, never a totem.
 *
 * @category molecular
 */
export function StoryRibbon({
  heading,
  prose,
  stepIndex,
  stepCount,
  legend,
  onPrev,
  onNext,
  className = '',
}: StoryRibbonProps) {
  return (
    <div
      className={`bg-base-100/90 text-base-content rounded-xl p-4 backdrop-blur-sm ${className}`}
    >
      <h2 className="font-blueprint text-xl font-bold">{heading}</h2>
      <p aria-live="polite" className="mt-1 text-sm leading-relaxed">
        {prose}
      </p>
      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={onPrev}
          disabled={stepIndex === 0}
          className="btn btn-sm min-h-11 disabled:opacity-40"
        >
          ‹ Back
        </button>
        <ul className="flex flex-1 items-center justify-center gap-1.5">
          {legend.map((l) => (
            <li
              key={l.id}
              data-testid="legend-dot"
              data-docked={l.docked}
              aria-hidden="true"
              className="h-2.5 w-2.5 rounded-full border"
              style={{
                background: l.docked ? l.tabColor : 'transparent',
                borderColor: l.tabColor,
              }}
            />
          ))}
        </ul>
        <button
          type="button"
          onClick={onNext}
          disabled={stepIndex === stepCount - 1}
          className="btn btn-sm min-h-11 disabled:opacity-40"
        >
          Next ›
        </button>
      </div>
    </div>
  );
}

export default StoryRibbon;
