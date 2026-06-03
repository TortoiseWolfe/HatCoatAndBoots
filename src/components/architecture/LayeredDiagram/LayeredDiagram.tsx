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

  const legend = manifest.legend ?? [];

  return (
    // EDITORIAL SPREAD (Option A). Below lg: the compact horizontal 3-col —
    // guided-view index | building | toggles — flex-nowrap, with the changing
    // narrative band + chapter footer stacked beneath (the mobile contract the
    // spec checks: presets left of the building, toggles right of it, no
    // h-scroll). At lg it becomes a 3-zone GRID — index (left) | building
    // (centre) | the CHANGING narrative as a tall editorial column (right) — so
    // the lesson is IN THE FOLD beside the building, never stranded below. Each
    // testid'd element is rendered ONCE; the grid just places it.
    <div
      className={`flex min-h-0 flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,21%)_minmax(0,1fr)_minmax(0,31%)] lg:items-start lg:gap-x-6 lg:gap-y-3 ${className}`}
    >
      {/* MOBILE/TABLET: the 3 control columns in a horizontal nowrap row (presets
          left of the building, toggles right of it — the spec's contract). At lg
          this wrapper becomes display:contents, so its three children flatten up
          into the grid above and are placed by their explicit grid-column/row. */}
      <div className="flex min-h-0 flex-row flex-nowrap items-start gap-2 sm:gap-3 lg:contents">
        {/* ─ LEFT: the guided-view index + a "how to read it" disclosure. On mobile
          this is the first flex child (presets, left of the building). At lg it
          is grid col 1. */}
        <div className="order-1 flex w-[26%] min-w-0 flex-col gap-3 md:w-[24%] lg:order-none lg:[grid-column:1] lg:[grid-row:1] lg:w-auto">
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

          {/* "How to read it" — a click/tap DISCLOSURE (was an always-on block).
            Native <details>/<summary>: closed by default, the reader expands it
            to reveal the keys. It needs NO JavaScript (the browser toggles
            <details> natively), and the keys stay in the DOM for assistive tech.
            Hidden below md (the narrow mobile column has no room; supplementary). */}
          {interactive && legend.length > 0 && (
            <details className="legend-disclosure border-base-300 mt-1 hidden rounded-lg border md:block">
              <summary className="text-base-content hover:bg-base-200 flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold tracking-wider uppercase">
                <span aria-hidden="true" className="legend-caret">
                  ▸
                </span>
                How to read it
              </summary>
              <ul className="flex flex-col gap-2.5 px-3 pt-1 pb-3">
                {legend.map((item) => (
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
            </details>
          )}
        </div>

        {/* ─ CENTRE: the building. Top-anchored so its y never depends on the
          rails' height (byte-identical across pages). Mobile: width-capped so it
          shrinks with its ~48% column. At lg: grid col 2, height-capped to ~60vh
          so the narrative column shares the fold. Layer toggles fold UNDER the
          building on lg (a compact chip strip); on mobile they stay the right
          column (see below). */}
        <div className="order-2 flex w-[48%] min-w-0 flex-col items-center gap-3 md:w-[52%] lg:order-none lg:[grid-column:2] lg:[grid-row:1] lg:w-auto">
          <div
            className={`border-base-300 bg-base-100/60 book-stage relative aspect-square w-full max-w-full rounded-xl border lg:max-h-[60vh] lg:max-w-[60vh] ${
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

        {/* ─ LAYER CONTROLS — ONE toolbar, two homes. Mobile: the right column
          (flex order-3), to the right of the building (the spec's contract).
          Desktop: a wrapping CHIP strip under the building (grid col 2, row 2).
          A single instance keeps exactly one role="toolbar" in the DOM. */}
        <div className="order-3 flex w-[26%] min-w-0 flex-col gap-3 md:w-[24%] lg:order-none lg:[grid-column:2] lg:[grid-row:2] lg:w-auto">
          {rightRail}
          {interactive && (
            <>
              <h2 className="text-base-content mb-1 hidden text-xs font-bold tracking-wider uppercase md:block">
                <span className="lg:hidden">Layer controls</span>
                <span className="hidden lg:inline">Take it apart</span>
              </h2>
              {/* ONE toolbar: a vertical list below lg (the narrow mobile rail),
                a horizontal wrapping chip strip at lg (under the building). */}
              <LayerToggles
                layers={manifest.layers}
                visibleIds={visibleIds}
                onToggle={toggleLayer}
                orientation="responsive"
              />
              <button
                type="button"
                onClick={() => selectPreset(manifest.defaultPresetId)}
                aria-disabled={activePresetId === manifest.defaultPresetId}
                aria-label="Rebuild the whole building"
                title="Rebuild the whole building"
                className={`border-base-300 text-base-content mt-2 hidden min-h-11 items-center rounded-md border px-3 py-2 text-sm font-medium transition-colors lg:inline-flex ${
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
      {/* ↑ end of the mobile 3-col row wrapper (display:contents at lg) */}

      {/* ─ THE CHANGING NARRATIVE. One element, two homes: the full-width band
          beneath on mobile, the tall editorial column (grid col 3) on lg. It
          CHANGES with the active view (aria-live); the heading names the view,
          the body is the lesson, and the takeaway is the one-line distillation.
          This is the chapter, told one variable at a time — and on desktop it
          sits IN THE FOLD beside the building. */}
      {interactive && activePreset?.description && (
        <figcaption
          aria-live="polite"
          data-testid="guided-view-description"
          className="border-base-300 bg-base-100/60 order-4 w-full rounded-xl border px-5 py-4 lg:order-none lg:[grid-column:3] lg:[grid-row:1/3] lg:h-full"
        >
          <h2
            className="text-base-content text-lg font-bold tracking-wide lg:text-2xl"
            style={{ fontFamily: 'var(--font-blueprint)' }}
          >
            {activePreset.label}
          </h2>
          {activePreset.takeaway && (
            <p
              className="text-base-content mt-1 hidden text-sm italic lg:block"
              data-testid="guided-view-takeaway"
            >
              {activePreset.takeaway}
            </p>
          )}
          <p className="text-base-content mt-2 leading-relaxed">
            {activePreset.description}
          </p>
        </figcaption>
      )}

      {/* ─ Chapter-level footer (heading for SEO/no-JS, sources). On lg it spans
          all three columns at the bottom (row 3, below the building+toggles in
          col 2 and the narrative in col 3). */}
      {narrativeRail && (
        <div className="order-5 lg:order-none lg:[grid-column:1/-1] lg:[grid-row:3]">
          {narrativeRail}
        </div>
      )}
    </div>
  );
}
