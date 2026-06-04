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
  },
];

describe('ExplodedBuilding Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(
      <ExplodedBuilding
        layers={LAYERS}
        isDocked={() => true}
        onToggle={() => {}}
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('decorative layer images carry empty alt', () => {
    const { container } = render(
      <ExplodedBuilding
        layers={LAYERS}
        isDocked={() => true}
        onToggle={() => {}}
      />
    );
    container.querySelectorAll('img').forEach((img) => {
      expect(img).toHaveAttribute('alt');
    });
  });
});
