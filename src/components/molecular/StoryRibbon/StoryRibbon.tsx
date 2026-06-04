'use client';

import React from 'react';

export interface StoryRibbonProps {
  heading: string;
  prose: string;
  /** Optional one-line distilled takeaway, shown under the prose. */
  takeaway?: string;
  stepIndex: number;
  stepCount: number;
  onPrev: () => void;
  onNext: () => void;
  className?: string;
}

/**
 * The narrative ribbon: active beat heading + the teaching prose + an optional
 * one-line takeaway, with Back/Next pills (≥44px) and a step counter. Floats over
 * the building's low-information margin — never a column, never a totem.
 *
 * @category molecular
 */
export function StoryRibbon({
  heading,
  prose,
  takeaway,
  stepIndex,
  stepCount,
  onPrev,
  onNext,
  className = '',
}: StoryRibbonProps) {
  return (
    <div
      className={`bg-base-100/90 text-base-content rounded-xl p-4 backdrop-blur-sm ${className}`}
    >
      <h2 className="font-blueprint text-xl font-bold">{heading}</h2>
      <div
        aria-live="polite"
        className="mt-1 space-y-2 text-sm leading-relaxed"
      >
        {prose.split('\n\n').map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>
      {takeaway && (
        <p className="border-primary/60 text-base-content/80 mt-3 border-l-2 pl-3 text-sm italic">
          {takeaway}
        </p>
      )}
      <div className="mt-3 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onPrev}
          disabled={stepIndex === 0}
          className="btn btn-sm min-h-11 disabled:opacity-40"
        >
          ‹ Back
        </button>
        <span
          aria-hidden="true"
          className="text-base-content/60 text-xs font-medium"
        >
          {stepIndex + 1} / {stepCount}
        </span>
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
