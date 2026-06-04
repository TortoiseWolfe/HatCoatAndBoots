import { describe, it, expect } from 'vitest';
import { getChapter, CHAPTER_SLUGS } from './index';
import { isChapterManifest } from './types';

describe('all chapters', () => {
  it('hat, coat, boots all resolve to valid manifests', () => {
    expect([...CHAPTER_SLUGS].sort()).toEqual(['boots', 'coat', 'hat']);
    for (const slug of CHAPTER_SLUGS) {
      const m = getChapter(slug)!;
      expect(isChapterManifest(m)).toBe(true);
    }
  });

  it('every step.dockedLayerIds references a real layer in that chapter', () => {
    for (const slug of CHAPTER_SLUGS) {
      const m = getChapter(slug)!;
      const ids = new Set(m.layers.map((l) => l.id));
      for (const step of m.steps)
        for (const id of step.dockedLayerIds)
          expect(ids.has(id), `${slug}/${step.id} → ${id}`).toBe(true);
    }
  });

  it('every spotlightLayerId references a real layer', () => {
    for (const slug of CHAPTER_SLUGS) {
      const m = getChapter(slug)!;
      const ids = new Set(m.layers.map((l) => l.id));
      for (const step of m.steps)
        if (step.spotlightLayerId)
          expect(ids.has(step.spotlightLayerId)).toBe(true);
    }
  });

  it('every layer src points under the right book chapter folder', () => {
    for (const slug of CHAPTER_SLUGS) {
      const m = getChapter(slug)!;
      for (const l of m.layers)
        expect(l.src).toMatch(/^book\/(hat|coat|boots)\/.+\.svg$/);
    }
  });

  it('coat and boots are real chapters now (not coming-soon stubs)', () => {
    expect(getChapter('coat')!.layers.length).toBeGreaterThan(3);
    expect(getChapter('boots')!.layers.length).toBeGreaterThan(3);
    // Each has the authored intro + sources wired in.
    for (const slug of ['hat', 'coat', 'boots']) {
      const m = getChapter(slug)!;
      expect(m.intro?.length ?? 0).toBeGreaterThanOrEqual(3);
      expect(m.sources?.length ?? 0).toBeGreaterThanOrEqual(4);
    }
  });
});
