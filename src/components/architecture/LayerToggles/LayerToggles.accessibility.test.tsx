import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import LayerToggles from './LayerToggles';
import type { DiagramLayer } from '../manifests/types';

expect.extend(toHaveNoViolations);

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
  {
    id: 'rain',
    src: 'book/hat/rain.svg',
    label: 'Rain',
    alt: '',
    decorative: true,
    region: 'roof',
    z: 12,
    defaultVisible: true,
  },
];

function setup(visible: string[] = ['wall']) {
  return render(
    <LayerToggles
      layers={layers}
      visibleIds={new Set(visible)}
      onToggle={vi.fn()}
    />
  );
}

describe('LayerToggles Accessibility', () => {
  it('G-LT-1: has no accessibility violations', async () => {
    const { container } = setup();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('G-LT-2: roving tabindex — exactly one toggle is in the tab order', () => {
    setup(['roof-overhang']);
    const buttons = screen.getAllByRole('button');
    const tabbable = buttons.filter((b) => b.getAttribute('tabindex') === '0');
    expect(tabbable).toHaveLength(1);
    const notTabbable = buttons.filter(
      (b) => b.getAttribute('tabindex') === '-1'
    );
    expect(notTabbable).toHaveLength(buttons.length - 1);
  });

  it('G-LT-4: every toggle meets the 44px touch-target minimum', () => {
    setup();
    screen.getAllByRole('button').forEach((b) => {
      expect(b.className).toMatch(/min-h-11/);
      expect(b.className).toMatch(/min-w-11/);
    });
  });
});
