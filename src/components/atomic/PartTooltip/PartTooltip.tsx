'use client';

import React from 'react';

export interface PartTooltipProps {
  open: boolean;
  name: string;
  /** The action line, e.g. "Tap to put the roof back". */
  verb: string;
  className?: string;
}

/**
 * Single-instance, AAA-contrast tooltip naming a building part. Opaque card so
 * contrast is independent of the artwork behind it. role=status so toggles/teaching
 * are announced to assistive tech.
 *
 * @category atomic
 */
export function PartTooltip({
  open,
  name,
  verb,
  className = '',
}: PartTooltipProps) {
  if (!open) return null;
  return (
    <div
      role="status"
      className={`pointer-events-none rounded-lg border border-[#2f4a63] bg-[#10202e] px-3 py-2 text-[#eef5ff] shadow-lg ${className}`}
    >
      <span className="block text-sm font-bold">{name}</span>
      <span className="mt-0.5 block text-xs font-semibold text-[#8fd0ff]">
        {verb}
      </span>
    </div>
  );
}

export default PartTooltip;
