'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { DiagramManifest, ChapterFocus } from '../manifests/types';
import { renderLayerStack } from '../shared/renderLayerStack';
import GuidedViews from '../GuidedViews';
import LayerToggles from '../LayerToggles';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export interface LayeredDiagramProps {
  /** The ONE building manifest, region-tagged. */
  manifest: DiagramManifest;
  /**
   * Which region is foregrounded; others may be dimmed (never moved).
   * `null` = the /book index neutral state (nothing dimmed, controls inert).
   */
  chapterFocus: ChapterFocus;
  /** Optional starting preset id; defaults to manifest.defaultPresetId. */
  initialPresetId?: string;
  /** Notified when the active preset changes (e.g. to mirror to the URL hash). */
  onPresetChange?: (presetId: string) => void;
  /** When false the controls are inert (the index neutral state). */
  interactive?: boolean;
  /** Content rendered in the LEFT rail ABOVE the guided views — the chapter-focus
   *  tabs + the chapter's intro/explanation/"coming soon" copy. Putting chapter
   *  content here (not above the grid) keeps the centre building in the SAME
   *  position on every page (FR-001a / SC-009). */
  leftRail?: React.ReactNode;
  /** Content rendered in the RIGHT rail above the toggles (e.g. language stub). */
  rightRail?: React.ReactNode;
  className?: string;
}

const CUSTOM = 'custom';

function resolveInitialPreset(
  manifest: DiagramManifest,
  initialPresetId?: string
): string {
  const known = manifest.presets.some((p) => p.id === initialPresetId);
  return known ? (initialPresetId as string) : manifest.defaultPresetId;
}

function presetVisibleSet(
  manifest: DiagramManifest,
  presetId: string
): Set<string> {
  const preset = manifest.presets.find((p) => p.id === presetId);
  return new Set(preset ? preset.visibleLayerIds : []);
}

/** Returns the id of the preset whose visible set equals `ids`, else 'custom'. */
function matchPreset(
  manifest: DiagramManifest,
  ids: ReadonlySet<string>
): string {
  for (const preset of manifest.presets) {
    const set = new Set(preset.visibleLayerIds);
    if (set.size === ids.size && [...ids].every((id) => set.has(id))) {
      return preset.id;
    }
  }
  return CUSTOM;
}

/**
 * The layered-diagram engine: owns visibility state, renders the shared building
 * via `renderLayerStack`, and composes the guided views, the per-layer toggles,
 * and the in-drawing labels overlay. Toggling/selecting changes only opacity —
 * never geometry (G-LD-1). The cross-fade is gated on reduced motion (G-LD-5).
 *
 * @category architecture
 */
export default function LayeredDiagram({
  manifest,
  chapterFocus,
  initialPresetId,
  onPresetChange,
  interactive = true,
  leftRail,
  rightRail,
  className = '',
}: LayeredDiagramProps) {
  const startPreset = resolveInitialPreset(manifest, initialPresetId);
  const [activePresetId, setActivePresetId] = useState<string>(startPreset);
  const [visibleIds, setVisibleIds] = useState<Set<string>>(() =>
    presetVisibleSet(manifest, startPreset)
  );
  const reducedMotion = useReducedMotion();

  // The last initialPresetId we applied. Guards against the prop "echo": when a
  // click emits onPresetChange, the parent feeds the new id back in as
  // initialPresetId; without this guard the effect would re-apply (and, mid
  // re-render, could reset the just-changed state back to the default — a race
  // that only surfaced on the slower CI runner). We re-sync ONLY when the parent
  // pushes a genuinely new external value (e.g. hash hydration on load).
  const appliedInitialRef = useRef<string | undefined>(initialPresetId);
  useEffect(() => {
    if (initialPresetId === appliedInitialRef.current) return;
    appliedInitialRef.current = initialPresetId;
    const resolved = resolveInitialPreset(manifest, initialPresetId);
    setActivePresetId(resolved);
    setVisibleIds(presetVisibleSet(manifest, resolved));
  }, [manifest, initialPresetId]);

  function selectPreset(presetId: string) {
    setActivePresetId(presetId);
    setVisibleIds(presetVisibleSet(manifest, presetId));
    onPresetChange?.(presetId);
  }

  function toggleLayer(layerId: string) {
    setVisibleIds((prev) => {
      const next = new Set(prev);
      if (next.has(layerId)) next.delete(layerId);
      else next.add(layerId);
      const matched = matchPreset(manifest, next);
      setActivePresetId(matched);
      if (matched !== CUSTOM) onPresetChange?.(matched);
      return next;
    });
  }

  const labelsVisible = visibleIds.has('labels');
  const stack = useMemo(
    () => renderLayerStack(manifest.layers, visibleIds),
    [manifest.layers, visibleIds]
  );

  // viewBox is "minX minY width height"; place HTML labels by percentage.
  const [, , vbW, vbH] = manifest.viewBox.split(/\s+/).map(Number);

  return (
    // THCB's three-column layout: flex 25% | 55% | 20%, side-by-side on desktop
    // so the presets, building, and toggles are ALL visible in one screen. At
    // <lg (≈1024px) it wraps to two columns (rails ~half each, building full-
    // width on top); at <md (768px) it stacks. The building is NOT aspect-square
    // — it fills its column's height — so it can never grow taller than the row
    // and push the controls below the fold.
    <div
      className={`flex min-h-0 flex-row flex-wrap items-stretch gap-4 lg:flex-nowrap ${className}`}
    >
      {/* LEFT (25%): chapter content (tabs + intro) above the guided views */}
      <div className="order-2 flex w-full min-w-0 flex-col gap-4 md:w-[48%] lg:order-1 lg:w-1/4">
        {leftRail}
        {interactive && (
          <div>
            <h2 className="text-base-content mb-2 text-sm font-bold tracking-wide uppercase">
              Guided views
            </h2>
            <GuidedViews
              presets={manifest.presets}
              activePresetId={activePresetId}
              onSelect={selectPreset}
            />
          </div>
        )}
      </div>

      {/* CENTER (55%): the building — anchored to the TOP of the row so its
          vertical position never depends on how tall the side rails are (keeps
          the building byte-identically aligned across pages). */}
      <div className="order-1 flex w-full min-w-0 items-start justify-center md:order-first md:w-full lg:order-2 lg:w-[55%]">
        <div
          className={`border-base-300 bg-base-100/60 relative mx-auto aspect-square h-full max-h-[78vh] w-full max-w-[78vh] rounded-xl border ${
            reducedMotion ? '' : 'layer-stack--animated'
          }`}
        >
          {stack}

          {/* In-drawing labels: HTML text over the SVG (translatable; FR-001),
              shown with the labels layer. */}
          <div
            aria-hidden={labelsVisible ? undefined : true}
            className="pointer-events-none absolute inset-0"
            style={{ opacity: labelsVisible ? 1 : 0 }}
          >
            {manifest.labels.map((lbl) => (
              <span
                key={lbl.id}
                className="text-base-content absolute -translate-y-1/2 text-[0.7rem] font-semibold whitespace-nowrap"
                style={{
                  left: `${(lbl.x / vbW) * 100}%`,
                  top: `${(lbl.y / vbH) * 100}%`,
                }}
              >
                {lbl.text}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT (20%): language stub + per-layer toggles */}
      <div className="order-3 flex w-full min-w-0 flex-col gap-4 md:w-[48%] lg:w-1/5">
        {rightRail}
        {interactive && (
          <div>
            <h2 className="text-base-content mb-2 text-sm font-bold tracking-wide uppercase">
              Layer controls
            </h2>
            <LayerToggles
              layers={manifest.layers}
              visibleIds={visibleIds}
              onToggle={toggleLayer}
            />
          </div>
        )}
      </div>
    </div>
  );
}
