import type { Metadata } from 'next';
import ErrorBoundary from '@/components/ErrorBoundary';
import BookShell from '@/components/architecture/BookShell';

export const metadata: Metadata = {
  title: 'The Coat — Hats, Coats, and Boots',
  description:
    'The insulated thermal envelope — the walls that hold comfort in. Coming soon.',
};

/**
 * `/book/coat` — envelope focus. The SAME shared viewer as every page (FR-007):
 * the whole building stays visible and byte-identically positioned, focused on
 * the wall/window (envelope) region, while the chapter's teaching content shows
 * a "coming soon" state in the rail. NOT a blank page — the building is here and
 * aligned with the Hat and Boots views.
 */
export default function CoatChapterPage() {
  return (
    <main className="bg-base-200 flex min-h-full flex-col">
      <a
        href="#main-content"
        className="btn btn-sm btn-primary sr-only min-h-11 min-w-11 focus:not-sr-only focus:absolute focus:top-4 focus:left-4"
      >
        Skip to main content
      </a>

      <section
        id="main-content"
        className="flex w-full flex-1 flex-col px-3 py-4 sm:px-4 lg:px-6"
      >
        <ErrorBoundary level="section">
          <BookShell
            chapterFocus="envelope"
            activeChapterId="coat"
            className="flex-1"
            chapterContent={
              <div className="border-base-300 bg-base-100 rounded-lg border p-3">
                <h1
                  className="text-base leading-tight font-bold"
                  style={{ fontFamily: 'var(--font-blueprint)' }}
                >
                  The Coat — the insulated walls
                </h1>
                <p className="text-base-content mt-2 text-sm leading-relaxed">
                  The thermal envelope that keeps warmth in and weather out.
                  This chapter is <strong>coming soon</strong> — but the wall
                  and window are already part of the building above; explore the
                  whole structure while you wait.
                </p>
              </div>
            }
          />
        </ErrorBoundary>
      </section>
    </main>
  );
}
