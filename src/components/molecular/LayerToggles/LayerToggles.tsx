'use client';

import React from 'react';
import type {
  Layer,
  LayerId,
} from '@/components/organisms/BookViewer/manifests/types';

export interface LayerTogglesProps {
  /** The chapter's layers, in display order. */
  layers: Layer[];
  /** True when a layer is docked (shown in place); false when exploded out. */
  isDocked: (id: LayerId) => boolean;
  /** Flip one layer's docked state. */
  onToggle: (id: LayerId) => void;
  className?: string;
}

/**
 * The visible layer controls: one labeled chip per building part (colour swatch +
 * name + on/off state), so a reader can clearly turn each layer on and off — the
 * discoverable counterpart to tapping the parts directly. Each chip is a real
 * ≥44px toggle button (aria-pressed), keyboard-operable.
 *
 * @category molecular
 */
export function LayerToggles({
  layers,
  isDocked,
  onToggle,
  className = '',
}: LayerTogglesProps) {
  return (
    <div
      role="group"
      aria-label="Show or hide building parts"
      className={`flex flex-wrap gap-2 ${className}`}
    >
      {layers.map((layer) => {
        const docked = isDocked(layer.id);
        return (
          <button
            key={layer.id}
            type="button"
            aria-pressed={docked}
            onClick={() => onToggle(layer.id)}
            className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              docked
                ? 'border-base-content/40 bg-base-200 text-base-content'
                : 'border-base-300 text-base-content/55'
            }`}
          >
            <span
              aria-hidden="true"
              className="h-3 w-3 shrink-0 rounded-full border"
              style={{
                background: docked ? layer.tabColor : 'transparent',
                borderColor: layer.tabColor,
              }}
            />
            {layer.label}
          </button>
        );
      })}
    </div>
  );
}

export default LayerToggles;
