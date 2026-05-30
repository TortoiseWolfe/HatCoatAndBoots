# Phase 1 Data Model: The "Hat" Chapter

**Feature**: `048-hats-chapter` | **Branch**: `048-hats-chapter`
**Spec**: [`spec.md`](./spec.md) | **Plan**: [`plan.md`](./plan.md)
**Status**: Phase 1 (design)

This document derives the concrete data shapes for the Hat chapter from the spec's
**Key Entities** (Building, Region, Drawing Element/Layer, Guided View/Preset,
Chapter/Focus) and the approved architecture. It is the contract the manifest TS
module, the type module, and the runtime visibility state must honor.

## Constitutional grounding

Per the constitution (`.specify/memory/constitution.md` v1.0.0):

- **Principle 5 — Hats, Coats, and Boots** is literally the data spine: every
  `DiagramLayer` is tagged to a `region` of `'roof' | 'envelope' | 'foundation'`
  (hat / coat / boots). The same triad is the Quality Gate (hat = graceful
  failure, coat = typed & tested, boots = deployable), which is why the manifest
  is a **TypeScript module** (typed → coat) whose presets are validated at
  `tsc` time (so a broken preset fails the build, not the reader → boots), and
  why the Server Component renders **all** layers (graceful no-JS fallback → hat).
- **Principle 3 — Two Metabolisms / no lock-in**: data lives as a co-located TS
  module (a technical nutrient that round-trips into the type system), **not** an
  opaque `public/*.json` blob. Strings live in a co-located strings module so the
  carved-out i18n feature (issue #2 / `049-i18n-multilingual`) can swap the
  translation layer without re-authoring artwork (FR-001, FR-016, SC-008).
- **Principle 1 — Design Is Intention** and **FR-001a / SC-009**: one canonical
  `viewBox` is shared by all chapters; focusing a region never moves an element.

## Where each artifact lives

| Artifact                          | Path                                                                | Notes                                                                                                                                                                                          |
| --------------------------------- | ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Type definitions                  | `src/components/architecture/manifests/types.ts`                    | The interfaces in this doc; imported by every consumer.                                                                                                                                        |
| Hat building manifest (TS module) | `src/components/architecture/manifests/hat.manifest.ts`             | The single region-tagged building manifest + 4 presets. Validated at `tsc` time.                                                                                                               |
| Chapter focus registry            | `src/components/architecture/manifests/chapters.ts`                 | The three `ChapterFocus` records (hat available; coat/boots coming-soon).                                                                                                                      |
| Reader-facing strings             | `src/components/architecture/manifests/hat.strings.ts` (co-located) | All prose, view names, explanations, toggle labels, in-drawing label text. EN-only this slice; the i18n boundary (FR-016/SC-008).                                                              |
| Language-neutral SVG artwork      | `public/book/hat/*.svg` (one file per pictorial layer)              | Referenced as `` `${detectedConfig.basePath}/book/hat/<file>.svg` `` via plain `<img>` (no `next/image` — zero benefit under `output:'export'` + `images.unoptimized`). ~11 KB total (SC-004). |
| Coordinate-space constant         | exported from `hat.manifest.ts` as `viewBox`                        | One canonical value shared by all chapters (FR-001a, SC-009).                                                                                                                                  |

> The manifest is **not** a runtime fetch. It is statically imported by both the
> Server page (renders all layers visible — FR-008/SC-002) and the client engine
> (`LayeredDiagram`), so there is a single source of truth and `tsc` can prove the
> preset allow-list is internally consistent before the build ships.

---

## Coordinate space (the shared registration grid)

All four chapter focuses draw the **same** building at the **same** coordinates;
a focus only changes per-region opacity emphasis, never geometry (FR-001a,
FR-006, SC-005, SC-009). The wireframes establish a byte-identical
`<g id="building" transform="translate(360,150)">` so the four screens register
as transparency layers.

- **Canonical `viewBox`**: `'0 0 360 360'` — the building's own local coordinate
  box (the values below are expressed in this space; the page chrome positions the
  box, the box never changes between chapters). This is the single value all
  chapters import; changing it is a spec-level change (SC-009).
- Layer geometry is authored in these local coordinates and is identical across
  every preset and every chapter focus — only `visible` membership and per-region
  `atmosphereOpacity` dimming differ.

---

## Entity 1 — Building

**Purpose**: The single subject of the entire book — one structure in one shared
coordinate space, drawn as an aligned cross-section. Every chapter is a focus on
this same building (spec Key Entities; FR-001).

**Representation**: There is no standalone `Building` object — the Building _is_
the `DiagramManifest` (`hat.manifest.ts`). Its identity is `manifest.id`
(`'house-cross-section'`) and its geometry box is `manifest.viewBox`. The Building
is composed of the manifest's `layers[]`, partitioned by `region`.

**Fields** (via `DiagramManifest`): `id`, `title`, `viewBox`, `layers`, `presets`,
`defaultPresetId` (see interface below).

**Relationships**:

- _has many_ `DiagramLayer` (grouped into three Regions by `region`).
- _has many_ `DiagramPreset` (guided views).
- _is focused by_ three `ChapterFocus` records.

**Validation rules**:

- Exactly one canonical `viewBox`; all chapters import it (SC-009).
- `layers` is non-empty; `layers[].id` values are unique.
- `defaultPresetId` resolves to an existing preset (see Preset rules).

**State transitions**: none. The Building is immutable static data; all mutable
state is the runtime visibility state (Entity 6).

---

## Entity 2 — Region

**Purpose**: One of the three parts of the building — **roof/Hat**,
**envelope/Coat**, **foundation/Boots**. A Region groups the Drawing Elements
that belong to it and is the target of a chapter focus. Foregrounding a Region
(and optionally dimming the others) never changes geometry (spec Key Entities;
FR-007b).

**Representation**: A Region is **not** a stored record; it is the value of the
`region` discriminator on each `DiagramLayer`. The set of regions is the closed
union below. A "Region" at runtime is the subset
`layers.filter(l => l.region === r)`.

**Fields**:

- `region: 'roof' | 'envelope' | 'foundation'` — closed union, the discriminator.

**Mapping to the book's mnemonic** (Principle 5):

| `region` value | Mnemonic | Building part                 | Owning chapter        |
| -------------- | -------- | ----------------------------- | --------------------- |
| `'roof'`       | Hat      | roof + projecting overhang    | `hat` (this slice)    |
| `'envelope'`   | Coat     | insulated wall + window       | `coat` (coming soon)  |
| `'foundation'` | Boots    | footing lifting the structure | `boots` (coming soon) |

**Relationships**:

- _contains_ the `DiagramLayer`s whose `region` matches.
- _is focused by_ exactly one `ChapterFocus` (`ChapterFocus.region`).

**Validation rules**:

- `region` is one of the three literals (enforced by the TS union; any other value
  is a `tsc` error).
- Every region in the focus registry has at least one layer in the manifest.

**State transitions**: A Region is either **foregrounded** (the active chapter
focus targets it → its layers render at full `atmosphereOpacity`/`1`) or
**dimmed** (a different focus is active → non-Hat context layers may render at a
reduced `atmosphereOpacity`, e.g. `0.4` per the wireframe). This is presentation
state derived from the active `ChapterFocus`, **not** stored on the Region.

---

## Entity 3 — Drawing Element (Layer)

**Purpose**: One named, individually-showable part of the building, tagged with
its Region. Carries a human-readable name, an on/off default, a stacking order in
the shared coordinate space, and a text alternative for assistive technology
(spec Key Entities; FR-001, FR-004, FR-006).

**Representation**: `DiagramLayer` (interface below). Pictorial layers reference
language-neutral SVG artwork via `src`; the **labels** layer is the exception —
its words are HTML text overlaid on the drawing (see Entity 3b), so they are
translatable without re-authoring artwork (FR-001).

```ts
// src/components/architecture/manifests/types.ts
export type DiagramRegion = 'roof' | 'envelope' | 'foundation';

export interface DiagramLayer {
  /** Stable, unique id; used by presets, toggles, and visibility state. */
  id: string;
  /** basePath-relative SVG path, e.g. 'book/hat/roof-overhang.svg'.
   *  Resolved at render as `${detectedConfig.basePath}/${src}` and drawn
   *  with a plain <img> (NOT next/image) inside the shared viewBox. */
  src: string;
  /** Human-readable control label (toggle text). String comes from the
   *  co-located strings module; this field holds the resolved EN value. */
  label: string;
  /** Text alternative for assistive technology (alt / aria description). */
  alt: string;
  /** True once the labels layer carries the words: the pictorial artwork is
   *  decorative (alt="") and conveys no language. False for the labels layer
   *  and any layer that must announce itself. */
  decorative: boolean;
  /** Region tag — the hat/coat/boots discriminator (Principle 5). */
  region: DiagramRegion;
  /** Stacking order in the shared coordinate space (low draws first / behind). */
  z: number;
  /** Whether the layer is shown in the default 'everything' preset. */
  defaultVisible: boolean;
  /** Optional dim factor (0..1) applied when this layer is context for a
   *  different chapter focus (e.g. coat/boots at 0.4 during the Hat focus).
   *  Omitted → full opacity (1). Never used to hide (hiding = visibility set). */
  atmosphereOpacity?: number;
}
```

**Fields** (name: type — description):

- `id: string` — stable unique identifier; the join key for presets, toggles,
  and the visibility `Set`.
- `src: string` — basePath-relative path to the language-neutral SVG artwork.
- `label: string` — resolved EN control label (sourced from strings module).
- `alt: string` — assistive-technology text alternative (FR-011).
- `decorative: boolean` — `true` when the pictorial artwork conveys no language
  (the words live in the labels layer); such layers carry `alt=""`.
- `region: DiagramRegion` — the hat/coat/boots tag.
- `z: number` — stacking order in the shared coordinate space (FR-006).
- `defaultVisible: boolean` — membership of the default `everything` preset.
- `atmosphereOpacity?: number` — optional dim factor for context layers under a
  different focus (FR-007b); never substitutes for visibility.

**Relationships**:

- _belongs to_ one Region (`region`).
- _is referenced by_ zero-or-more `DiagramPreset`s (via `visibleLayerIds`).
- _is toggled by_ one `LayerToggle` control (1:1 with `id`).

**Validation rules**:

- `id` unique across `layers`.
- `region` ∈ the closed union.
- A decorative layer (`decorative: true`) MUST have `alt: ''`; a non-decorative
  layer (e.g. labels) MUST have non-empty `alt` (FR-011).
- `atmosphereOpacity`, if present, ∈ `[0, 1]`.
- `z` values are intended to be distinct (deterministic paint order); ties are
  broken by array order.

**State transitions**: A layer is **visible** or **hidden** at runtime. Hidden ≠
removed — per FR-006/SC-005 a hidden layer keeps its place in layout and renders
with `opacity: 0; pointer-events: none; aria-hidden="true"` (NEVER
`display:none`), so re-showing it re-registers it in exactly the same position.
The Server Component (no-JS path) renders **all** layers visible (FR-008/SC-002).

### Entity 3b — Label Overlay (sub-entity of the labels layer)

**Purpose**: The dimension/angle callouts are HTML text positioned over the
drawing (NOT baked into the SVG), so issue #2 can translate them without touching
artwork (FR-001, FR-016, SC-008).

```ts
export interface LabelOverlay {
  /** Stable id, e.g. 'lbl-overhang-depth'. */
  id: string;
  /** EN text this slice; sourced from the strings module (the i18n seam). */
  text: string;
  /** x position in the canonical viewBox coordinate space. */
  x: number;
  /** y position in the canonical viewBox coordinate space. */
  y: number;
}
```

The labels layer is a single `DiagramLayer` (`id: 'labels'`,
`decorative: false`), and its overlay entries are the `LabelOverlay[]` rendered
as positioned HTML text on top of the SVG stack (translatable; FR-001).

---

## Entity 4 — Guided View (Preset)

**Purpose**: A named teaching step within a chapter focus, defined as the exact
set of Drawing Elements it makes visible, plus the explanation text shown while
it is active (spec Key Entities; FR-002, FR-003, FR-015). The four Hat views are
`everything` (default), `bare-wall`, `roof-line`, and `how-it-sheds-water`. A
"custom" state is the implicit view when the visible set matches no named preset
(FR-005).

```ts
export interface DiagramPreset {
  /** Stable id; also the URL hash token (e.g. #view=roof-line). */
  id: string;
  /** Resolved EN button label (from strings module). */
  label: string;
  /** Resolved EN explanation, shown in the aria-live region while active.
   *  Updates together with the visible set (FR-003). */
  description: string;
  /** The exact layer ids this view makes visible.
   *  VALIDATION: every id MUST exist in manifest.layers (preset ids ⊆ layer ids). */
  visibleLayerIds: string[];
}
```

**Fields**:

- `id: string` — stable id and URL hash token (FR-007a).
- `label: string` — resolved EN button label.
- `description: string` — resolved EN explanation; announced via `aria-live`
  when the view changes (FR-003, FR-011, SC-007).
- `visibleLayerIds: string[]` — the exact visible set defining the view.

**Relationships**:

- _belongs to_ a chapter focus (the Hat presets belong to the `hat` focus).
- _references_ `DiagramLayer`s by id (`visibleLayerIds ⊆ layers[].id`).

**Validation rules** (enforced at `tsc` time / in a unit guard):

- **Preset allow-list**: every id in every preset's `visibleLayerIds` MUST exist
  in `manifest.layers` (preset ids ⊆ layer ids). A typo is a build failure, not a
  runtime blank stage. (Coat gate: typed & tested.)
- `id` unique across presets and stable as a URL token.
- `defaultPresetId` MUST equal an existing preset id (the `everything` preset).
- The `everything` preset's `visibleLayerIds` SHOULD equal the set of all layers
  with `defaultVisible: true` (consistency with the no-JS composite; SC-002).
- `visibleLayerIds` has no duplicate ids.

**State transitions**: Selecting a preset replaces the runtime visibility `Set`
with `new Set(preset.visibleLayerIds)` and sets `activePresetId = preset.id`
(FR-003). Any subsequent single-element toggle that makes the set no longer equal
to a named preset's set transitions `activePresetId → 'custom'` (FR-005).
Re-selecting a named preset re-establishes exactly that set, overriding custom
toggles (Edge Case "Returning to a guided view after custom toggling").

---

## Entity 5 — Chapter (Focus)

**Purpose**: A focus on one Region of the shared Building (Hat → roof, Coat →
envelope, Boots → foundation), with a title, a stable location that enters the
shared viewer pre-focused, an availability state for its teaching content, and
ordering relative to its neighbors. A chapter is NOT a separate drawing or page
(spec Key Entities; FR-007, FR-007a, FR-007b).

```ts
export interface ChapterFocus {
  /** Which chapter / focus. */
  id: 'hat' | 'coat' | 'boots';
  /** Resolved EN chapter title / nav label (from strings module). */
  label: string;
  /** The building region this focus foregrounds. */
  region: DiagramRegion;
  /** true → teaching content authored (Hat this slice);
   *  false → 'coming soon' content state while the shared building still shows. */
  available: boolean;
  /** Stable shareable route into the shared viewer, e.g. '/book/hat'.
   *  Resolved with basePath at link time. */
  href: string;
}
```

> **No-focus / index state.** There are exactly **three** `ChapterFocus` records (hat/coat/boots) — the `/book` index is **not** a fourth record. The index is the same viewer mounted with the **`chapterFocus` prop set to `null`** (see `LayeredDiagram` contract): no region foregrounded, nothing dimmed (the balanced full-opacity composite), controls inert until the reader picks a chapter. So the prop type is `DiagramRegion | null` while the registry stays the three chapters.

**Fields**:

- `id: 'hat' | 'coat' | 'boots'` — the chapter discriminator and URL segment.
- `label: string` — resolved EN title / nav label.
- `region: DiagramRegion` — the foregrounded region.
- `available: boolean` — `true` for `hat` this slice; `false` for `coat`/`boots`
  (coming-soon content while the shared building stays visible — FR-007, Edge
  Case "Reaching a not-yet-written chapter").
- `href: string` — stable, shareable route (`/book/hat`, `/book/coat`,
  `/book/boots`).

**The three records** (`chapters.ts`), in reading order:

| `id`    | `region`     | `available` | `href`        | prev / next |
| ------- | ------------ | ----------- | ------------- | ----------- |
| `hat`   | `roof`       | `true`      | `/book/hat`   | — / coat    |
| `coat`  | `envelope`   | `false`     | `/book/coat`  | hat / boots |
| `boots` | `foundation` | `false`     | `/book/boots` | coat / —    |

(Ordering is the array order; `book/layout.tsx` derives prev/next nav from it.)

**Relationships**:

- _focuses_ exactly one Region.
- _owns_ the presets for its region (Hat owns the four guided views; coat/boots
  own none this slice).
- _neighbors_ the adjacent chapters via array order (prev/next nav).

**Validation rules**:

- `id` ∈ `{'hat','coat','boots'}`; unique; matches the URL segment in `href`.
- `region` matches the chapter's mnemonic mapping (hat→roof, coat→envelope,
  boots→foundation).
- Exactly one focus is `available: true` this slice (`hat`).
- `href` is one of the three real static-export routes under `/book`.

**State transitions**: Selecting a focus foregrounds its region's layers and MAY
dim the others via `atmosphereOpacity`, **without moving any element** (FR-007b,
SC-009). The focus is reflected in the page address (the route segment;
FR-007a/b). An `available: false` focus shows a "coming soon" content area while
the shared building remains visible (never a broken/empty page).

---

## Entity 6 — Runtime Visibility State (client engine)

**Purpose**: The only mutable state in the chapter — what is currently shown and
which named view (if any) that corresponds to. Owned by the `LayeredDiagram`
engine; restored from the URL hash on load (FR-007a).

```ts
export interface DiagramViewState {
  /** The ids of currently-visible layers. Hidden layers stay in the DOM
   *  (opacity:0; pointer-events:none; aria-hidden) — never removed (FR-006). */
  visibleIds: Set<string>;
  /** The active named preset id, or 'custom' when the visible set matches
   *  no named preset (FR-005). */
  activePresetId: string | 'custom';
}
```

**Fields**:

- `visibleIds: Set<string>` — currently-visible layer ids (members ⊆
  `manifest.layers[].id`).
- `activePresetId: string | 'custom'` — the active preset id or `'custom'`.

**Relationships**:

- _derived from_ the active `DiagramPreset` (on preset select) or from manual
  toggles (custom).
- _projected to_ the URL hash for the active **preset** only (manual custom
  toggles are NOT encoded this slice — Edge Case "Sharing a custom toggle
  combination").

**Validation rules**:

- Every member of `visibleIds` exists in `manifest.layers` (no orphan ids).
- `activePresetId` is `'custom'` **iff** `visibleIds` deep-equals no preset's
  `new Set(visibleLayerIds)`; otherwise it equals that preset's id (FR-005,
  SC-007).
- The empty set is a legal state (Edge Case "Hand-toggling to an empty drawing")
  → `activePresetId = 'custom'`, stage empty but stable.

**State transitions** (initial → events):

```
initial (on mount):
  read URL hash `#view=<id>`:
    known preset id     → visibleIds = Set(preset.visibleLayerIds);
                          activePresetId = preset.id
    unknown / absent id → visibleIds = Set(defaultPreset.visibleLayerIds);
                          activePresetId = defaultPresetId   // 'everything'
  (Edge Case "Unrecognized view in the address" → fall back to default.)

event: selectPreset(p)
  visibleIds := new Set(p.visibleLayerIds)
  activePresetId := p.id
  URL hash := #view=p.id          // shareable, survives reload (FR-007a)

event: toggleLayer(layerId)
  visibleIds := visibleIds.has(layerId)
                ? visibleIds \ {layerId}
                : visibleIds ∪ {layerId}
  activePresetId := matchesPreset(visibleIds) ?? 'custom'    // FR-005
  URL hash := (activePresetId === 'custom') ? unchanged-or-cleared
                                            : #view=activePresetId
```

Reduced-motion preference (`useReducedMotion`) removes animated transitions on
any of these updates (FR-013); the state values themselves are unaffected.

---

## Concrete Hat manifest content

This is the authored content of `hat.manifest.ts`. Geometry values are in the
canonical `viewBox` (`'0 0 360 360'`) coordinate space, taken from the signed-off
Hat wireframe's `<g id="building">`. The Hat lesson's teaching layers are the
roof region plus the atmosphere (sun-high / sun-low / rain); the envelope (coat:
wall + window) and foundation (boots: footing) are drawn as **always-present
aligned context** (dimmed to `atmosphereOpacity: 0.4` during the Hat focus per the
wireframe), so the building reads as whole (FR-001).

### Layers (region-tagged), painted back-to-front by `z`

| `id`            | `region`     | `z` | `defaultVisible` | `atmosphereOpacity` | `src` (under `public/book/hat/`) | role                                            |
| --------------- | ------------ | --- | ---------------- | ------------------- | -------------------------------- | ----------------------------------------------- |
| `sun-high`      | `roof`       | 10  | `true`           | —                   | `sun-high.svg`                   | summer sun (high/steep) — blocked at eave       |
| `sun-low`       | `roof`       | 11  | `true`           | —                   | `sun-low.svg`                    | winter sun (low/shallow) — reaches window       |
| `rain`          | `roof`       | 12  | `true`           | —                   | `rain.svg`                       | rain shedding clear of the wall base            |
| `footing`       | `foundation` | 20  | `true`           | `0.4`               | `footing.svg`                    | BOOTS — footing lifting the building (context)  |
| `wall`          | `envelope`   | 30  | `true`           | `0.4`               | `wall.svg`                       | COAT — insulated wall (context)                 |
| `window`        | `envelope`   | 31  | `true`           | `0.4`               | `window.svg`                     | COAT — window opening (context)                 |
| `roof-overhang` | `roof`       | 40  | `true`           | —                   | `roof-overhang.svg`              | HAT — roof + projecting overhang (the lesson)   |
| `labels`        | `roof`       | 50  | `true`           | —                   | (HTML overlay, no `src`)         | dimension/angle callouts (translatable; FR-001) |

Notes:

- `wall` + `window` are split into two layers so the envelope reads as the coat
  (wall) carrying an opening (window); both are `envelope` context here and become
  the Coat chapter's teaching layers later.
- `sun-high`, `sun-low`, `rain`, `roof-overhang`, `labels` are tagged `roof`
  because they are the Hat lesson's foregrounded teaching elements; `footing`,
  `wall`, `window` are `foundation`/`envelope` context aligned beneath.
- `labels` has no SVG `src`; it is the `LabelOverlay[]` (Entity 3b) rendered as
  positioned HTML text. `decorative: false`, non-empty `alt`. All pictorial
  layers are `decorative: true` with `alt: ''` (the words live in `labels`).
- Per FR-012, `sun-high` vs `sun-low` MUST differ by shape/angle (steep dashed
  rays vs a shallow solid ray), not color alone — encoded in the artwork, not the
  data, but the data keeps them as two distinct toggleable layers.

### The four presets (exact `visibleLayerIds`)

`defaultPresetId = 'everything'`. The reading order encoded by these presets is
the FR-015 sequence (bare wall → add overhang → … → sheds water).

| preset `id` (URL token)  | `visibleLayerIds`                                                                  | teaching beat                           |
| ------------------------ | ---------------------------------------------------------------------------------- | --------------------------------------- |
| `everything` _(default)_ | `['sun-high','sun-low','rain','footing','wall','window','roof-overhang','labels']` | full labeled cross-section (all layers) |
| `bare-wall`              | `['footing','wall','window','labels']`                                             | the unprotected-wall problem (no hat)   |
| `roof-line`              | `['footing','wall','window','roof-overhang','labels']`                             | add the overhang — name it the "hat"    |
| `how-it-sheds-water`     | `['footing','wall','window','roof-overhang','rain','labels']`                      | rain shed clear of the wall base        |

(`everything`'s set equals the set of all `defaultVisible: true` layers — the
no-JS composite — satisfying SC-002.)

### Label overlay entries (in viewBox coordinates)

Authored as HTML text (FR-001); `x`/`y` in the canonical `'0 0 360 360'` space,
matching the wireframe's `<text>` anchors. Text values are sourced from the
strings module (the i18n seam).

| `id`             | `text` (EN this slice)                | `x` | `y` |
| ---------------- | ------------------------------------- | --- | --- |
| `lbl-summer-sun` | "summer sun (high) — blocked at eave" | 10  | 20  |
| `lbl-winter-sun` | "winter sun (low) — reaches window"   | -40 | 142 |
| `lbl-rain`       | "rain sheds clear of the wall base"   | -40 | 352 |
| `lbl-hat`        | "HAT"                                 | 180 | 96  |
| `lbl-coat`       | "COAT"                                | 180 | 292 |
| `lbl-boots`      | "BOOTS"                               | 180 | 324 |

---

## Cross-cutting validation rules (manifest invariants)

A unit test (`hat.manifest.test.ts`) and the type system together enforce:

1. **Preset allow-list**: `∀ preset, ∀ id ∈ preset.visibleLayerIds:
id ∈ manifest.layers[].id` (preset ids ⊆ layer ids). — FR-002, Coat gate.
2. **Default preset exists**: `manifest.defaultPresetId ∈ manifest.presets[].id`,
   and it is `'everything'`.
3. **One canonical viewBox**: `manifest.viewBox === '0 0 360 360'`, and the
   chapter focus registry imports the same constant — no per-chapter viewBox
   (FR-001a, SC-009).
4. **Unique ids**: `layers[].id`, `presets[].id`, `chapters[].id`, and
   `labels[].id` are each unique within their collection.
5. **Region closure**: every `layers[].region` and `chapters[].region` ∈
   `{'roof','envelope','foundation'}`; every chapter's region has ≥1 layer.
6. **Decorative/alt coherence**: `decorative === true ⟺ alt === ''`; the `labels`
   layer is `decorative: false` with non-empty `alt` (FR-011).
7. **Default composite**: `Set(everythingPreset.visibleLayerIds) ===
Set(layers.filter(l => l.defaultVisible).map(l => l.id))` (SC-002 no-JS
   parity).
8. **No orphan visibility**: at runtime, every member of `visibleIds` ∈
   `manifest.layers[].id`.
9. **atmosphereOpacity range**: where present, `∈ [0,1]`.
10. **Strings externalized**: every reader-facing string (labels, view names,
    explanations, toggle labels, label-overlay text) resolves from the co-located
    strings module, never an inline literal (FR-016, SC-008).

---

## Consumers (how the data flows)

- **Server page** `src/app/book/hat/page.tsx` — statically imports
  `hat.manifest.ts`, calls the shared hookless `renderLayerStack(layers, visible)`
  with **all** layers visible, wraps the `HatViewer` island in `<ErrorBoundary>`.
  This is the no-JS / print / crawler composite (FR-008, SC-002; Hat gate).
- **Client engine** `LayeredDiagram` — owns `DiagramViewState`, restores from the
  URL hash, reuses the same `renderLayerStack`; hidden = `opacity:0;
pointer-events:none; aria-hidden`, never `display:none` (FR-006).
- **`LayerToggles`** — one controlled toggle per `DiagramLayer.id` (FR-004),
  announcing name + on/off state (FR-011).
- **`ChapterPresets` / `GuidedViews`** — controlled buttons over
  `manifest.presets`; selecting one drives the state transition and updates the
  `aria-live` explanation region (FR-003, SC-007).
- **`book/layout.tsx`** — reads `chapters.ts` for prev/next chapter nav and the
  coming-soon state of `coat`/`boots` (FR-007).
