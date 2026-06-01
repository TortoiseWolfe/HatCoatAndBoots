import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import GuidedViews from './GuidedViews';
import type { DiagramPreset } from '../manifests/types';

/**
 * T019 [US1] — GuidedViews is a fully-controlled single-select preset rail.
 * Binds G-GV-1..G-GV-4 (contracts/components.md §4).
 */

const presets: DiagramPreset[] = [
  {
    id: 'everything',
    label: 'Full Picture',
    description: 'Everything explanation.',
    visibleLayerIds: ['wall', 'roof-overhang'],
  },
  {
    id: 'bare-wall',
    label: 'No Roof Yet',
    description: 'Bare wall explanation.',
    visibleLayerIds: ['wall'],
  },
  {
    id: 'roof-line',
    label: 'One Roof, Two Seasons',
    description: 'Roof line explanation.',
    visibleLayerIds: ['wall', 'roof-overhang'],
  },
];

describe('GuidedViews', () => {
  it('G-GV-2: renders one selectable control per preset', () => {
    render(
      <GuidedViews
        presets={presets}
        activePresetId="everything"
        onSelect={vi.fn()}
      />
    );
    presets.forEach((p) => {
      expect(screen.getByRole('radio', { name: p.label })).toBeInTheDocument();
    });
  });

  it('G-GV-2: marks the active preset as checked and others not', () => {
    render(
      <GuidedViews
        presets={presets}
        activePresetId="bare-wall"
        onSelect={vi.fn()}
      />
    );
    expect(screen.getByRole('radio', { name: 'No Roof Yet' })).toBeChecked();
    expect(
      screen.getByRole('radio', { name: 'Full Picture' })
    ).not.toBeChecked();
  });

  it('G-GV-2: selecting a preset fires onSelect with that id', () => {
    const onSelect = vi.fn();
    render(
      <GuidedViews
        presets={presets}
        activePresetId="everything"
        onSelect={onSelect}
      />
    );
    fireEvent.click(
      screen.getByRole('radio', { name: 'One Roof, Two Seasons' })
    );
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith('roof-line');
  });

  it('G-GV-1: renders the active description in an aria-live=polite region that updates', () => {
    const { container, rerender } = render(
      <GuidedViews
        presets={presets}
        activePresetId="everything"
        onSelect={vi.fn()}
      />
    );
    const live = container.querySelector('[aria-live="polite"]');
    expect(live).toBeInTheDocument();
    expect(live).toHaveTextContent('Everything explanation.');

    // Description updates together with the active view (FR-003).
    rerender(
      <GuidedViews
        presets={presets}
        activePresetId="bare-wall"
        onSelect={vi.fn()}
      />
    );
    expect(container.querySelector('[aria-live="polite"]')).toHaveTextContent(
      'Bare wall explanation.'
    );
  });

  it('G-GV-3: onSelect only ever receives an allowlisted preset id', () => {
    const onSelect = vi.fn();
    render(
      <GuidedViews
        presets={presets}
        activePresetId="everything"
        onSelect={onSelect}
      />
    );
    presets.forEach((p) => {
      fireEvent.click(screen.getByRole('radio', { name: p.label }));
    });
    onSelect.mock.calls.forEach(([id]) => {
      expect(presets.map((p) => p.id)).toContain(id);
    });
  });
});
