---
description: 'Task list for the Hat chapter (feature 048)'
---

# Tasks: The "Hat" Chapter

**Input**: Design documents from `features/_uncategorized/048-hats-chapter/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/components.md ✅, quickstart.md ✅
**Branch**: `048-hats-chapter`

**Prerequisites (feature dependencies)**: None — this is a fresh book-content feature with no code dependencies. Feature 049 (i18n, issue #2) depends on THIS slice; this slice does not depend on it.

**Tests**: INCLUDED. The constitution mandates Test-First Development (RED → GREEN → REFACTOR) and CI rejects components missing their `.test.tsx` / `.accessibility.test.tsx`. Test tasks therefore precede implementation within each story.

**Organization**: Tasks are grouped by user story (P1/P2/P3 from spec.md). The shared building viewer is foundational (Phase 2) because all three stories operate on it.

**Docker-first**: every `pnpm`/generator command runs in the container: `docker compose exec hatcoatandboots pnpm <cmd>`. Commit from the container with the `GIT_*` env vars; never `--no-verify`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: US1 / US2 / US3 (user-story phases only; Setup/Foundational/Polish carry no story label)
- Exact file paths included. Paths are relative to repo root `/home/TurtleWolfe/repos/HatCoatAndBoots/`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Scaffold the four components (5-file pattern via the generator) and the directory skeleton so all later tasks have files to edit.

- [ ] T001 Generate the `LayeredDiagram` component via `docker compose exec hatcoatandboots pnpm run generate:component` (category `architecture`, with hooks). Verify the 5 files land at `src/components/architecture/LayeredDiagram/`.
- [ ] T002 Generate the `LayerToggles` component the same way → `src/components/architecture/LayerToggles/` (5 files).
- [ ] T003 Generate the `GuidedViews` component the same way → `src/components/architecture/GuidedViews/` (5 files).
- [ ] T004 Generate the `HatViewer` component the same way → `src/components/architecture/HatViewer/` (5 files).
- [ ] T005 [P] Create the manifests directory and empty module skeletons: `src/components/architecture/manifests/types.ts`, `src/components/architecture/manifests/hat.manifest.ts`, `src/components/architecture/manifests/strings.ts`, and `src/components/architecture/shared/renderLayerStack.tsx` (`.tsx` — it returns JSX).
- [ ] T006 [P] Create the asset directory `public/book/hat/` and the route directory skeleton `src/app/book/` (with `hat/`, `coat/`, `boots/` subfolders).

**Checkpoint**: All component files exist (generated), directories exist, build still green (`pnpm type-check`).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The shared building viewer — the data model, the SVG art, the strings, the self-hosted font, and the pure layer-stack helper. **Every user story renders this same building**, so this phase blocks all of US1–US3.

**⚠️ CRITICAL**: No user-story work can begin until this phase is complete.

### Data model & types

- [ ] T007 Define `DiagramLayer`, `DiagramPreset`, `DiagramManifest`, `ChapterFocus`, and the runtime `VisibilityState` types in `src/components/architecture/manifests/types.ts` (per data-model.md). Include the compile-time constraint that `DiagramPreset.visibleLayerIds` are layer ids.
- [ ] T008 Author the Hat building manifest in `src/components/architecture/manifests/hat.manifest.ts`: region-tagged layers (roof/overhang, sun-high, sun-low, rain, plus shared envelope=wall+window and foundation=footing as always-present context), one shared `viewBox`, the 4 presets (`everything` [default], `bare-wall`, `roof-line`, `how-it-sheds-water`) with exact `visibleLayerIds`, `defaultPresetId`, and the labels overlay entries (id, text, x, y in viewBox coords). Validate at tsc time that preset ids ⊆ layer ids. (data-model.md)
- [ ] T009 [P] Author the English strings module `src/components/architecture/manifests/strings.ts` (chapter title, intro prose, the 4 view names + explanations, toggle labels, in-drawing label text, coming-soon copy) as discrete externally-referenced keys — satisfies FR-016/SC-008 so feature 049 has no rework.

### SVG art (language-neutral, shared viewBox, ~11 KB total)

- [ ] T010 [P] Author `public/book/hat/wall.svg` (envelope: wall + window, the always-present context, shared viewBox, transparent).
- [ ] T011 [P] Author `public/book/hat/foundation.svg` (footing lifting the building off the ground line; shared viewBox).
- [ ] T012 [P] Author `public/book/hat/overhang.svg` (roof + projecting eave — the Hat region; shared viewBox).
- [ ] T013 [P] Author `public/book/hat/sun-high.svg` (summer sun, steep, blocked at the eave — distinguishable by shape+angle per FR-012; shared viewBox).
- [ ] T014 [P] Author `public/book/hat/sun-low.svg` (winter sun, shallow, reaching the window — distinct shape+angle from sun-high; shared viewBox).
- [ ] T015 [P] Author `public/book/hat/rain.svg` (rain shedding clear of the wall base; shared viewBox). All six SVGs MUST register in one coordinate space (FR-001a).

### Shared helper, font, error boundary

- [ ] T016 Implement the pure `renderLayerStack(layers, visibleIds)` helper in `src/components/architecture/shared/renderLayerStack.tsx` (`.tsx` — returns `React.ReactNode`) — returns the absolutely-positioned stacked `<img>` layers (basePath-prefixed `src` via `detectedConfig.basePath`), hidden = `opacity:0` + `pointer-events:none` + `aria-hidden` (NEVER `display:none`); decorative SVG layers carry `alt=""`. Used by BOTH the Server page and the client engine. **Canonical location is `architecture/shared/renderLayerStack.tsx`** — reconcile contracts/components.md (which earlier referenced `LayeredDiagram/renderLayerStack.tsx`) to this path. (research.md, contracts/components.md)
- [ ] T017 [P] Self-host the Latin "illustrated blueprint" display font with a declared system-font fallback (per FR-013a) — add the `@font-face`/`next/font/local` setup and the fallback stack; no third-party request.
- [ ] T018 [P] Write the unit test for `renderLayerStack` in `src/components/architecture/shared/renderLayerStack.test.tsx`: asserts hidden layers use `opacity:0`+`pointer-events:none`+`aria-hidden` and **never** `display:none`; asserts all layers are present in the DOM regardless of visibility (FR-006 no-shift); asserts decorative SVG layers carry `alt=""`. (RED first)

**Checkpoint**: The building manifest type-checks, the six SVGs register in one coordinate space, `renderLayerStack` is implemented and its test passes. The shared building can now be rendered by any story.

---

## Phase 3: User Story 1 — A reader discovers why the overhang matters (Priority: P1) 🎯 MVP

**Goal**: Guided views (`everything`/`bare-wall`/`roof-line`/`how-it-sheds-water`) reveal the roof-region lesson one variable at a time; the explanation updates with the view; the active view is reflected in the URL hash and restored on load.

**Independent Test**: Load `/book/hat`, step through each guided view, confirm the drawing shows exactly that view's element set with a matching explanation, and that copying/reloading the URL restores the same view (spec US1 AS-1…6).

### Tests for User Story 1 (write FIRST, ensure they FAIL) ⚠️

- [ ] T019 [P] [US1] Unit test `GuidedViews` in `src/components/architecture/GuidedViews/GuidedViews.test.tsx`: selecting a preset emits the exact `visibleLayerIds`, marks that view active, and the `aria-live` description updates to match (FR-002/003, SC-007).
- [ ] T020 [P] [US1] Unit test the `LayeredDiagram` preset application in `src/components/architecture/LayeredDiagram/LayeredDiagram.test.tsx`: applying each of the 4 presets shows exactly that subset; default (no hash) = `everything` (FR-002, US1 AS-1).
- [ ] T021 [P] [US1] E2E test in `tests/e2e/book-hat-guided-views.spec.ts`: walk the 4 views in order, assert drawing+explanation match each (FR-002/SC-007); assert selecting a view updates the URL hash and a reload restores it (US1 AS-6, FR-007a); unknown hash view → falls back to `everything` (Edge Case). Additionally assert the **FR-015 6-beat reasoning progression** is reachable via the 4 views + per-element toggles (bare wall → overhang → summer-sun blocked → winter-sun admitted → rain shed → measurements/labels), each beat changing one element at a time (FR-015, FR-004).

### Implementation for User Story 1

- [ ] T022 [US1] Implement `LayeredDiagram` body in `src/components/architecture/LayeredDiagram/LayeredDiagram.tsx`: props `manifest`, `chapterFocus`, `initialPresetId?`; owns `visibleIds: Set` + `activePresetId`; renders the building via `renderLayerStack`; cross-fade `opacity 0.3s` gated on `useReducedMotion`; never moves geometry on change (FR-001a/006). (depends on T016)
- [ ] T023 [US1] Implement `GuidedViews` body in `src/components/architecture/GuidedViews/GuidedViews.tsx`: controlled rail of the 4 presets, active indication, and an `aria-live="polite"` description region driven by the active preset's explanation (FR-003/011).
- [ ] T024 [US1] Implement the in-drawing **labels HTML overlay** in `src/components/architecture/LayeredDiagram/LayeredDiagram.tsx` (positioned over the SVG via the manifest's label entries, English text from the strings module) — NOT baked into the SVG (FR-001).
- [ ] T025 [US1] Implement the URL-hash state in `HatViewer`/`LayeredDiagram`: read `#view=…` on mount to restore the preset, write it on view change; unknown/absent → `everything` (FR-007a, research.md hash decision).
- [ ] T026 [US1] Implement `HatViewer` body in `src/components/architecture/HatViewer/HatViewer.tsx`: imports `hat.manifest`, composes `LayeredDiagram` + `GuidedViews`, defaults to roof focus.
- [ ] T027 [US1] Create the Hat route `src/app/book/hat/page.tsx` as a **Server Component**: SSR-render the full composite (all layers visible via `renderLayerStack`) + intro prose + legend, then hydrate `<ErrorBoundary><HatViewer/></ErrorBoundary>` (Hat gate, FR-008/SC-002).
- [ ] T028 [P] [US1] Add Storybook stories in `src/components/architecture/LayeredDiagram/LayeredDiagram.stories.tsx`: `EverythingOn` (= the no-JS spread), `RoofLine`, `HowItShedsWater`, `BareWall` (Principle IV printable spreads).

**Checkpoint**: `/book/hat` teaches the lesson via guided views, URL-restorable; MVP is demonstrable.

---

## Phase 4: User Story 2 — A reader explores freely by toggling elements (Priority: P2)

**Goal**: Per-element toggles let the reader show/hide any single element; toggling away from a preset surfaces a "custom" state; only the toggled element changes (no shift); the two suns are distinguishable beyond color.

**Independent Test**: With `/book/hat` loaded, toggle each element individually — only that element appears/disappears, no other element moves, and the view indicator switches to "custom" (spec US2 AS-1…3).

### Tests for User Story 2 (write FIRST) ⚠️

- [ ] T029 [P] [US2] Unit test `LayerToggles` in `src/components/architecture/LayerToggles/LayerToggles.test.tsx`: each toggle flips exactly one layer's visibility; `role="toolbar"`, `aria-pressed` reflects state; roving focus moves with arrow keys (FR-004/010/011).
- [ ] T030 [P] [US2] Unit test the custom-state logic in `LayeredDiagram.test.tsx`: hand-toggling away from a preset sets `activePresetId = 'custom'` and does NOT falsely report a named view (FR-005); toggling a layer changes only that layer (SC-005). (extends T020's file — sequential within that file)
- [ ] T030a [P] [US2] Write the RED-first sun-distinguishability test in `src/components/architecture/LayerToggles/LayerToggles.accessibility.test.tsx` (or a co-located visual/interaction test): assert `sun-high` and `sun-low` are distinguishable by **shape AND angle**, not color alone, and that enabling `useColorblindMode` does not collapse them into the same appearance (FR-012). (RED first)

### Implementation for User Story 2

- [ ] T031 [US2] Implement `LayerToggles` body in `src/components/architecture/LayerToggles/LayerToggles.tsx`: controlled (`layers`, `visibleIds`, `onToggle`); `role="toolbar"`, `aria-pressed`, arrow-key roving focus, 44×44 px targets (`min-h-11 min-w-11`) (FR-004/010/014).
- [ ] T032 [US2] Wire `LayerToggles` into `src/components/architecture/HatViewer/HatViewer.tsx` and add the "custom" state handling in `src/components/architecture/LayeredDiagram/LayeredDiagram.tsx` (toggling away from a preset → `custom`; selecting a preset re-applies its exact set, overriding custom — Edge Case). (FR-005)
- [ ] T033 [US2] The summer/winter sun elements MUST be distinguishable by shape AND angle (not color alone): author `sun-high` (T013) and `sun-low` (T014) with distinct geometry, and integrate `src/hooks/useColorblindMode.ts` so the distinction survives colorblind modes — make T030a pass (GREEN). This is a constitutional WCAG-AA requirement, not optional (FR-012, SC-003). (touches T013/T014 assets + `src/components/architecture/LayeredDiagram/LayeredDiagram.tsx`)
- [ ] T034 [P] [US2] Add an `Interactive` Storybook story (free toggling) in `LayerToggles.stories.tsx`.

**Checkpoint**: Free exploration works alongside guided views; US1 still passes independently.

---

## Phase 5: User Story 3 — Every reader can use the chapter (Priority: P3)

**Goal**: Universal access — no-JS full composite, keyboard-only operation, screen-reader announcements, phone single-column reflow, reduced-motion, and the navigable Coat/Boots coming-soon focuses + book index.

**Independent Test**: Exercise the chapter with JS disabled (full composite + text visible, controls inert), keyboard-only (skip link, roving focus, Space/Enter), screen reader (names/states/announcements), narrow viewport (single column, 44px), and reduced-motion (instant swaps) — spec US3 AS-1…5.

### Tests for User Story 3 (write FIRST) ⚠️

- [ ] T035 [P] [US3] Accessibility tests (jest-axe) for `LayeredDiagram`, `LayerToggles`, `GuidedViews` in their respective `*.accessibility.test.tsx`: zero WCAG-AA violations; labeled controls; `aria-pressed`/`aria-hidden` correct (SC-003).
- [ ] T035a [P] [US3] Accessibility test for the integration island in `src/components/architecture/HatViewer/HatViewer.accessibility.test.tsx` (Principle IV — every component ships its a11y test, CI-enforced): assert zero jest-axe violations on the hydrated `HatViewer` over the SSR composite, the `aria-live` explanation region is present and announced, and the `<ErrorBoundary>` fallback is itself accessible (FR-008/FR-011, SC-003). (RED-first, before T026/T032 wiring is finalized)
- [ ] T036 [P] [US3] E2E no-JS test in `tests/e2e/book-hat-no-js.spec.ts`: with JavaScript disabled, the full composite drawing + all text are visible and the controls are present-but-inert (not broken) (FR-008/SC-002, US3 AS-1).
- [ ] T037 [P] [US3] E2E keyboard + reduced-motion test in `tests/e2e/book-hat-a11y.spec.ts`: skip link works; Tab/arrow/Space-Enter operate all controls; reduced-motion removes animated transitions (FR-010/013, US3 AS-2/5).

### Implementation for User Story 3

- [ ] T038 [US3] Add the skip-link + landmark structure and ensure visible focus indicators across all controls in `HatViewer`/`book/layout.tsx` (FR-010).
- [ ] T039 [US3] Gate all transitions on reduced-motion in `src/components/architecture/LayeredDiagram/LayeredDiagram.tsx` (OS preference AND the app's `data-reduce-motion` setting) via the `src/hooks/useReducedMotion.ts` hook — instant swaps when reduced (FR-013, US3 AS-5).
- [ ] T040 [US3] Implement responsive single-column reflow for the three regions (guided views | drawing | toggles) at the phone breakpoint, all controls ≥44×44 px (FR-014/SC-006).
- [ ] T041 [US3] Create `src/app/book/layout.tsx` (chapter chrome + prev/next nav) and `src/app/book/page.tsx` (the index: one building → 3 chapter focuses) per the signed-off `01-book-index` wireframe (FR-007).
- [ ] T042 [P] [US3] Create `src/app/book/coat/page.tsx` and `src/app/book/boots/page.tsx`: same shared viewer, envelope/foundation focus, region content "coming soon", building still rendered — never a dead end (FR-007/007b, Edge Case). Reuse `LayeredDiagram` with `chapterFocus="coat"`/`"boots"`.
- [ ] T043 [US3] Add the language-switcher **stub** (EN active; ES/中文 shown disabled with a "coming in 049" note) per the wireframes — forward-looking, no live translation (issue #2). (UI Mockup note 2)

**Checkpoint**: All three stories pass independently; the chapter is universally usable and the book index + coming-soon focuses are navigable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verify every constitution gate and finalize.

- [ ] T044 Run the Coat gate: `docker compose exec hatcoatandboots pnpm run type-check && pnpm run lint && pnpm test` — `type-check` clean; `lint` **zero errors AND zero NEW warnings**; tests green with coverage ≥25% on changed files **and no regression in overall coverage** (constitution Coat gate, verbatim).
- [ ] T045 [P] Run the a11y gate: `docker compose exec hatcoatandboots pnpm run test:a11y` (Pa11y) — zero WCAG-AA violations (SC-003).
- [ ] T046 [P] Run the E2E gate: `docker compose exec hatcoatandboots pnpm exec playwright test tests/e2e/book-hat-*.spec.ts` for the fast local check, **then run the full suite `pnpm run test:e2e` once before merge** so the constitution Coat gate (whole Playwright suite green) is met, not just the feature subset (guards against shared-suite/webkit-scroll regressions).
- [ ] T047 Run the Boots gate: `docker compose exec hatcoatandboots pnpm build` — static export succeeds, zero warnings, first-load JS **≤ 150 KB hard cap (target ≤ 100 KB)**; confirm the 6 SVGs total ~11 KB (SC-004).
- [ ] T047a [P] Run the **Lighthouse gate** against the built routes (`/book`, `/book/hat`, `/book/coat`, `/book/boots`) via `docker compose exec hatcoatandboots pnpm run lighthouse` (add a Lighthouse CI script if absent — that script is itself a prerequisite): assert **Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 90** (constitution Hat + Boots gates; plan.md Constitution Check).
- [ ] T048 [P] Execute the `quickstart.md` manual verification checklist end-to-end: guided views, URL hash restore, no-JS composite, keyboard, reduced-motion, phone reflow at ≤640px — AND verify **SC-001** (a reader reaches the full "why the overhang matters" explanation by stepping the views in under 2 minutes, without instruction) and **FR-009** (no auth UI, no network call collecting reader data, no server routes).
- [ ] T049 Run `/refresh-inventories` (or `docker compose exec hatcoatandboots` equivalent) so the codebase inventories reflect the new `architecture/` components, then commit from the container with the `GIT_*` env vars.
- [ ] T050 [P] Run the post-implement wireframe regression `/speckit.wireframe.screenshots` (constitution SpecKit workflow step) against the 4 signed-off wireframes so the built UI is captured against the approved mockups, OR record in this file why it is deferred for this slice.

---

## Dependencies & Execution Order

### Phase dependencies

- **Setup (P1)**: no deps — start immediately.
- **Foundational (P2)**: depends on Setup — **BLOCKS all user stories** (they all render the shared building).
- **US1 (P3) → US2 (P4) → US3 (P5)**: each depends on Foundational; US2/US3 build on US1's `LayeredDiagram` but each remains independently testable.
- **Polish (P6)**: depends on the desired stories being complete.

### User-story dependencies

- **US1 (P1)**: after Foundational. The MVP. No dependency on US2/US3.
- **US2 (P2)**: after Foundational; reuses `LayeredDiagram` from US1 but is independently testable (toggles work even without the guided views).
- **US3 (P3)**: after Foundational; a11y/no-JS/responsive cut across US1+US2 surfaces and adds the index + coming-soon routes.

### Within each story

- Tests written FIRST and FAIL (RED) before implementation (constitution TDD).
- Types/manifest (Phase 2) before components; helper before components; components before routes.

### Parallel opportunities

- Setup: T005, T006 in parallel.
- Foundational: the 6 SVG tasks T010–T015 in parallel; T009 strings, T017 font, T018 helper-test in parallel with art.
- Within a story: the `[P]` test tasks run together; Storybook stories `[P]` run alongside implementation.
- Polish: T045, T046, T048 in parallel.

---

## Parallel Example: Foundational SVG art

```bash
# The six language-neutral SVG layers are independent files — author together:
Task: "Author public/book/hat/wall.svg"
Task: "Author public/book/hat/foundation.svg"
Task: "Author public/book/hat/overhang.svg"
Task: "Author public/book/hat/sun-high.svg"
Task: "Author public/book/hat/sun-low.svg"
Task: "Author public/book/hat/rain.svg"
```

## Parallel Example: User Story 1 tests

```bash
# Write the failing tests for US1 together (RED), then implement:
Task: "Unit test GuidedViews in src/components/architecture/GuidedViews/GuidedViews.test.tsx"
Task: "Unit test LayeredDiagram preset application in .../LayeredDiagram/LayeredDiagram.test.tsx"
Task: "E2E guided-view walkthrough in tests/e2e/book-hat-guided-views.spec.ts"
```

---

## Implementation Strategy

### MVP first (User Story 1 only)

1. Phase 1 Setup → 2. Phase 2 Foundational (CRITICAL — the shared building) → 3. Phase 3 US1 → **STOP & VALIDATE**: `/book/hat` teaches the lesson via guided views, URL-restorable. Deploy/demo.

### Incremental delivery

- Foundation ready → US1 (MVP, the lesson) → US2 (free exploration) → US3 (universal access + index + coming-soon). Each story adds value without breaking the previous.

---

## Notes

- `[P]` = different files, no incomplete-task dependency.
- The shared building (Phase 2) is the heart — get its registration + `renderLayerStack` right and the rest composes.
- The no-JS gate (T027) and the no-shift invariant (T018/T022) are the constitution's Hat gate and SC-005/SC-009 — do not regress them.
- Commit after each task or logical group, from the container, never `--no-verify`.
- Total: **53 tasks** — Setup 6, Foundational 12, US1 10, US2 8 (incl. T030a sun-distinguishability test + T033), US3 10 (incl. T035a HatViewer a11y test), Polish 7 (incl. T047a Lighthouse gate + T050 wireframe-screenshot regression).
