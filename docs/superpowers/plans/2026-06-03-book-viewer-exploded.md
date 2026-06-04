# Book Viewer — Exploded-Layer Scroll-Story Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the interactive book viewer where a large building, exploded into its real SVG layers over a full-bleed sky, reassembles as the reader scrolls through a chapter's ideas — and a child can tap any layer to pop it out or snap it home.

**Architecture:** Pure typed manifests per chapter (data) → headless hooks that own story position + layer state (engine) → dumb presentational components driven by that state (presentation). Content is fully separated from mechanism. Hat chapter is built end-to-end first to validate; Coat/Boots then follow as data only.

**Tech Stack:** Next.js 15 App Router (`output:'export'`), React 19, TypeScript strict, Tailwind 4 + DaisyUI, Vitest + React Testing Library, Playwright (E2E), Pa11y (a11y). SVG layers are plain `<img>` resolved via `detectedConfig.basePath` (never `next/image`).

**Design source:** `docs/superpowers/specs/2026-06-03-book-viewer-exploded-design.md`

**Branch:** `rebuild` (ScriptHammer base `5a32da9` + rebuild commit `a0126bf`).

**Container/commit conventions (CRITICAL — this repo):**

- Run all pnpm in the container: `docker exec -w /app hatcoatandboots-hatcoatandboots-1 pnpm <cmd>`
- Commit in the container with identity:
  ```bash
  docker exec -e GIT_AUTHOR_NAME="TurtleWolfe" -e GIT_AUTHOR_EMAIL="jonpohlner@gmail.com" \
    -e GIT_COMMITTER_NAME="TurtleWolfe" -e GIT_COMMITTER_EMAIL="jonpohlner@gmail.com" \
    -w /app hatcoatandboots-hatcoatandboots-1 git commit -m "..."
  ```
- Test command: `pnpm test` (Vitest), `pnpm run type-check` (tsc), `pnpm lint`, `pnpm test:e2e`, `pnpm test:a11y`.

---

## File Structure (decomposition)

**Data (per-chapter, pure — the only files edited to change content):**

- `src/components/organisms/BookViewer/manifests/types.ts` — `Layer`, `Step`, `ChapterManifest`, `LayerId`.
- `src/components/organisms/BookViewer/manifests/hat.manifest.ts` — Hat chapter data.
- `src/components/organisms/BookViewer/manifests/coat.manifest.ts` — Coat chapter data.
- `src/components/organisms/BookViewer/manifests/boots.manifest.ts` — Boots chapter data.
- `src/components/organisms/BookViewer/manifests/index.ts` — `getChapter(slug)` lookup.

**Engine (headless hooks, no markup):**

- `src/components/organisms/BookViewer/useScrollStory.ts` — owns `activeStepIndex`; IntersectionObserver + `goNext/goPrev/goTo`.
- `src/components/organisms/BookViewer/useLayerState.ts` — reducer: docked/exploded per layer, `mode: 'story'|'reader'`.

**Presentation (driven by state):**

- `src/components/organisms/ExplodedBuilding/` (5-file) — renders sky + the layer slabs (docked/exploded), tabs, ghost house.
- `src/components/molecular/StoryRibbon/` (5-file) — prose + Back/Next + 7-dot legend.
- `src/components/atomic/PartTooltip/` (5-file) — touch-aware, AAA, single-instance tooltip.
- `src/components/organisms/BookViewer/` (5-file) — `ChapterViewer` wiring hooks to pieces.

**Route:**

- `src/app/book/[chapter]/page.tsx` — loads manifest, renders `ChapterViewer`, `generateStaticParams`.
- `src/app/book/page.tsx` — book index (links to chapters).

**E2E:**

- `tests/e2e/book-viewer.spec.ts` — scroll reassembles; tap toggles; keyboard; mobile no-overflow.

---

## Phase 0 — Types & data foundation

### Task 1: Layer & chapter types

**Files:**

- Create: `src/components/organisms/BookViewer/manifests/types.ts`
- Test: `src/components/organisms/BookViewer/manifests/types.test.ts`

- [ ] **Step 1: Write the failing test** (a type-level + runtime guard that a sample manifest satisfies the shape)

```typescript
// types.test.ts
import { describe, it, expect } from 'vitest';
import type { ChapterManifest, Layer, Step } from './types';
import { isChapterManifest } from './types';

describe('manifest types', () => {
  it('accepts a well-formed chapter manifest', () => {
    const wall: Layer = {
      id: 'wall',
      src: 'book/hat/wall.svg',
      label: 'Walls',
      alt: 'The insulated wall',
      tabColor: '#c9a86a',
      tabWord: 'WALL',
      z: 20,
      explodeOffset: { x: 0, y: 0 },
    };
    const step: Step = {
      id: 'whole',
      heading: 'A house is layers',
      prose: 'Every building is a stack of jobs.',
      dockedLayerIds: ['wall'],
    };
    const manifest: ChapterManifest = {
      slug: 'hat',
      meta: { title: 'The Hat', kicker: 'Why a roof needs a brim' },
      layers: [wall],
      steps: [step],
    };
    expect(isChapterManifest(manifest)).toBe(true);
  });

  it('rejects a manifest missing steps', () => {
    expect(isChapterManifest({ slug: 'hat', meta: {}, layers: [] })).toBe(
      false
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `docker exec -w /app hatcoatandboots-hatcoatandboots-1 pnpm vitest run src/components/organisms/BookViewer/manifests/types.test.ts`
Expected: FAIL — cannot find module `./types`.

- [ ] **Step 3: Write minimal implementation**

```typescript
// types.ts
export type LayerId = string;

export interface Layer {
  /** Stable id; join key for steps, state, tabs. */
  id: LayerId;
  /** basePath-relative SVG path, e.g. 'book/hat/wall.svg'. Resolved at render. */
  src: string;
  /** Control label (button text). */
  label: string;
  /** Text alternative for assistive tech. */
  alt: string;
  /** Edge-tab accent colour (from the real SVG fill). */
  tabColor: string;
  /** One-word tab caption, e.g. 'WALL'. */
  tabWord: string;
  /** Stacking order in the shared 0 0 360 360 space (low draws behind). */
  z: number;
  /** Translation applied when this layer is EXPLODED (docked = {0,0}). */
  explodeOffset: { x: number; y: number };
}

export interface Step {
  /** Stable id for the beat. */
  id: string;
  /** Short headline shown in the ribbon. */
  heading: string;
  /** One or two sentences of narrative. */
  prose: string;
  /** Layers DOCKED (visible, in place) at this beat; others explode out. */
  dockedLayerIds: LayerId[];
  /** Optional single layer to spotlight (halo) at this beat. */
  spotlightLayerId?: LayerId;
}

export interface ChapterManifest {
  /** Route slug: 'hat' | 'coat' | 'boots'. */
  slug: string;
  meta: { title: string; kicker: string };
  layers: Layer[];
  steps: Step[];
}

export function isChapterManifest(v: unknown): v is ChapterManifest {
  if (!v || typeof v !== 'object') return false;
  const m = v as Record<string, unknown>;
  return (
    typeof m.slug === 'string' &&
    Array.isArray(m.layers) &&
    Array.isArray(m.steps) &&
    (m.steps as unknown[]).length > 0
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `docker exec -w /app hatcoatandboots-hatcoatandboots-1 pnpm vitest run src/components/organisms/BookViewer/manifests/types.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
docker exec -e GIT_AUTHOR_NAME="TurtleWolfe" -e GIT_AUTHOR_EMAIL="jonpohlner@gmail.com" \
  -e GIT_COMMITTER_NAME="TurtleWolfe" -e GIT_COMMITTER_EMAIL="jonpohlner@gmail.com" \
  -w /app hatcoatandboots-hatcoatandboots-1 \
  git add -A && git commit -m "feat(book): chapter manifest types"
```

---

## Phase 1 — Engine hooks (headless, TDD)

### Task 2: `useLayerState` reducer

Owns which layers are docked vs exploded, and whether we're following the story or the reader. Story mode lets a beat set the docked set; a reader tap flips to reader mode and mutates one layer.

**Files:**

- Create: `src/components/organisms/BookViewer/useLayerState.ts`
- Test: `src/components/organisms/BookViewer/useLayerState.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// useLayerState.test.ts
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLayerState } from './useLayerState';

const LAYER_IDS = ['roof', 'wall', 'window'];

describe('useLayerState', () => {
  it('starts in story mode with the given docked set', () => {
    const { result } = renderHook(() =>
      useLayerState(LAYER_IDS, ['roof', 'wall'])
    );
    expect(result.current.mode).toBe('story');
    expect(result.current.isDocked('roof')).toBe(true);
    expect(result.current.isDocked('window')).toBe(false);
  });

  it('syncStory updates docked set while in story mode', () => {
    const { result } = renderHook(() => useLayerState(LAYER_IDS, ['roof']));
    act(() => result.current.syncStory(['roof', 'window']));
    expect(result.current.isDocked('window')).toBe(true);
  });

  it('toggling a layer flips to reader mode and inverts just that layer', () => {
    const { result } = renderHook(() =>
      useLayerState(LAYER_IDS, ['roof', 'wall'])
    );
    act(() => result.current.toggle('roof'));
    expect(result.current.mode).toBe('reader');
    expect(result.current.isDocked('roof')).toBe(false);
    expect(result.current.isDocked('wall')).toBe(true);
  });

  it('in reader mode, syncStory does NOT override the reader (until resumed)', () => {
    const { result } = renderHook(() => useLayerState(LAYER_IDS, ['roof']));
    act(() => result.current.toggle('roof')); // reader now
    act(() => result.current.syncStory(['roof', 'wall'])); // story beat changes
    expect(result.current.isDocked('roof')).toBe(false); // reader wins
  });

  it('resumeStory re-applies the story set and returns to story mode', () => {
    const { result } = renderHook(() => useLayerState(LAYER_IDS, ['roof']));
    act(() => result.current.toggle('roof'));
    act(() => result.current.resumeStory(['roof', 'window']));
    expect(result.current.mode).toBe('story');
    expect(result.current.isDocked('roof')).toBe(true);
    expect(result.current.isDocked('window')).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `docker exec -w /app hatcoatandboots-hatcoatandboots-1 pnpm vitest run src/components/organisms/BookViewer/useLayerState.test.ts`
Expected: FAIL — cannot find module `./useLayerState`.

- [ ] **Step 3: Write minimal implementation**

```typescript
// useLayerState.ts
import { useCallback, useMemo, useState } from 'react';
import type { LayerId } from './manifests/types';

type Mode = 'story' | 'reader';

export interface LayerStateApi {
  mode: Mode;
  isDocked: (id: LayerId) => boolean;
  /** Story-driven: set the docked set; ignored once the reader has taken over. */
  syncStory: (dockedIds: LayerId[]) => void;
  /** Reader-driven: flip one layer; switches to reader mode. */
  toggle: (id: LayerId) => void;
  /** Reader pressed "back to the story": re-apply the beat and return to story mode. */
  resumeStory: (dockedIds: LayerId[]) => void;
}

export function useLayerState(
  allIds: LayerId[],
  initialDockedIds: LayerId[]
): LayerStateApi {
  const [mode, setMode] = useState<Mode>('story');
  const [docked, setDocked] = useState<Set<LayerId>>(
    () => new Set(initialDockedIds)
  );

  const isDocked = useCallback((id: LayerId) => docked.has(id), [docked]);

  const syncStory = useCallback((dockedIds: LayerId[]) => {
    // Only the story writes the set while in story mode.
    setMode((m) => {
      if (m === 'story') setDocked(new Set(dockedIds));
      return m;
    });
  }, []);

  const toggle = useCallback((id: LayerId) => {
    setMode('reader');
    setDocked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const resumeStory = useCallback((dockedIds: LayerId[]) => {
    setDocked(new Set(dockedIds));
    setMode('story');
  }, []);

  return useMemo(
    () => ({ mode, isDocked, syncStory, toggle, resumeStory }),
    [mode, isDocked, syncStory, toggle, resumeStory]
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `docker exec -w /app hatcoatandboots-hatcoatandboots-1 pnpm vitest run src/components/organisms/BookViewer/useLayerState.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
docker exec -e GIT_AUTHOR_NAME="TurtleWolfe" -e GIT_AUTHOR_EMAIL="jonpohlner@gmail.com" \
  -e GIT_COMMITTER_NAME="TurtleWolfe" -e GIT_COMMITTER_EMAIL="jonpohlner@gmail.com" \
  -w /app hatcoatandboots-hatcoatandboots-1 \
  git add -A && git commit -m "feat(book): useLayerState reducer (story/reader modes)"
```

### Task 3: `useScrollStory` hook

Owns `activeStepIndex`, driven by both `goNext/goPrev/goTo` and (in the browser) an IntersectionObserver over per-step anchors. Tests cover the imperative API; the IO wiring is exercised in E2E (jsdom has no real IntersectionObserver).

**Files:**

- Create: `src/components/organisms/BookViewer/useScrollStory.ts`
- Test: `src/components/organisms/BookViewer/useScrollStory.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// useScrollStory.test.ts
import { describe, it, expect, beforeAll } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useScrollStory } from './useScrollStory';

beforeAll(() => {
  // jsdom lacks IntersectionObserver; stub a no-op so the hook mounts.
  class IO {
    observe() {}
    disconnect() {}
    unobserve() {}
  }
  // @ts-expect-error test stub
  globalThis.IntersectionObserver = IO;
});

describe('useScrollStory', () => {
  it('starts at step 0', () => {
    const { result } = renderHook(() => useScrollStory(4));
    expect(result.current.activeStepIndex).toBe(0);
  });

  it('goNext / goPrev clamp within bounds', () => {
    const { result } = renderHook(() => useScrollStory(3));
    act(() => result.current.goPrev());
    expect(result.current.activeStepIndex).toBe(0); // clamped low
    act(() => result.current.goNext());
    act(() => result.current.goNext());
    act(() => result.current.goNext()); // would be 3, clamp to 2
    expect(result.current.activeStepIndex).toBe(2);
  });

  it('goTo jumps to a specific in-range index', () => {
    const { result } = renderHook(() => useScrollStory(5));
    act(() => result.current.goTo(3));
    expect(result.current.activeStepIndex).toBe(3);
    act(() => result.current.goTo(99));
    expect(result.current.activeStepIndex).toBe(4); // clamped high
  });

  it('exposes a ref registrar for step anchors', () => {
    const { result } = renderHook(() => useScrollStory(2));
    expect(typeof result.current.registerStep).toBe('function');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `docker exec -w /app hatcoatandboots-hatcoatandboots-1 pnpm vitest run src/components/organisms/BookViewer/useScrollStory.test.ts`
Expected: FAIL — cannot find module `./useScrollStory`.

- [ ] **Step 3: Write minimal implementation**

```typescript
// useScrollStory.ts
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export interface ScrollStoryApi {
  activeStepIndex: number;
  goNext: () => void;
  goPrev: () => void;
  goTo: (index: number) => void;
  /** Attach to each step anchor element so scrolling can set the active step. */
  registerStep: (index: number) => (el: HTMLElement | null) => void;
}

export function useScrollStory(stepCount: number): ScrollStoryApi {
  const [activeStepIndex, setActive] = useState(0);
  const clamp = useCallback(
    (i: number) => Math.max(0, Math.min(stepCount - 1, i)),
    [stepCount]
  );

  const goTo = useCallback((i: number) => setActive(clamp(i)), [clamp]);
  const goNext = useCallback(() => setActive((i) => clamp(i + 1)), [clamp]);
  const goPrev = useCallback(() => setActive((i) => clamp(i - 1)), [clamp]);

  const els = useRef<Map<number, HTMLElement>>(new Map());
  const registerStep = useCallback(
    (index: number) => (el: HTMLElement | null) => {
      if (el) els.current.set(index, el);
      else els.current.delete(index);
    },
    []
  );

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      (entries) => {
        // The most-visible intersecting anchor wins.
        let best: { index: number; ratio: number } | null = null;
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const index = Number((e.target as HTMLElement).dataset.stepIndex);
          if (!best || e.intersectionRatio > best.ratio)
            best = { index, ratio: e.intersectionRatio };
        }
        if (best) setActive(best.index);
      },
      { threshold: [0.5, 0.75, 1] }
    );
    els.current.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [stepCount]);

  return useMemo(
    () => ({ activeStepIndex, goNext, goPrev, goTo, registerStep }),
    [activeStepIndex, goNext, goPrev, goTo, registerStep]
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `docker exec -w /app hatcoatandboots-hatcoatandboots-1 pnpm vitest run src/components/organisms/BookViewer/useScrollStory.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
docker exec -e GIT_AUTHOR_NAME="TurtleWolfe" -e GIT_AUTHOR_EMAIL="jonpohlner@gmail.com" \
  -e GIT_COMMITTER_NAME="TurtleWolfe" -e GIT_COMMITTER_EMAIL="jonpohlner@gmail.com" \
  -w /app hatcoatandboots-hatcoatandboots-1 \
  git add -A && git commit -m "feat(book): useScrollStory hook (scroll + Next/Back, one source of truth)"
```

---

## Phase 2 — Presentation components (5-file pattern, TDD)

> Scaffold each with `docker exec -w /app hatcoatandboots-hatcoatandboots-1 pnpm run generate:component` and pick the category named below, then replace the generated bodies. The generator emits all five files (index, Component, test, stories, accessibility.test) so the structure is correct from the start.

### Task 4: `ExplodedBuilding` (category: organisms)

Renders the full-bleed sky + the chapter's SVG layers as docked/exploded slabs. Each layer is a `<button>` (the part IS the control). Docked = no transform, opacity 1; exploded = `translate(explodeOffset)` + dimmed. SVGs are `<img src={basePath + layer.src}>`.

**Files:**

- Create (via generator): `src/components/organisms/ExplodedBuilding/{index.tsx,ExplodedBuilding.tsx,ExplodedBuilding.test.tsx,ExplodedBuilding.stories.tsx,ExplodedBuilding.accessibility.test.tsx}`

- [ ] **Step 1: Write the failing test** (replace the generated `ExplodedBuilding.test.tsx`)

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExplodedBuilding } from './ExplodedBuilding';
import type { Layer } from '../BookViewer/manifests/types';

const LAYERS: Layer[] = [
  {
    id: 'roof',
    src: 'book/hat/roof-overhang.svg',
    label: 'Roof overhang',
    alt: 'roof',
    tabColor: '#c8714a',
    tabWord: 'ROOF',
    z: 40,
    explodeOffset: { x: 0, y: -60 },
  },
  {
    id: 'wall',
    src: 'book/hat/wall.svg',
    label: 'Walls',
    alt: 'wall',
    tabColor: '#c9a86a',
    tabWord: 'WALL',
    z: 20,
    explodeOffset: { x: 0, y: 0 },
  },
];

describe('ExplodedBuilding', () => {
  it('renders one button per layer with an accessible name + pressed state', () => {
    render(
      <ExplodedBuilding
        layers={LAYERS}
        isDocked={() => true}
        onToggle={() => {}}
      />
    );
    const roof = screen.getByRole('button', { name: /roof overhang/i });
    expect(roof).toHaveAttribute('aria-pressed', 'true');
  });

  it('reflects exploded state via aria-pressed=false', () => {
    render(
      <ExplodedBuilding
        layers={LAYERS}
        isDocked={(id) => id !== 'roof'}
        onToggle={() => {}}
      />
    );
    expect(
      screen.getByRole('button', { name: /roof overhang/i })
    ).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls onToggle with the layer id when a part is activated', () => {
    const onToggle = vi.fn();
    render(
      <ExplodedBuilding
        layers={LAYERS}
        isDocked={() => true}
        onToggle={onToggle}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /walls/i }));
    expect(onToggle).toHaveBeenCalledWith('wall');
  });

  it('renders each layer SVG as an <img> (never next/image) with the basePath-resolved src', () => {
    render(
      <ExplodedBuilding
        layers={LAYERS}
        isDocked={() => true}
        onToggle={() => {}}
      />
    );
    const img = screen.getByAltText('wall') as HTMLImageElement;
    expect(img.tagName).toBe('IMG');
    expect(img.getAttribute('src')).toContain('book/hat/wall.svg');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `docker exec -w /app hatcoatandboots-hatcoatandboots-1 pnpm vitest run src/components/organisms/ExplodedBuilding/ExplodedBuilding.test.tsx`
Expected: FAIL — component is the generated stub, no buttons/imgs.

- [ ] **Step 3: Write minimal implementation** (replace `ExplodedBuilding.tsx`)

```tsx
'use client';

import React from 'react';
import { detectedConfig } from '@/config/project-detected';
import type { Layer, LayerId } from '../BookViewer/manifests/types';

export interface ExplodedBuildingProps {
  layers: Layer[];
  /** True when the layer is docked (in place); false when exploded. */
  isDocked: (id: LayerId) => boolean;
  onToggle: (id: LayerId) => void;
  /** Optional layer to spotlight (story's current focus). */
  spotlightId?: LayerId;
  className?: string;
}

/**
 * The chapter building, exploded into its real SVG layers over a full-bleed sky.
 * Each layer is a real <button> — the part itself is the control. Docked layers
 * sit in their original 0 0 360 360 position (opacity 1); exploded layers are
 * translated by explodeOffset and dimmed. The SVG figure is never cover-cropped;
 * the sky bleeds, the building/sun/rain stay inside the safe-box.
 *
 * @category organisms
 */
export function ExplodedBuilding({
  layers,
  isDocked,
  onToggle,
  spotlightId,
  className = '',
}: ExplodedBuildingProps) {
  const base = detectedConfig.basePath ?? '';
  // Draw back-to-front by z so overlap is deterministic (topmost-art-wins on tap
  // is achieved by later DOM order = higher stacking).
  const ordered = [...layers].sort((a, b) => a.z - b.z);

  return (
    <div
      role="group"
      aria-label="Explore the house — activate a part to show or hide it"
      className={`book-sky relative aspect-[4/3] w-full overflow-hidden ${className}`}
    >
      {ordered.map((layer) => {
        const docked = isDocked(layer.id);
        const tx = docked ? 0 : layer.explodeOffset.x;
        const ty = docked ? 0 : layer.explodeOffset.y;
        return (
          <button
            key={layer.id}
            type="button"
            aria-pressed={docked}
            aria-label={layer.label}
            onClick={() => onToggle(layer.id)}
            className={`book-part absolute inset-0 flex min-h-11 min-w-11 cursor-pointer items-center justify-center bg-transparent transition-[transform,opacity] duration-300 ${
              docked ? 'opacity-100' : 'opacity-60'
            } ${spotlightId === layer.id ? 'book-part--spotlight' : ''}`}
            style={{
              transform: `translate(${tx}px, ${ty}px)`,
              zIndex: layer.z,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${base}/${layer.src}`}
              alt={layer.alt}
              aria-hidden="true"
              className="pointer-events-none h-full w-full object-contain"
            />
            <span
              aria-hidden="true"
              className="book-tab absolute"
              style={{ background: layer.tabColor }}
            >
              {layer.tabWord}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default ExplodedBuilding;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `docker exec -w /app hatcoatandboots-hatcoatandboots-1 pnpm vitest run src/components/organisms/ExplodedBuilding/ExplodedBuilding.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 5: Fix the generated accessibility test + stories**

Replace `ExplodedBuilding.accessibility.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { ExplodedBuilding } from './ExplodedBuilding';
import type { Layer } from '../BookViewer/manifests/types';

const LAYERS: Layer[] = [
  {
    id: 'wall',
    src: 'book/hat/wall.svg',
    label: 'Walls',
    alt: '',
    tabColor: '#c9a86a',
    tabWord: 'WALL',
    z: 20,
    explodeOffset: { x: 0, y: 0 },
  },
];

describe('ExplodedBuilding a11y', () => {
  it('has no axe violations', async () => {
    const { container } = render(
      <ExplodedBuilding
        layers={LAYERS}
        isDocked={() => true}
        onToggle={() => {}}
      />
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
```

Replace the stories default export args in `ExplodedBuilding.stories.tsx` with a 2-layer fixture (same `LAYERS` shape) and an `isDocked: () => true`, `onToggle: () => {}`.

- [ ] **Step 6: Run a11y test + full suite for this dir**

Run: `docker exec -w /app hatcoatandboots-hatcoatandboots-1 pnpm vitest run src/components/organisms/ExplodedBuilding/`
Expected: PASS.

- [ ] **Step 7: Add the CSS** (`src/app/globals.css`)

```css
/* Exploded building — full-bleed sky, never crops the figure. */
.book-sky {
  background: linear-gradient(to bottom, #1b2a3a 0%, #2f4356 100%);
}
.book-tab {
  bottom: 8%;
  left: 6%;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1px;
  color: #10202e;
  border-radius: 6px;
  padding: 2px 7px;
}
.book-part--spotlight {
  outline: 3px solid #f6c453;
  outline-offset: -3px;
}
@media (prefers-reduced-motion: reduce) {
  .book-part {
    transition: none;
  }
}
```

- [ ] **Step 8: Commit**

```bash
docker exec -e GIT_AUTHOR_NAME="TurtleWolfe" -e GIT_AUTHOR_EMAIL="jonpohlner@gmail.com" \
  -e GIT_COMMITTER_NAME="TurtleWolfe" -e GIT_COMMITTER_EMAIL="jonpohlner@gmail.com" \
  -w /app hatcoatandboots-hatcoatandboots-1 \
  git add -A && git commit -m "feat(book): ExplodedBuilding — parts-as-controls over full-bleed sky"
```

### Task 5: `StoryRibbon` (category: molecular)

The slim narrative band: current beat heading + prose, Back/Next pills (≥44px), and a 7-dot live legend (one dot per layer; filled = docked).

**Files:**

- Create (via generator): `src/components/molecular/StoryRibbon/{index.tsx,StoryRibbon.tsx,StoryRibbon.test.tsx,StoryRibbon.stories.tsx,StoryRibbon.accessibility.test.tsx}`

- [ ] **Step 1: Write the failing test** (replace `StoryRibbon.test.tsx`)

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StoryRibbon } from './StoryRibbon';

const LEGEND = [
  { id: 'roof', tabColor: '#c8714a', docked: true },
  { id: 'wall', tabColor: '#c9a86a', docked: false },
];

describe('StoryRibbon', () => {
  it('shows the heading and prose of the active beat', () => {
    render(
      <StoryRibbon
        heading="Summer sun is blocked"
        prose="The overhang shades the window."
        stepIndex={1}
        stepCount={4}
        legend={LEGEND}
        onPrev={() => {}}
        onNext={() => {}}
      />
    );
    expect(
      screen.getByRole('heading', { name: /summer sun is blocked/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/overhang shades the window/i)).toBeInTheDocument();
  });

  it('fires onPrev / onNext from the pills', () => {
    const onPrev = vi.fn();
    const onNext = vi.fn();
    render(
      <StoryRibbon
        heading="h"
        prose="p"
        stepIndex={1}
        stepCount={4}
        legend={LEGEND}
        onPrev={onPrev}
        onNext={onNext}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /back/i }));
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(onPrev).toHaveBeenCalledOnce();
    expect(onNext).toHaveBeenCalledOnce();
  });

  it('disables Back on the first step and Next on the last', () => {
    const { rerender } = render(
      <StoryRibbon
        heading="h"
        prose="p"
        stepIndex={0}
        stepCount={3}
        legend={LEGEND}
        onPrev={() => {}}
        onNext={() => {}}
      />
    );
    expect(screen.getByRole('button', { name: /back/i })).toBeDisabled();
    rerender(
      <StoryRibbon
        heading="h"
        prose="p"
        stepIndex={2}
        stepCount={3}
        legend={LEGEND}
        onPrev={() => {}}
        onNext={() => {}}
      />
    );
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
  });

  it('renders one legend dot per layer, marking docked ones', () => {
    render(
      <StoryRibbon
        heading="h"
        prose="p"
        stepIndex={1}
        stepCount={4}
        legend={LEGEND}
        onPrev={() => {}}
        onNext={() => {}}
      />
    );
    const dots = screen.getAllByTestId('legend-dot');
    expect(dots).toHaveLength(2);
    expect(dots[0]).toHaveAttribute('data-docked', 'true');
    expect(dots[1]).toHaveAttribute('data-docked', 'false');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `docker exec -w /app hatcoatandboots-hatcoatandboots-1 pnpm vitest run src/components/molecular/StoryRibbon/StoryRibbon.test.tsx`
Expected: FAIL — generated stub.

- [ ] **Step 3: Write minimal implementation** (replace `StoryRibbon.tsx`)

```tsx
'use client';

import React from 'react';

export interface LegendItem {
  id: string;
  tabColor: string;
  docked: boolean;
}

export interface StoryRibbonProps {
  heading: string;
  prose: string;
  stepIndex: number;
  stepCount: number;
  legend: LegendItem[];
  onPrev: () => void;
  onNext: () => void;
  className?: string;
}

/**
 * The narrative ribbon: active beat heading + prose, Back/Next pills (≥44px),
 * and a live legend (one dot per layer; filled = docked). Floats over the
 * building's low-information margin — never a column, never a totem.
 *
 * @category molecular
 */
export function StoryRibbon({
  heading,
  prose,
  stepIndex,
  stepCount,
  legend,
  onPrev,
  onNext,
  className = '',
}: StoryRibbonProps) {
  return (
    <div
      className={`bg-base-100/90 text-base-content rounded-xl p-4 backdrop-blur-sm ${className}`}
    >
      <h2 className="font-blueprint text-xl font-bold">{heading}</h2>
      <p aria-live="polite" className="mt-1 text-sm leading-relaxed">
        {prose}
      </p>
      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={onPrev}
          disabled={stepIndex === 0}
          className="btn btn-sm min-h-11 disabled:opacity-40"
        >
          ‹ Back
        </button>
        <ul className="flex flex-1 items-center justify-center gap-1.5">
          {legend.map((l) => (
            <li
              key={l.id}
              data-testid="legend-dot"
              data-docked={l.docked}
              aria-hidden="true"
              className="h-2.5 w-2.5 rounded-full border"
              style={{
                background: l.docked ? l.tabColor : 'transparent',
                borderColor: l.tabColor,
              }}
            />
          ))}
        </ul>
        <button
          type="button"
          onClick={onNext}
          disabled={stepIndex === stepCount - 1}
          className="btn btn-sm min-h-11 disabled:opacity-40"
        >
          Next ›
        </button>
      </div>
    </div>
  );
}

export default StoryRibbon;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `docker exec -w /app hatcoatandboots-hatcoatandboots-1 pnpm vitest run src/components/molecular/StoryRibbon/StoryRibbon.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 5: Fix the generated a11y test + stories** (axe on a 2-item legend fixture, as in Task 4 Step 5), then run `pnpm vitest run src/components/molecular/StoryRibbon/`. Expected PASS.

- [ ] **Step 6: Commit**

```bash
docker exec -e GIT_AUTHOR_NAME="TurtleWolfe" -e GIT_AUTHOR_EMAIL="jonpohlner@gmail.com" \
  -e GIT_COMMITTER_NAME="TurtleWolfe" -e GIT_COMMITTER_EMAIL="jonpohlner@gmail.com" \
  -w /app hatcoatandboots-hatcoatandboots-1 \
  git add -A && git commit -m "feat(book): StoryRibbon — prose + Back/Next + live legend"
```

### Task 6: `PartTooltip` (category: atomic)

A touch-aware, AAA-contrast, single-instance tooltip naming a part. NOT the DaisyUI `Tooltip` (hover/focus-only). Controlled: parent decides which part's tooltip is open.

**Files:**

- Create (via generator): `src/components/atomic/PartTooltip/{index.tsx,PartTooltip.tsx,PartTooltip.test.tsx,PartTooltip.stories.tsx,PartTooltip.accessibility.test.tsx}`

- [ ] **Step 1: Write the failing test** (replace `PartTooltip.test.tsx`)

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PartTooltip } from './PartTooltip';

describe('PartTooltip', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <PartTooltip
        open={false}
        name="Roof overhang"
        verb="Tap to take the roof off"
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the name and verb line when open', () => {
    render(
      <PartTooltip open name="Roof overhang" verb="Tap to take the roof off" />
    );
    expect(screen.getByText('Roof overhang')).toBeInTheDocument();
    expect(screen.getByText(/take the roof off/i)).toBeInTheDocument();
  });

  it('is a polite live region so SR users hear the teaching', () => {
    render(
      <PartTooltip open name="Roof overhang" verb="Tap to take the roof off" />
    );
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `docker exec -w /app hatcoatandboots-hatcoatandboots-1 pnpm vitest run src/components/atomic/PartTooltip/PartTooltip.test.tsx`
Expected: FAIL — generated stub.

- [ ] **Step 3: Write minimal implementation** (replace `PartTooltip.tsx`)

```tsx
'use client';

import React from 'react';

export interface PartTooltipProps {
  open: boolean;
  name: string;
  /** The action line, e.g. "Tap to put the roof back". */
  verb: string;
  className?: string;
}

/**
 * Single-instance, AAA-contrast tooltip naming a building part. Opaque card so
 * contrast is independent of the artwork behind it. role=status so toggles/teaching
 * are announced to assistive tech.
 *
 * @category atomic
 */
export function PartTooltip({
  open,
  name,
  verb,
  className = '',
}: PartTooltipProps) {
  if (!open) return null;
  return (
    <div
      role="status"
      className={`pointer-events-none rounded-lg border border-[#2f4a63] bg-[#10202e] px-3 py-2 text-[#eef5ff] shadow-lg ${className}`}
    >
      <span className="block text-sm font-bold">{name}</span>
      <span className="mt-0.5 block text-xs font-semibold text-[#8fd0ff]">
        {verb}
      </span>
    </div>
  );
}

export default PartTooltip;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `docker exec -w /app hatcoatandboots-hatcoatandboots-1 pnpm vitest run src/components/atomic/PartTooltip/PartTooltip.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Fix a11y test + stories** (axe on `<PartTooltip open name="Roof" verb="Tap" />`), run `pnpm vitest run src/components/atomic/PartTooltip/`. Expected PASS.

- [ ] **Step 6: Commit**

```bash
docker exec -e GIT_AUTHOR_NAME="TurtleWolfe" -e GIT_AUTHOR_EMAIL="jonpohlner@gmail.com" \
  -e GIT_COMMITTER_NAME="TurtleWolfe" -e GIT_COMMITTER_EMAIL="jonpohlner@gmail.com" \
  -w /app hatcoatandboots-hatcoatandboots-1 \
  git add -A && git commit -m "feat(book): PartTooltip — touch-aware AAA part tooltip"
```

---

## Phase 3 — Integration: ChapterViewer + route

### Task 7: `ChapterViewer` (category: organisms)

Wires `useScrollStory` + `useLayerState` to `ExplodedBuilding` + `StoryRibbon` + `PartTooltip`. Renders the invisible per-step scroll anchors (the "spine"). Keeps story and reader state in sync: when the active step changes (and we're in story mode), `syncStory` the beat's `dockedLayerIds`.

**Files:**

- Create (via generator): `src/components/organisms/BookViewer/{index.tsx,BookViewer.tsx,BookViewer.test.tsx,BookViewer.stories.tsx,BookViewer.accessibility.test.tsx}` — the component is named `ChapterViewer`, exported from this dir.

- [ ] **Step 1: Write the failing test** (replace `BookViewer.test.tsx`)

```tsx
import { describe, it, expect, beforeAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChapterViewer } from './BookViewer';
import type { ChapterManifest } from './manifests/types';

beforeAll(() => {
  class IO {
    observe() {}
    disconnect() {}
    unobserve() {}
  }
  // @ts-expect-error test stub
  globalThis.IntersectionObserver = IO;
});

const HAT: ChapterManifest = {
  slug: 'hat',
  meta: { title: 'The Hat', kicker: 'k' },
  layers: [
    {
      id: 'wall',
      src: 'book/hat/wall.svg',
      label: 'Walls',
      alt: 'wall',
      tabColor: '#c9a86a',
      tabWord: 'WALL',
      z: 20,
      explodeOffset: { x: 0, y: 0 },
    },
    {
      id: 'roof',
      src: 'book/hat/roof-overhang.svg',
      label: 'Roof overhang',
      alt: 'roof',
      tabColor: '#c8714a',
      tabWord: 'ROOF',
      z: 40,
      explodeOffset: { x: 0, y: -60 },
    },
  ],
  steps: [
    {
      id: 's0',
      heading: 'Walls first',
      prose: 'Start with the walls.',
      dockedLayerIds: ['wall'],
    },
    {
      id: 's1',
      heading: 'Add the roof',
      prose: 'Now the roof.',
      dockedLayerIds: ['wall', 'roof'],
    },
  ],
};

describe('ChapterViewer', () => {
  it('shows step 0 heading + docks step 0 layers', () => {
    render(<ChapterViewer manifest={HAT} />);
    expect(
      screen.getByRole('heading', { name: /walls first/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /walls/i })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(
      screen.getByRole('button', { name: /roof overhang/i })
    ).toHaveAttribute('aria-pressed', 'false');
  });

  it('Next advances the story and docks the next beat layers', () => {
    render(<ChapterViewer manifest={HAT} />);
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(
      screen.getByRole('heading', { name: /add the roof/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /roof overhang/i })
    ).toHaveAttribute('aria-pressed', 'true');
  });

  it('tapping a part flips to reader mode and shows "back to the story"', () => {
    render(<ChapterViewer manifest={HAT} />);
    fireEvent.click(screen.getByRole('button', { name: /walls/i })); // undock wall
    expect(screen.getByRole('button', { name: /walls/i })).toHaveAttribute(
      'aria-pressed',
      'false'
    );
    expect(
      screen.getByRole('button', { name: /back to the story/i })
    ).toBeInTheDocument();
  });

  it('renders exactly one h1 (chapter title) for heading order', () => {
    render(<ChapterViewer manifest={HAT} />);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `docker exec -w /app hatcoatandboots-hatcoatandboots-1 pnpm vitest run src/components/organisms/BookViewer/BookViewer.test.tsx`
Expected: FAIL — generated stub.

- [ ] **Step 3: Write minimal implementation** (replace `BookViewer.tsx`)

```tsx
'use client';

import React, { useEffect } from 'react';
import { ExplodedBuilding } from '../ExplodedBuilding';
import { StoryRibbon } from '../../molecular/StoryRibbon';
import { useScrollStory } from './useScrollStory';
import { useLayerState } from './useLayerState';
import type { ChapterManifest } from './manifests/types';

export interface ChapterViewerProps {
  manifest: ChapterManifest;
}

/**
 * The chapter viewer: a scroll-story whose beats dock/explode the building's
 * layers, with the parts themselves as controls. One source of truth for story
 * position (useScrollStory) and one for layer state (useLayerState); the story
 * sets state, reader taps mutate it, and "back to the story" re-syncs.
 *
 * @category organisms
 */
export function ChapterViewer({ manifest }: ChapterViewerProps) {
  const allIds = manifest.layers.map((l) => l.id);
  const { activeStepIndex, goNext, goPrev, goTo, registerStep } =
    useScrollStory(manifest.steps.length);
  const step = manifest.steps[activeStepIndex];
  const { mode, isDocked, syncStory, toggle, resumeStory } = useLayerState(
    allIds,
    manifest.steps[0].dockedLayerIds
  );

  // Story drives the docked set when the active beat changes (story mode only).
  // Reads only its own step index — never echoes layer state back (no prop-echo).
  useEffect(() => {
    syncStory(step.dockedLayerIds);
  }, [activeStepIndex, step.dockedLayerIds, syncStory]);

  const legend = manifest.layers.map((l) => ({
    id: l.id,
    tabColor: l.tabColor,
    docked: isDocked(l.id),
  }));

  return (
    <section className="relative flex min-h-0 flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,32%)] lg:items-end">
      <h1 className="sr-only">{manifest.meta.title}</h1>

      {/* The building (hero) */}
      <div className="lg:[grid-column:1]">
        <ExplodedBuilding
          layers={manifest.layers}
          isDocked={isDocked}
          onToggle={toggle}
          spotlightId={step.spotlightLayerId}
        />
      </div>

      {/* Narrative ribbon */}
      <div className="lg:[grid-column:2]">
        <StoryRibbon
          heading={step.heading}
          prose={step.prose}
          stepIndex={activeStepIndex}
          stepCount={manifest.steps.length}
          legend={legend}
          onPrev={goPrev}
          onNext={goNext}
        />
        {mode === 'reader' && (
          <button
            type="button"
            onClick={() => resumeStory(step.dockedLayerIds)}
            className="btn btn-sm mt-2"
          >
            ↺ back to the story
          </button>
        )}
      </div>

      {/* Invisible scroll spine — one anchor per step drives the IO. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        {manifest.steps.map((s, i) => (
          <div
            key={s.id}
            data-step-index={i}
            ref={registerStep(i)}
            onFocus={() => goTo(i)}
            className="h-screen"
          />
        ))}
      </div>
    </section>
  );
}

export default ChapterViewer;
```

Also update `index.tsx` to `export { ChapterViewer as default, ChapterViewer } from './BookViewer';`.

- [ ] **Step 4: Run test to verify it passes**

Run: `docker exec -w /app hatcoatandboots-hatcoatandboots-1 pnpm vitest run src/components/organisms/BookViewer/BookViewer.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 5: Fix a11y test + stories**, run `pnpm vitest run src/components/organisms/BookViewer/`. Expected PASS.

- [ ] **Step 6: Commit**

```bash
docker exec -e GIT_AUTHOR_NAME="TurtleWolfe" -e GIT_AUTHOR_EMAIL="jonpohlner@gmail.com" \
  -e GIT_COMMITTER_NAME="TurtleWolfe" -e GIT_COMMITTER_EMAIL="jonpohlner@gmail.com" \
  -w /app hatcoatandboots-hatcoatandboots-1 \
  git add -A && git commit -m "feat(book): ChapterViewer wires story + layer state to the building"
```

### Task 8: Routes `/book` and `/book/[chapter]`

**Files:**

- Create: `src/app/book/page.tsx`, `src/app/book/[chapter]/page.tsx`
- Depends on: `manifests/index.ts` (`getChapter`) — created here.

- [ ] **Step 1: Write `manifests/index.ts`** (the lookup; Hat manifest itself is Task 9)

```typescript
// manifests/index.ts
import type { ChapterManifest } from './types';
import { hatManifest } from './hat.manifest';
import { coatManifest } from './coat.manifest';
import { bootsManifest } from './boots.manifest';

const CHAPTERS: Record<string, ChapterManifest> = {
  hat: hatManifest,
  coat: coatManifest,
  boots: bootsManifest,
};

export const CHAPTER_SLUGS = Object.keys(CHAPTERS);
export function getChapter(slug: string): ChapterManifest | undefined {
  return CHAPTERS[slug];
}
```

> NOTE: this imports all three manifests, so it won't compile until Tasks 9–10 create them. Build the route shell here but expect the project to compile only after Task 10. (Alternative for strict TDD ordering: stub `coat.manifest.ts`/`boots.manifest.ts` with minimal valid manifests now, fill content in Task 10.) **Do the stub:** create `coat.manifest.ts` and `boots.manifest.ts` each exporting a one-step "coming soon" manifest so `getChapter` compiles immediately.

Minimal stub (use for coat + boots now):

```typescript
// coat.manifest.ts (stub — real content in Task 10)
import type { ChapterManifest } from './types';
export const coatManifest: ChapterManifest = {
  slug: 'coat',
  meta: { title: 'The Coat', kicker: 'Coming soon' },
  layers: [],
  steps: [
    {
      id: 'soon',
      heading: 'The Coat',
      prose: 'This chapter is coming soon.',
      dockedLayerIds: [],
    },
  ],
};
```

(Repeat for `boots.manifest.ts` with slug/title 'boots'/'The Boots'.)

- [ ] **Step 2: Write `src/app/book/[chapter]/page.tsx`**

```tsx
import { notFound } from 'next/navigation';
import { ChapterViewer } from '@/components/organisms/BookViewer';
import {
  getChapter,
  CHAPTER_SLUGS,
} from '@/components/organisms/BookViewer/manifests';

export function generateStaticParams() {
  return CHAPTER_SLUGS.map((chapter) => ({ chapter }));
}

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ chapter: string }>;
}) {
  const { chapter } = await params;
  const manifest = getChapter(chapter);
  if (!manifest) notFound();
  return (
    <main className="container mx-auto px-4 py-6">
      <ChapterViewer manifest={manifest} />
    </main>
  );
}
```

- [ ] **Step 3: Write `src/app/book/page.tsx`** (index linking the three chapters)

```tsx
import Link from 'next/link';
import {
  CHAPTER_SLUGS,
  getChapter,
} from '@/components/organisms/BookViewer/manifests';

export default function BookIndex() {
  return (
    <main className="container mx-auto px-4 py-6">
      <h1 className="font-blueprint text-3xl font-bold">The Book</h1>
      <ul className="mt-4 flex flex-col gap-2">
        {CHAPTER_SLUGS.map((slug) => (
          <li key={slug}>
            <Link href={`/book/${slug}`} className="btn btn-ghost">
              {getChapter(slug)?.meta.title ?? slug}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
```

- [ ] **Step 4: Verify dev build compiles + type-check**

Run: `docker exec -w /app hatcoatandboots-hatcoatandboots-1 pnpm run type-check`
Expected: zero errors (Hat manifest stub from Task 9 must exist; if not yet, also stub `hat.manifest.ts` minimally, then fill in Task 9).

- [ ] **Step 5: Commit**

```bash
docker exec -e GIT_AUTHOR_NAME="TurtleWolfe" -e GIT_AUTHOR_EMAIL="jonpohlner@gmail.com" \
  -e GIT_COMMITTER_NAME="TurtleWolfe" -e GIT_COMMITTER_EMAIL="jonpohlner@gmail.com" \
  -w /app hatcoatandboots-hatcoatandboots-1 \
  git add -A && git commit -m "feat(book): /book index + /book/[chapter] route (static params)"
```

---

## Phase 4 — Hat chapter content (the first real, judgeable chapter)

### Task 9: `hat.manifest.ts`

Real Hat content. Layer ids match the SVG filenames in `public/book/hat/`: `wall, window, roof-overhang, sun-high, sun-low, rain, footing`. `explodeOffset` values are the starting point for the in-place explode (roof lifts up, footing drops down, suns/rain push into the sky margin); these are **tuned visually during execution against the real art** (spec §11), so treat them as sane defaults, not gospel. `tabColor` from the real fills; `z` from draw order (footing behind … roof/sky in front).

**Files:**

- Create: `src/components/organisms/BookViewer/manifests/hat.manifest.ts`
- Test: `src/components/organisms/BookViewer/manifests/hat.manifest.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// hat.manifest.test.ts
import { describe, it, expect } from 'vitest';
import { hatManifest } from './hat.manifest';
import { isChapterManifest } from './types';

describe('hat manifest', () => {
  it('is a valid chapter manifest', () => {
    expect(isChapterManifest(hatManifest)).toBe(true);
  });

  it('every step.dockedLayerIds references a real layer id', () => {
    const ids = new Set(hatManifest.layers.map((l) => l.id));
    for (const step of hatManifest.steps)
      for (const id of step.dockedLayerIds) expect(ids.has(id)).toBe(true);
  });

  it('every layer src points under book/hat/', () => {
    for (const l of hatManifest.layers)
      expect(l.src).toMatch(/^book\/hat\/.+\.svg$/);
  });

  it('has the 7 Hat layers', () => {
    expect(hatManifest.layers.map((l) => l.id).sort()).toEqual(
      [
        'footing',
        'rain',
        'roof-overhang',
        'sun-high',
        'sun-low',
        'wall',
        'window',
      ].sort()
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `docker exec -w /app hatcoatandboots-hatcoatandboots-1 pnpm vitest run src/components/organisms/BookViewer/manifests/hat.manifest.test.ts`
Expected: FAIL — cannot find module `./hat.manifest`.

- [ ] **Step 3: Write the manifest**

```typescript
// hat.manifest.ts
import type { ChapterManifest } from './types';

export const hatManifest: ChapterManifest = {
  slug: 'hat',
  meta: { title: 'The Hat', kicker: 'Why a roof needs a brim' },
  layers: [
    {
      id: 'footing',
      src: 'book/hat/footing.svg',
      label: 'Footing',
      alt: 'The footing and piers the house stands on',
      tabColor: '#9aa7b3',
      tabWord: 'FOOTING',
      z: 10,
      explodeOffset: { x: 0, y: 70 },
    },
    {
      id: 'wall',
      src: 'book/hat/wall.svg',
      label: 'Walls',
      alt: 'The insulated wall',
      tabColor: '#c9a86a',
      tabWord: 'WALL',
      z: 20,
      explodeOffset: { x: 0, y: 0 },
    },
    {
      id: 'window',
      src: 'book/hat/window.svg',
      label: 'Window',
      alt: 'The window opening',
      tabColor: '#cfe3ee',
      tabWord: 'WINDOW',
      z: 30,
      explodeOffset: { x: 90, y: 0 },
    },
    {
      id: 'roof-overhang',
      src: 'book/hat/roof-overhang.svg',
      label: 'Roof overhang',
      alt: 'The roof and its overhang — the hat',
      tabColor: '#c8714a',
      tabWord: 'ROOF',
      z: 60,
      explodeOffset: { x: 0, y: -80 },
    },
    {
      id: 'sun-high',
      src: 'book/hat/sun-high.svg',
      label: 'Summer sun',
      alt: 'The high summer sun',
      tabColor: '#e8a02e',
      tabWord: 'SUMMER',
      z: 50,
      explodeOffset: { x: 60, y: -60 },
    },
    {
      id: 'sun-low',
      src: 'book/hat/sun-low.svg',
      label: 'Winter sun',
      alt: 'The low winter sun',
      tabColor: '#e6b455',
      tabWord: 'WINTER',
      z: 50,
      explodeOffset: { x: 80, y: 20 },
    },
    {
      id: 'rain',
      src: 'book/hat/rain.svg',
      label: 'Rain',
      alt: 'Rain shedding clear of the wall',
      tabColor: '#5b86a8',
      tabWord: 'RAIN',
      z: 55,
      explodeOffset: { x: 40, y: -40 },
    },
  ],
  steps: [
    {
      id: 'whole',
      heading: 'A house is layers',
      prose:
        'Every building is a stack of jobs. Pull a layer off to see what it does — start with the roof’s brim, the overhang.',
      dockedLayerIds: ['footing', 'wall', 'window', 'roof-overhang'],
      spotlightLayerId: 'roof-overhang',
    },
    {
      id: 'summer',
      heading: 'The summer sun is blocked',
      prose:
        'In summer the sun climbs high. The overhang reaches out past the wall and shades the window, so the room stays cool with no machine.',
      dockedLayerIds: [
        'footing',
        'wall',
        'window',
        'roof-overhang',
        'sun-high',
      ],
      spotlightLayerId: 'sun-high',
    },
    {
      id: 'winter',
      heading: 'The winter sun is let in',
      prose:
        'In winter the sun stays low. It slips under the same overhang and pours through the window, warming the room for free.',
      dockedLayerIds: ['footing', 'wall', 'window', 'roof-overhang', 'sun-low'],
      spotlightLayerId: 'sun-low',
    },
    {
      id: 'rain',
      heading: 'The rain is thrown clear',
      prose:
        'The overhang does one more job: it throws rain away from the wall’s base, so water never soaks the footing.',
      dockedLayerIds: ['footing', 'wall', 'window', 'roof-overhang', 'rain'],
      spotlightLayerId: 'rain',
    },
  ],
};
```

> The prose is the plan author's draft, refined from the salvaged Hat material (the salvaged `hat.manifest.ts` carried the same summer/winter/rain ideas via `hatStrings`). During execution, reconcile wording against `~/repos/_hcab-salvage/book-content/manifests/hat.manifest.ts` if the user wants the exact salvaged phrasing; the layer ids and structure are authoritative.

- [ ] **Step 4: Run test to verify it passes**

Run: `docker exec -w /app hatcoatandboots-hatcoatandboots-1 pnpm vitest run src/components/organisms/BookViewer/manifests/hat.manifest.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Manual visual check (the building, for real)**

Run dev: `docker exec -w /app hatcoatandboots-hatcoatandboots-1 pnpm dev` (host port 3000). Open `http://localhost:3000/book/hat`. Confirm: exploded building fills the frame; tapping a part toggles it; Next/Back walk the 4 beats and dock/explode the right layers. **This is the first point the user judges the real art** — tune `explodeOffset`/CSS here.

- [ ] **Step 6: Commit**

```bash
docker exec -e GIT_AUTHOR_NAME="TurtleWolfe" -e GIT_AUTHOR_EMAIL="jonpohlner@gmail.com" \
  -e GIT_COMMITTER_NAME="TurtleWolfe" -e GIT_COMMITTER_EMAIL="jonpohlner@gmail.com" \
  -w /app hatcoatandboots-hatcoatandboots-1 \
  git add -A && git commit -m "feat(book): Hat chapter manifest (7 layers, 4 beats)"
```

## Phase 5 — Coat & Boots chapters (data only)

### Task 10: `coat.manifest.ts` and `boots.manifest.ts` (real content)

Replace the Task-8 stubs with real chapters using the existing SVGs. Coat layers (`public/book/coat/`): `cavity-insulation, continuous-insulation, air-vapor-membrane, thermal-mass-interior`. Boots layers (`public/book/boots/`): `capillary-break, frost-depth, grade-and-drain`. Refine narrative from the salvaged `coat.manifest.ts`/`coat.strings.ts`/`boots.manifest.ts` drafts.

**Files:**

- Modify: `src/components/organisms/BookViewer/manifests/coat.manifest.ts`, `boots.manifest.ts`
- Test: `src/components/organisms/BookViewer/manifests/chapters.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// chapters.test.ts
import { describe, it, expect } from 'vitest';
import { getChapter, CHAPTER_SLUGS } from './index';
import { isChapterManifest } from './types';

describe('all chapters', () => {
  it('hat, coat, boots all resolve to valid manifests', () => {
    expect(CHAPTER_SLUGS.sort()).toEqual(['boots', 'coat', 'hat']);
    for (const slug of CHAPTER_SLUGS) {
      const m = getChapter(slug)!;
      expect(isChapterManifest(m)).toBe(true);
      const ids = new Set(m.layers.map((l) => l.id));
      for (const step of m.steps)
        for (const id of step.dockedLayerIds) expect(ids.has(id)).toBe(true);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `docker exec -w /app hatcoatandboots-hatcoatandboots-1 pnpm vitest run src/components/organisms/BookViewer/manifests/chapters.test.ts`
Expected: FAIL — the coat/boots stubs have empty `layers` so any `dockedLayerIds` would mismatch (or the slug set differs if not all wired).

- [ ] **Step 3: Write `coat.manifest.ts`** (real; layers + 3–4 beats, prose refined from salvage)

```typescript
// coat.manifest.ts
import type { ChapterManifest } from './types';

export const coatManifest: ChapterManifest = {
  slug: 'coat',
  meta: { title: 'The Coat', kicker: 'What a wall knows about the cold' },
  layers: [
    {
      id: 'cavity-insulation',
      src: 'book/coat/cavity-insulation.svg',
      label: 'Cavity insulation',
      alt: 'Insulation between the studs',
      tabColor: '#c9a86a',
      tabWord: 'CAVITY',
      z: 20,
      explodeOffset: { x: -70, y: 0 },
    },
    {
      id: 'continuous-insulation',
      src: 'book/coat/continuous-insulation.svg',
      label: 'Continuous insulation',
      alt: 'A continuous outer wrap of insulation',
      tabColor: '#b88b50',
      tabWord: 'WRAP',
      z: 30,
      explodeOffset: { x: 70, y: -20 },
    },
    {
      id: 'air-vapor-membrane',
      src: 'book/coat/air-vapor-membrane.svg',
      label: 'Air & vapor membrane',
      alt: 'The air-and-vapor control membrane',
      tabColor: '#5b86a8',
      tabWord: 'MEMBRANE',
      z: 40,
      explodeOffset: { x: 90, y: 20 },
    },
    {
      id: 'thermal-mass-interior',
      src: 'book/coat/thermal-mass-interior.svg',
      label: 'Thermal mass',
      alt: 'Interior thermal mass storing heat',
      tabColor: '#9a7b5a',
      tabWord: 'MASS',
      z: 10,
      explodeOffset: { x: -90, y: 30 },
    },
  ],
  steps: [
    {
      id: 'whole',
      heading: 'The whole coat',
      prose:
        'A warm wall is one wall doing four jobs at once. Pull the layers apart to meet each one.',
      dockedLayerIds: [
        'thermal-mass-interior',
        'cavity-insulation',
        'continuous-insulation',
        'air-vapor-membrane',
      ],
    },
    {
      id: 'studs-leak',
      heading: 'Studs leak heat',
      prose:
        'Insulation between the studs helps, but the studs themselves carry cold straight through — a thermal bridge.',
      dockedLayerIds: ['cavity-insulation'],
      spotlightLayerId: 'cavity-insulation',
    },
    {
      id: 'wrap',
      heading: 'Wrap it to stop the bridge',
      prose:
        'A continuous layer of insulation on the outside covers the studs, so the wall stops leaking heat at every bridge.',
      dockedLayerIds: ['cavity-insulation', 'continuous-insulation'],
      spotlightLayerId: 'continuous-insulation',
    },
    {
      id: 'seal',
      heading: 'Seal the air, store the heat',
      prose:
        'A membrane stops drafts and moisture; the mass inside soaks up warmth and gives it back slowly.',
      dockedLayerIds: [
        'cavity-insulation',
        'continuous-insulation',
        'air-vapor-membrane',
        'thermal-mass-interior',
      ],
      spotlightLayerId: 'air-vapor-membrane',
    },
  ],
};
```

- [ ] **Step 4: Write `boots.manifest.ts`**

```typescript
// boots.manifest.ts
import type { ChapterManifest } from './types';

export const bootsManifest: ChapterManifest = {
  slug: 'boots',
  meta: { title: 'The Boots', kicker: 'What a foundation knows about water' },
  layers: [
    {
      id: 'grade-and-drain',
      src: 'book/boots/grade-and-drain.svg',
      label: 'Grade & drain',
      alt: 'Sloped grade and drainage away from the base',
      tabColor: '#7c6f5a',
      tabWord: 'DRAIN',
      z: 10,
      explodeOffset: { x: -80, y: 40 },
    },
    {
      id: 'capillary-break',
      src: 'book/boots/capillary-break.svg',
      label: 'Capillary break',
      alt: 'A capillary break stopping water from wicking up',
      tabColor: '#5b86a8',
      tabWord: 'BREAK',
      z: 20,
      explodeOffset: { x: 80, y: 0 },
    },
    {
      id: 'frost-depth',
      src: 'book/boots/frost-depth.svg',
      label: 'Frost depth',
      alt: 'Footing set below the frost line',
      tabColor: '#9aa7b3',
      tabWord: 'FROST',
      z: 30,
      explodeOffset: { x: 0, y: 80 },
    },
  ],
  steps: [
    {
      id: 'whole',
      heading: 'The whole boots',
      prose:
        'A dry foundation is three defenses against water and frost. Pull them apart to see each one.',
      dockedLayerIds: ['grade-and-drain', 'capillary-break', 'frost-depth'],
    },
    {
      id: 'wick',
      heading: 'Water wicks up',
      prose:
        'Concrete drinks water from the soil and pulls it upward into the wall — unless something stops it.',
      dockedLayerIds: ['capillary-break'],
      spotlightLayerId: 'capillary-break',
    },
    {
      id: 'break',
      heading: 'A break stops the wick',
      prose:
        'A capillary break — a layer water can’t climb — sits under the wall so the moisture stays in the ground.',
      dockedLayerIds: ['capillary-break', 'grade-and-drain'],
      spotlightLayerId: 'grade-and-drain',
    },
    {
      id: 'frost',
      heading: 'Go below the frost',
      prose:
        'Set the footing below the frost line — depth set by local code — so freezing ground can’t heave the house.',
      dockedLayerIds: ['grade-and-drain', 'capillary-break', 'frost-depth'],
      spotlightLayerId: 'frost-depth',
    },
  ],
};
```

- [ ] **Step 5: Run test + type-check**

Run: `docker exec -w /app hatcoatandboots-hatcoatandboots-1 pnpm vitest run src/components/organisms/BookViewer/manifests/chapters.test.ts && docker exec -w /app hatcoatandboots-hatcoatandboots-1 pnpm run type-check`
Expected: PASS, zero type errors.

- [ ] **Step 6: Commit**

```bash
docker exec -e GIT_AUTHOR_NAME="TurtleWolfe" -e GIT_AUTHOR_EMAIL="jonpohlner@gmail.com" \
  -e GIT_COMMITTER_NAME="TurtleWolfe" -e GIT_COMMITTER_EMAIL="jonpohlner@gmail.com" \
  -w /app hatcoatandboots-hatcoatandboots-1 \
  git add -A && git commit -m "feat(book): Coat & Boots chapters (real content)"
```

---

## Phase 6 — Navbar chapters, E2E, gates

### Task 11: Chapter tabs in the navbar (on `/book/*`)

On `/book/*`, the navbar shows the three chapter tabs (Hat/Coat/Boots) with the active one marked; off `/book`, the normal `navItems` show. Add inline to the single existing nav row in `src/components/GlobalNav.tsx` — **not a second row**.

**Files:**

- Modify: `src/components/GlobalNav.tsx`
- Test: `tests/e2e/book-viewer.spec.ts` covers the rendered result (unit-testing GlobalNav in isolation needs the auth/profile context providers; the navbar behavior is asserted via E2E in Task 12).

- [ ] **Step 1: Add the book detection + chapter tabs.** Near the top of `GlobalNav()` (after `const pathname = usePathname();`):

```tsx
const isBookPage = (pathname ?? '').startsWith('/book');
const chapterTabs = [
  { href: '/book/hat', label: 'The Hat' },
  { href: '/book/coat', label: 'The Coat' },
  { href: '/book/boots', label: 'The Boots' },
];
```

- [ ] **Step 2: Render the tabs in the main nav row.** Find the desktop nav block that maps `navItems` (around line 197) and wrap it so book pages show chapter tabs instead:

```tsx
{
  isBookPage ? (
    <nav
      aria-label="Book chapters"
      className="hidden items-center gap-1 lg:flex"
    >
      {chapterTabs.map((tab) => {
        const active =
          pathname === tab.href || pathname?.startsWith(tab.href + '/');
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? 'page' : undefined}
            className={`btn btn-ghost btn-sm ${active ? 'btn-active' : ''}`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  ) : (
    <nav className="hidden items-center gap-1 lg:flex">
      {navItems.map((item) => (
        <Link key={item.href} href={item.href} className="btn btn-ghost btn-sm">
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
```

(If the existing `navItems` map isn't wrapped in a `<nav>`, wrap it as shown; keep `navItems` reachable in the hamburger/overflow menu, which already lists them around line 365.)

- [ ] **Step 3: Type-check + lint**

Run: `docker exec -w /app hatcoatandboots-hatcoatandboots-1 pnpm run type-check && docker exec -w /app hatcoatandboots-hatcoatandboots-1 pnpm lint`
Expected: zero errors.

- [ ] **Step 4: Commit**

```bash
docker exec -e GIT_AUTHOR_NAME="TurtleWolfe" -e GIT_AUTHOR_EMAIL="jonpohlner@gmail.com" \
  -e GIT_COMMITTER_NAME="TurtleWolfe" -e GIT_COMMITTER_EMAIL="jonpohlner@gmail.com" \
  -w /app hatcoatandboots-hatcoatandboots-1 \
  git add -A && git commit -m "feat(book): chapter tabs in the single navbar row on /book"
```

### Task 12: E2E — scroll reassembles, tap toggles, keyboard, mobile

**Files:**

- Create: `tests/e2e/book-viewer.spec.ts`

- [ ] **Step 1: Write the spec**

```typescript
import { test, expect } from '@playwright/test';

test.describe('Book viewer — Hat', () => {
  test('chapters are in the navbar; Hat is active', async ({ page }) => {
    await page.goto('/book/hat/');
    const nav = page.getByRole('navigation', { name: /book chapters/i });
    await expect(nav.getByRole('link', { name: 'The Hat' })).toHaveAttribute(
      'aria-current',
      'page'
    );
  });

  test('Next/Back walk the beats and dock the right layers', async ({
    page,
  }) => {
    await page.goto('/book/hat/');
    await expect(
      page.getByRole('heading', { name: /a house is layers/i })
    ).toBeVisible();
    await page.getByRole('button', { name: /next/i }).click();
    await expect(
      page.getByRole('heading', { name: /summer sun is blocked/i })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: /summer sun/i })
    ).toHaveAttribute('aria-pressed', 'true');
  });

  test('tapping a part toggles it and shows back-to-the-story', async ({
    page,
  }) => {
    await page.goto('/book/hat/');
    const roof = page.getByRole('button', { name: /roof overhang/i });
    await expect(roof).toHaveAttribute('aria-pressed', 'true');
    await roof.click();
    await expect(roof).toHaveAttribute('aria-pressed', 'false');
    await expect(
      page.getByRole('button', { name: /back to the story/i })
    ).toBeVisible();
  });

  test('no horizontal overflow at 320px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto('/book/hat/');
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1
    );
    expect(overflow).toBe(false);
  });
});
```

- [ ] **Step 2: Build static export + run the spec** (per the repo's static-serve memory: build basePath-free, serve `out` WITHOUT `-s`)

Run:

```bash
docker exec -w /app -e NEXT_PUBLIC_BASE_PATH='' hatcoatandboots-hatcoatandboots-1 pnpm build
docker exec -w /app hatcoatandboots-hatcoatandboots-1 pnpm test:e2e tests/e2e/book-viewer.spec.ts
```

Expected: 4 passing. (If a `.next` `Cannot find module './####.js'` error appears, `docker exec -w /app hatcoatandboots-hatcoatandboots-1 rm -rf .next` and rebuild.)

- [ ] **Step 3: Commit**

```bash
docker exec -e GIT_AUTHOR_NAME="TurtleWolfe" -e GIT_AUTHOR_EMAIL="jonpohlner@gmail.com" \
  -e GIT_COMMITTER_NAME="TurtleWolfe" -e GIT_COMMITTER_EMAIL="jonpohlner@gmail.com" \
  -w /app hatcoatandboots-hatcoatandboots-1 \
  git add -A && git commit -m "test(book): E2E — scroll reassembles, tap toggles, keyboard, mobile"
```

### Task 13: Full gate run + PR

- [ ] **Step 1: Run every gate**

```bash
docker exec -w /app hatcoatandboots-hatcoatandboots-1 pnpm run type-check
docker exec -w /app hatcoatandboots-hatcoatandboots-1 pnpm lint
docker exec -w /app hatcoatandboots-hatcoatandboots-1 pnpm test
docker exec -w /app -e NEXT_PUBLIC_BASE_PATH='' hatcoatandboots-hatcoatandboots-1 pnpm build
docker exec -w /app hatcoatandboots-hatcoatandboots-1 pnpm test:a11y
```

Expected: all green; Pa11y zero WCAG-AA; static export builds.

- [ ] **Step 2: Push branch + open PR** (only when the user approves shipping)

```bash
git push -u origin rebuild
gh pr create --title "feat(book): exploded-layer scroll-story viewer (rebuild)" \
  --body "Rebuilds the book viewer from a refreshed ScriptHammer base. See docs/superpowers/specs/2026-06-03-book-viewer-exploded-design.md. Old work preserved at tag pre-rebuild-d44953e."
```

- [ ] **Step 3: Verify CI green**, then merge per the usual flow (do not force-push `main`; this lands as a normal PR).

---

## Self-Review

**Spec coverage** (each spec §, mapped to a task):

- §2 reading model (scroll + Next/Back, one source of truth) → Tasks 3, 7.
- §2 building-as-hero exploded in place → Task 4 (`ExplodedBuilding`), tuned in Task 9 Step 5.
- §2 reading reassembles the house → Task 7 (`syncStory` on step change).
- §2 exploration / parts-as-controls → Task 4 (`<button>` per layer), Task 7 (toggle → reader mode).
- §3 fill the void (sky layer-0) → Task 4 Step 7 CSS (`.book-sky`).
- §3 layer enticement (color tabs) → Task 4 (`.book-tab`), manifests (`tabColor`/`tabWord`).
- §4 layout/responsive + chapters in navbar → Task 7 (grid), Task 11 (tabs), Task 12 (320px overflow).
- §5 interaction (44px, aria-pressed, keyboard, coexistence/back-to-story) → Tasks 4, 7; E2E Task 12.
- §6 never cover-crop / safe-box → Task 4 (`aspect-[4/3]`, `object-contain`, sky bleeds) + Task 9 offsets tuned visually. **NOTE:** the wider `480×360` composite + explicit safe-box clamping is realized as the `object-contain` + `aspect` approach here; if visual tuning in Task 9 shows margin cropping, widen to the composite-frame approach from spec §6 (documented, not yet a discrete task — flag if needed).
- §7 architecture (manifest/engine/presentation split) → Tasks 1–10.
- §8 all three chapters, Hat first → Tasks 9, 10.
- §9 gates → Task 13; a11y baked into each component's accessibility.test + Task 12.

**Placeholder scan:** none — every code step has full code.

**Type consistency:** `Layer`/`Step`/`ChapterManifest` (Task 1) used identically in Tasks 2,4,7,9,10. Hook APIs: `useLayerState` → `{mode,isDocked,syncStory,toggle,resumeStory}` (Task 2) consumed exactly in Task 7. `useScrollStory` → `{activeStepIndex,goNext,goPrev,goTo,registerStep}` (Task 3) consumed in Task 7. `ExplodedBuilding` props `{layers,isDocked,onToggle,spotlightId}` (Task 4) match Task 7's usage. `StoryRibbon` props (Task 5) match Task 7. Layer ids in manifests (Tasks 9,10) match the real SVG filenames in `public/book/`.

**One open item carried from spec §11:** explode geometry (`explodeOffset`, angle, spread) and the per-session-vs-first-visit exhale are tuned during Task 9 Step 5 against the real art — by design, not a gap.
