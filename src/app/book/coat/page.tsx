import type { Metadata } from 'next';
import ErrorBoundary from '@/components/ErrorBoundary';
import BookShell from '@/components/architecture/BookShell';
import { coatManifest } from '@/components/architecture/manifests/coat.manifest';
import { coatStrings } from '@/components/architecture/manifests/coat.strings';

export const metadata: Metadata = {
  title: coatStrings.chapterTitle,
  description: coatStrings.chapterSubtitle,
};

/**
 * `/book/coat` — envelope focus. The SAME BookShell as every book page, driven by
 * the Coat manifest (which shares the identical wall/window/footing/roof geometry
 * so the building stays byte-identically registered, FR-001a / SC-009). The
 * changing per-view explanation is the full-width band owned by LayeredDiagram;
 * the `narrative` slot carries only the compact chapter-level extras (the <h1> +
 * tagline + sources), which are plain SSR'd HTML so the heading, a key line, and
 * a sources link are readable with JavaScript disabled (the no-JS gate).
 * Prose is web-research fact-checked (see coat.strings.ts header).
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
            manifest={coatManifest}
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
                  {coatStrings.chapterTitle}
                </h1>
                <span className="text-base-content italic">
                  warmth in, moisture out — without a furnace.
                </span>
                <span className="text-base-content ml-auto">
                  <span className="font-semibold">
                    {coatStrings.sourcesHeading}:{' '}
                  </span>
                  {coatStrings.sources.map((src, i) => (
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
