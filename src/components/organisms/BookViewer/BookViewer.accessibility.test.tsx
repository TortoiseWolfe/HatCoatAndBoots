import { describe, it, expect, beforeAll } from 'vitest';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ChapterViewer } from './BookViewer';
import type { ChapterManifest } from './manifests/types';

expect.extend(toHaveNoViolations);

beforeAll(() => {
  class IO {
    observe() {}
    disconnect() {}
    unobserve() {}
  }
  // @ts-expect-error test stub
  globalThis.IntersectionObserver = IO;
});

const HAT: ChapterManifest = {
  slug: 'hat',
  meta: { title: 'The Hat', kicker: 'k' },
  layers: [
    {
      id: 'wall',
      src: 'book/hat/wall.svg',
      label: 'Walls',
      alt: '',
      tabColor: '#c9a86a',
      tabWord: 'WALL',
      z: 20,
      explodeOffset: { x: 0, y: 0 },
    },
  ],
  steps: [
    {
      id: 's0',
      heading: 'Walls first',
      prose: 'Start with the walls.',
      dockedLayerIds: ['wall'],
    },
  ],
};

describe('ChapterViewer Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<ChapterViewer manifest={HAT} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
