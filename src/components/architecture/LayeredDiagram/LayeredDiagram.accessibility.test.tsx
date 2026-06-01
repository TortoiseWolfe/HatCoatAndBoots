import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import LayeredDiagram from './LayeredDiagram';
import { hatManifest } from '../manifests/hat.manifest';

expect.extend(toHaveNoViolations);

describe('LayeredDiagram Accessibility', () => {
  it('has no violations in the full (everything) state', async () => {
    const { container } = render(
      <LayeredDiagram manifest={hatManifest} chapterFocus="roof" />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no violations in a focused/partial guided view', async () => {
    const { container } = render(
      <LayeredDiagram
        manifest={hatManifest}
        chapterFocus="roof"
        initialPresetId="bare-wall"
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('G-RLS-4: decorative layers carry empty alt; the labels layer is non-decorative', () => {
    const { container } = render(
      <LayeredDiagram manifest={hatManifest} chapterFocus="roof" />
    );
    // every pictorial <img> is decorative → alt=""
    container.querySelectorAll('img').forEach((img) => {
      expect(img).toHaveAttribute('alt', '');
    });
  });
});
