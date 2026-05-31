import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { renderLayerStack } from './renderLayerStack';
import type { DiagramLayer } from '../manifests/types';
import { detectedConfig } from '@/config/project-detected';

/**
 * Unit test for the shared pure renderer (T018 — written RED, before T016).
 * Binds the G-RLS-* guarantees from contracts/components.md §1.
 */

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
    id: 'labels',
    label: 'Labels',
    alt: 'Diagram labels naming the parts.',
    decorative: false,
    region: 'roof',
    z: 50,
    defaultVisible: true,
  },
];

function renderStack(visible: ReadonlySet<string>) {
  return render(<>{renderLayerStack(layers, visible)}</>);
}

describe('renderLayerStack', () => {
  it('G-RLS-1: hidden layers stay in the DOM with opacity:0 + pointer-events:none + aria-hidden, never display:none', () => {
    const { container } = renderStack(new Set(['wall'])); // roof-overhang + labels hidden
    const nodes = container.querySelectorAll('[data-layer-id]');
    // every layer is present regardless of visibility (FR-006 no-shift)
    expect(nodes.length).toBe(layers.length);

    const hidden = container.querySelector(
      '[data-layer-id="roof-overhang"]'
    ) as HTMLElement;
    expect(hidden).toBeInTheDocument();
    expect(hidden.style.opacity).toBe('0');
    expect(hidden.style.pointerEvents).toBe('none');
    expect(hidden.getAttribute('aria-hidden')).toBe('true');
    // NEVER display:none
    expect(hidden.style.display).not.toBe('none');
  });

  it('G-RLS-1: visible layers are opaque and not aria-hidden', () => {
    const { container } = renderStack(new Set(['wall']));
    const visible = container.querySelector(
      '[data-layer-id="wall"]'
    ) as HTMLElement;
    expect(visible).toBeInTheDocument();
    expect(visible.style.opacity).not.toBe('0');
    expect(visible.getAttribute('aria-hidden')).not.toBe('true');
  });

  it('G-RLS-3: every pictorial layer src is basePath-prefixed', () => {
    const { container } = renderStack(
      new Set(['wall', 'roof-overhang', 'labels'])
    );
    const imgs = Array.from(container.querySelectorAll('img'));
    expect(imgs.length).toBeGreaterThan(0);
    imgs.forEach((img) => {
      // jsdom resolves to absolute; assert the path segment is present and prefixed
      const src = img.getAttribute('src') ?? '';
      expect(src).toBe(
        `${detectedConfig.basePath}/book/hat/${img.getAttribute('data-file')}`
      );
    });
  });

  it('G-RLS-4: decorative layers carry alt="" ', () => {
    const { container } = renderStack(new Set(['wall', 'roof-overhang']));
    const wallImg = container.querySelector(
      '[data-layer-id="wall"] img'
    ) as HTMLImageElement;
    expect(wallImg).toBeInTheDocument();
    expect(wallImg.getAttribute('alt')).toBe('');
  });

  it('G-RLS-5: purity — same inputs yield identical markup', () => {
    const a = renderStack(new Set(['wall', 'labels']));
    const b = renderStack(new Set(['wall', 'labels']));
    expect(a.container.innerHTML).toBe(b.container.innerHTML);
  });
});
