import type { Metadata } from 'next';
import ErrorBoundary from '@/components/ErrorBoundary';
import HatViewer from '@/components/architecture/HatViewer';
import { hatStrings } from '@/components/architecture/manifests/strings';

export const metadata: Metadata = {
  title: hatStrings.chapterTitle,
  description: hatStrings.chapterSubtitle,
};

/**
 * `/book/hat` — roof focus, full content (T027).
 *
 * Server Component shell. The `HatViewer` island renders the shared building; in
 * its default `everything` view EVERY layer is visible, so the server-rendered
 * HTML is the complete labeled composite — the no-JS / print / crawler Hat gate
 * (FR-008 / SC-002). With scripts on, the island hydrates over that same stack
 * and the controls become live. The ErrorBoundary's section fallback keeps the
 * SSR composite readable if hydration ever throws (Principle V "graceful failure").
 *
 * Every claim in the prose is web-research fact-checked and the Sources are real
 * (see features/_uncategorized/048-hats-chapter/content-source.md).
 */
export default function HatChapterPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <header className="mb-6">
        <h1
          className="text-3xl leading-tight font-bold"
          style={{ fontFamily: 'var(--font-blueprint)' }}
        >
          {hatStrings.chapterTitle}
        </h1>
        <p className="text-base-content/70 mt-1 text-lg italic">
          {hatStrings.chapterSubtitle}
        </p>
      </header>

      <section className="prose mb-8 max-w-none">
        {hatStrings.intro.map((para, i) => (
          <p key={i} className="mb-3 leading-relaxed">
            {para}
          </p>
        ))}
      </section>

      <ErrorBoundary level="section">
        <HatViewer />
      </ErrorBoundary>

      <aside className="border-base-300 bg-base-200/40 mt-8 rounded-lg border p-4">
        <p className="text-base-content/80 text-sm leading-relaxed">
          {hatStrings.sourcedAside}
        </p>
      </aside>

      <section className="border-base-300 mt-8 border-t pt-6">
        <p className="leading-relaxed">{hatStrings.whyItMatters}</p>
      </section>

      <footer className="border-base-300 mt-10 border-t pt-4 text-sm">
        <h2 className="mb-2 font-semibold">{hatStrings.sourcesHeading}</h2>
        <ul className="text-base-content/70 list-disc space-y-1 pl-5">
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
    </main>
  );
}
