# Research — Feature 048: Hat Chapter (Phase 0)

**Feature:** 048-hats-chapter
**Branch:** `048-hats-chapter`
**Dir:** `features/_uncategorized/048-hats-chapter/`
**Scope:** English-only Hat (roof) chapter of the one-building transparency-stack book viewer.
**Purpose:** Resolve every technical unknown before Phase 1 design. No `NEEDS CLARIFICATION` may remain after this document.

This slice authors the **roof-region teaching content** on top of a single building drawn once in a shared coordinate space (the _House-That-Code-Built_ transparency-stack mechanic). A chapter is a **focus on a region**, never a separate drawing. Decisions below are ordered to be traceable to the spec's functional requirements (FR-xxx) and success criteria (SC-xxx) and to the constitution's "Hats, Coats, and Boots" quality gate.

---

## 1. SVG Layer Rendering Under Static Export

**Decision:** Render every diagram layer as a plain `<img src={...} alt={...} />` element, absolutely positioned within a shared `position: relative` stage sized to the manifest `viewBox` aspect ratio. Use `next/image` for **neither** the Server composite nor the client island. Do **not** inline the SVG markup into the React tree.

**Rationale:**

- `next.config.ts` sets `output: 'export'` (line 43) and `images.unoptimized: true` (line 48). Under unoptimized static export, `next/image` performs **no resizing, no format negotiation, and no lazy CDN work** — it degrades to an `<img>` while still shipping the `next/image` runtime, the `<span>` wrapper boxes, and the `sizes`/`srcset` plumbing. That is pure weight for zero benefit and works against the Boots gate (first-load < 150 KB, SC: ~11 KB of SVG).
- The existing prototype `src/components/atomic/SpinningLogo/LayeredHatCoatAndBootsLogo.tsx` proves the stacked-transparent-layer mechanic (absolute-positioned layers, `drop-shadow` filters, basePath-aware `src`) but **imports `next/image`** (line 4, `src={`${detectedConfig.basePath}/...`}` at lines 40/58/85). This feature **generalizes the layout idea and drops `next/image`** — same absolute-stack visual result, lighter bundle.
- Inline `<svg>` would bloat the **island JS bundle** (the artwork bytes become part of the hydrated component tree and re-render on every visibility toggle) and would couple language-neutral artwork to the component, defeating the strings-as-overlay strategy (decision #5). External `<img>` keeps each SVG a cacheable static asset under `public/book/hat/*.svg`.
- basePath correctness: assets must be referenced as `` `${detectedConfig.basePath}/book/hat/...` `` exactly as the prototype does (`src/config/project-detected.ts` exports `detectedConfig`, currently `basePath: ""`), so deploys under a GitHub Pages subpath resolve.

**Alternatives considered:**

- **`next/image`** — rejected: zero optimization under `unoptimized: true` + `output: 'export'`, ships dead runtime weight, conflicts with the Boots size budget.
- **Inline `<svg>` in JSX** — rejected: bloats the island bundle, re-renders on toggle, bakes artwork into the component, hurts caching and the i18n-overlay plan.
- **CSS `background-image` layers** — rejected: backgrounds are not in the accessibility tree, so per-layer `alt`/`aria` (FR a11y, decoration flags) become impossible; harder to opacity-cross-fade individually.

---

## 2. Shared-Coordinate Registration (One Building, Three Chapters)

**Decision:** Maintain **one canonical building manifest** (a co-located TS module, decision #5) with a **single fixed `viewBox`** shared by every layer and every chapter. Every layer is authored against that one coordinate space and carries a `region: 'roof' | 'envelope' | 'foundation'` tag. A "chapter" sets a `chapterFocus` prop on the `LayeredDiagram` engine; focusing a region changes **only `opacity` (and `z`/atmosphere dimming)** of the non-focused layers — **never geometry, never the `viewBox`, never element coordinates**. The building is drawn once; `/book/hat`, `/book/coat`, `/book/boots` mount the **same** `LayeredDiagram` with a different `chapterFocus`.

**Rationale:**

- Satisfies FR-001a / FR-006 / SC-009: focusing a region foregrounds its layers and dims the rest **without moving anything** — no layout shift between chapters because the stage, the `viewBox`, and every layer's box are identical across routes.
- A single source-of-truth manifest means there is exactly one place that defines where the roof, walls, and foundation live; chapters are **views**, not forks. This is the _House-That-Code-Built_ transparency-stack mechanic made literal.
- **Future 3D drop-in:** because all 2D layers already register to one canonical coordinate space keyed by region, a later feature can replace the `<img>` layer renderer with a 3D scene (e.g. issue #48 Three.js track) that consumes the **same** region tags and focus prop. The contract (`region`, `chapterFocus`, visibility set) is renderer-agnostic; only `renderLayerStack` changes. Nothing in routing, presets, or strings has to move.

**Alternatives considered:**

- **Per-chapter drawings / per-chapter SVG sets** — rejected: guarantees layout shift and drift between chapters, triples the artwork, and breaks the one-building promise (SC-009).
- **Pan/zoom (`viewBox` mutation) to "focus" a region** — rejected: it _moves_ the building, violating FR-006's no-shift rule and making the 3D drop-in coordinate-incompatible.
- **CSS transform-based focus (scale/translate the region)** — rejected: same no-shift violation; also fights the "draw once, dim the rest" model.

---

## 3. URL-Reflected View / Focus State Under Static Export

**Decision:** Reflect the active guided view in a **hash fragment** on the chapter route, e.g. `/book/hat#view=roof-line`. Chapter focus is carried by the **route segment** itself (`/book/hat` ⇒ roof focus, `/book/coat` ⇒ envelope, `/book/boots` ⇒ foundation). The client island reads `window.location.hash` on mount and restores the matching preset; it writes the hash (via `history.replaceState`, no scroll jump) whenever the active view changes. An **unknown or absent** view name falls back to the manifest `defaultPresetId` (`'everything'`).

**Rationale:**

- GitHub Pages serves the static export with no server. With `output: 'export'` there is no server to **resolve query strings or dynamic params for arbitrary view names** — a deep link like `?view=roof-line` cannot be server-rendered into the right preset, and creating a static page per view-name combinatorially explodes the export.
- A **hash fragment is never sent to the server**, is fully client-restorable, requires zero extra exported HTML, and survives the static-export model cleanly. This directly satisfies FR-007a/FR-007b (active guided view + chapter focus visible in the page address) without a backend.
- Route segments for the three chapters are already real exported pages (`src/app/book/{hat,coat,boots}/page.tsx`), so focus-in-URL is "free" and crawlable; only the finer-grained view selection needs the hash.
- Graceful unknown-view handling (→ `'everything'`) keeps shared/edited links from ever rendering a broken or empty state.

**Alternatives considered:**

- **Query string (`?view=`)** — rejected: GitHub Pages can't server-resolve it under static export; it also gets stripped/normalized by some static hosts and pollutes analytics.
- **Dynamic route segment per view (`/book/hat/roof-line`)** — rejected: requires pre-generating an exported HTML page for every view, multiplies the export, and couples URL shape to the preset list (rework when presets change).
- **No URL reflection (in-memory state only)** — rejected: violates FR-007a/b; loses deep-linkability and "printable spread" shareability.

---

## 4. No-JS Hat-Gate Technique (Server Composite + Opacity Hydration)

**Decision:** The Hat page (`src/app/book/hat/page.tsx`) is a **Server Component** that renders the **full composite** — every layer visible — by calling the shared hookless `renderLayerStack(layers, /* all visible */)`. Hidden layers in the interactive state are hidden with **`opacity: 0` + `pointer-events: none` + `aria-hidden="true"`**, **never `display: none`** and never removed from the DOM. The interactive client island (`HatViewer`, wrapped in `<ErrorBoundary>` from `src/components/ErrorBoundary.tsx`) hydrates **on top of** the already-complete server markup and merely toggles those opacity/aria attributes.

**Rationale:**

- FR-008 / SC-002 (the "Hat gate" — graceful failure): with JS disabled, in print, or for crawlers, the Server Component output is the **complete, labeled blueprint** — all roof/envelope/foundation layers composited and readable. The page is never blank or partial without JS.
- `opacity: 0` (not `display: none`) is required for two reasons: (a) **no layout shift** — hidden layers keep occupying their box so toggling visibility never reflows the building (FR-006); and (b) **no-JS completeness** — `display: none` would make the no-JS/print render lose layers; opacity-hidden layers still paint in the composite and remain in the accessibility tree until the island explicitly sets `aria-hidden`.
- Hydrating on top of a full composite (rather than rendering the island from scratch) means the first paint is correct even before hydration, and a hydration failure is contained by `<ErrorBoundary>` — the reader still sees the full static blueprint, the worst case is "interactivity unavailable," never "broken page."
- `renderLayerStack` is **hookless and shared** by the Server page and the client engine, guaranteeing the server composite and the client's "everything" preset are pixel-identical (single rendering function, no divergence).

**Alternatives considered:**

- **`display: none` for hidden layers** — rejected: drops layers from the no-JS/print composite (fails SC-002) and causes reflow on every toggle (fails FR-006).
- **Client-only rendering (island renders the building itself)** — rejected: no-JS users get nothing; defeats the Hat gate.
- **`visibility: hidden`** — rejected: it does preserve layout, but it cannot cross-fade (no opacity transition) and still removes the element from hit-testing/AX less predictably than the explicit `opacity` + `pointer-events` + `aria-hidden` triple we control directly.

---

## 5. English-Only-But-i18n-Ready Strings

**Decision:** Author **all reader-facing text as discrete, externally-referenced strings in a co-located strings module** (e.g. `strings.ts` beside the manifest), and render **in-drawing labels as HTML text overlaid on language-neutral SVG artwork** — labels are positioned HTML elements over the `<img>` stage, **never baked into the SVG files**. No i18n library is added this slice (the repo has none). The strings module exports a flat, keyed English record consumed by every component and by the manifest's `label`/`alt`/`description` fields.

**Rationale:**

- FR-001 / FR-016 / SC-008: this slice is **English only** (multilingual is carved to feature 049 / issue #2), but it must leave **zero rework** for 049. Two structural choices guarantee that:
  1. **Language-neutral SVG + HTML label overlay** — the artwork SVGs in `public/book/hat/*.svg` contain no words, so translating never means re-exporting artwork. Labels live as HTML positioned over the building (also better for a11y/selection/zoom than `<text>` in an image).
  2. **Strings as externally-referenced keys** — every string is referenced by key from one module, so feature 049 adds a translation layer by swapping the resolver (key → locale string) **without touching any component or artwork**. Components already read keys, not literals.
- Keeping it a **co-located TS module** (not a JSON file) lets `tsc` type-check that every referenced key exists and lets the manifest reference strings by the same typed keys (decision: manifest is also TS for the same reason).
- No i18n dependency is pulled in (keeps the Coat/Boots gates lean and the bundle small); the shape is simply "ready to be wrapped" by 049's chosen mechanism (e.g. `next-intl` or a hand-rolled dictionary) later.

**Alternatives considered:**

- **Inline literal strings in JSX** — rejected: forces a find-and-replace sweep through every component in 049 (rework), violates FR-016.
- **Text baked into the SVG (`<text>` elements)** — rejected: every translation needs new artwork; SVG text is harder to make accessible, selectable, and zoom-stable than HTML overlay (FR-001 wants language-neutral artwork).
- **Adding an i18n library now** — rejected: out of scope (049/#2), adds weight and config this slice doesn't need; the keyed-strings shape already makes the future addition a drop-in.
- **`public/` JSON strings** — rejected: loses `tsc`-time key validation and the shared typed contract with the manifest.

---

## 6. Self-Hosted Latin Display Font + System Fallback (FR-013a)

**Decision:** Ship a **self-hosted** Latin display typeface for the book's headings/labels via an `@font-face` block in `src/app/globals.css` pointing at a **locally committed font file** (woff2) under the app, with `font-display: swap` and an explicit **system fallback stack** (e.g. `"<DisplayFace>", ui-serif, Georgia, "Times New Roman", serif` for a display serif, or the sans equivalent). **No third-party (Google Fonts / CDN) request** is made for the book typeface.

**Rationale:**

- FR-013a requires a self-hosted display font with a system fallback and **no third-party network request** (privacy + offline-PWA + deterministic print). The repo already demonstrates **both** font patterns: `src/app/globals.css` contains hand-written `@font-face` blocks (lines 194, 200) — the self-host pattern we extend — and `src/app/layout.tsx` currently imports `Geist`/`Geist_Mono` from `next/font/google`. We deliberately use the **`@font-face` / self-host path**, not `next/font/google`, so the book face is served from our own origin.
- `next/font/local` is an acceptable alternative mechanism (it also self-hosts and auto-generates the fallback metrics), but the existing `globals.css` `@font-face` precedent keeps the book's display face co-located with the rest of the app's font CSS and avoids touching the root layout's existing `next/font` setup.
- `font-display: swap` + a real system fallback stack means text is readable instantly (no FOIT), satisfies the progressive-enhancement/Hat gate (graceful even before the webfont loads), and keeps Lighthouse Perf/A11y high (Boots gate: Perf ≥ 90, A11y ≥ 95).
- Self-hosting (no Google Fonts) aligns with the constitution's privacy Mandatory Constraint and the static-export/offline-PWA model — every byte ships from the same origin, so the book renders identically offline and in print.

**Alternatives considered:**

- **`next/font/google` (Geist, as the rest of the app uses)** — rejected for the **book display face**: it issues/embeds a Google-originated request flow and is not the self-hosted guarantee FR-013a demands.
- **System fonts only (no display face)** — rejected: loses the book's intended display character; FR-013a explicitly calls for a self-hosted display font.
- **CDN-hosted webfont** — rejected: third-party request, privacy + offline + print determinism failure.
- **`next/font/local`** — viable and equivalent in outcome; documented here as the secondary option. Chosen `@font-face` in `globals.css` to match existing repo precedent and avoid editing the root layout.

---

## 7. Reduced-Motion + Colorblind Support

**Decision:** Reuse the existing hooks `src/hooks/useReducedMotion.ts` and `src/hooks/useColorblindMode.ts` directly — do **not** reimplement. Gate the **opacity cross-fade** between guided views on `useReducedMotion()`: when reduced motion is requested, view changes are an **instant opacity swap (no transition)**; otherwise a short opacity transition. The two suns (summer-sun-blocked vs winter-sun-admitted teaching) are distinguished by **shape + angle + label, not color alone** — e.g. a high-angle summer sun vs a low-angle winter sun with distinct glyph silhouettes — so the teaching reads under any `useColorblindMode()` palette and for monochrome print.

**Rationale:**

- FR-012 requires the summer and winter suns to be distinguishable **without relying on color** (colorblind + monochrome print). Encoding the difference in **angle (high vs low in the sky) and shape/glyph** plus an HTML label means the meaning survives any colorblind palette and grayscale printing — color becomes redundant reinforcement, not the sole channel.
- Reusing `useReducedMotion` (and its test `useReducedMotion.test.ts`) keeps motion behavior consistent with the rest of the app and honors `prefers-reduced-motion`; gating only the **cross-fade transition** (not the visibility logic) means reduced-motion users still get the full feature, just instantly — satisfying both the a11y constraint and FR-006's no-shift guarantee (the swap is still opacity-only).
- Reusing `useColorblindMode` (test `useColorblindMode.test.ts`) lets the colorblind palette apply uniformly; because the sun semantics are shape/angle-encoded, the colorblind mode is reinforcement rather than a dependency.

**Alternatives considered:**

- **New bespoke motion/colorblind logic for the viewer** — rejected: duplicates tested hooks, risks drift, violates the constitution's "components make the next component easier" principle.
- **Color-only sun distinction (e.g. yellow vs orange)** — rejected: fails FR-012 for colorblind readers and monochrome print.
- **Disabling all animation unconditionally** — rejected: needlessly removes the cross-fade affordance for users who haven't requested reduced motion; gating per-user is the correct, tested approach.

---

## 8. Testing Strategy Per Gate

**Decision:** Map tests to the three constitution gates (Hat = graceful failure, Coat = typed & tested, Boots = deployable) and the established stack (Vitest + RTL unit, Pa11y/jest-axe a11y, Playwright e2e, Storybook stories). Concretely:

- **Vitest + React Testing Library (Coat gate — unit):**
  - **Visibility logic** — `renderLayerStack` and the engine produce the correct visible set for each preset (`'everything'` default, bare wall, roof line, how-it-sheds-water) and for custom toggle states.
  - **Preset allow-list / custom-state** — selecting a preset yields exactly its `visibleLayerIds`; toggling an individual layer transitions the engine into a "custom" state (no longer matching a named preset) and the explanation/aria-live text updates accordingly.
  - **No `display: none` invariant** — assert hidden layers are hidden via `opacity: 0` + `pointer-events: none` + `aria-hidden="true"` and are **still present in the DOM** (never `display: none`, never removed) — locks FR-006 / SC-002 against regression.
  - **Unknown-view fallback** — an unrecognized hash view resolves to `defaultPresetId` (`'everything'`).
  - **Manifest type validity** — the co-located TS manifest type-checks at `tsc` time (preset IDs reference real layer IDs, string keys exist), enforced by the type-check step, not a runtime test.

- **Pa11y / jest-axe (Coat gate — a11y, zero WCAG-AA violations):**
  - Each chapter route and each guided view passes axe/Pa11y with **zero AA violations**.
  - Layer `alt` text present for meaningful layers, `decorative` layers marked appropriately; aria-live region announces explanation changes; HTML labels and controls are reachable and labeled; 44px touch targets (`min-h-11 min-w-11`).

- **Playwright (Hat + Boots gates — e2e):**
  - **Guided-view walkthrough** — drive everything → bare wall → roof line → how-it-sheds-water; assert the explanation text and the visible-layer set update each step.
  - **Keyboard operation** — all guided-view and per-layer controls reachable and operable by keyboard; focus order sane.
  - **URL/hash restore** — deep-linking `/book/hat#view=roof-line` restores that view; changing views rewrites the hash; an unknown hash lands on `'everything'`.
  - **No-JS completeness** — with JavaScript disabled, the Hat page renders the **full composite** (all layers visible, labeled) — the Hat-gate proof (SC-002).

- **Storybook (visual + printable spreads):**
  - Stories for `LayeredDiagram`, `LayerToggles`, `ChapterPresets`/`GuidedViews`, and `HatViewer` (plop category `architecture`, Storybook title `Book/Architecture`).
  - Each guided view gets a story so the spreads are **printable** and reviewable as static composites — doubling as the no-JS/print visual reference.

**Rationale:**

- This is "a book children will read; correctness matters" (project practice #3). Mapping each assertion to a specific gate makes the quality gate enforceable in CI rather than aspirational, and the "no `display: none`" + "no-JS full composite" tests pin the two highest-risk invariants (FR-006 no-shift, SC-002 no-JS completeness) that the rest of the architecture depends on.
- Reusing the repo's existing four-tool stack (Vitest, jest-axe/Pa11y, Playwright, Storybook) and the 5-file generator pattern means no new test infrastructure and keeps the Coat gate (TS strict, unit + RTL, zero-AA a11y, lint clean) and Boots gate (static export, < 150 KB first load, Lighthouse Perf ≥ 90 / A11y ≥ 95) directly checkable.

**Alternatives considered:**

- **E2E-only (skip unit tests of visibility logic)** — rejected: visibility/preset/custom-state logic is the engine's core and is far cheaper and more precise to pin in Vitest; e2e alone is slow and flaky for this.
- **Snapshot-testing the SVG composite** — rejected: brittle against artwork edits; Storybook visual stories + the no-JS Playwright composite check cover the same intent without snapshot churn.
- **Manual a11y review only** — rejected: violates the Coat gate's automated zero-AA requirement; jest-axe/Pa11y must run in CI.

---

## Open Questions

None. All Phase 0 unknowns are resolved above; no `NEEDS CLARIFICATION` remains.
