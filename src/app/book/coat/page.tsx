import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'The Coat — coming soon',
  description: 'The insulated thermal envelope. Coming soon.',
};

/**
 * `/book/coat` — envelope focus. Scaffold this slice; the shared building with
 * `chapterFocus="envelope"` + "coming soon" content is wired in a later slice (US3).
 */
export default function CoatChapterPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold">The Coat</h1>
      <p className="mt-2">Coming soon.</p>
    </main>
  );
}
