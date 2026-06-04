'use client';

import React from 'react';
import { detectedConfig } from '@/config/project-detected';
import type { Layer, LayerId } from '../BookViewer/manifests/types';

export interface ExplodedBuildingProps {
  layers: Layer[];
  /** True when the layer is docked (in place); false when exploded. */
  isDocked: (id: LayerId) => boolean;
  onToggle: (id: LayerId) => void;
  /** Optional layer to spotlight (story's current focus). */
  spotlightId?: LayerId;
  className?: string;
}

/**
 * The chapter building, exploded into its real SVG layers over a full-bleed sky.
 * Each layer is a real <button> — the part itself is the control. Docked layers
 * sit in their original 0 0 360 360 position (opacity 1); exploded layers are
 * translated by explodeOffset and dimmed. The SVG figure is never cover-cropped;
 * the sky bleeds, the building/sun/rain stay inside the safe-box.
 *
 * @category organisms
 */
export function ExplodedBuilding({
  layers,
  isDocked,
  onToggle,
  spotlightId,
  className = '',
}: ExplodedBuildingProps) {
  const base = detectedConfig.basePath ?? '';
  // Draw back-to-front by z so overlap is deterministic (later DOM order = on top).
  const ordered = [...layers].sort((a, b) => a.z - b.z);

  return (
    <div
      role="group"
      aria-label="Explore the house — activate a part to show or hide it"
      className={`book-sky relative aspect-[4/3] w-full overflow-hidden ${className}`}
    >
      {ordered.map((layer) => {
        const docked = isDocked(layer.id);
        const tx = docked ? 0 : layer.explodeOffset.x;
        const ty = docked ? 0 : layer.explodeOffset.y;
        return (
          <button
            key={layer.id}
            type="button"
            aria-pressed={docked}
            aria-label={layer.label}
            onClick={() => onToggle(layer.id)}
            className={`book-part absolute inset-0 flex min-h-11 min-w-11 cursor-pointer items-center justify-center bg-transparent transition-[transform,opacity] duration-300 ${
              docked ? 'opacity-100' : 'opacity-60'
            } ${spotlightId === layer.id ? 'book-part--spotlight' : ''}`}
            style={{
              transform: `translate(${tx}px, ${ty}px)`,
              zIndex: layer.z,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${base}/${layer.src}`}
              alt={layer.alt}
              aria-hidden="true"
              className="pointer-events-none h-full w-full object-contain"
            />
            <span
              aria-hidden="true"
              className="book-tab absolute"
              style={{ background: layer.tabColor }}
            >
              {layer.tabWord}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default ExplodedBuilding;
