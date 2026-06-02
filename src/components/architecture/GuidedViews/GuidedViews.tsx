'use client';

import React, { useRef } from 'react';
import type { DiagramPreset } from '../manifests/types';

export interface GuidedViewsProps {
  /** The chapter's presets (guided views), in display order. */
  presets: readonly DiagramPreset[];
  /** Active preset id (controlled). May be 'custom' when the reader diverged. */
  activePresetId: string;
  /** Intent to switch guided view. */
  onSelect: (presetId: string) => void;
  /** Accessible name for the radiogroup. */
  label?: string;
  className?: string;
}

/**
 * Controlled guided-view selector — a single-select radiogroup whose active
 * option's explanation is announced via an aria-live region (G-GV). Owns no
 * state; selecting fires `onSelect` with an allowlisted preset id only.
 *
 * @category architecture
 */
export default function GuidedViews({
  presets,
  activePresetId,
  onSelect,
  label = 'Guided views',
  className = '',
}: GuidedViewsProps) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  function focusAt(index: number) {
    const count = presets.length;
    const next = ((index % count) + count) % count;
    refs.current[next]?.focus();
    onSelect(presets[next].id);
  }

  function handleKeyDown(e: React.KeyboardEvent, index: number) {
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault();
        focusAt(index + 1);
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault();
        focusAt(index - 1);
        break;
      default:
        break;
    }
  }

  // The active radio holds the single tab stop (radiogroup pattern).
  const tabStopIndex = Math.max(
    0,
    presets.findIndex((p) => p.id === activePresetId)
  );

  return (
    <div className={className}>
      <div role="radiogroup" aria-label={label} className="flex flex-col gap-2">
        {presets.map((preset, i) => {
          const checked = preset.id === activePresetId;
          return (
            <button
              key={preset.id}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={checked}
              // On mobile the column is too narrow for the full label, so the
              // chip shows the step number; the name is announced via aria-label.
              aria-label={preset.label}
              title={preset.label}
              tabIndex={i === tabStopIndex ? 0 : -1}
              onClick={() => onSelect(preset.id)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              className={`flex min-h-11 w-full items-center justify-center rounded-lg border px-0 py-2 text-center text-sm font-medium transition-colors md:justify-start md:px-3 md:text-left ${
                checked
                  ? 'border-primary bg-primary/15 text-base-content'
                  : 'border-base-300 bg-base-200/40 text-base-content hover:bg-base-200'
              }`}
            >
              <span aria-hidden="true" className="md:hidden">
                {i + 1}
              </span>
              <span className="hidden md:inline">{preset.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
