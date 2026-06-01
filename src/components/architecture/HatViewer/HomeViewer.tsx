'use client';

import React, { useEffect, useState } from 'react';
import LayeredDiagram from '../LayeredDiagram';
import ChapterTabs from '../ChapterTabs';
import { hatManifest } from '../manifests/hat.manifest';
import { chapters } from '../manifests/chapters';

const CHAPTER_TAGLINES: Record<string, string> = {
  hat: 'the roof overhang',
  coat: 'the insulated walls',
  boots: 'the foundation',
};

/** Parse `#view=<id>` from a hash fragment. */
function readViewFromHash(hash: string): string | undefined {
  const frag = hash.startsWith('#') ? hash.slice(1) : hash;
  for (const part of frag.split('&')) {
    const [key, value] = part.split('=');
    if (key === 'view' && value) return decodeURIComponent(value);
  }
  return undefined;
}

/**
 * The home-page viewer: the shared building viewer dominating the page (FR-007 +
 * wireframe 01-book-index). The chapter-focus tabs (Hat/Coat/Boots) are the
 * navigation; below them the full-width LayeredDiagram shows the whole labelled
 * building, large, with its guided views and per-layer toggles live so the
 * reader takes it apart the moment they land. The building IS the interface.
 *
 * LayeredDiagram already lays out (guided views | building | toggles); we give
 * it a wide stage and let it fill the width, with the chapter tabs as a slim
 * rail above so we don't nest control columns.
 */
export default function HomeViewer({ className = '' }: { className?: string }) {
  const [viewId, setViewId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const fromHash = readViewFromHash(window.location.hash);
    if (fromHash) setViewId(fromHash);
  }, []);

  function handlePresetChange(presetId: string) {
    const url = `${window.location.pathname}${window.location.search}#view=${presetId}`;
    window.history.replaceState(null, '', url);
  }

  return (
    <div className={`flex w-full flex-col gap-4 ${className}`}>
      <ChapterTabs
        chapters={chapters}
        taglines={CHAPTER_TAGLINES}
        activeId={null}
        className="[&_ul]:flex-row [&_ul]:flex-wrap [&_ul]:gap-3"
      />
      <LayeredDiagram
        manifest={hatManifest}
        chapterFocus="roof"
        initialPresetId={viewId}
        onPresetChange={handlePresetChange}
        stageMaxWidthClass="max-w-3xl"
      />
    </div>
  );
}
