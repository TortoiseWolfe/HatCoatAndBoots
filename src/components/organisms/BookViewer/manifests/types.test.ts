import { describe, it, expect } from 'vitest';
import type { ChapterManifest, Layer, Step } from './types';
import { isChapterManifest } from './types';

describe('manifest types', () => {
  it('accepts a well-formed chapter manifest', () => {
    const wall: Layer = {
      id: 'wall',
      src: 'book/hat/wall.svg',
      label: 'Walls',
      alt: 'The insulated wall',
      tabColor: '#c9a86a',
      tabWord: 'WALL',
      z: 20,
      explodeOffset: { x: 0, y: 0 },
      bbox: { x: 148, y: 116, w: 96, h: 188 },
    };
    const step: Step = {
      id: 'whole',
      heading: 'A house is layers',
      prose: 'Every building is a stack of jobs.',
      dockedLayerIds: ['wall'],
    };
    const manifest: ChapterManifest = {
      slug: 'hat',
      meta: { title: 'The Hat', kicker: 'Why a roof needs a brim' },
      layers: [wall],
      steps: [step],
    };
    expect(isChapterManifest(manifest)).toBe(true);
  });

  it('rejects a manifest missing steps', () => {
    expect(isChapterManifest({ slug: 'hat', meta: {}, layers: [] })).toBe(
      false
    );
  });
});
