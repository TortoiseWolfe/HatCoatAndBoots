import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import HatViewer from './HatViewer';
import { hatManifest } from '../manifests/hat.manifest';

/**
 * T021 [US1] (unit portion) — HatViewer mounts the Hat manifest and syncs the
 * active guided view to the URL hash. Binds G-HV-1..G-HV-3 (contracts §5).
 * The full guided-view walkthrough + reload is covered by the Playwright E2E.
 */

function isShown(container: HTMLElement, id: string): boolean {
  const node = container.querySelector(
    `[data-layer-id="${id}"]`
  ) as HTMLElement;
  return (
    !!node &&
    node.getAttribute('aria-hidden') !== 'true' &&
    node.style.opacity !== '0'
  );
}

describe('HatViewer', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
  });
  afterEach(() => {
    window.history.replaceState(null, '', '/');
  });

  it('G-HV-1: mounts the Hat building (all manifest layers present in the DOM)', () => {
    const { container } = render(<HatViewer />);
    hatManifest.layers.forEach((l) => {
      expect(
        container.querySelector(`[data-layer-id="${l.id}"]`)
      ).toBeInTheDocument();
    });
  });

  it('G-HV-2: restores the guided view from initialViewId (hash hydrated by the page)', () => {
    const { container } = render(<HatViewer initialViewId="bare-wall" />);
    // bare-wall hides the overhang
    expect(isShown(container, 'roof-overhang')).toBe(false);
    expect(isShown(container, 'wall')).toBe(true);
  });

  it('G-HV-2: an unknown initialViewId falls back to everything', () => {
    const { container } = render(<HatViewer initialViewId="bogus" />);
    hatManifest.layers.forEach((l) => {
      expect(isShown(container, l.id)).toBe(true);
    });
  });

  it('G-HV-3: changing the guided view writes #view= to the URL hash', () => {
    render(<HatViewer />);
    fireEvent.click(
      screen.getByRole('radio', {
        name: hatManifest.presets.find((p) => p.id === 'roof-line')!.label,
      })
    );
    expect(window.location.hash).toContain('view=roof-line');
  });
});
