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
  /** Max width of the central building stage (Tailwind class). Default 'max-w-xl';
   *  the full-bleed index uses a larger cap so the building dominates. */
  stageMaxWidthClass?: string;
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
  stageMaxWidthClass = 'max-w-xl',
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
    <div
      className={`grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)] ${className}`}
    >
      {/* LEFT: chapter content (tabs + intro/coming-soon) ABOVE the guided views */}
      <div className="order-2 flex flex-col gap-4 md:order-1">
        {leftRail}
        {interactive && (
          <GuidedViews
            presets={manifest.presets}
            activePresetId={activePresetId}
            onSelect={selectPreset}
          />
        )}
      </div>

      {/* CENTER: the building stage + labels overlay */}
      <div className="order-1 md:order-2">
        <div
          className={`border-base-300 bg-base-100/60 relative mx-auto aspect-square w-full ${stageMaxWidthClass} rounded-xl border ${
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

      {/* RIGHT: language stub + per-layer toggles */}
      <div className="order-3 flex flex-col gap-4">
        {rightRail}
        {interactive && (
          <LayerToggles
            layers={manifest.layers}
            visibleIds={visibleIds}
            onToggle={toggleLayer}
          />
        )}
      </div>
    </div>
  );
}
