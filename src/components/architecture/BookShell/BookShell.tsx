'use client';

import React, { useEffect, useState } from 'react';
import LayeredDiagram from '../LayeredDiagram';
import { hatManifest } from '../manifests/hat.manifest';
import type { ChapterFocus, DiagramManifest } from '../manifests/types';

export interface BookShellProps {
  /** Which region is focused: 'roof' (hat), 'envelope' (coat), 'foundation'
   *  (boots), or null (the neutral index/home state). */
  chapterFocus: ChapterFocus;
  /** The chapter's building manifest (its layers, presets, labels). Defaults to
   *  the Hat building; each chapter passes its own manifest, which shares the
   *  same wall/window/footing/roof geometry so the building stays byte-identical
   *  across chapters (FR-001a / SC-009). */
  manifest?: DiagramManifest;
  /** Short chapter narrative (intro/hook, or a "coming soon" note) rendered under
   *  the changing per-view band. */
  narrative?: React.ReactNode;
  /** Long-form chapter copy rendered BELOW the viewer (sources, why-it-matters).
   *  Optional; deep reading that doesn't need to be above the fold. */
  chapterContent?: React.ReactNode;
  /** When false the guided-views/toggles are inert (neutral index state). */
  interactive?: boolean;
  className?: string;
}

/**
 * The ONE shared shell for every book page (index/home, Hat, Coat, Boots). It
 * renders the SAME viewer structure — guided views (left) | the shared building,
 * fixed size and position (centre) | per-layer toggles + legend (right) — over a
 * full-width per-view narrative band. Only the `manifest` (which region's layers
 * + presets) and `chapterFocus` change between pages; every manifest shares the
 * same wall/window/footing/roof geometry, so the building stays byte-identically
 * registered as you navigate (FR-001a / SC-009). The chapter nav (Hat/Coat/Boots)
 * lives in the navbar (`ChapterNav` in `GlobalNav`), not in this shell.
 *
 * @category architecture
 */
export default function BookShell({
  chapterFocus,
  manifest = hatManifest,
  narrative,
  chapterContent,
  interactive = true,
  className = '',
}: BookShellProps) {
  const [viewId, setViewId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const hash = window.location.hash;
    const frag = hash.startsWith('#') ? hash.slice(1) : hash;
    for (const part of frag.split('&')) {
      const [key, value] = part.split('=');
      if (key === 'view' && value) {
        setViewId(decodeURIComponent(value));
        return;
      }
    }
  }, []);

  function handlePresetChange(presetId: string) {
    const url = `${window.location.pathname}${window.location.search}#view=${presetId}`;
    window.history.replaceState(null, '', url);
  }

  return (
    <div className={`flex min-h-0 flex-col ${className}`}>
      <LayeredDiagram
        manifest={manifest}
        chapterFocus={chapterFocus}
        initialPresetId={viewId}
        onPresetChange={handlePresetChange}
        interactive={interactive}
        narrativeRail={narrative}
        className="flex-1"
      />
      {chapterContent && (
        <div className="mx-auto mt-4 w-full max-w-3xl">{chapterContent}</div>
      )}
    </div>
  );
}
