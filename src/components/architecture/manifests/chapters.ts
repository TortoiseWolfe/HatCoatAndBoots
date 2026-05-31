/**
 * The chapter focus registry — the three records (hat/coat/boots) in reading
 * order. The `/book` index is NOT a fourth record; it is the same viewer mounted
 * with `chapterFocus={null}`. `book/layout.tsx` derives prev/next nav from this
 * array order, and the coming-soon state from `available`.
 */

import type { ChapterFocusRecord } from './types';

export const chapters: ChapterFocusRecord[] = [
  {
    id: 'hat',
    label: 'Hat',
    region: 'roof',
    available: true,
    href: '/book/hat',
  },
  {
    id: 'coat',
    label: 'Coat',
    region: 'envelope',
    available: false,
    href: '/book/coat',
  },
  {
    id: 'boots',
    label: 'Boots',
    region: 'foundation',
    available: false,
    href: '/book/boots',
  },
];
