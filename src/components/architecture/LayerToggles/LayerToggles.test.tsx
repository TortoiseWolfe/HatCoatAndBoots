import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LayerToggles from './LayerToggles';
import type { DiagramLayer } from '../manifests/types';

const layers: DiagramLayer[] = [
  {
    id: 'wall',
    src: 'book/hat/wall.svg',
    label: 'Wall',
    alt: '',
    decorative: true,
    region: 'envelope',
    z: 30,
    defaultVisible: true,
  },
  {
    id: 'roof-overhang',
    src: 'book/hat/roof-overhang.svg',
    label: 'Overhang',
    alt: '',
    decorative: true,
    region: 'roof',
    z: 40,
    defaultVisible: true,
  },
];

describe('LayerToggles', () => {
  it('G-LT-1: renders a toolbar with one button per layer', () => {
    render(
      <LayerToggles
        layers={layers}
        visibleIds={new Set(['wall'])}
        onToggle={vi.fn()}
      />
    );
    expect(screen.getByRole('toolbar')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Wall' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Overhang' })
    ).toBeInTheDocument();
  });

  it('G-LT-3: aria-pressed mirrors visibleIds', () => {
    render(
      <LayerToggles
        layers={layers}
        visibleIds={new Set(['wall'])}
        onToggle={vi.fn()}
      />
    );
    expect(screen.getByRole('button', { name: 'Wall' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(screen.getByRole('button', { name: 'Overhang' })).toHaveAttribute(
      'aria-pressed',
      'false'
    );
  });

  it('G-LT-3: clicking fires onToggle once with the layer id (no local mutation)', () => {
    const onToggle = vi.fn();
    render(
      <LayerToggles
        layers={layers}
        visibleIds={new Set(['wall'])}
        onToggle={onToggle}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Overhang' }));
    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onToggle).toHaveBeenCalledWith('roof-overhang');
    // controlled: the button's pressed state did not change locally
    expect(screen.getByRole('button', { name: 'Overhang' })).toHaveAttribute(
      'aria-pressed',
      'false'
    );
  });
});
