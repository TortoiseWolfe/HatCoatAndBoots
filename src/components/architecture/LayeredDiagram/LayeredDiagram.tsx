'use client';

import React, { useEffect, useMemo, useState } from 'react';
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
  className = '',
}: LayeredDiagramProps) {
  const startPreset = resolveInitialPreset(manifest, initialPresetId);
  const [activePresetId, setActivePresetId] = useState<string>(startPreset);
  const [visibleIds, setVisibleIds] = useState<Set<string>>(() =>
    presetVisibleSet(manifest, startPreset)
  );
  const reducedMotion = useReducedMotion();

  // Re-sync when the initial preset prop changes (e.g. hash hydration).
  useEffect(() => {
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
      {/* LEFT: guided views */}
      <div className="order-2 md:order-1">
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
          className={`border-base-300 bg-base-100/60 relative mx-auto aspect-square w-full max-w-xl rounded-xl border ${
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
                className="text-base-content/90 absolute -translate-y-1/2 text-[0.7rem] font-semibold whitespace-nowrap"
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

      {/* RIGHT: per-layer toggles */}
      <div className="order-3">
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
