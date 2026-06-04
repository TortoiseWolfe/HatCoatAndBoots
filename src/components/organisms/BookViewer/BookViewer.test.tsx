import { describe, it, expect, beforeAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChapterViewer } from './BookViewer';
import type { ChapterManifest } from './manifests/types';

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
      alt: 'wall',
      tabColor: '#c9a86a',
      tabWord: 'WALL',
      z: 20,
      explodeOffset: { x: 0, y: 0 },
    },
    {
      id: 'roof',
      src: 'book/hat/roof-overhang.svg',
      label: 'Roof overhang',
      alt: 'roof',
      tabColor: '#c8714a',
      tabWord: 'ROOF',
      z: 40,
      explodeOffset: { x: 0, y: -60 },
    },
  ],
  steps: [
    {
      id: 's0',
      heading: 'Walls first',
      prose: 'Start with the walls.',
      dockedLayerIds: ['wall'],
    },
    {
      id: 's1',
      heading: 'Add the roof',
      prose: 'Now the roof.',
      dockedLayerIds: ['wall', 'roof'],
    },
  ],
};

describe('ChapterViewer', () => {
  it('shows step 0 heading + docks step 0 layers', () => {
    render(<ChapterViewer manifest={HAT} />);
    expect(
      screen.getByRole('heading', { name: /walls first/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /walls/i })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(
      screen.getByRole('button', { name: /roof overhang/i })
    ).toHaveAttribute('aria-pressed', 'false');
  });

  it('Next advances the story and docks the next beat layers', () => {
    render(<ChapterViewer manifest={HAT} />);
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(
      screen.getByRole('heading', { name: /add the roof/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /roof overhang/i })
    ).toHaveAttribute('aria-pressed', 'true');
  });

  it('tapping a part flips to reader mode and shows "back to the story"', () => {
    render(<ChapterViewer manifest={HAT} />);
    fireEvent.click(screen.getByRole('button', { name: /walls/i })); // undock wall
    expect(screen.getByRole('button', { name: /walls/i })).toHaveAttribute(
      'aria-pressed',
      'false'
    );
    expect(
      screen.getByRole('button', { name: /back to the story/i })
    ).toBeInTheDocument();
  });

  it('renders exactly one h1 (chapter title) for heading order', () => {
    render(<ChapterViewer manifest={HAT} />);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });
});
