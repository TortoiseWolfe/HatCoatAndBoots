/**
 * `renderLayerStack` — the shared pure renderer for the layered diagram.
 *
 * Returns the full layer stack as absolutely-positioned, transparent, registered
 * `<img>` elements in z-order. Pure: identical (layers, visible) input always
 * yields identical output — no hooks, no state, no effects — which is what lets
 * the Server page (Hat gate) and the client engine share ONE renderer.
 *
 * Guarantees (contracts/components.md §1):
 *  G-RLS-1  hidden = opacity:0 + pointer-events:none + aria-hidden, NEVER
 *           display:none; every layer is always rendered (no geometry shift).
 *  G-RLS-2  all layers stack in the manifest viewBox via absolute positioning.
 *  G-RLS-3  every layer src is basePath-prefixed.
 *  G-RLS-4  decorative layers carry alt="" / role="presentation"; meaningful
 *           layers carry alt={layer.alt}.
 *  G-RLS-5  pure: same inputs → same React tree.
 */

import type React from 'react';
import type { DiagramLayer } from '../manifests/types';
import { detectedConfig } from '@/config/project-detected';

export function renderLayerStack(
  layers: readonly DiagramLayer[],
  visible: ReadonlySet<string>
): React.ReactNode {
  // Paint back-to-front by z so stacking is deterministic regardless of source
  // order. A stable copy keeps the function pure.
  const ordered = [...layers].sort((a, b) => a.z - b.z);

  return ordered.map((layer) => {
    const isVisible = visible.has(layer.id);
    // Visible context layers may be dimmed via atmosphereOpacity (never hidden).
    const shownOpacity = layer.atmosphereOpacity ?? 1;

    return (
      <div
        key={layer.id}
        data-layer-id={layer.id}
        aria-hidden={isVisible ? undefined : true}
        // The opacity transition (cross-fade) is applied by the engine via a
        // class, gated on reduced motion (G-LD-5); the pure renderer stays
        // animation-free so the Server Component output is deterministic.
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: layer.z,
          opacity: isVisible ? shownOpacity : 0,
          pointerEvents: isVisible ? undefined : 'none',
        }}
      >
        {layer.src ? (
          <img
            src={`${detectedConfig.basePath}/${layer.src}`}
            data-file={layer.src.split('/').pop()}
            alt={layer.decorative ? '' : layer.alt}
            role={layer.decorative ? 'presentation' : undefined}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
        ) : null}
      </div>
    );
  });
}
