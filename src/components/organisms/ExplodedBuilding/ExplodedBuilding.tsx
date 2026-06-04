'use client';

import React from 'react';
import type { Layer, LayerId } from '../BookViewer/manifests/types';
// SVG_BODIES is build-time-generated from our own committed SVGs in public/book/
// (scripts/gen-svg-bodies.mjs) — trusted static art, never user/runtime input,
// so dangerouslySetInnerHTML below carries no XSS risk.
import { SVG_BODIES } from './svg-bodies.generated';

export interface ExplodedBuildingProps {
  /** Chapter slug, e.g. 'hat' — selects which inlined SVG bodies to use. */
  chapter: string;
  layers: Layer[];
  /** True when the layer is docked (in place); false when exploded. */
  isDocked: (id: LayerId) => boolean;
  onToggle: (id: LayerId) => void;
  /** Optional layer to spotlight (story's current focus). */
  spotlightId?: LayerId;
  className?: string;
}

const VIEWBOX = 360;

/**
 * The chapter building rendered as ONE shared SVG (viewBox 0 0 360 360) whose
 * layers are <g> groups in the same coordinate space. Docked layers sit at their
 * true position (translate 0,0) so the assembled building composites exactly;
 * exploded layers translate by explodeOffset (in viewBox units), so the REAL
 * geometry pulls apart — a genuine exploded view, not stacked full-canvas images.
 *
 * An overlay of <button>s (one per layer, positioned on each part's real bbox)
 * carries the tap controls + colour tabs, so the parts are the controls and the
 * labels sit on the actual parts instead of piling in a corner.
 *
 * @category organisms
 */
export function ExplodedBuilding({
  chapter,
  layers,
  isDocked,
  onToggle,
  spotlightId,
  className = '',
}: ExplodedBuildingProps) {
  const bodies = SVG_BODIES[chapter] ?? {};
  // Draw back-to-front by z (later DOM order = on top).
  const ordered = [...layers].sort((a, b) => a.z - b.z);

  return (
    <div
      role="group"
      aria-label="Explore the house — activate a part to show or hide it"
      className={`book-sky relative aspect-square w-full overflow-hidden ${className}`}
    >
      {/* The shared-coordinate-space building. One SVG, layers as <g> groups. */}
      <svg
        viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
        preserveAspectRatio="xMidYMid meet"
      >
        {ordered.map((layer) => {
          const docked = isDocked(layer.id);
          const ox = docked ? 0 : layer.explodeOffset.x;
          const oy = docked ? 0 : layer.explodeOffset.y;
          const body = bodies[layer.id] ?? '';
          return (
            <g
              key={layer.id}
              className="book-layer"
              transform={`translate(${ox} ${oy})`}
              opacity={docked ? 1 : 0.85}
              dangerouslySetInnerHTML={{ __html: body }}
            />
          );
        })}
      </svg>

      {/* Control + tab overlay: one button per layer on its real bbox. */}
      <div className="absolute inset-0">
        {ordered.map((layer) => {
          const docked = isDocked(layer.id);
          const ox = docked ? 0 : layer.explodeOffset.x;
          const oy = docked ? 0 : layer.explodeOffset.y;
          // Centre of the part's bbox, shifted by the explode offset, as a % of
          // the viewBox so it tracks the SVG at any rendered size.
          const cx = ((layer.bbox.x + layer.bbox.w / 2 + ox) / VIEWBOX) * 100;
          const cy = ((layer.bbox.y + layer.bbox.h / 2 + oy) / VIEWBOX) * 100;
          return (
            <button
              key={layer.id}
              type="button"
              aria-pressed={docked}
              aria-label={layer.label}
              onClick={() => onToggle(layer.id)}
              className={`book-part absolute flex min-h-11 min-w-11 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md transition-[left,top] duration-300 ${
                spotlightId === layer.id ? 'book-part--spotlight' : ''
              }`}
              style={{ left: `${cx}%`, top: `${cy}%`, zIndex: layer.z }}
            >
              <span
                aria-hidden="true"
                className="book-tab"
                style={{ background: layer.tabColor }}
              >
                {layer.tabWord}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default ExplodedBuilding;
