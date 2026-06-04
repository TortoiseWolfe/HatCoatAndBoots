# Book Viewer — Exploded-Layer Scroll-Story (Design)

**Date:** 2026-06-03
**Status:** Design — awaiting user review before implementation planning
**Supersedes:** the merged Option-A viewer on `main` (`d44953e`), which is being rebuilt from scratch.

---

## 1. What we're building

The interactive viewer for _HatCoatAndBoots_, a kids' building book. Each chapter
(Hat / Coat / Boots) teaches one building system. The book's whole point is that a
building is a **stack of transparent layers**, and the reader pulls them apart to
understand what each does.

This design replaces the previous "control-panel" viewer (presets rail + building +
toggle rail) — which read like a dashboard and buried the narrative — with a
**full-bleed exploded-layer scroll-story**: a large building, exploded into its real
parts in place, where **reading the chapter physically reassembles the house**.

Built on a fresh ScriptHammer base (branch `rebuild`, upstream `5a32da9`). The old
work is preserved at tag `pre-rebuild-d44953e` and `~/repos/_hcab-salvage`.

## 2. The core experience (locked)

- **Reading model:** a **scroll-story spine**. The reader scrolls (or presses
  Next/Back — a second way to move the _same_ story) through the chapter's ideas.
  The resting state is a readable page. There is no "operate-the-dashboard" mode.
- **The building is the hero, exploded in place:** one **large** building dominates
  the frame. Its real parts are spread apart along a diagonal/vertical axis (roof
  lifted high, walls/window in the middle, footing dropped low; suns and rain in the
  sky), still recognizably **one building**, tethered to a faint "ghost house"
  silhouette by dotted guide lines so the empty space becomes an assembly diagram.
- **Reading reassembles the house:** each story beat **docks** (or spotlights) the
  layer it is about. Stepping through the chapter's ideas snaps the pieces home — the
  narrative and the diagram are the same motion.
- **Exploration is the point:** the parts themselves are the controls. A child taps a
  part to pop it out / snap it home. This is enticing _by construction_ — seven
  separated, shadowed, color-tabbed slabs make "this comes apart into pieces" obvious
  at a glance.

## 3. Why it looks the way it does (the two failures this fixes)

Two problems with earlier attempts, both fixed here:

1. **Wasted space / void.** Earlier the building was a small glyph in a large empty
   (dark) gradient. **Fix:** a full-bleed **dawn-gradient sky as "layer 0"** fills the
   frame edge-to-edge (the _sky_ bleeds, never the building), and the exploded slabs +
   ghost house + guide lines span corner-to-corner, so negative space is load-bearing.
2. **Nothing showed there were layers to explore.** A single subtle glow didn't
   communicate "stack of pieces." **Fix:** the **separation itself is the composition**
   — seven distinct floating slabs, each with its own drop-shadow and a **color-coded,
   one-word edge-tab** (tan WALL, cyan WINDOW, terracotta ROOF, ochre SUMMER, gold
   WINTER, slate RAIN, grey FOOTING — colors pulled from the real SVG fills). On first
   load the house **exhales** (assembled → pops apart) so the child _witnesses_ it
   coming apart. (Reduced-motion: render the exploded state statically.)

## 4. Layout & responsive

- **Frame:** navbar (with chapter tabs) on top; the rest is the full-bleed stage; a
  slim translucent **narrative ribbon** carries the prose + Back/Next + a 7-dot live
  legend. The ribbon floats over already-low-information margin (lower-left on desktop;
  a thin thumb-zone bottom sheet on phone) — **never a third column, never a totem.**
- **Desktop/tablet:** wide isometric exploded spread; building mass corner-to-corner.
- **Phone:** the explode axis **steepens toward vertical** so the slabs cascade down
  the tall viewport (still skewed depth-planes with tabs + guide lines — _not_ a
  stacked button list). Suns/rain tuck into the top corner; earth bleeds off the
  bottom. Back/Next + 7-dot legend collapse into the bottom thumb ribbon.
- **3D fallback:** if CSS 3D is flaky, drop to a 2D `skewY` exploded view (same
  offsets, no perspective) — loses some wow, keeps all the layer-ness and pedagogy.
- **Chapters live in the navbar** (Hat active; Coat/Boots as tabs). No second nav row.

## 5. Exploration interaction

- Each of the 7 layers is a real focusable `<button aria-pressed aria-label>` with a
  **≥44×44px** hit area on its skewed plane; the colored edge-tab guarantees the target
  even where the art is a thin line (rain streaks, sun discs get padded hit rects).
  Overlapping parts resolve **topmost-art-wins** so a tap is deterministic.
- **Tap/click** toggles that one layer between **docked** (slid into its ghost slot,
  opacity 1, in original coordinates) and **exploded** (translated out + dimmed). This
  maps exactly onto the existing opacity-layer stack; **docked re-superimposes to the
  exact original 360-box position**, so the assembled building is byte-identical (honors
  the alignment invariant).
- **Desktop:** hover lifts the slab + shows its name tooltip; click toggles. **Touch:**
  tap to dock / tap again to pop out (tap is the contract; drag is progressive
  enhancement). **Keyboard:** Arrow keys move focus slab-to-slab in sky→soil order,
  Enter/Space toggles, Esc closes a tooltip.
- **Story vs. reader (coexistence):** advancing a beat auto-docks/spotlights that beat's
  layer and dims the rest. The instant the child toggles a part themselves, manual state
  takes over and a **"↺ back to the story"** affordance appears to resync to the current
  beat. Story sets state; taps mutate state; **the story reads only its own step index
  and never echoes state back into `initialPresetId`** (honors the no-prop-echo invariant).

## 6. The single biggest engineering risk (and the mitigation)

**Never cover-crop the figure.** The 7 SVGs were authored to read only when
superimposed in one shared `viewBox 0 0 360 360`, and the chapter's _lesson lives in the
margins_: summer-sun disc ≈ x286–314 with rays to x316, winter-sun ≈ x313–339, rain
throw bulging to x330, earth to y344. A naive `preserveAspectRatio="...slice"` cover on a
tall phone would scale-to-fill and silently delete everything past x≈290 — shipping a
pretty house with its pedagogy off-screen.

**Mitigation:** author a **wider composite frame (`viewBox 0 0 480 360`)** where the
extra width + full height are **decorative sky/earth bleed only**. ALL load-bearing
geometry stays inside a defined **safe-box** (the original `0 0 360 360`, plus the
right margin x290–339 explicitly reserved for suns/rain). The **sky-rect** is what
bleeds/crops (harmlessly); the building/suns/rain are placed by their **real per-layer
bbox offsets** and clamped so the safe-box never crops at any aspect ratio. Per-layer
offset metadata is derived from the verified bboxes: wall y120–300, window x182–236 /
y150–253, roof apex y62 / eaves x110–290, summer-sun (300,46), winter-sun (326,196),
rain throw to x330/x312, footing y300–344. Keeping these consistent is what lets DOCKED
re-superimpose exactly.

Secondary: build-inline all SVGs (no per-card fetch) for static export; hard-bail the
exhale to a static exploded render under `prefers-reduced-motion`.

## 7. Architecture (components & data)

**Data (pure, per chapter — the only files you edit to change content):**

- `chapters/<chapter>.manifest.ts` — typed chapter data: an ordered list of **steps**
  (idea-based beats), each `{ id, heading, prose, dockedLayerIds, spotlightLayerId? }`;
  plus `layers` (id → SVG, alt, **bbox offset**, **edge-tab color/word**) and `meta`
  (title, kicker). One file per chapter (Hat, Coat, Boots).
- `types.ts` — `Step`, `ChapterManifest`, `Layer`.
- Narrative refined from the **salvaged drafts** (`_hcab-salvage/.../*.manifest.ts`,
  `*.strings.ts`), re-cut into idea-steps, tuned for ages 13–18. Strings live in a
  `*.strings.ts` map (i18n seam), never inline.

**Engine (headless):**

- `useScrollStory(steps)` — owns `activeStep`; driven by both an IntersectionObserver
  over invisible step anchors **and** `goNext/goPrev/goTo`. One source of truth (prevents
  scroll-vs-button conflict). Settle gate (~700ms) before auto-teaching, to avoid flicker.
- `useLayerState(manifest)` — reducer: `{ layerState, mode: 'story'|'reader', openTip,
exploredParts }`. Session-scoped (resets per visit so a returning child gets the lure).
- `useReducedMotion()` — reuse existing repo hook; gates exhale/transitions.

**Presentation (driven by state):**

- `<ExplodedBuilding layers, layerState, onToggle>` — renders the sky-rect + the 7 SVG
  layers as docked/exploded slabs with tabs, shadows, guide lines, ghost house. The only
  component that knows about SVGs/geometry.
- `<StoryRibbon step, total, onNext, onPrev, legend>` — prose + Back/Next + 7-dot legend.
- `<PartTooltip>` — touch-aware, AAA-contrast, single-instance, anchored in the sky.
  (Do **not** reuse the DaisyUI `Tooltip` — it's hover/focus-only.)
- `<ChapterViewer manifest>` — wires the hooks to the pieces (single integration point).
- Route `app/book/[chapter]/page.tsx` — loads the manifest, static-exportable.

**One-directional data flow:** scroll/Next/Back → `useScrollStory` sets `activeStep` →
beat's `dockedLayerIds` drive `useLayerState` (story mode) → `<ExplodedBuilding>` +
`<StoryRibbon>` render from state. A tap flips `mode` to reader and mutates `layerState`
directly. **Content (manifests) is fully separated from mechanism.**

**Component packaging:** the viewer pieces follow the repo's 5-file atomic pattern via
`pnpm run generate:component` (e.g. category `architecture`).

## 8. Scope of the first slice

- **All three chapters** (Hat / Coat / Boots), but **Hat built first** to validate the
  mechanism end-to-end; Coat + Boots then follow the same manifest shape.
- Uses the **14 salvaged SVG layers** already restored to `public/book/`.

## 9. Quality gates (must pass)

- TS strict, Vitest, Pa11y zero WCAG-AA (Coat gate); static export deployable, small
  first load (Boots gate); error boundary + degraded modes (Hat gate — **no-JS gate was
  dropped in constitution v1.0.1**, so the JS-driven scroll/explode is allowed).
- **AAA contrast** both themes (text on opaque cards, independent of artwork).
- **44px** touch targets; full keyboard operation; `aria-live` announces toggles;
  honors `prefers-reduced-motion` and the repo's `data-reduce-motion`.
- The building's docked/assembled wall-rectangle stays consistent across Hat/Coat/Boots
  (alignment invariant); mobile has no horizontal scroll at 320/375/390/428.

## 10. Out of scope

- New chapter _content_ beyond refining salvaged drafts; multilingual; the 3D game;
  auth/messaging/blog (template features, left as-is).
- Drag-to-peel (progressive enhancement only; tap is the contract).

## 11. Open / deferred

- The exact explode geometry (offsets, angle, spread) is a **build-time visual tuning**
  task — the user judges it on the _real_ art, not in wireframe. The mock was approved
  only as "a step in the right direction"; final composition is dialed in during
  implementation against the actual SVGs.
- Whether the on-load "exhale" is per-visit or first-visit-only (default: per session).
