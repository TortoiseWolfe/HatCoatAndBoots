# Implementation Plan: The "Hat" Chapter

**Branch**: `048-hats-chapter` | **Date**: 2026-05-30 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `features/_uncategorized/048-hats-chapter/spec.md`

## Summary

Build the book's **first content chapter** as a **single shared-building viewer**: one labeled cross-section of a building drawn once in a fixed coordinate space, where each "chapter" (Hat / Coat / Boots) is a _focus_ on one region — never a separate drawing. This slice authors the **Hat (roof) region's teaching content** — a generous overhang shades the high summer sun, admits the low winter sun, and sheds rain clear of the wall — taught as a one-variable-at-a-time reveal through guided views and per-layer toggles on an "illustrated blueprint."

The technical approach is a **data-driven layered-SVG diagram**: a `LayeredDiagram` engine renders a region-tagged building manifest as a stack of absolutely-positioned transparent SVG layers (generalizing the existing `LayeredHatCoatAndBootsLogo` prototype). A Server Component page renders the **full composite** (all layers visible) so the lesson survives with no JavaScript (the Hat gate); an `<ErrorBoundary>`-wrapped client island hydrates the interactivity on top. Hidden layers use `opacity:0` (never `display:none`) so nothing shifts and the building registers identically across all chapter focuses — which is also what lets a future slice attach a 3D model behind the same layers without rework. Ships **English-only**, but with in-drawing labels as an HTML overlay and all text as externally-referenced strings so the carved-out multilingual feature (049 / issue #2) needs no restructuring.

## Technical Context

**Language/Version**: TypeScript 5 (strict), React 19, Next.js 15 (App Router)
**Primary Dependencies**: Next.js (`output: 'export'`, `images.unoptimized: true`), Tailwind CSS 4 + DaisyUI; reused in-repo hooks `useReducedMotion`, `useColorblindMode`; `ErrorBoundary` component. No new runtime dependency. **No i18n library** (English-only this slice via a co-located strings module).
**Storage**: N/A — static front-end. No database, no server, no reader data (FR-009). Diagram data is a co-located TS manifest module; SVG art is static files under `public/book/hat/`.
**Testing**: Vitest + React Testing Library (unit/component), Playwright (E2E), Pa11y + jest-axe (a11y), Storybook (visual / printable spreads).
**Target Platform**: Static export → GitHub Pages; modern evergreen browsers; must degrade to no-JS and to no-WebGL (3D is a later slice).
**Project Type**: Web (single Next.js app, frontend-only; no backend).
**Performance Goals**: First-load JS ≤ 150 KB hard cap (target ≤ 100 KB); the full set of drawing SVGs ~11 KB (SC-004); Lighthouse Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 90 (Boots/Hat gates — verified by a dedicated Lighthouse task in Polish).
**Constraints**: `output: 'export'` (no server API routes, no server-resolved query params → URL state via **hash fragment**); WCAG 2.1 AA, zero Pa11y violations; 44×44 px touch targets; honor reduced-motion (OS + app setting); self-hosted Latin font + system fallback, no third-party requests.
**Scale/Scope**: One chapter shipped (Hat) + two navigable coming-soon focuses (Coat, Boots) + a book index. ~4 generated components, ~1 manifest module + strings, ~6 SVG layers, 4 routes.

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

The constitution's five Core Principles and the Mandatory Constraints (operationalized as the Hat / Coat / Boots Quality Gates) all bind here.

**Core Principles**

- **I. Design Is Intention** — ✅ The chapter states what _thriving_ looks like (a building that shades, warms, and stays dry by design); the reveal pedagogy makes the _reasoning_ legible to a 13–18 reader, not just the facts.
- **II. Be More Good, Not Just Less Bad** — ✅ Teaches what a good overhang _gives back_ (free cooling, free winter warmth, a dry wall), not merely "avoid water damage." The `LayeredDiagram` engine + `renderLayerStack` make the next chapter (Coat, Boots) cheaper to build.
- **III. Two Metabolisms** — ✅ Reader-facing text is externally-referenced strings (user-ownable/exportable/translatable, not trapped inline); dependencies stay in Docker; no lock-in (no new runtime dep). No downcycled/dead code — Coat/Boots ship as real navigable focuses, not stubs to be ripped out.
- **IV. Components as Assets** — ✅ Every generated component ships its Storybook story (printable spread), unit test, and a11y test (the 5-file pattern, CI-enforced).
- **V. Hat / Coat / Boots** — ✅ Operationalized as the gates below.

**Mandatory Constraints** — ✅ Docker-first; 5-file component pattern via the generator (category `architecture`); TDD (tests precede implementation); SpecKit workflow with the wireframe gate **already passed + signed off** (`## UI Mockup` in spec); client-side route protection N/A (public, no auth); static hosting; progressive enhancement + WCAG AA; privacy (no tracking, no data).

**Quality Gates**

- **Hat (graceful failure)** — ✅ Server Component renders all 6 layers at full opacity → no-JS/print/crawlers get the complete labeled blueprint; hidden = `opacity:0`+`pointer-events:none`+`aria-hidden`, never `display:none`; `<ErrorBoundary>` around the island; self-hosted font has a system fallback.
- **Coat (typed/tested/insulated)** — ✅ `tsc --noEmit` clean; preset `visibleLayerIds` are tsc-checked subsets of the manifest; Vitest asserts toggle/preset/custom logic and forbids `display:none`; Pa11y/jest-axe zero WCAG-AA; lint clean.
- **Boots (deployable)** — ✅ `pnpm build` static export; first-load ≤ 150 KB hard cap / ≤ 100 KB target (~11 KB SVGs); Lighthouse Perf ≥ 90 / A11y ≥ 95 / Best Practices ≥ 90 — **verified by the dedicated Lighthouse task in the Polish phase** (tasks.md), not asserted on faith; no server routes.

**Result: PASS.** No violations. Complexity Tracking is empty (nothing to justify).

## Project Structure

### Documentation (this feature)

```
features/_uncategorized/048-hats-chapter/
├── plan.md              # This file (/speckit.plan output)
├── research.md          # Phase 0 — technical decisions
├── data-model.md        # Phase 1 — entities + the Hat manifest content
├── quickstart.md        # Phase 1 — the build+verify runbook
├── contracts/
│   └── components.md     # Phase 1 — component + route + URL-hash contracts (no server API)
├── spec.md              # Signed-off spec (## UI Mockup gate passed)
├── wireframes/          # 4 signed-off wireframes (index/hat/coat/boots)
└── tasks.md             # Phase 2 output (/speckit.tasks — NOT created here)
```

### Source Code (repository root)

```
src/
├── app/
│   └── book/
│       ├── layout.tsx              # chapter chrome + prev/next nav
│       ├── page.tsx                # /book index (one building → 3 chapters)
│       ├── hat/page.tsx            # Server Component: SSR full composite + <ErrorBoundary><HatViewer/>
│       ├── coat/page.tsx           # same viewer, envelope focus, "coming soon"
│       └── boots/page.tsx          # same viewer, foundation focus, "coming soon"
├── components/
│   └── architecture/               # plop category 'architecture' → Storybook "Book/Architecture"
│       ├── LayeredDiagram/         # engine: renders the building, chapterFocus prop, owns visibility state (5 files)
│       ├── LayerToggles/           # controlled toggle rail, role=toolbar, roving focus (5 files)
│       ├── GuidedViews/            # controlled preset rail + aria-live description (5 files)
│       ├── HatViewer/              # thin wrapper: mounts hat.manifest, composes the above (5 files)
│       ├── shared/
│       │   └── renderLayerStack.tsx # pure helper used by the Server page AND the client engine
│       └── manifests/
│           ├── types.ts            # DiagramLayer / DiagramPreset / DiagramManifest / ChapterFocus
│           ├── hat.manifest.ts     # the Hat building manifest (region-tagged layers + 4 presets)
│           └── strings.ts          # English reader-facing strings (externally-referenced for 049)
└── hooks/                          # REUSED: useReducedMotion.ts, useColorblindMode.ts

public/
└── book/
    └── hat/                        # 6 language-neutral SVG layers (shared viewBox): wall, foundation,
                                    # overhang, sun-high, sun-low, rain (~11 KB total). The 7th element,
                                    # the labels overlay, is HTML text in the component (not an SVG file).

# Tests live beside components (the 5-file pattern): *.test.tsx + *.accessibility.test.tsx
tests/e2e/                          # Playwright: guided-view walkthrough, keyboard, no-JS, hash restore
```

**Structure Decision**: Single Next.js web app, frontend-only (no backend — static export, no API routes). All new UI lives under `src/components/architecture/` (the book content category) and `src/app/book/`. Diagram data is a co-located TS manifest (compile-time validated), not public JSON. SVG art is static under `public/book/hat/`. This matches the signed-off wireframes' one-building / chapter-focus structure and reuses the existing layered-SVG prototype, hooks, and ErrorBoundary.

## Complexity Tracking

_No constitution violations — this section is intentionally empty._

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --------- | ---------- | ------------------------------------ |
| —         | —          | —                                    |
