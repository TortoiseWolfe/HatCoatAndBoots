import type { Metadata } from 'next';
import ErrorBoundary from '@/components/ErrorBoundary';
import BookShell from '@/components/architecture/BookShell';

export const metadata: Metadata = {
  title: 'The Boots — Hats, Coats, and Boots',
  description:
    'The foundation that lifts the structure above wet ground. Coming soon.',
};

/**
 * `/book/boots` — foundation focus. The SAME shared viewer as every page
 * (FR-007): the whole building stays visible and byte-identically positioned,
 * focused on the footing (foundation) region, while the chapter's teaching
 * content shows a "coming soon" state in the rail. NOT a blank page — the
 * building is here and aligned with the Hat and Coat views.
 */
export default function BootsChapterPage() {
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
            chapterFocus="foundation"
            activeChapterId="boots"
            className="flex-1"
            narrative={
              <div>
                <h1
                  className="text-base leading-tight font-bold"
                  style={{ fontFamily: 'var(--font-blueprint)' }}
                >
                  The Boots — the foundation
                </h1>
                <p className="text-base-content mt-2 leading-relaxed">
                  What lifts the structure off the wet ground and keeps it
                  standing dry. This chapter is <strong>coming soon</strong> —
                  but the footing is already part of the building beside this
                  text; explore the whole structure while you wait.
                </p>
              </div>
            }
          />
        </ErrorBoundary>
      </section>
    </main>
  );
}
