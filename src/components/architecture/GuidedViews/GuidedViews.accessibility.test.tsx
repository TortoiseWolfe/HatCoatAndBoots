import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import GuidedViews from './GuidedViews';
import type { DiagramPreset } from '../manifests/types';

expect.extend(toHaveNoViolations);

const presets: DiagramPreset[] = [
  {
    id: 'everything',
    label: 'Full Picture',
    description: 'Everything explanation.',
    takeaway: 'Everything takeaway.',
    visibleLayerIds: ['wall'],
  },
  {
    id: 'bare-wall',
    label: 'No Roof Yet',
    description: 'Bare wall explanation.',
    takeaway: 'Bare wall takeaway.',
    visibleLayerIds: ['wall'],
  },
];

function setup(active = 'everything') {
  return render(
    <GuidedViews presets={presets} activePresetId={active} onSelect={vi.fn()} />
  );
}

describe('GuidedViews Accessibility', () => {
  it('has no accessibility violations', async () => {
    const { container } = setup();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  // G-GV-1 (the active description in an aria-live=polite region) now lives as a
  // caption under the building in LayeredDiagram — asserted in
  // LayeredDiagram.accessibility.test.tsx, not here.

  it('G-GV-2: radiogroup with one checked radio', () => {
    setup('bare-wall');
    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    const checked = screen
      .getAllByRole('radio')
      .filter((r) => r.getAttribute('aria-checked') === 'true');
    expect(checked).toHaveLength(1);
  });

  it('G-GV-5: each selectable control meets the 44px touch target', () => {
    setup();
    screen.getAllByRole('radio').forEach((r) => {
      expect(r.className).toMatch(/min-h-11/);
    });
  });
});
