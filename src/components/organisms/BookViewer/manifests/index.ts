import type { ChapterManifest } from './types';
import { hatManifest } from './hat.manifest';
import { coatManifest } from './coat.manifest';
import { bootsManifest } from './boots.manifest';

const CHAPTERS: Record<string, ChapterManifest> = {
  hat: hatManifest,
  coat: coatManifest,
  boots: bootsManifest,
};

export const CHAPTER_SLUGS = Object.keys(CHAPTERS);

export function getChapter(slug: string): ChapterManifest | undefined {
  return CHAPTERS[slug];
}
