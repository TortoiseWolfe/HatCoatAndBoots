import Link from 'next/link';
import type { Metadata } from 'next';
import { LayeredHatCoatAndBootsLogo } from '@/components/atomic/SpinningLogo';
import { AnimatedLogo } from '@/components/atomic/AnimatedLogo';
import { detectedConfig } from '@/config/project-detected';
import { chapters } from '@/components/architecture/manifests/chapters';

// ── The book's front door. Audience is a curious reader (ages 13–18) — and
//     anyone who lands on the site. The home page IS the book's cover: the
//     Hats-Coats-Boots premise, then a clear way into the chapters. Server
//     component; the spinning logo + animated title are 'use client' islands.

export const metadata: Metadata = {
  title: 'Hats, Coats, and Boots — a book on building with nature',
  description:
    'Why does a good building wear a hat, a coat, and boots? An illustrated, interactive book on sustainable natural building — start with the Hat: the roof overhang.',
};

// One-line "what this part does" for each chapter, keyed to the registry.
const CHAPTER_BLURB: Record<string, { tagline: string; body: string }> = {
  hat: {
    tagline: 'the roof overhang',
    body: 'A generous eave blocks the high summer sun, lets in the low winter sun, and throws rain clear of the wall — comfort for free, no machines.',
  },
  coat: {
    tagline: 'the insulated walls',
    body: 'The thermal envelope that keeps warmth in and weather out — how a building stays comfortable through the seasons.',
  },
  boots: {
    tagline: 'the foundation',
    body: 'What lifts the structure off the wet ground and keeps it standing dry, year after year.',
  },
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

      {/* ── Hero: the premise ───────────────────────────────────────────── */}
      <section
        id="main-content"
        aria-labelledby="hero-heading"
        className="mx-auto w-full max-w-6xl flex-1 px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
      >
        <div className="flex flex-col items-center gap-8 lg:flex-row lg:gap-16">
          <div className="flex-shrink-0">
            <div className="h-48 w-48 sm:h-52 sm:w-52 md:h-56 md:w-56 lg:h-[350px] lg:w-[350px]">
              <LayeredHatCoatAndBootsLogo speed="slow" pauseOnHover />
            </div>
          </div>

          <div className="text-center lg:text-left">
            <h1 id="hero-heading" className="mb-4 sm:mb-6">
              <AnimatedLogo
                text={detectedConfig.projectName}
                className="!text-2xl font-bold sm:!text-3xl md:!text-5xl lg:!text-6xl"
                animationSpeed="normal"
              />
            </h1>

            <p
              className="text-base-content/90 mb-3 text-xl font-semibold sm:text-2xl"
              style={{ fontFamily: 'var(--font-blueprint)' }}
            >
              Why does a good building wear a hat, a coat, and boots?
            </p>

            <p className="text-base-content/80 mb-8 max-w-2xl text-lg leading-relaxed">
              An interactive, illustrated book on building with nature instead
              of against it. Each chapter is a living blueprint you can take
              apart one layer at a time — to see <em>why</em> the old,
              low-energy ways of building actually work. Start with the Hat: the
              roof overhang that cools you in summer and warms you in winter,
              with no machines at all.
            </p>

            <nav
              aria-label="Primary actions"
              className="flex flex-col items-center gap-4 sm:flex-row lg:items-start"
            >
              <Link
                href="/book/hat"
                className="btn btn-primary btn-lg min-h-11 min-w-11"
              >
                Start reading: the Hat
              </Link>
              <Link
                href="/book"
                className="link link-hover text-base-content inline-flex min-h-11 items-center gap-2 text-sm"
              >
                or browse all chapters
                <span aria-hidden="true">→</span>
              </Link>
            </nav>
          </div>
        </div>
      </section>

      {/* ── Chapter cards ───────────────────────────────────────────────── */}
      <section
        aria-label="Chapters"
        className="px-4 pt-4 pb-16 sm:px-6 lg:px-8"
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-6">
          <h2
            className="text-center text-2xl font-bold sm:text-left"
            style={{ fontFamily: 'var(--font-blueprint)' }}
          >
            The three chapters
          </h2>

          <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {chapters.map((chapter) => {
              const blurb = CHAPTER_BLURB[chapter.id];
              const card = (
                <>
                  <div className="card-body gap-2 p-6">
                    <div className="flex items-center justify-between">
                      <h3
                        className="card-title text-2xl"
                        style={{ fontFamily: 'var(--font-blueprint)' }}
                      >
                        The {chapter.label}
                      </h3>
                      {chapter.available ? (
                        <span className="badge badge-primary badge-sm">
                          Read now
                        </span>
                      ) : (
                        <span className="badge badge-ghost badge-sm">
                          Coming soon
                        </span>
                      )}
                    </div>
                    <p className="text-base-content/70 text-sm font-medium">
                      {blurb.tagline}
                    </p>
                    <p className="text-base-content/80 text-sm leading-relaxed">
                      {blurb.body}
                    </p>
                  </div>
                </>
              );

              return (
                <li key={chapter.id}>
                  {chapter.available ? (
                    <Link
                      href={chapter.href}
                      className="card bg-base-100 border-base-300 focus-within:ring-primary block h-full border shadow-md transition-all focus-within:ring-2 hover:-translate-y-1 hover:shadow-lg"
                    >
                      {card}
                    </Link>
                  ) : (
                    <div className="card bg-base-100 border-base-300 h-full border opacity-70 shadow-sm">
                      {card}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          <p className="text-base-content/70 mx-auto max-w-2xl text-center text-sm leading-relaxed">
            It’s one building, drawn once — every chapter just brings a
            different part into focus. The best-designed things don’t only avoid
            harm; they give something back, the way a tree gives shade.
          </p>
        </div>
      </section>
    </main>
  );
}
