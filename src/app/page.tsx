import Link from 'next/link';
import type { Metadata } from 'next';
import ErrorBoundary from '@/components/ErrorBoundary';
import HatViewer from '@/components/architecture/HatViewer';
import { chapters } from '@/components/architecture/manifests/chapters';

// ── The home page IS the book. You land looking at the building and you take
//     it apart, layer by layer — the interactive blueprint is the centerpiece,
//     not a brochure. The viewer (HatViewer → LayeredDiagram) is the same
//     graphical interface the chapters use; the chapter links below it drop you
//     into a focused lesson on one part. Server component; the viewer is a
//     'use client' island hydrating over the SSR'd composite.

export const metadata: Metadata = {
  title: 'Hats, Coats, and Boots — an interactive book on building with nature',
  description:
    'Take the building apart layer by layer. An interactive, illustrated book on sustainable natural building — why a good building wears a hat (roof overhang), a coat (insulated walls), and boots (a dry foundation).',
};

const CHAPTER_BLURB: Record<string, string> = {
  hat: 'the roof overhang — blocks summer sun, lets in winter sun, sheds the rain',
  coat: 'the insulated walls — the envelope that holds comfort in',
  boots: 'the foundation — what keeps it standing dry',
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

      <section
        id="main-content"
        aria-labelledby="hero-heading"
        className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 lg:px-8 lg:py-12"
      >
        {/* The hook — tight, one breath, then the building. */}
        <div className="mb-6 text-center">
          <h1
            id="hero-heading"
            className="text-3xl leading-tight font-bold sm:text-4xl lg:text-5xl"
            style={{ fontFamily: 'var(--font-blueprint)' }}
          >
            Why does a good building wear a hat, a coat, and boots?
          </h1>
          <p className="text-base-content mx-auto mt-3 max-w-2xl text-lg leading-relaxed">
            Here’s the whole building. Take it apart, one layer at a time, and
            see <em>why</em> the old, low-energy ways of building actually work
            — no machines required.
          </p>
        </div>

        {/* THE BOOK: the interactive blueprint. Same engine the chapters use,
            mounted right on the front page. SSRs the full labeled composite,
            then hydrates into the live viewer (guided views + layer toggles). */}
        <ErrorBoundary level="section">
          <HatViewer />
        </ErrorBoundary>

        <p className="text-base-content mt-4 text-center text-sm">
          Drag the guided views and toggle the parts on and off — then go deeper
          into a chapter.
        </p>
      </section>

      {/* Chapter entry points — go deeper into one part. */}
      <section aria-label="Chapters" className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-5xl flex-col gap-4">
          <h2 className="sr-only">Chapters</h2>
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {chapters.map((chapter) => {
              const inner = (
                <div className="card-body gap-1 p-5">
                  <div className="flex items-center justify-between">
                    <h3
                      className="card-title text-xl"
                      style={{ fontFamily: 'var(--font-blueprint)' }}
                    >
                      The {chapter.label}
                    </h3>
                    {chapter.available ? (
                      <span className="badge badge-primary badge-sm">
                        Read now
                      </span>
                    ) : (
                      <span className="badge badge-neutral badge-sm">
                        Coming soon
                      </span>
                    )}
                  </div>
                  <p className="text-base-content text-sm leading-relaxed">
                    {CHAPTER_BLURB[chapter.id]}
                  </p>
                </div>
              );
              return (
                <li key={chapter.id}>
                  {chapter.available ? (
                    <Link
                      href={chapter.href}
                      className="card bg-base-100 border-base-300 focus-within:ring-primary block h-full border shadow-md transition-all focus-within:ring-2 hover:-translate-y-1 hover:shadow-lg"
                    >
                      {inner}
                    </Link>
                  ) : (
                    <div className="card bg-base-100 border-base-300 h-full border shadow-sm">
                      {inner}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </main>
  );
}
