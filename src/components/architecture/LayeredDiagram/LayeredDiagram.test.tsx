import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LayeredDiagram from './LayeredDiagram';
import { hatManifest } from '../manifests/hat.manifest';

/**
 * T020 [US1] — LayeredDiagram owns visibility state and applies presets.
 * Binds G-LD-1..G-LD-4 (contracts/components.md §2). Tested through the real
 * Hat manifest so the preset → layer wiring is exercised end-to-end.
 */

function layerNode(container: HTMLElement, id: string): HTMLElement {
  const node = container.querySelector(`[data-layer-id="${id}"]`);
  if (!node) throw new Error(`layer ${id} not in DOM`);
  return node as HTMLElement;
}

function isShown(container: HTMLElement, id: string): boolean {
  const node = layerNode(container, id);
  // shown = present, not aria-hidden, opacity != 0
  return (
    node.getAttribute('aria-hidden') !== 'true' && node.style.opacity !== '0'
  );
}

describe('LayeredDiagram', () => {
  it('G-LD-4: defaults to the everything preset when no initialPresetId given', () => {
    const { container } = render(
      <LayeredDiagram manifest={hatManifest} chapterFocus="roof" />
    );
    // every layer present in DOM (no-shift) ...
    hatManifest.layers.forEach((l) => {
      expect(layerNode(container, l.id)).toBeInTheDocument();
    });
    // ... and the everything preset shows them all
    hatManifest.layers.forEach((l) => {
      expect(isShown(container, l.id)).toBe(true);
    });
  });

  it('G-LD-4: an unknown initialPresetId falls back to the default preset', () => {
    const { container } = render(
      <LayeredDiagram
        manifest={hatManifest}
        chapterFocus="roof"
        initialPresetId="does-not-exist"
      />
    );
    // falls back to everything: all shown, nothing blank
    hatManifest.layers.forEach((l) => {
      expect(isShown(container, l.id)).toBe(true);
    });
  });

  it('G-LD-3: selecting a guided view shows exactly that preset’s layers (others present but hidden)', () => {
    const { container } = render(
      <LayeredDiagram manifest={hatManifest} chapterFocus="roof" />
    );
    // pick the bare-wall view via its control
    fireEvent.click(
      screen.getByRole('radio', { name: hatManifest.presets[1].label })
    );
    const bareWall = hatManifest.presets.find((p) => p.id === 'bare-wall')!;
    const shownSet = new Set(bareWall.visibleLayerIds);

    hatManifest.layers.forEach((l) => {
      // present regardless of visibility (no-shift)
      expect(layerNode(container, l.id)).toBeInTheDocument();
      expect(isShown(container, l.id)).toBe(shownSet.has(l.id));
    });
    // roof-overhang and the suns are hidden in bare-wall
    expect(isShown(container, 'roof-overhang')).toBe(false);
    expect(isShown(container, 'sun-high')).toBe(false);
  });

  it('G-GV-1: the active view’s description is a caption under the building, in an aria-live=polite region that updates with the view', () => {
    const { container } = render(
      <LayeredDiagram manifest={hatManifest} chapterFocus="roof" />
    );
    const caption = screen.getByTestId('guided-view-description');
    expect(caption).toHaveAttribute('aria-live', 'polite');
    const everything = hatManifest.presets.find((p) => p.id === 'everything')!;
    expect(caption).toHaveTextContent(everything.description);

    // switching the view updates the same live region (FR-003)
    fireEvent.click(
      screen.getByRole('radio', { name: hatManifest.presets[1].label })
    );
    const bareWall = hatManifest.presets.find((p) => p.id === 'bare-wall')!;
    expect(screen.getByTestId('guided-view-description')).toHaveTextContent(
      bareWall.description
    );
    void container;
  });

  it('G-LD-3: a manual layer toggle diverges to the custom state and flips only that layer', () => {
    const { container } = render(
      <LayeredDiagram manifest={hatManifest} chapterFocus="roof" />
    );
    // everything is on; toggle the overhang OFF
    const toggles = screen.getByRole('toolbar');
    const overhangToggle = within(toggles).getByRole('button', {
      name: hatManifest.layers.find((l) => l.id === 'roof-overhang')!.label,
    });
    fireEvent.click(overhangToggle);

    // overhang now hidden, but still in the DOM (no-shift)
    expect(layerNode(container, 'roof-overhang')).toBeInTheDocument();
    expect(isShown(container, 'roof-overhang')).toBe(false);
    // other layers unaffected
    expect(isShown(container, 'wall')).toBe(true);
    // no named preset is fully active anymore → none checked
    const checked = screen
      .getAllByRole('radio')
      .filter((r) => (r as HTMLInputElement).checked);
    expect(checked.length).toBe(0);
  });
});
