import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LayerToggles } from './LayerToggles';
import type { Layer } from '@/components/organisms/BookViewer/manifests/types';

const LAYERS: Layer[] = [
  {
    id: 'roof-overhang',
    src: 'book/hat/roof-overhang.svg',
    label: 'Overhang',
    alt: '',
    tabColor: '#c8714a',
    tabWord: 'ROOF',
    z: 60,
    explodeOffset: { x: 0, y: -80 },
    bbox: { x: 110, y: 62, w: 188, h: 88 },
  },
  {
    id: 'wall',
    src: 'book/hat/wall.svg',
    label: 'Wall',
    alt: '',
    tabColor: '#c9a86a',
    tabWord: 'WALL',
    z: 20,
    explodeOffset: { x: 0, y: 0 },
    bbox: { x: 148, y: 116, w: 96, h: 188 },
  },
];

describe('LayerToggles', () => {
  it('renders one labeled toggle per layer with its name visible', () => {
    render(
      <LayerToggles layers={LAYERS} isDocked={() => true} onToggle={() => {}} />
    );
    expect(
      screen.getByRole('button', { name: /overhang/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /wall/i })).toBeInTheDocument();
  });

  it('reflects docked state via aria-pressed', () => {
    render(
      <LayerToggles
        layers={LAYERS}
        isDocked={(id) => id === 'wall'}
        onToggle={() => {}}
      />
    );
    expect(screen.getByRole('button', { name: /wall/i })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(screen.getByRole('button', { name: /overhang/i })).toHaveAttribute(
      'aria-pressed',
      'false'
    );
  });

  it('calls onToggle with the layer id when a chip is clicked', () => {
    const onToggle = vi.fn();
    render(
      <LayerToggles layers={LAYERS} isDocked={() => true} onToggle={onToggle} />
    );
    fireEvent.click(screen.getByRole('button', { name: /overhang/i }));
    expect(onToggle).toHaveBeenCalledWith('roof-overhang');
  });

  it('groups the toggles under an accessible label', () => {
    render(
      <LayerToggles layers={LAYERS} isDocked={() => true} onToggle={() => {}} />
    );
    expect(
      screen.getByRole('group', { name: /show or hide building parts/i })
    ).toBeInTheDocument();
  });
});
