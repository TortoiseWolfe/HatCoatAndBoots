import { notFound } from 'next/navigation';
import { ChapterViewer } from '@/components/organisms/BookViewer';
import {
  getChapter,
  CHAPTER_SLUGS,
} from '@/components/organisms/BookViewer/manifests';

export function generateStaticParams() {
  return CHAPTER_SLUGS.map((chapter) => ({ chapter }));
}

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ chapter: string }>;
}) {
  const { chapter } = await params;
  const manifest = getChapter(chapter);
  if (!manifest) notFound();
  return (
    <main className="container mx-auto px-4 py-6">
      <ChapterViewer manifest={manifest} />
    </main>
  );
}
