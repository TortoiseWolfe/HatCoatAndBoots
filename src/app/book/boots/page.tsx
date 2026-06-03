import type { Metadata } from 'next';
import ErrorBoundary from '@/components/ErrorBoundary';
import BookShell from '@/components/architecture/BookShell';
import { bootsManifest } from '@/components/architecture/manifests/boots.manifest';
import { bootsStrings } from '@/components/architecture/manifests/boots.strings';

export const metadata: Metadata = {
  title: bootsStrings.chapterTitle,
  description: bootsStrings.chapterSubtitle,
};

/**
 * `/book/boots` — foundation focus. The SAME BookShell as every book page, driven
 * by the Boots manifest (which shares the identical wall/window/footing/roof
 * geometry so the building stays byte-identically registered, FR-001a / SC-009).
 * The changing per-view explanation is the full-width band owned by
 * LayeredDiagram; the `narrative` slot carries only the compact chapter-level
 * extras (the <h1> + tagline + sources), plain SSR'd HTML so the heading, a key
 * line, and a sources link are readable with JavaScript disabled (the no-JS gate).
 * Prose is web-research fact-checked (see boots.strings.ts header); frost depth is
 * always stated as set by local code, never a universal number.
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
            manifest={bootsManifest}
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
                  {bootsStrings.chapterTitle}
                </h1>
                <span className="text-base-content italic">
                  hold it up, and keep it dry.
                </span>
                <span className="text-base-content ml-auto">
                  <span className="font-semibold">
                    {bootsStrings.sourcesHeading}:{' '}
                  </span>
                  {bootsStrings.sources.map((src, i) => (
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
