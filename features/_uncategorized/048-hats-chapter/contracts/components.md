# Phase 1 Contracts — Component & Route (048 Hats Chapter)

**Feature:** 048 Hats Chapter
**Branch:** `048-hats-chapter`
**Spec:** [`../spec.md`](../spec.md)
**Plan:** [`../plan.md`](../plan.md)
**Constitution:** [`.specify/memory/constitution.md`](../../../../.specify/memory/constitution.md) v1.0.0 (Principle V — Hats/Coats/Boots = Quality Gate)

---

## 0. There are NO server API endpoints

This is a **static front-end feature**. The app builds with Next.js 15 App Router under `output: 'export'` (`images.unoptimized: true`), deployed to GitHub Pages. Under `output: 'export'`:

- `src/app/api/**` route handlers are **not emitted** and do not run in production — there is no server at runtime.
- No request can be server-resolved at view time, so **query strings cannot be read on the server** (the page is a pre-rendered static file). This is the architectural reason the URL-reflected state (FR-007a/FR-007b) is carried in a **hash fragment**, not a query string — see §6.
- No secrets, no `NEXT_PUBLIC`-less env access in the browser (per CLAUDE.md "Static Hosting Constraint").

Therefore the contracts in this document are **Component contracts** (§1–§5) and **Route contracts** (§6), plus the **URL hash "API"** (§6.1). There is no `openapi.yaml`, no endpoint table, no request/response schema — by design.

The only data layer is a **co-located TypeScript manifest module** (not `public/*.json`), so the preset → layer-id allowlist is validated at `tsc` time, not at runtime. See `../data-model.md` for the `DiagramLayer` / `DiagramPreset` / `DiagramManifest` shapes; this file references those types.

---

## 1. `renderLayerStack(layers, visible)` — shared pure helper

| Field          | Value                                                                                          |
| -------------- | ---------------------------------------------------------------------------------------------- |
| Kind           | Pure function (NOT a component, NOT a hook)                                                    |
| Location       | `src/components/architecture/shared/renderLayerStack.tsx`                                      |
| `'use client'` | No — must be importable by **both** the Server Component page (Hat gate) and the client engine |
| Plop category  | n/a (helper colocated under the `architecture` component dir)                                  |

### Signature

```ts
import { detectedConfig } from '@/config/project-detected';
import type { DiagramLayer } from './hat.manifest';

/**
 * Renders the full layer stack as absolutely-positioned, transparent,
 * registered <img> elements in z-order. Pure: identical (layers, visible)
 * input always yields identical output. No hooks, no state, no effects.
 *
 * @param layers  region-tagged layers from the manifest, in source order
 * @param visible Set/array of layer ids currently shown; a layer NOT in
 *                `visible` is rendered with opacity:0 + pointer-events:none
 *                + aria-hidden — NEVER display:none (FR-006, SC-002).
 */
export function renderLayerStack(
  layers: readonly DiagramLayer[],
  visible: ReadonlySet<string>
): React.ReactNode;
```

### Behavioral contract — guarantees

- **G-RLS-1 (no geometry shift):** every layer is rendered for every call regardless of visibility; hidden layers are kept in the DOM at their exact coordinates via `opacity: 0; pointer-events: none;` + `aria-hidden="true"`. **Never `display:none`**, never unmounted. (FR-006, SC-009, SC-002.)
- **G-RLS-2 (one coordinate space):** all layers stack in the manifest `viewBox` space with absolute positioning so each element registers in a fixed position relative to the others (FR-001a). Mirrors the proven prototype `src/components/atomic/SpinningLogo/LayeredHatCoatAndBootsLogo.tsx` (absolute, transparent, drop-shadow), **but uses plain `<img>` not `next/image`** (no benefit under unoptimized export; less weight).
- **G-RLS-3 (basePath-aware):** every layer `src` is emitted as `` `${detectedConfig.basePath}${layer.src}` `` so it resolves on GitHub Pages under a non-root basePath.
- **G-RLS-4 (a11y of art):** decorative layers (`decorative: true`) render `alt=""` / `role="presentation"`; meaningful layers render `alt={layer.alt}`. In-drawing **label text is HTML overlaid on the SVG**, never baked into the artwork (FR-001, FR-016).
- **G-RLS-5 (purity):** no `useState`/`useEffect`/`useRef`/context; same inputs → same React tree. This is what lets the Server page and the client engine share one renderer.

---

## 2. `LayeredDiagram` — the engine

| Field         | Value                                                                                                              |
| ------------- | ------------------------------------------------------------------------------------------------------------------ |
| Plop category | `architecture` (`src/components/architecture/LayeredDiagram/`, Storybook title `Book/Architecture/LayeredDiagram`) |
| Client/Server | **Client** (`'use client'`) — owns interactive visibility state                                                    |
| Generated by  | `docker compose exec hatcoatandboots pnpm run generate:component` (5-file pattern)                                 |

### Props

```ts
import type { DiagramManifest } from './hat.manifest';

export interface LayeredDiagramProps {
  /** The ONE building manifest, region-tagged. Same building for every chapter. */
  manifest: DiagramManifest;
  /** Which region is foregrounded; the others are dimmed (NOT moved). */
  chapterFocus: 'roof' | 'envelope' | 'foundation';
  /** Optional starting preset id; must exist in manifest.presets.
   *  Defaults to manifest.defaultPresetId ('everything'). */
  initialPresetId?: string;
  /** Optional className for layout composition. */
  className?: string;
}
```

### State owned

- `visibleIds: Set<string>` — the layer ids currently shown (the "custom" state once a reader toggles individual layers).
- `activePresetId: string` — the active guided view id (one of `manifest.presets`, or a sentinel `'custom'` after a manual toggle diverges from a preset).

> Owns these two pieces of state and nothing else. `chapterFocus` is a **prop, not state** — focus is driven by the route (§6), not by the engine.

### Behavioral contract — guarantees

- **G-LD-1 (no geometry shift on toggle):** toggling any layer or switching any preset changes only `visibleIds` → opacity, never layout. Calls `renderLayerStack(manifest.layers, visibleIds)`; the full set of layers is always mounted (FR-006, SC-009).
- **G-LD-2 (focus = foreground+dim, never move):** `chapterFocus` foregrounds its region's layers and **may dim** the other regions (e.g. via `atmosphereOpacity` / reduced opacity on out-of-focus regions). Changing `chapterFocus` from `roof`→`envelope`→`foundation` moves **zero** elements (SC-009, FR-007b).
- **G-LD-3 (preset application):** selecting a preset sets `visibleIds = new Set(preset.visibleLayerIds)` and `activePresetId = preset.id`. A manual single-layer toggle afterward sets `activePresetId = 'custom'` (the custom state is intentionally NOT URL-encoded — FR-007a).
- **G-LD-4 (default-on resilience):** `initialPresetId` that is missing/unknown resolves to `manifest.defaultPresetId`. The engine never renders an empty stack.
- **G-LD-5 (reduced motion / colorblind):** consumes `src/hooks/useReducedMotion.ts` and `src/hooks/useColorblindMode.ts`; any opacity transition is disabled when reduced motion is requested. No dependency on motion for correctness.
- **G-LD-6 (composition):** renders `LayerToggles` (§3) and `GuidedViews`/`ChapterPresets` (§4) as **controlled** children, passing `visibleIds` / `activePresetId` down and `onToggle` / `onSelect` handlers up. The diagram surface and controls share one `aria` description region.

---

## 3. `LayerToggles` — controlled per-layer toggles

| Field         | Value                                                                                          |
| ------------- | ---------------------------------------------------------------------------------------------- |
| Plop category | `architecture` (`src/components/architecture/LayerToggles/`, `Book/Architecture/LayerToggles`) |
| Client/Server | **Client** (`'use client'`)                                                                    |
| Control model | **Fully controlled** — owns no visibility state; emits intent via `onToggle`                   |

### Props

```ts
import type { DiagramLayer } from '../LayeredDiagram/hat.manifest';

export interface LayerTogglesProps {
  /** Toggleable layers (non-decorative), in display order. */
  layers: readonly DiagramLayer[];
  /** Currently-visible layer ids (the controlled value). */
  visibleIds: ReadonlySet<string>;
  /** Intent to flip one layer's visibility. */
  onToggle: (layerId: string) => void;
  className?: string;
}
```

### State owned

**None.** Controlled component; visibility state lives in `LayeredDiagram` (§2).

### Behavioral contract — guarantees

- **G-LT-1 (toolbar semantics):** root is `role="toolbar"` with an accessible name (e.g. `aria-label="Show or hide building parts"`).
- **G-LT-2 (roving tabindex):** exactly one toggle is in the tab order (`tabindex="0"`), the rest `tabindex="-1"`; Arrow keys move focus between toggles, Home/End jump to first/last (WAI-ARIA toolbar pattern).
- **G-LT-3 (pressed state):** each toggle is a `<button>` with `aria-pressed={visibleIds.has(layer.id)}`; pressing fires `onToggle(layer.id)` and never mutates state locally.
- **G-LT-4 (touch target):** every toggle is ≥44×44 px (`min-h-11 min-w-11`, per CLAUDE.md mobile-first rule).
- **G-LT-5 (externalized labels):** visible label and `aria-label` come from the co-located strings module, never hard-coded inline (FR-016, SC-008).

---

## 4. `GuidedViews` / `ChapterPresets` — controlled preset selector

| Field         | Value                                                                                        |
| ------------- | -------------------------------------------------------------------------------------------- |
| Plop category | `architecture` (`src/components/architecture/GuidedViews/`, `Book/Architecture/GuidedViews`) |
| Client/Server | **Client** (`'use client'`)                                                                  |
| Control model | **Fully controlled** — owns no state; emits `onSelect`                                       |

> Single component; "GuidedViews" is the reader-facing name, "ChapterPresets" the data name. The presets are: `everything` (default), `bare-wall`, `roof-line`, `how-it-sheds-water` (the Hat chapter's guided views from the signed-off UI Mockup).

### Props

```ts
import type { DiagramPreset } from '../LayeredDiagram/hat.manifest';

export interface GuidedViewsProps {
  /** The chapter's presets (guided views), in display order. */
  presets: readonly DiagramPreset[];
  /** Active preset id (controlled). May be 'custom' when reader diverged. */
  activePresetId: string;
  /** Intent to switch guided view. */
  onSelect: (presetId: string) => void;
  className?: string;
}
```

### State owned

**None.** Controlled. The active view lives in `LayeredDiagram` and is mirrored to the URL hash (§6) by the page island.

### Behavioral contract — guarantees

- **G-GV-1 (aria-live explanation):** renders the active preset's `description` (the explanation that updates with the view) inside an `aria-live="polite"` region. Changing the view announces the new explanation to screen readers (summer-sun-blocked / winter-sun-admitted / rain-shed teaching).
- **G-GV-2 (single-select semantics):** the preset list is a single-select group (`role="radiogroup"` + `role="radio"` with `aria-checked`, OR a `<select>`); exactly one preset is active. Selecting fires `onSelect(presetId)`.
- **G-GV-3 (allowlisted ids only):** `presets` come from the typed manifest; `onSelect` can only ever be called with an id present in `presets` (no free-form input). The preset→layer allowlist is validated at `tsc` time in the manifest module.
- **G-GV-4 (externalized strings):** every view name and description is a discrete string from the co-located strings module (FR-016, SC-008).
- **G-GV-5 (touch target):** each selectable control ≥44×44 px.

---

## 5. `HatViewer` — thin Hat-chapter wrapper

| Field         | Value                                                                                                    |
| ------------- | -------------------------------------------------------------------------------------------------------- |
| Plop category | `architecture` (`src/components/architecture/HatViewer/`, `Book/Architecture/HatViewer`)                 |
| Client/Server | **Client** (`'use client'`) — it is the **interactive island** that hydrates on top of the SSR composite |
| Generated by  | `pnpm run generate:component`                                                                            |

### Props

```ts
export interface HatViewerProps {
  /** Optional initial guided-view id, hydrated from the URL hash by the page. */
  initialViewId?: string;
  className?: string;
}
```

### State owned

Holds the URL-hash sync glue (reads `#view=` / `#focus=` on mount, writes hash on view change). Visibility/preset state is delegated downward to `LayeredDiagram`.

### Behavioral contract — guarantees

- **G-HV-1 (thin mount):** imports the **Hat manifest** (`hat.manifest.ts`) and renders `<LayeredDiagram manifest={hatManifest} chapterFocus="roof" initialPresetId={...} />` plus its controls. No teaching content is hard-coded here — it all comes from the manifest + strings module.
- **G-HV-2 (hash restore on load):** on mount, reads the hash fragment (§6.1), resolves `view`→`initialPresetId` (unknown ⇒ `'everything'`) and `focus`→`chapterFocus` (unknown ⇒ `'roof'` for the Hat route), and applies it client-side. This is the static-export-safe substitute for server query resolution.
- **G-HV-3 (hash write on change):** when the active view changes, updates the hash (`history.replaceState`, no full navigation) so the address identifies the active view and is reload/shareable (FR-007a).
- **G-HV-4 (graceful island):** the page wraps `HatViewer` in `<ErrorBoundary level="section">` (`src/components/ErrorBoundary.tsx`); if hydration throws, the reader still sees the SSR'd full composite (the Hat gate, §6.2) and the boundary's section fallback (Principle V "hat = graceful failure").

---

## 6. Route contracts

All routes are **real static-export pages** (pre-rendered HTML files). One building, drawn once; a "chapter" is a focus, not a separate drawing.

### Shared layout — `src/app/book/layout.tsx`

- **Server Component.** Renders the chapter nav (prev/next across Hat → Coat → Boots) and shared chrome. No client state.

### 6.0 `/book` — index — `src/app/book/page.tsx`

| Aspect      | Contract                                                                                                                                                                                                                                       |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Path        | `/book`                                                                                                                                                                                                                                        |
| Split       | **Server Component**, fully static.                                                                                                                                                                                                            |
| SSR renders | The book index: ONE building presented with links into its three chapter focuses (`/book/hat`, `/book/coat`, `/book/boots`). May render a static composite via `renderLayerStack(manifest.layers, allVisible)` for a complete labeled preview. |
| Hash state  | None required.                                                                                                                                                                                                                                 |
| No-JS       | Fully usable: all three chapter links are real `<a href>`.                                                                                                                                                                                     |

### 6.1 `/book/hat` — roof focus, full content — `src/app/book/hat/page.tsx`

| Aspect                  | Contract                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Path                    | `/book/hat`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Split                   | **Server Component shell + client island.**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| SSR renders             | **The full composite (Hat gate, FR-008/SC-002):** the page Server Component calls `renderLayerStack(hatManifest.layers, new Set(allLayerIds))` so **every** layer is visible — the complete labeled blueprint — in the static HTML. Then it mounts `<ErrorBoundary level="section"><HatViewer initialViewId={...} /></ErrorBoundary>` as the interactive island that hydrates **on top of** the same SSR'd stack. Hidden-on-hydration layers use `opacity:0 + pointer-events:none + aria-hidden`, **never `display:none`** (G-RLS-1). |
| Chapter focus           | `roof` (foregrounds roof region, dims envelope + foundation; SC-009 — nothing moves).                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Hash state              | Reads/writes `#view=` and `#focus=` per §6.1-API below.                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| No-JS / print / crawler | The complete labeled drawing **and** all explanatory text are fully visible and readable with scripts disabled (SC-002 = 100%). Interactivity is purely additive (FR-008).                                                                                                                                                                                                                                                                                                                                                            |

### 6.2 `/book/coat` — `src/app/book/coat/page.tsx` & 6.3 `/book/boots` — `src/app/book/boots/page.tsx`

| Aspect      | Contract                                                                                                                                                                                                                              |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Path        | `/book/coat`, `/book/boots`                                                                                                                                                                                                           |
| Split       | **Server Component**; mounts the **same** `LayeredDiagram`/viewer with `chapterFocus="envelope"` (coat) or `chapterFocus="foundation"` (boots).                                                                                       |
| SSR renders | The same ONE building, full composite, with the respective region foregrounded and the others dimmed (SC-009 — identical coordinates to `/book/hat`, nothing moves between routes). Teaching content is **"coming soon"** this slice. |
| Hash state  | Same hash contract as Hat; `focus` defaults to `envelope` / `foundation` respectively.                                                                                                                                                |
| No-JS       | Building + "coming soon" copy fully visible without scripts.                                                                                                                                                                          |

---

### 6.1-API — URL hash fragment contract (the static-export "API")

Because `output: 'export'` cannot server-resolve query params on GitHub Pages, view/focus state lives in the **hash fragment** and is restored **client-side** on load (FR-007a/FR-007b).

**Format:** `#key=value&key=value` (ampersand-delimited; e.g. `/book/hat#view=roof-line&focus=roof`).

| Param   | Meaning                        | Accepted values                                                                                                | Fallback on missing/unknown                                                                                             |
| ------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `view`  | active guided view (preset id) | `everything`, `bare-wall`, `roof-line`, `how-it-sheds-water` (i.e. any `id` in the route's `manifest.presets`) | **`everything`** (= `manifest.defaultPresetId`) — FR-007a                                                               |
| `focus` | foregrounded chapter region    | `roof`, `envelope`, `foundation`                                                                               | the route's own default (`roof` for `/book/hat`, `envelope` for `/book/coat`, `foundation` for `/book/boots`) — FR-007b |

**Contract rules:**

- **H-1 (restore on load):** on mount the island parses the hash, validates each param against the allowlist above, applies valid values, and silently substitutes the fallback for anything missing or unrecognized. Never errors on bad input.
- **H-2 (reflect on change):** changing the guided view writes `#view=<id>` via `history.replaceState` (no navigation, no scroll jump). Opening/reloading that address restores the same view (FR-007a).
- **H-3 (custom NOT encoded):** manual per-layer toggles (the `'custom'` state) are intentionally **not** written to the hash this slice (FR-007a). Only the guided `view` and `focus` are URL-reflected.
- **H-4 (language NOT in scope):** no `lang`/locale hash param this slice — owned by carved-out feature 049 / issue #2 (FR-016). The in-drawing labels are HTML-over-SVG strings so 049 adds translation with zero rework.

---

## 7. Test contracts — which spec asserts which guarantee

Files follow the 5-file component pattern (`*.test.tsx` unit + `*.accessibility.test.tsx` a11y) generated by `pnpm run generate:component`, plus a Playwright e2e spec. Each row binds a test to the guarantee it must prove.

### Unit / RTL (`*.test.tsx`) — Vitest

| Test file                                                                      | Asserts                                                                                                                                                                                                                                                                                                  |
| ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/components/architecture/shared/renderLayerStack.test.tsx`                 | G-RLS-1 hidden layers stay in DOM with `opacity:0`+`pointer-events:none`+`aria-hidden` and **no `display:none`**; G-RLS-3 every `src` is `basePath`-prefixed; G-RLS-5 purity (same input → same tree); G-RLS-4 decorative ⇒ `alt=""`/`role=presentation`.                                                |
| `src/components/architecture/LayeredDiagram/LayeredDiagram.test.tsx`           | G-LD-1 toggling/preset switch changes only `visibleIds` (every layer still mounted); G-LD-3 preset → `visibleIds = preset.visibleLayerIds`, manual toggle ⇒ `activePresetId='custom'`; G-LD-4 unknown `initialPresetId` ⇒ default; G-LD-2 changing `chapterFocus` mounts the same elements (no unmount). |
| `src/components/architecture/LayerToggles/LayerToggles.test.tsx`               | G-LT-3 `aria-pressed` mirrors `visibleIds`, click fires `onToggle` once, **no local state mutation** (controlled); G-LT-5 labels sourced from strings module.                                                                                                                                            |
| `src/components/architecture/GuidedViews/GuidedViews.test.tsx`                 | G-GV-1 active `description` rendered in `aria-live="polite"`; G-GV-2 single-select, `onSelect` fires with allowlisted id only; G-GV-4 names/descriptions from strings module.                                                                                                                            |
| `src/components/architecture/HatViewer/HatViewer.test.tsx`                     | G-HV-1 mounts `LayeredDiagram` with `chapterFocus="roof"` + Hat manifest; G-HV-2 hash `#view=roof-line` ⇒ starts on `roof-line`, unknown view ⇒ `everything`; G-HV-3 changing view calls `history.replaceState` with `#view=...`; G-HV-4 throwing child is caught by ErrorBoundary section fallback.     |
| `src/components/architecture/LayeredDiagram/hat.manifest.test.tsx` (type+data) | Every `preset.visibleLayerIds` references a real `layer.id` (allowlist holds at runtime, mirroring the `tsc`-time guarantee); `defaultPresetId === 'everything'`; all `view`/`focus` enums match §6.1-API.                                                                                               |

### Accessibility (`*.accessibility.test.tsx`) — jest-axe / Pa11y, zero WCAG-AA

| Test file                               | Asserts                                                                                                                                              |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `LayerToggles.accessibility.test.tsx`   | G-LT-1 `role="toolbar"` + name; G-LT-2 roving tabindex (one `tabindex=0`, Arrow/Home/End move focus); G-LT-4 ≥44×44 px targets; zero axe violations. |
| `GuidedViews.accessibility.test.tsx`    | G-GV-1 `aria-live` region present and updates; G-GV-2 radiogroup/`aria-checked` correctness; G-GV-5 ≥44 px; zero axe violations.                     |
| `LayeredDiagram.accessibility.test.tsx` | G-RLS-4 meaningful vs decorative `alt`; hidden layers `aria-hidden`; zero axe violations on full + focused states.                                   |
| `HatViewer.accessibility.test.tsx`      | Island + SSR composite together: zero axe violations; the aria-live explanation is discoverable.                                                     |

### E2E (`tests/e2e/book/hat-chapter.spec.ts`) — Playwright (chromium + firefox + webkit)

| Scenario                       | Asserts                                                                                                                                                                                        |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| No-JS Hat gate                 | With JavaScript disabled, `/book/hat` shows the complete labeled drawing **and** all explanatory text (SC-002 = 100%, FR-008).                                                                 |
| No-geometry-shift on toggle    | Capture a layer element's bounding box; toggle another layer; the captured box is byte-identical (FR-006, SC-009). Hidden element asserted `opacity:0` + present in DOM, never `display:none`. |
| No-geometry-shift across focus | Navigate `/book/hat` → `/book/coat` → `/book/boots`; a shared building element (e.g. wall) keeps identical coordinates across all three routes (SC-009).                                       |
| Hash restore                   | Open `/book/hat#view=roof-line` ⇒ starts on the "roof line" view; reload preserves it (FR-007a, H-1/H-2). Open `/book/hat#view=bogus` ⇒ falls back to `everything` (H-1).                      |
| Hash write                     | Selecting a guided view updates the address to `#view=<id>` without a full navigation (H-2).                                                                                                   |
| aria-live announce             | Switching guided views updates the `aria-live` explanation text (G-GV-1).                                                                                                                      |

> WebKit note (CLAUDE.md "CI & E2E Stability"): if any e2e step sets a scroll/`scrollTop` and expects a scroll-driven UI effect, dispatch the `scroll` event explicitly — WebKit does not auto-fire it.

---

## 8. Quality-gate mapping (Constitution Principle V — Hats/Coats/Boots)

| Gate                       | Means                                                                                                 | Where proven in this contract                                     |
| -------------------------- | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| **Hat** (graceful failure) | No-JS/print/crawler see the full composite; ErrorBoundary catches a broken island                     | §6.1 SSR composite, G-HV-4, E2E "No-JS Hat gate"                  |
| **Coat** (typed & tested)  | TS strict, manifest allowlist validated at `tsc`, Vitest+RTL, Pa11y/jest-axe zero WCAG-AA, lint clean | §1–§5 typed props, §7 unit + a11y rows                            |
| **Boots** (deployable)     | Static export, first-load <150 KB (~11 KB SVGs), Lighthouse Perf ≥90 / A11y ≥95                       | plain `<img>` over `next/image` (G-RLS-2), all routes static (§6) |
