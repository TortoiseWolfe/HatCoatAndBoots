'use client';

import React, { useEffect, useState } from 'react';
import LayeredDiagram from '../LayeredDiagram';
import { hatManifest } from '../manifests/hat.manifest';

export interface HatViewerProps {
  /** Initial guided-view id, hydrated from the URL hash by the page. */
  initialViewId?: string;
  className?: string;
}

/** Parse `#view=<id>` from a hash fragment (`#key=value&key=value`). */
function readViewFromHash(hash: string): string | undefined {
  const frag = hash.startsWith('#') ? hash.slice(1) : hash;
  for (const part of frag.split('&')) {
    const [key, value] = part.split('=');
    if (key === 'view' && value) return decodeURIComponent(value);
  }
  return undefined;
}

/**
 * The Hat-chapter interactive island. Mounts the shared building focused on the
 * roof region, restores the guided view from the URL hash on load (G-HV-2), and
 * writes it back on change so the address is shareable/reloadable (G-HV-3).
 *
 * @category architecture
 */
export default function HatViewer({
  initialViewId,
  className = '',
}: HatViewerProps) {
  // Seeds LayeredDiagram's INITIAL preset only. We set it on mount (from the
  // prop, then refined from the live hash). We deliberately do NOT update it on
  // every preset change — LayeredDiagram owns the live preset state, and echoing
  // the active id back through initialPresetId caused a prop/state feedback race
  // that reset the view on the slower CI runner. The hash is still kept in sync
  // for shareability/reload, but it does not drive live state.
  const [viewId, setViewId] = useState<string | undefined>(initialViewId);

  useEffect(() => {
    const fromHash = readViewFromHash(window.location.hash);
    if (fromHash) setViewId(fromHash);
  }, []);

  function handlePresetChange(presetId: string) {
    // Reflect to the hash without a navigation or scroll jump (FR-007a). Do NOT
    // call setViewId here — that would echo back into initialPresetId.
    const url = `${window.location.pathname}${window.location.search}#view=${presetId}`;
    window.history.replaceState(null, '', url);
  }

  return (
    <LayeredDiagram
      manifest={hatManifest}
      chapterFocus="roof"
      initialPresetId={viewId}
      onPresetChange={handlePresetChange}
      className={className}
    />
  );
}
