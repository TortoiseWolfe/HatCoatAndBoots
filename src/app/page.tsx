import Link from 'next/link';
import {
  CHAPTER_SLUGS,
  getChapter,
} from '@/components/organisms/BookViewer/manifests';

// ── The book cover / front door. Audience is a reader (ages 13–18). Three
//     chapters — Hat, Coat, Boots — each a focus on the same shared building.
//     Server component: zero client JS. ──

export const metadata = {
  title: 'HatCoatAndBoots — a building book',
  description:
    'An interactive book about how buildings work: the Hat (roof), the Coat (walls), and the Boots (foundation).',
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
        aria-labelledby="cover-heading"
        className="mx-auto w-full max-w-5xl flex-1 px-4 py-12 sm:px-6 lg:py-20"
      >
        {/* Cover header */}
        <div className="text-center">
          <h1
            id="cover-heading"
            className="font-blueprint text-base-content text-4xl font-bold sm:text-5xl"
          >
            Hat, Coat &amp; Boots
          </h1>
          <p className="text-base-content/80 mx-auto mt-4 max-w-2xl text-lg leading-relaxed">
            Every building does three jobs at once. A roof is its{' '}
            <strong>hat</strong>, the walls its <strong>coat</strong>, and the
            foundation its <strong>boots</strong>. Pull each one apart and see
            how it works — no machines, just good design.
          </p>
        </div>

        {/* Three chapter cards */}
        <ul className="mt-10 grid gap-6 sm:grid-cols-3">
          {CHAPTER_SLUGS.map((slug, i) => {
            const chapter = getChapter(slug);
            if (!chapter) return null;
            return (
              <li key={slug}>
                <Link
                  href={`/book/${slug}`}
                  className="border-base-300 bg-base-100 hover:border-primary group flex h-full flex-col rounded-xl border p-6 transition-colors"
                >
                  <span className="text-base-content/50 text-sm font-bold tracking-wider uppercase">
                    Chapter {i + 1}
                  </span>
                  <span className="font-blueprint text-base-content group-hover:text-primary mt-1 text-2xl font-bold">
                    {chapter.meta.title}
                  </span>
                  <span className="text-base-content/80 mt-2 leading-relaxed">
                    {chapter.meta.kicker}
                  </span>
                  <span className="text-primary mt-4 text-sm font-semibold">
                    Start reading →
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}
