import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'The Book — Hats, Coats, and Boots',
  description:
    'One building, three lessons: the Hat (roof overhang), the Coat (insulated walls), and the Boots (foundation).',
};

/**
 * `/book` index — the same shared viewer in the neutral no-focus state.
 * Scaffold this slice; the neutral `chapterFocus={null}` composite is wired in a
 * later slice (US3). For now it links to the chapters.
 */
export default function BookIndexPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold">Hats, Coats, and Boots</h1>
      <p className="mt-2">Pick a chapter to begin.</p>
      <ul className="mt-4 list-disc pl-6">
        <li>
          <a className="link" href="/book/hat">
            The Hat — the roof overhang
          </a>
        </li>
        <li>The Coat — coming soon</li>
        <li>The Boots — coming soon</li>
      </ul>
    </main>
  );
}
