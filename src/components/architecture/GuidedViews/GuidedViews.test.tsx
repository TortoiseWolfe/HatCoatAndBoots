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

  // G-GV-1 (the aria-live description) now lives as a caption UNDER the building
  // in LayeredDiagram (so the tall paragraph can't push the rail past the fold).
  // It is asserted in LayeredDiagram.test.tsx, not here — GuidedViews is now just
  // the controlled radiogroup.

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
