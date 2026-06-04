import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExplodedBuilding } from './ExplodedBuilding';
import type { Layer } from '../BookViewer/manifests/types';

const LAYERS: Layer[] = [
  {
    id: 'roof-overhang',
    src: 'book/hat/roof-overhang.svg',
    label: 'Roof overhang',
    alt: 'roof',
    tabColor: '#c8714a',
    tabWord: 'ROOF',
    z: 40,
    explodeOffset: { x: 0, y: -60 },
    bbox: { x: 110, y: 62, w: 188, h: 88 },
  },
  {
    id: 'wall',
    src: 'book/hat/wall.svg',
    label: 'Walls',
    alt: 'wall',
    tabColor: '#c9a86a',
    tabWord: 'WALL',
    z: 20,
    explodeOffset: { x: 0, y: 0 },
    bbox: { x: 148, y: 116, w: 96, h: 188 },
  },
];

describe('ExplodedBuilding', () => {
  it('renders one button per layer with an accessible name + pressed state', () => {
    render(
      <ExplodedBuilding
        chapter="hat"
        layers={LAYERS}
        isDocked={() => true}
        onToggle={() => {}}
      />
    );
    const roof = screen.getByRole('button', { name: /roof overhang/i });
    expect(roof).toHaveAttribute('aria-pressed', 'true');
  });

  it('reflects exploded state via aria-pressed=false', () => {
    render(
      <ExplodedBuilding
        chapter="hat"
        layers={LAYERS}
        isDocked={(id) => id !== 'roof-overhang'}
        onToggle={() => {}}
      />
    );
    expect(
      screen.getByRole('button', { name: /roof overhang/i })
    ).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls onToggle with the layer id when a part is activated', () => {
    const onToggle = vi.fn();
    render(
      <ExplodedBuilding
        chapter="hat"
        layers={LAYERS}
        isDocked={() => true}
        onToggle={onToggle}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /walls/i }));
    expect(onToggle).toHaveBeenCalledWith('wall');
  });

  it('renders the building as ONE shared inline <svg> with a <g> per layer (not stacked <img>s)', () => {
    const { container } = render(
      <ExplodedBuilding
        chapter="hat"
        layers={LAYERS}
        isDocked={() => true}
        onToggle={() => {}}
      />
    );
    // Exactly one building SVG, and no <img> layers at all.
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBe(1);
    expect(container.querySelectorAll('img').length).toBe(0);
    // One translatable group per layer, inside the shared viewBox.
    expect(svgs[0].getAttribute('viewBox')).toBe('0 0 360 360');
    expect(svgs[0].querySelectorAll('g.book-layer').length).toBe(LAYERS.length);
  });

  it('docked layers translate to 0,0; exploded layers translate by their offset', () => {
    const { container, rerender } = render(
      <ExplodedBuilding
        chapter="hat"
        layers={LAYERS}
        isDocked={() => true}
        onToggle={() => {}}
      />
    );
    const groups = () =>
      Array.from(container.querySelectorAll('g.book-layer')).map((g) =>
        g.getAttribute('transform')
      );
    // All docked → all translate(0 0).
    expect(groups().every((t) => t === 'translate(0 0)')).toBe(true);
    // Explode the roof (offset y:-60) → its group translates away from origin.
    rerender(
      <ExplodedBuilding
        chapter="hat"
        layers={LAYERS}
        isDocked={(id) => id !== 'roof-overhang'}
        onToggle={() => {}}
      />
    );
    expect(groups()).toContain('translate(0 -60)');
  });
});
