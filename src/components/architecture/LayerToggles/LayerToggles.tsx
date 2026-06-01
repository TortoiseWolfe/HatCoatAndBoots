'use client';

import React, { useRef } from 'react';
import type { DiagramLayer } from '../manifests/types';

export interface LayerTogglesProps {
  /** Toggleable layers (non-decorative control list), in display order. */
  layers: readonly DiagramLayer[];
  /** Currently-visible layer ids (the controlled value). */
  visibleIds: ReadonlySet<string>;
  /** Intent to flip one layer's visibility. */
  onToggle: (layerId: string) => void;
  /** Accessible name for the toolbar group. */
  label?: string;
  className?: string;
}

/**
 * Controlled per-layer toggles — a WAI-ARIA toolbar of pressed buttons.
 * Owns no visibility state (G-LT). Roving tabindex + Arrow/Home/End movement;
 * each toggle is ≥44×44px and announces its name + on/off state.
 *
 * @category architecture
 */
export default function LayerToggles({
  layers,
  visibleIds,
  onToggle,
  label = 'Show or hide building parts',
  className = '',
}: LayerTogglesProps) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  function focusAt(index: number) {
    const count = layers.length;
    const next = ((index % count) + count) % count;
    refs.current[next]?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent, index: number) {
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        focusAt(index + 1);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        focusAt(index - 1);
        break;
      case 'Home':
        e.preventDefault();
        focusAt(0);
        break;
      case 'End':
        e.preventDefault();
        focusAt(layers.length - 1);
        break;
      default:
        break;
    }
  }

  // The first visible toggle (or the first toggle) holds the single tab stop.
  const tabStopIndex = Math.max(
    0,
    layers.findIndex((l) => visibleIds.has(l.id))
  );

  return (
    <div
      role="toolbar"
      aria-label={label}
      aria-orientation="vertical"
      className={`flex flex-col gap-1${className ? ` ${className}` : ''}`}
    >
      {layers.map((layer, i) => {
        const pressed = visibleIds.has(layer.id);
        return (
          <button
            key={layer.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            aria-pressed={pressed}
            tabIndex={i === tabStopIndex ? 0 : -1}
            onClick={() => onToggle(layer.id)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            className={`flex min-h-11 min-w-11 items-center gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors ${
              pressed
                ? 'border-primary bg-primary/15 text-base-content'
                : 'border-base-300 bg-base-200/40 text-base-content/60'
            }`}
          >
            <span
              aria-hidden="true"
              className={`inline-block h-3 w-3 shrink-0 rounded-full border ${
                pressed ? 'border-primary bg-primary' : 'border-base-content/40'
              }`}
            />
            {layer.label}
          </button>
        );
      })}
    </div>
  );
}
