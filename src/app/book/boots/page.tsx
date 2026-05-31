import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'The Boots — coming soon',
  description:
    'The foundation that lifts the structure above wet ground. Coming soon.',
};

/**
 * `/book/boots` — foundation focus. Scaffold this slice; the shared building with
 * `chapterFocus="foundation"` + "coming soon" content is wired in a later slice (US3).
 */
export default function BootsChapterPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold">The Boots</h1>
      <p className="mt-2">Coming soon.</p>
    </main>
  );
}
