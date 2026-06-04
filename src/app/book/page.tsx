import Link from 'next/link';
import {
  CHAPTER_SLUGS,
  getChapter,
} from '@/components/organisms/BookViewer/manifests';

export default function BookIndex() {
  return (
    <main className="container mx-auto px-4 py-6">
      <h1 className="font-blueprint text-3xl font-bold">The Book</h1>
      <ul className="mt-4 flex flex-col gap-2">
        {CHAPTER_SLUGS.map((slug) => (
          <li key={slug}>
            <Link href={`/book/${slug}`} className="btn btn-ghost">
              {getChapter(slug)?.meta.title ?? slug}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
