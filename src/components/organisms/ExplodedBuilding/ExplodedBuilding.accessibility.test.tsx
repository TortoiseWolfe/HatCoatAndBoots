import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ExplodedBuilding } from './ExplodedBuilding';
import type { Layer } from '../BookViewer/manifests/types';

expect.extend(toHaveNoViolations);

const LAYERS: Layer[] = [
  {
    id: 'wall',
    src: 'book/hat/wall.svg',
    label: 'Walls',
    alt: '',
    tabColor: '#c9a86a',
    tabWord: 'WALL',
    z: 20,
    explodeOffset: { x: 0, y: 0 },
    bbox: { x: 148, y: 116, w: 96, h: 188 },
  },
];

describe('ExplodedBuilding Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(
      <ExplodedBuilding
        chapter="hat"
        layers={LAYERS}
        isDocked={() => true}
        onToggle={() => {}}
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('the decorative building SVG is hidden from assistive tech', () => {
    const { container } = render(
      <ExplodedBuilding
        chapter="hat"
        layers={LAYERS}
        isDocked={() => true}
        onToggle={() => {}}
      />
    );
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });
});
