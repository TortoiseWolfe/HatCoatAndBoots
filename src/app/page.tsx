import type { Metadata } from 'next';
import ErrorBoundary from '@/components/ErrorBoundary';
import BookShell from '@/components/architecture/BookShell';

// ── The home page IS the book. You land inside the shared building viewer — the
//     interactive blueprint dominates the screen, full-bleed. A one-line hook,
//     then the building: chapter-focus tabs to navigate, guided views to step
//     the lesson, per-layer toggles to take it apart. (FR-007 + wireframe
//     01-book-index — the index is the same viewer in its landing state.)
//     Server component; BookShell is the 'use client' island.

export const metadata: Metadata = {
  title: 'Hats, Coats, and Boots — an interactive book on building with nature',
  description:
    'Take the building apart layer by layer. An interactive, illustrated book on sustainable natural building — why a good building wears a hat (roof overhang), a coat (insulated walls), and boots (a dry foundation).',
};

export default function Home() {
  return (
    <main className="bg-base-200 flex min-h-full flex-col">
      {/* Skip link — load-bearing a11y, do not remove. */}
      <a
        href="#main-content"
        className="btn btn-sm btn-primary sr-only min-h-11 min-w-11 focus:not-sr-only focus:absolute focus:top-4 focus:left-4"
      >
        Skip to main content
      </a>

      {/* Full-bleed: the shared viewer fills the screen and is the SAME shell as
          every chapter page, so the building sits in the same place when you
          navigate. The welcome copy is in the rail (not above the building). */}
      <section
        id="main-content"
        aria-labelledby="hero-heading"
        className="flex w-full flex-1 flex-col px-3 py-4 sm:px-4 lg:px-6"
      >
        <h1 id="hero-heading" className="sr-only">
          Hats, Coats, and Boots — the interactive book
        </h1>
        <ErrorBoundary level="section">
          <BookShell
            chapterFocus={null}
            activeChapterId={null}
            className="flex-1"
            chapterContent={
              <div className="border-base-300 bg-base-100 rounded-lg border p-3">
                <p
                  className="text-base-content text-base font-bold"
                  style={{ fontFamily: 'var(--font-blueprint)' }}
                >
                  Why does a good building wear a hat, a coat, and boots?
                </p>
                <p className="text-base-content mt-1 text-sm leading-relaxed">
                  Here’s the whole building. Pick a chapter to explore the roof,
                  the walls, or the foundation — or just take it apart, one
                  layer at a time.
                </p>
              </div>
            }
          />
        </ErrorBoundary>
      </section>
    </main>
  );
}
