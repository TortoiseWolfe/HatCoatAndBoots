import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExplodedBuilding } from './ExplodedBuilding';
import type { Layer } from '../BookViewer/manifests/types';

const LAYERS: Layer[] = [
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
];

describe('ExplodedBuilding', () => {
  it('renders one button per layer with an accessible name + pressed state', () => {
    render(
      <ExplodedBuilding
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
        layers={LAYERS}
        isDocked={(id) => id !== 'roof'}
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
        layers={LAYERS}
        isDocked={() => true}
        onToggle={onToggle}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /walls/i }));
    expect(onToggle).toHaveBeenCalledWith('wall');
  });

  it('renders each layer SVG as an <img> (never next/image) with the basePath-resolved src', () => {
    render(
      <ExplodedBuilding
        layers={LAYERS}
        isDocked={() => true}
        onToggle={() => {}}
      />
    );
    const img = screen.getByAltText('wall') as HTMLImageElement;
    expect(img.tagName).toBe('IMG');
    expect(img.getAttribute('src')).toContain('book/hat/wall.svg');
  });
});
