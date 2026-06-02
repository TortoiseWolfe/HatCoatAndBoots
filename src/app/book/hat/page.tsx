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
 * SC-009). The chapter title + intro live in the LEFT RAIL (chapterContent), NOT
 * above the building — that is what keeps the centre stage from moving. The
 * default `everything` view SSRs the full labelled composite (the no-JS Hat
 * gate, FR-008 / SC-002); the controls hydrate over it. Sources + why-it-matters
 * sit BELOW the fixed-position viewer. Prose is web-research fact-checked
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
          <BookShell
            chapterFocus="roof"
            activeChapterId="hat"
            className="flex-1"
            chapterContent={
              <div className="border-base-300 bg-base-100 rounded-lg border p-3">
                <h1
                  className="text-base leading-tight font-bold"
                  style={{ fontFamily: 'var(--font-blueprint)' }}
                >
                  {hatStrings.chapterTitle}
                </h1>
                <p className="text-base-content mt-1 text-sm italic">
                  {hatStrings.chapterSubtitle}
                </p>
                <div className="mt-2 space-y-2">
                  {hatStrings.intro.map((para, i) => (
                    <p
                      key={i}
                      className="text-base-content text-sm leading-relaxed"
                    >
                      {para}
                    </p>
                  ))}
                </div>
              </div>
            }
          />
        </ErrorBoundary>
      </section>

      {/* Long-form chapter text BELOW the fixed-position viewer. */}
      <div className="mx-auto w-full max-w-3xl px-4 pb-12">
        <aside className="border-base-300 bg-base-100 mt-4 rounded-lg border p-4">
          <p className="text-base-content text-sm leading-relaxed">
            {hatStrings.sourcedAside}
          </p>
        </aside>

        <section className="border-base-300 mt-6 border-t pt-6">
          <p className="text-base-content leading-relaxed">
            {hatStrings.whyItMatters}
          </p>
        </section>

        <footer className="border-base-300 mt-8 border-t pt-4 text-sm">
          <h2 className="mb-2 font-semibold">{hatStrings.sourcesHeading}</h2>
          <ul className="text-base-content list-disc space-y-1 pl-5">
            {hatStrings.sources.map((src) => (
              <li key={src.url}>
                <a
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link"
                >
                  {src.title}
                </a>
              </li>
            ))}
          </ul>
        </footer>
      </div>
    </main>
  );
}
