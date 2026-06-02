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
  /** Page-specific chapter narrative rendered in the LEFT column BELOW the guided
   *  views — it flows into the empty space beside the building's lower half, so
   *  the prose is visible WITHOUT scrolling. It lives in the left column (not the
   *  centre), so its per-page height never moves the building (FR-001a / SC-009).
   *  Long-form prose (sources, etc.) still belongs below the viewer on the page. */
  narrativeRail?: React.ReactNode;
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
  narrativeRail,
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
  const activePreset = manifest.presets.find((p) => p.id === activePresetId);
  const stack = useMemo(
    () => renderLayerStack(manifest.layers, visibleIds),
    [manifest.layers, visibleIds]
  );

  // viewBox is "minX minY width height"; place HTML labels by percentage.
  const [, , vbW, vbH] = manifest.viewBox.split(/\s+/).map(Number);

  return (
    // The drafting bench: three columns side-by-side — plate selector (left) |
    // the drawing + its caption (centre) | the parts checklist (right). Flex
    // 25/55/20 (THCB), nowrap ≥lg so presets + building + toggles are ALL in one
    // screen. Each rail is TOP-aligned (items-start) — never stretched — so a
    // short rail leaves no dead space, and the building's y never depends on rail
    // height (keeps it byte-identically aligned across pages). At <lg it wraps to
    // two columns (building full-width on top); at <md it stacks.
    <div
      className={`flex min-h-0 flex-row flex-wrap items-start gap-4 lg:flex-nowrap ${className}`}
    >
      {/* LEFT (~30%): chapter nav (slim) → the guided-view plates → the chapter
          narrative. The narrative flows into the space BESIDE the building's lower
          half (the empty lower-left), so the prose is in view without scrolling.
          Because this is a separate flex column with items-start, its per-page
          height never moves the centre building (FR-001a / SC-009). */}
      <div className="order-2 flex w-full min-w-0 flex-col gap-3 md:w-[48%] lg:order-1 lg:w-[30%]">
        {leftRail}
        {interactive && (
          <div>
            <h2 className="text-base-content mb-2 text-xs font-bold tracking-wider uppercase">
              Guided views
            </h2>
            <GuidedViews
              presets={manifest.presets}
              activePresetId={activePresetId}
              onSelect={selectPreset}
            />
          </div>
        )}
        {narrativeRail && (
          <section
            aria-label="Chapter narrative"
            className="border-base-300 text-base-content border-t pt-3 text-sm leading-relaxed"
          >
            {narrativeRail}
          </section>
        )}
      </div>

      {/* CENTER (55%): the building, then its caption directly beneath it. The
          caption is the aria-live preset description — it belongs under the
          drawing it describes, and moving it here keeps the side rails short. */}
      <div className="order-1 flex w-full min-w-0 flex-col items-center gap-2 md:order-first md:w-full lg:order-2 lg:w-[48%]">
        <div
          className={`border-base-300 bg-base-100/60 relative aspect-square max-h-[68vh] w-full max-w-[68vh] rounded-xl border ${
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

        {/* Caption plate: what you're looking at right now — a titled card under
            the drawing, like the caption block under a drafting plate. aria-live
            so the view change is announced; line-clamped to keep the one-screen
            layout (the full text is in the chapter prose below the viewer). */}
        {interactive && activePreset?.description && (
          <figcaption
            aria-live="polite"
            data-testid="guided-view-description"
            className="border-base-300 bg-base-100/70 mx-auto w-full max-w-md rounded-lg border px-4 py-3 text-center"
          >
            <span
              className="text-base-content block text-sm font-bold tracking-wide"
              style={{ fontFamily: 'var(--font-blueprint)' }}
            >
              {activePreset.label}
            </span>
            <span className="text-base-content mt-1 line-clamp-3 block text-sm leading-relaxed">
              {activePreset.description}
            </span>
          </figcaption>
        )}
      </div>

      {/* RIGHT (20%): language stub + per-layer toggles (top-aligned, snug),
          then a reset that rebuilds the full view — useful after taking parts
          away, and it gives the column a purposeful footer. */}
      <div className="order-3 flex w-full min-w-0 flex-col gap-3 md:w-[48%] lg:w-1/5">
        {rightRail}
        {interactive && (
          <>
            <div>
              <h2 className="text-base-content mb-2 text-xs font-bold tracking-wider uppercase">
                Layer controls
              </h2>
              <LayerToggles
                layers={manifest.layers}
                visibleIds={visibleIds}
                onToggle={toggleLayer}
              />
            </div>
            <button
              type="button"
              onClick={() => selectPreset(manifest.defaultPresetId)}
              aria-disabled={activePresetId === manifest.defaultPresetId}
              className={`border-base-300 text-base-content min-h-11 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                activePresetId === manifest.defaultPresetId
                  ? 'bg-base-200/40 cursor-not-allowed'
                  : 'bg-base-100 hover:bg-base-200'
              }`}
            >
              ↺ Rebuild the whole building
            </button>
          </>
        )}
      </div>
    </div>
  );
}
