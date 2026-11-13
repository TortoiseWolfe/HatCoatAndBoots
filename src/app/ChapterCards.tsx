import Link from 'next/link';
import {
  CHAPTER_SLUGS,
  getChapter,
} from '@/components/organisms/BookViewer/manifests';

/**
 * The three chapter cards, shared by the cover and the book index so both doors
 * into the book look and read the same. Server component: zero client JS.
 */
export function ChapterCards() {
  return (
    <ul className="grid gap-6 sm:grid-cols-3">
      {CHAPTER_SLUGS.map((slug, i) => {
        const chapter = getChapter(slug);
        if (!chapter) return null;
        return (
          <li key={slug}>
            <Link
              href={`/book/${slug}`}
              className="border-base-300 bg-base-100 hover:border-primary hover:shadow-md focus-visible:outline-primary group flex h-full min-h-11 flex-col rounded-xl border p-6 shadow-sm transition focus-visible:outline-4 focus-visible:outline-offset-2"
            >
              <span className="text-base-content/70 text-sm font-bold tracking-wider uppercase">
                Chapter {i + 1}
              </span>
              <span className="font-blueprint text-base-content group-hover:text-primary mt-1 text-2xl font-bold">
                {chapter.meta.title}
              </span>
              <span className="text-base-content/80 mt-2 text-lg leading-relaxed">
                {chapter.meta.kicker}
              </span>
              <span className="text-primary mt-auto pt-4 text-base font-semibold">
                Start reading →
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export default ChapterCards;
