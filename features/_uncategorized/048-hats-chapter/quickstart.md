# Quickstart — 048 Hats Chapter (build + verify runbook)

**Feature:** 048 — Hat chapter (first slice of the one-building transparency-stack book)
**Branch:** `048-hats-chapter`
**Dir:** `features/_uncategorized/048-hats-chapter/`
**Stack:** Next.js 15 App Router (`output: 'export'`), React 19, TS strict, Tailwind 4 / DaisyUI, Vitest + RTL, Playwright, Pa11y.

> This is a checklist a developer follows top-to-bottom. Every command is **Docker-first** —
> the host never runs `pnpm`/`npm`/`npx` (see `CLAUDE.md` → "NEVER Install Packages Locally").
> The compose service is **`hatcoatandboots`**. The viewer is pinned to **http://localhost:3000**.

---

## What this slice builds (acceptance recap)

ONE building is drawn **once** in a shared coordinate space. A "chapter" is a **focus** on one
region (roof / **Hat**, envelope / **Coat**, foundation / **Boots**) — not a separate drawing.
Focusing a region foregrounds its layers and dims the rest **without moving anything**
(FR-001a, FR-006, SC-009). This slice authors the **Hat** (roof) teaching content; Coat and
Boots reuse the same viewer with "coming soon" copy.

Gates that must be green before commit:

| Gate      | Meaning                                                                                                            | Verified by                                   |
| --------- | ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------- |
| **Hat**   | Graceful failure: full labeled composite renders with no JS / print / crawler; `<ErrorBoundary>` around the island | Server Component SSR + Playwright no-JS check |
| **Coat**  | Typed & tested: TS strict, Vitest (+RTL), Pa11y zero WCAG-AA, lint clean                                           | `type-check` + `lint` + `test` + `test:a11y`  |
| **Boots** | Deployable: static export, first-load < 150 KB (~11 KB SVGs), Lighthouse Perf ≥ 90 / A11y ≥ 95                     | `pnpm build` + manual Lighthouse              |

---

## 0. Start the container (port pinned to 3000)

```bash
# In repo root: /home/TurtleWolfe/repos/HatCoatAndBoots
# Pin host port 3000 (compose defaults SH_PORT to 0 = random; we want a stable URL).
grep -q '^SH_PORT=' .env || echo 'SH_PORT=3000' >> .env

# Make sure GIT_* env is present for in-container commits (see step 9).
grep -q '^GIT_AUTHOR_NAME='  .env || echo 'GIT_AUTHOR_NAME=TurtleWolfe'        >> .env
grep -q '^GIT_AUTHOR_EMAIL=' .env || echo 'GIT_AUTHOR_EMAIL=jonpohlner@gmail.com' >> .env

docker compose up -d
docker compose exec hatcoatandboots pnpm install   # only if node_modules volume is cold
docker compose exec hatcoatandboots pnpm run dev    # serves http://localhost:3000
```

Confirm the service name and port any time with:

```bash
docker compose ps
docker compose port hatcoatandboots 3000   # should show 127.0.0.1:3000
```

> Permission errors? **Never `sudo`.** `docker compose down && docker compose up -d`, or
> `docker compose exec hatcoatandboots pnpm run docker:clean`.

---

## 1. Generate the 4 components (5-file pattern, category `architecture`)

The generator is interactive (`plop component`): it prompts **name → category → hasProps → withHooks**.
For each component pick category **`Architecture (book page: sustainable building forms)`** so files land in
`src/components/architecture/<Name>/` with Storybook title prefix **`Book/Architecture`**.

```bash
docker compose exec hatcoatandboots pnpm run generate:component
#   name:     LayeredDiagram     category: architecture   hasProps: y   withHooks: y
docker compose exec hatcoatandboots pnpm run generate:component
#   name:     LayerToggles       category: architecture   hasProps: y   withHooks: n
docker compose exec hatcoatandboots pnpm run generate:component
#   name:     GuidedViews        category: architecture   hasProps: y   withHooks: n
docker compose exec hatcoatandboots pnpm run generate:component
#   name:     HatViewer          category: architecture   hasProps: y   withHooks: n
```

Each call emits the **5-file** structure (CI fails if any file is missing or added manually):

```
src/components/architecture/<Name>/
├── index.tsx                       # barrel export
├── <Name>.tsx                      # component body
├── <Name>.test.tsx                 # Vitest + RTL (REQUIRED)
├── <Name>.stories.tsx              # Storybook (REQUIRED)
└── <Name>.accessibility.test.tsx   # jest-axe a11y (REQUIRED)
```

Component responsibilities (from the approved plan):

- **`LayeredDiagram`** — the engine. Renders the **whole building** in the shared viewBox, takes a
  `chapterFocus` prop (`'roof' | 'envelope' | 'foundation'`), **owns visibility state**, applies the
  focus dimming + cross-fade. `'use client'`.
- **`LayerToggles`** — controlled per-layer on/off, `role="toolbar"` with roving tabindex. `'use client'`.
- **`GuidedViews`** — controlled preset picker (everything[default] / bare wall / roof line / how it
  sheds water) + the `aria-live` explanation that updates with the view. `'use client'`.
- **`HatViewer`** — thin wrapper mounting the **Hat manifest** into `LayeredDiagram` + `GuidedViews`
  - `LayerToggles`; this is the island the Server page hydrates. `'use client'`.

---

## 2. Author the language-neutral building SVG layers → `public/book/hat/`

One building, one **shared viewBox**, drawn once. Artwork is **language-neutral** (no baked-in
text — labels are an HTML overlay, step 4) so feature 049 (multilingual) needs zero rework
(FR-001, FR-016, SC-008). Reference assets as `${detectedConfig.basePath}/book/hat/<file>.svg`
(basePath from `src/config/project-detected.ts`). Keep the whole set **~11 KB total**.

```bash
mkdir -p public/book/hat
```

Author these transparent layers (each its own file so the engine can fade them independently):

| File                | Region     | Purpose                                                     |
| ------------------- | ---------- | ----------------------------------------------------------- |
| `foundation.svg`    | foundation | the "boots" — footing/stem lifting the wall off wet ground  |
| `wall-envelope.svg` | envelope   | the shared insulated wall (the "coat"); on in every chapter |
| `roof.svg`          | roof       | the roof plane                                              |
| `overhang.svg`      | roof       | the "hat" — eave/overhang that does the shading             |
| `sun-high.svg`      | roof       | summer high sun → **blocked** by the overhang               |
| `sun-low.svg`       | roof       | winter low sun → **admitted** under the overhang            |
| `rain.svg`          | roof       | water **shed** clear of the wall by the overhang            |

Rules:

- Every file uses the **same `viewBox`** (declare it once in the manifest, step 3). No per-file
  translation — focus changes opacity, never coordinates (SC-009).
- Transparent backgrounds, no embedded `<text>` that a reader must read (atmosphere arrows/dashes ok).
- Model the stacked-layer technique on the working prototype
  `src/components/atomic/SpinningLogo/LayeredHatCoatAndBootsLogo.tsx` (absolute-positioned
  transparent layers, basePath-aware) — **but render with plain `<img>`**, not `next/image`
  (next/image gives no benefit under `images.unoptimized` export and only adds weight).

Verify size budget:

```bash
du -bc public/book/hat/*.svg | tail -1   # target ≈ 11000 bytes total
```

---

## 3. Manifest + strings + `renderLayerStack` helper

All data is a **co-located TS module** (NOT public JSON) so `tsc` validates the preset allowlist at
compile time.

```bash
mkdir -p src/components/architecture/manifests
```

Author:

**`src/components/architecture/manifests/types.ts`**

```ts
export type Region = 'roof' | 'envelope' | 'foundation';

export interface DiagramLayer {
  id: string;
  src: string; // relative to basePath, e.g. 'book/hat/overhang.svg'
  label: string; // HTML-overlay label (string, not baked into SVG)
  alt: string; // empty when decorative
  decorative: boolean;
  region: Region;
  z: number; // stacking order
  defaultVisible: boolean;
  atmosphereOpacity?: number; // optional dim level for sun/rain hints
}

export interface DiagramPreset {
  id: string;
  label: string;
  description: string; // the aria-live teaching text for this view
  visibleLayerIds: string[]; // MUST reference real layer ids (tsc-checked)
}

export interface DiagramManifest {
  id: string;
  viewBox: string; // shared coordinate space — declared once
  layers: DiagramLayer[];
  presets: DiagramPreset[];
  defaultPresetId: string;
}
```

**`src/components/architecture/manifests/hat.manifest.ts`** — one `DiagramManifest` describing the
whole building (all 7 layers above, region-tagged) and the Hat presets:

- `everything` (default) — every layer visible; this is the **no-JS composite**.
- `bare-wall` — wall-envelope + foundation only.
- `roof-line` — adds roof + overhang.
- `how-it-sheds-water` — roof + overhang + rain (+ sun-high blocked / sun-low admitted).

Each preset's `description` carries the summer-sun-blocked / winter-sun-admitted / rain-shed teaching.

**`src/components/architecture/manifests/strings.ts`** — every reader-facing string (titles, view
labels, descriptions, chapter nav, "coming soon" copy) as discrete exported keys. **No literal user
text in JSX** — components import from here so 049 swaps a locale module with no component edits.

**`src/components/architecture/manifests/renderLayerStack.tsx`** — a **hookless** pure function
`renderLayerStack(layers, visible)` returning the stacked `<img>` elements. Hidden layers get
`opacity: 0; pointer-events: none; aria-hidden="true"` — **never `display:none`** (FR-008/SC-002).
This same helper is used by BOTH the Server page (all layers visible → full composite) and the
client engine (visibility driven by state).

---

## 4. Implement the component bodies

- **`LayeredDiagram`** holds the state (active preset id + per-layer overrides + `chapterFocus`).
  Region not in focus is dimmed via reduced opacity on the non-focused regions.
  Visibility/opacity transitions use a **`opacity 0.3s` cross-fade**, gated on
  `useReducedMotion()` (`src/hooks/useReducedMotion.ts`) — when reduced motion is set, switch
  instantly (no transition). Calls `renderLayerStack` for the actual DOM.
- **`LayerToggles`** — controlled checkboxes/buttons, `role="toolbar"`, **roving tabindex**
  (one tab stop, arrow keys move focus), each control ≥ **44px** (`min-h-11 min-w-11`).
- **`GuidedViews`** — controlled preset list; selecting a preset updates `LayeredDiagram` and writes
  the preset's `description` into an `aria-live="polite"` region so the explanation is announced.
- **`HatViewer`** — wires the three together from `hat.manifest.ts`, owns the **hash-fragment**
  read/restore on mount (step 5).
- Reuse `useColorblindMode()` (`src/hooks/useColorblindMode.ts`) if layer cues need a colorblind-safe
  palette.

---

## 5. Routing — `src/app/book/`

```bash
mkdir -p src/app/book/hat src/app/book/coat src/app/book/boots
```

| File                          | Role                                                                                                                                                                                                                                    |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/book/layout.tsx`     | chapter nav (prev/next across Hat/Coat/Boots), shared chrome                                                                                                                                                                            |
| `src/app/book/page.tsx`       | index — one building → 3 chapter links                                                                                                                                                                                                  |
| `src/app/book/hat/page.tsx`   | **Server Component**: SSR the **full composite** (all layers visible via `renderLayerStack`) so no-JS/print/crawlers get the complete labeled blueprint, then `<ErrorBoundary><HatViewer /></ErrorBoundary>` hydrates the island on top |
| `src/app/book/coat/page.tsx`  | same viewer, `chapterFocus="envelope"`, "coming soon" content                                                                                                                                                                           |
| `src/app/book/boots/page.tsx` | same viewer, `chapterFocus="foundation"`, "coming soon" content                                                                                                                                                                         |

Use the existing boundary at `src/components/ErrorBoundary.tsx`.

**URL-reflected state (FR-007a/b) via hash fragment** — static export → GitHub Pages can't resolve
query params server-side, so encode active view + focus in the hash, e.g.
`/book/hat#view=roof-line`. In `HatViewer`'s mount effect:

1. read `window.location.hash`, parse `view=` (and focus if present);
2. **unknown view → fall back to `everything`**;
3. on preset change, `history.replaceState` the new hash (no scroll jump).

All four routes must be real static-export pages (they appear in `out/` after `pnpm build`).

---

## 6. Self-host the Latin display font (+ system fallback)

Add the display font under `public/fonts/` (or `src/app/fonts/` via `next/font/local`) and define a
`font-family` stack ending in a system fallback (`ui-sans-serif, system-ui, …`). **No CDN/Google
fetch** — self-hosted keeps first load tight and works offline (PWA) and on GitHub Pages.

---

## 7. Tests + Storybook stories

Fill in the generated `.test.tsx` / `.accessibility.test.tsx` and author these stories (in each
component's `.stories.tsx`, title prefix `Book/Architecture`):

- **`EverythingOn`** — the no-JS composite spread (all layers visible). This is the printable blueprint.
- **`RoofLine`** — `roof-line` preset.
- **`HowItShedsWater`** — `how-it-sheds-water` preset (sun-high blocked, sun-low admitted, rain shed).
- **`BareWall`** — `bare-wall` preset.
- **`Interactive`** — full `HatViewer` with toggles + guided views live.

Key assertions to cover:

- hidden layers are `opacity:0` + `aria-hidden`, **not** `display:none`;
- changing a guided view updates the `aria-live` description text;
- toggles are keyboard reachable (roving focus) and ≥ 44px;
- unknown hash `view` resolves to `everything`;
- with reduced motion, no opacity transition is applied.

---

## 8. Verify every gate (exact commands)

Run the Coat gate (typed & tested) and the Hat/Boots checks:

```bash
docker compose exec hatcoatandboots pnpm run type-check \
  && docker compose exec hatcoatandboots pnpm run lint \
  && docker compose exec hatcoatandboots pnpm test \
  && docker compose exec hatcoatandboots pnpm run test:a11y \
  && docker compose exec hatcoatandboots pnpm exec playwright test
```

> Note: `test:a11y` runs Pa11y at **WCAG2AAA**; color-contrast is delegated to
> `tests/e2e/color-contrast.spec.ts` (runs under Playwright above). Add the four new routes
> (`/book`, `/book/hat`, `/book/coat`, `/book/boots`) to `config/pa11yci.json` `urls`.

Boots gate — static export + first-load budget:

```bash
docker compose exec hatcoatandboots pnpm build      # emits static `out/`
# Inspect first-load JS for the book routes in the build summary (must be < 150 KB).
du -bc public/book/hat/*.svg | tail -1              # SVGs ≈ 11 KB
docker compose exec hatcoatandboots pnpm exec playwright show-report  # if any e2e failed
```

**Manual verification** (viewer at http://localhost:3000):

1. Visit **`/book/hat`** — full labeled building renders.
2. **Step the guided views** (everything → bare wall → roof line → how it sheds water); the
   explanation text updates and only opacity changes — **nothing moves** (SC-009).
3. Confirm the **URL hash updates** as you switch views, and **restores** on reload
   (e.g. reload `/book/hat#view=roof-line` lands on that view); a bogus `#view=xyz` falls back to
   `everything`.
4. **Disable JavaScript** (DevTools → Settings → Debugger → Disable JS, or print preview) → the
   **full composite** (all layers + labels) still shows. Re-enable → island hydrates.
5. **Keyboard nav**: tab to the toggles toolbar, arrow through the controls, activate with
   Enter/Space; confirm every target is ≥ **44px**.
6. **Reduced motion**: OS "reduce motion" on → view switches are instant (no cross-fade).
7. Visit **`/book/coat`** and **`/book/boots`** — same building, region foregrounded, "coming soon".

(Optional) Lighthouse on `/book/hat`: Performance ≥ 90, Accessibility ≥ 95.

---

## 9. Commit from inside the container (never `--no-verify`)

Git hooks (husky + lint-staged + gitleaks) must run — they catch secrets and lint failures.
Commit **from the container** so hooks resolve correctly; **push from the host** (SSH keys live there).

```bash
docker compose exec hatcoatandboots git add -A
docker compose exec hatcoatandboots git commit -m "feat(book): 048 Hat chapter — one-building layered diagram + roof teaching content

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"

# If a hook fails: read the file + line it names, FIX the underlying issue, re-stage, recommit.
# NEVER `git commit --no-verify` (forbidden unless the user explicitly asks — see CLAUDE.md).

git push   # from the host
```

---

## Done when

- All 5 commands in step 8 pass; `pnpm build` produces `out/book/{,hat,coat,boots}/` with first-load < 150 KB.
- No-JS composite renders the full labeled blueprint; interactive island hydrates with `<ErrorBoundary>`.
- Guided views update the `aria-live` description, write/restore the URL hash, and respect reduced motion.
- English-only this slice; all reader text lives in `strings.ts`; SVG artwork is language-neutral (049-ready).
