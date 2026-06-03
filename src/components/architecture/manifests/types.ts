/**
 * Type definitions for the layered "illustrated blueprint" diagram engine.
 *
 * Derived from `features/_uncategorized/048-hats-chapter/data-model.md`.
 * One building, drawn once, in a single shared coordinate space; a chapter is a
 * focus on a region, never a separate drawing (Principle I / FR-001a / SC-009).
 */

/** The hat/coat/boots discriminator (Constitution Principle V). */
export type DiagramRegion = 'roof' | 'envelope' | 'foundation';

/**
 * One named, individually-showable part of the building, tagged with its region.
 * Pictorial layers reference language-neutral SVG artwork via `src`; the labels
 * layer carries its words as an HTML overlay instead (see {@link LabelOverlay}).
 */
export interface DiagramLayer {
  /** Stable, unique id; the join key for presets, toggles, and visibility state. */
  id: string;
  /**
   * basePath-relative SVG path, e.g. `'book/hat/roof-overhang.svg'`. Resolved at
   * render as `${detectedConfig.basePath}/${src}` and drawn with a plain `<img>`
   * (never `next/image` — no benefit under `output:'export'` + unoptimized).
   * The labels layer has no `src` (its words are an HTML overlay).
   */
  src?: string;
  /** Resolved EN control label (toggle text), sourced from the strings module. */
  label: string;
  /** Text alternative for assistive technology (alt / aria description). */
  alt: string;
  /**
   * `true` when the pictorial artwork conveys no language (the words live in the
   * labels layer); such layers carry `alt=""`. The labels layer is `false`.
   */
  decorative: boolean;
  /** Region tag — the hat/coat/boots discriminator. */
  region: DiagramRegion;
  /** Stacking order in the shared coordinate space (low draws first / behind). */
  z: number;
  /** Whether the layer is shown in the default `everything` preset. */
  defaultVisible: boolean;
  /**
   * Optional dim factor (0..1) applied when this layer is context for a different
   * chapter focus (e.g. coat/boots at 0.4 during the Hat focus). Omitted → full
   * opacity. Never used to hide (hiding is membership in the visibility set).
   */
  atmosphereOpacity?: number;
}

/**
 * A dimension/angle callout: HTML text positioned over the drawing in viewBox
 * coordinates (NOT baked into the SVG), so it can be translated without
 * re-authoring artwork (FR-001 / FR-016 / SC-008).
 */
export interface LabelOverlay {
  /** Stable id, e.g. `'lbl-overhang-depth'`. */
  id: string;
  /** EN text this slice; sourced from the strings module (the i18n seam). */
  text: string;
  /** x position in the canonical viewBox coordinate space. */
  x: number;
  /** y position in the canonical viewBox coordinate space. */
  y: number;
}

/**
 * A named teaching step (guided view): the exact set of layers it makes visible
 * plus the explanation shown while it is active (FR-002 / FR-003 / FR-015).
 */
export interface DiagramPreset {
  /** Stable id; also the URL hash token (e.g. `#view=roof-line`). */
  id: string;
  /** Resolved EN button label (from strings module). */
  label: string;
  /** Resolved EN explanation, announced via `aria-live` while active (FR-003). */
  description: string;
  /** Short distilled takeaway for the card beside the building; changes with the
   *  view alongside `description` (restates it, no new claims). */
  takeaway: string;
  /**
   * The exact layer ids this view makes visible.
   * Invariant: every id MUST exist in `manifest.layers` (preset ids ⊆ layer ids),
   * enforced at `tsc` time by the manifest module and by `hat.manifest.test.tsx`.
   */
  visibleLayerIds: string[];
}

/** The single region-tagged building + its guided views (the "Building"). */
export interface DiagramManifest {
  /** Building identity, e.g. `'house-cross-section'`. */
  id: string;
  /** Resolved EN building/chapter title. */
  title: string;
  /** The one canonical coordinate box shared by all chapters (FR-001a / SC-009). */
  viewBox: string;
  /** All region-tagged layers, in source order. */
  layers: DiagramLayer[];
  /** The label-overlay entries rendered as positioned HTML text. */
  labels: LabelOverlay[];
  /** The guided views (presets). */
  presets: DiagramPreset[];
  /** The default preset id; must resolve to an existing preset (`'everything'`). */
  defaultPresetId: string;
}

/**
 * Which region a chapter foregrounds (the `LayeredDiagram` prop). `null` is the
 * `/book` index neutral state: no region foregrounded, nothing dimmed.
 */
export type ChapterFocus = DiagramRegion | null;

/**
 * One chapter record (hat/coat/boots) in the focus registry. Not a fourth `null`
 * record — the index is the same viewer mounted with `chapterFocus={null}`.
 */
export interface ChapterFocusRecord {
  /** The chapter discriminator and URL segment. */
  id: 'hat' | 'coat' | 'boots';
  /** Resolved EN chapter title / nav label (from strings module). */
  label: string;
  /** The building region this focus foregrounds. */
  region: DiagramRegion;
  /** `true` → teaching content authored; `false` → "coming soon" content state. */
  available: boolean;
  /** Stable shareable route, e.g. `'/book/hat'` (resolved with basePath at link time). */
  href: string;
}

/** The only mutable runtime state: what is shown and which named view it is. */
export interface DiagramViewState {
  /**
   * Currently-visible layer ids. Hidden layers stay in the DOM
   * (`opacity:0; pointer-events:none; aria-hidden`) — never removed (FR-006).
   */
  visibleIds: Set<string>;
  /** The active preset id, or `'custom'` when the set matches no named preset. */
  activePresetId: string;
}
