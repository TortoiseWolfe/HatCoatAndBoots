import { describe, it, expect } from 'vitest';
import { hatManifest } from './hat.manifest';
import { isChapterManifest } from './types';

describe('hat manifest', () => {
  it('is a valid chapter manifest', () => {
    expect(isChapterManifest(hatManifest)).toBe(true);
  });

  it('every step.dockedLayerIds references a real layer id', () => {
    const ids = new Set(hatManifest.layers.map((l) => l.id));
    for (const step of hatManifest.steps)
      for (const id of step.dockedLayerIds) expect(ids.has(id)).toBe(true);
  });

  it('every layer src points under book/hat/', () => {
    for (const l of hatManifest.layers)
      expect(l.src).toMatch(/^book\/hat\/.+\.svg$/);
  });

  it('has the 7 Hat layers', () => {
    expect(hatManifest.layers.map((l) => l.id).sort()).toEqual(
      [
        'footing',
        'rain',
        'roof-overhang',
        'sun-high',
        'sun-low',
        'wall',
        'window',
      ].sort()
    );
  });
});
