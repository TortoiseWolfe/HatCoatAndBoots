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
    // The interactive spread: a row of three columns — guided-view plates (left)
    // | the drawing (centre) | the parts checklist + legend (right) — over ONE
    // full-width narrative band that CHANGES with the active guided view. There
    // is no static intro and no duplicate prose: the band IS the chapter text for
    // the current view, so the whole spread reads in one screen with no scroll.
    <div className={`flex min-h-0 flex-col gap-4 ${className}`}>
      {/* Horizontal at EVERY width: nowrap so the spread never stacks vertically
          on phones. Base mobile widths ~26/48/26 keep all three columns on one
          screen with no horizontal scroll; md/lg widen them to 48/–/48 then the
          true 25/55/20. gap shrinks on mobile to buy column width. */}
      <div className="flex min-h-0 flex-row flex-nowrap items-start gap-2 sm:gap-3 lg:gap-4">
        {/* LEFT: chapter nav (slim) → the guided-view plates → the takeaway card.
            The card fills the empty lower-left beside the building and CHANGES
            with the view (alongside the full-width band below). Hidden below lg —
            on small screens the band carries the lesson and the column is too
            narrow for a card. */}
        <div className="order-1 flex w-[26%] min-w-0 flex-col gap-3 md:w-[24%] lg:w-1/4">
          {leftRail}
          {interactive && (
            <div>
              <h2 className="text-base-content mb-2 hidden text-xs font-bold tracking-wider uppercase md:block">
                Guided views
              </h2>
              <GuidedViews
                presets={manifest.presets}
                activePresetId={activePresetId}
                onSelect={selectPreset}
              />
            </div>
          )}
          {interactive && activePreset?.takeaway && (
            // A plain <div>, not <aside> (a complementary landmark must be
            // top-level, not nested — axe landmark-complementary-is-top-level)
            // and not an aria-live region (the full-width band below already
            // announces the active view; axe also rejects a display:none live
            // region, and this card is hidden below lg). Visual desktop affordance.
            <div
              data-testid="guided-view-takeaway"
              className="border-base-300 bg-base-100/60 hidden rounded-xl border px-4 py-3 lg:block"
            >
              <h3
                className="text-base-content text-sm font-bold tracking-wide"
                style={{ fontFamily: 'var(--font-blueprint)' }}
              >
                {activePreset.label}
              </h3>
              <p className="text-base-content mt-1 text-sm leading-relaxed">
                {activePreset.takeaway}
              </p>
            </div>
          )}
        </div>

        {/* CENTRE: the building. Top-anchored so its y never depends on the
            rails' height (keeps it byte-identical across pages). On mobile it is
            width-capped (not height-capped) so it shrinks with its ~48% column
            and never overflows the screen; ≥lg the 68vh height cap takes over. */}
        <div className="order-2 flex w-[48%] min-w-0 flex-col items-center md:w-[52%] lg:w-[55%]">
          <div
            className={`border-base-300 bg-base-100/60 relative aspect-square w-full max-w-full rounded-xl border lg:max-h-[68vh] lg:max-w-[68vh] ${
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

        {/* RIGHT (20%): per-layer toggles → reset → "how to read it" legend. The
          legend keys the drawing's invisible-physics marks and fills the column
          beside the building's lower third, balancing the left-hand narrative. */}
        <div className="order-3 flex w-[26%] min-w-0 flex-col gap-3 md:w-[24%] lg:w-1/5">
          {rightRail}
          {interactive && (
            <>
              <div>
                <h2 className="text-base-content mb-2 hidden text-xs font-bold tracking-wider uppercase md:block">
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
                aria-label="Rebuild the whole building"
                title="Rebuild the whole building"
                className={`border-base-300 text-base-content flex min-h-11 items-center justify-center rounded-md border px-0 py-2 text-sm font-medium transition-colors md:justify-start md:px-3 ${
                  activePresetId === manifest.defaultPresetId
                    ? 'bg-base-200/40 cursor-not-allowed'
                    : 'bg-base-100 hover:bg-base-200'
                }`}
              >
                <span aria-hidden="true">↺</span>
                <span className="ml-1 hidden md:inline">
                  Rebuild the whole building
                </span>
              </button>

              {/* The legend is per-chapter (from the manifest) and supplementary;
                  hide it below md so the narrow mobile column stays short (the
                  narrative band carries the lesson). Omitted when a chapter has
                  no legend. */}
              {manifest.legend && manifest.legend.length > 0 && (
                <div className="border-base-300 mt-1 hidden border-t pt-3 md:block">
                  <h2 className="text-base-content mb-2 text-xs font-bold tracking-wider uppercase">
                    How to read it
                  </h2>
                  <ul className="flex flex-col gap-2.5">
                    {manifest.legend.map((item) => (
                      <li key={item.label} className="flex items-start gap-3">
                        <svg
                          width="34"
                          height="14"
                          viewBox="0 0 34 14"
                          aria-hidden="true"
                          className="mt-0.5 shrink-0"
                        >
                          <line
                            x1="1"
                            y1="7"
                            x2="33"
                            y2="7"
                            stroke={item.color}
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeDasharray={item.dashed ? '5 4' : undefined}
                          />
                        </svg>
                        <span className="leading-snug">
                          <span className="text-base-content text-sm font-semibold">
                            {item.label}
                          </span>
                          <span className="text-base-content block text-xs">
                            {item.hint}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* FULL-WIDTH NARRATIVE BAND — the one and only chapter text, spanning all
          three columns. It CHANGES with the active guided view (aria-live), so
          there is no static intro and no duplicate prose below. With the labels
          layer the band carries the active view's explanation; the heading names
          the view. This is the chapter, told one variable at a time. */}
      {interactive && activePreset?.description && (
        <figcaption
          aria-live="polite"
          data-testid="guided-view-description"
          className="border-base-300 bg-base-100/60 w-full rounded-xl border px-5 py-4"
        >
          <h2
            className="text-base-content text-base font-bold tracking-wide"
            style={{ fontFamily: 'var(--font-blueprint)' }}
          >
            {activePreset.label}
          </h2>
          <p className="text-base-content mt-1 leading-relaxed">
            {activePreset.description}
          </p>
        </figcaption>
      )}

      {/* Chapter-level extras (heading for SEO/no-JS, sources) — page-specific,
          compact, rendered ONCE under the band. NOT a duplicate of the changing
          narrative. */}
      {narrativeRail}
    </div>
  );
}
