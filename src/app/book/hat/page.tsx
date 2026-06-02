import type { Metadata } from 'next';
import ErrorBoundary from '@/components/ErrorBoundary';
import BookShell from '@/components/architecture/BookShell';
import { hatStrings } from '@/components/architecture/manifests/strings';

export const metadata: Metadata = {
  title: hatStrings.chapterTitle,
  description: hatStrings.chapterSubtitle,
};

/**
 * `/book/hat` — roof focus. The SAME BookShell as every other book page, so the
 * building is byte-identically positioned when you navigate here (FR-001a /
 * SC-009). The ENTIRE chapter narrative lives in the LEFT RAIL beside the
 * building (it scrolls within its own column if long) — there is NO duplicate
 * prose block below the viewer, so the page is one screen with no page-level
 * scroll. The default `everything` view SSRs the full labelled composite (the
 * no-JS Hat gate, FR-008 / SC-002) and the rail prose is plain SSR'd HTML, so
 * the heading, body, and sources are all readable with JavaScript disabled.
 * Prose is web-research fact-checked
 * (see features/_uncategorized/048-hats-chapter/content-source.md).
 */
export default function HatChapterPage() {
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
          {/* The CHANGING per-view explanation is the chapter narrative (the
              full-width band, owned by LayeredDiagram). The `narrative` slot here
              carries only the compact chapter-level extras that aren't tied to a
              view: the chapter <h1> (heading; also the no-JS/SEO anchor) and the
              sources. One short row, not a duplicate of the changing text. */}
          <BookShell
            chapterFocus="roof"
            activeChapterId="hat"
            className="flex-1"
            narrative={
              <section
                aria-label="About this chapter"
                className="text-base-content flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xs"
              >
                <h1
                  className="text-sm font-bold"
                  style={{ fontFamily: 'var(--font-blueprint)' }}
                >
                  {hatStrings.chapterTitle}
                </h1>
                <span className="text-base-content italic">
                  no shutters, no sensors, no machines.
                </span>
                <span className="text-base-content ml-auto">
                  <span className="font-semibold">
                    {hatStrings.sourcesHeading}:{' '}
                  </span>
                  {hatStrings.sources.map((src, i) => (
                    <span key={src.url}>
                      {i > 0 && ' · '}
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link"
                      >
                        {src.title}
                      </a>
                    </span>
                  ))}
                </span>
              </section>
            }
          />
        </ErrorBoundary>
      </section>
    </main>
  );
}
