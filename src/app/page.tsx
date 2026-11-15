import Link from 'next/link';
import { hatManifest } from '@/components/organisms/BookViewer/manifests/hat.manifest';
import { SVG_BODIES } from '@/components/organisms/ExplodedBuilding/svg-bodies.generated';
import { ChapterCards } from './ChapterCards';

// ── The book cover / front door. Audience is a reader (ages 13–18). Three
//     chapters — Hat, Coat, Boots — each a focus on the same shared building.
//     Server component: zero client JS. ──

export const metadata = {
  title: 'HatCoatAndBoots — a building book',
  description:
    'An interactive book about how buildings work: the Hat (roof), the Coat (walls), and the Boots (foundation).',
};

// The assembled house from the Hat chapter's own art, drawn once as a static
// picture (the chapters are where it comes apart).
const COVER_LAYERS = [...hatManifest.layers].sort((a, b) => a.z - b.z);
function bodyFor(src: string): string {
  const m = src.match(/book\/([^/]+)\/([^/]+)\.svg$/);
  return m ? (SVG_BODIES[m[1]]?.[m[2]] ?? '') : '';
}

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
        className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6 lg:py-16"
      >
        {/* Cover: title and invitation beside the house */}
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="text-center lg:text-left">
            <h1
              id="cover-heading"
              className="font-blueprint text-base-content text-4xl font-bold sm:text-5xl"
            >
              Hat, Coat &amp; Boots
            </h1>
            <p className="text-base-content/90 mt-4 text-lg leading-relaxed sm:text-xl">
              Every building does three jobs at once. A roof is its{' '}
              <strong>hat</strong>, the walls its <strong>coat</strong>, and the
              foundation its <strong>boots</strong>. Pull each one apart and see
              how it works — no machines, just good design.
            </p>
            <Link
              href="/book/hat"
              className="btn btn-primary mt-6 min-h-12 px-8 text-base"
            >
              Start with the Hat →
            </Link>
          </div>

          <div
            role="img"
            aria-label="A small house, drawn in layers: a roof with a wide brim, an insulated wall with a window, and a footing in the ground."
            className="book-sky relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-2xl shadow-lg"
          >
            <svg
              viewBox="0 0 360 360"
              aria-hidden="true"
              className="absolute inset-0 h-full w-full"
              preserveAspectRatio="xMidYMid meet"
            >
              {COVER_LAYERS.map((layer) => (
                <g
                  key={layer.id}
                  dangerouslySetInnerHTML={{ __html: bodyFor(layer.src) }}
                />
              ))}
            </svg>
          </div>
        </div>

        {/* Three chapter cards */}
        <h2 className="sr-only">Chapters</h2>
        <div className="mt-12">
          <ChapterCards />
        </div>
      </section>
    </main>
  );
}
