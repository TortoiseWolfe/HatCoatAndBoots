import type { Metadata } from 'next';
import { hatStrings } from '@/components/architecture/manifests/strings';

export const metadata: Metadata = {
  title: hatStrings.chapterTitle,
  description: hatStrings.chapterSubtitle,
};

/**
 * `/book/hat` — roof focus, full content. Scaffold this slice.
 *
 * Step 3 (T027) replaces this with the Server Component that SSR-renders the full
 * composite (`renderLayerStack` with ALL layers visible — the no-JS Hat gate) and
 * hydrates `<ErrorBoundary level="section"><HatViewer/></ErrorBoundary>` on top.
 */
export default function HatChapterPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold">{hatStrings.chapterTitle}</h1>
      <p className="mt-2 italic">{hatStrings.chapterSubtitle}</p>
    </main>
  );
}
