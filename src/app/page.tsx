import type { Metadata } from 'next';
import ErrorBoundary from '@/components/ErrorBoundary';
import HomeViewer from '@/components/architecture/HatViewer/HomeViewer';

// ── The home page IS the book. You land inside the shared building viewer — the
//     interactive blueprint dominates the screen, full-bleed. A one-line hook,
//     then the building: chapter-focus tabs to navigate, guided views to step
//     the lesson, per-layer toggles to take it apart. (FR-007 + wireframe
//     01-book-index — the index is the same viewer in its landing state.)
//     Server component; HomeViewer is the 'use client' island.

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

      {/* Full-bleed: the viewer fills the screen. Only a slim padding so the
          building dominates edge to edge. */}
      <section
        id="main-content"
        aria-labelledby="hero-heading"
        className="flex w-full flex-1 flex-col px-3 py-4 sm:px-4 lg:px-6"
      >
        <div className="mb-3 text-center">
          <h1
            id="hero-heading"
            className="text-2xl leading-tight font-bold sm:text-3xl"
            style={{ fontFamily: 'var(--font-blueprint)' }}
          >
            Why does a good building wear a hat, a coat, and boots?
          </h1>
          <p className="text-base-content mt-1 text-sm">
            Here’s the whole building — take it apart, one layer at a time.
          </p>
        </div>

        <ErrorBoundary level="section">
          <HomeViewer className="flex-1" />
        </ErrorBoundary>
      </section>
    </main>
  );
}
