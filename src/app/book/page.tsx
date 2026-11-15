import { ChapterCards } from '@/app/ChapterCards';

export const metadata = {
  title: 'The Book — Hat, Coat & Boots',
  description:
    'Three chapters on how buildings work: the Hat (roof), the Coat (walls), and the Boots (foundation).',
};

export default function BookIndex() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="font-blueprint text-base-content text-3xl font-bold sm:text-4xl">
        The Book
      </h1>
      <p className="text-base-content/80 mt-3 mb-8 max-w-2xl text-lg leading-relaxed">
        Three chapters, one house. Read them in order or start anywhere.
      </p>
      <ChapterCards />
    </main>
  );
}
