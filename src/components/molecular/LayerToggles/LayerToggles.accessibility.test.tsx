import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { LayerToggles } from './LayerToggles';
import type { Layer } from '@/components/organisms/BookViewer/manifests/types';

expect.extend(toHaveNoViolations);

const LAYERS: Layer[] = [
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

describe('LayerToggles Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(
      <LayerToggles layers={LAYERS} isDocked={() => true} onToggle={() => {}} />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
