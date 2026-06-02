'use client';

import React, { useEffect, useState } from 'react';
import LayeredDiagram from '../LayeredDiagram';
import ChapterTabs from '../ChapterTabs';
import { hatManifest } from '../manifests/hat.manifest';
import { chapters } from '../manifests/chapters';
import type { ChapterFocus } from '../manifests/types';

const CHAPTER_TAGLINES: Record<string, string> = {
  hat: 'the roof overhang',
  coat: 'the insulated walls',
  boots: 'the foundation',
};

export interface BookShellProps {
  /** Which region is focused: 'roof' (hat), 'envelope' (coat), 'foundation'
   *  (boots), or null (the neutral index/home state). */
  chapterFocus: ChapterFocus;
  /** The active chapter id for the tab highlight (null on the index/home). */
  activeChapterId?: 'hat' | 'coat' | 'boots' | null;
  /** Chapter-specific copy for the left rail (intro for an available chapter,
   *  a "coming soon" note for one not yet written, or the index welcome). Goes
   *  in the rail so it never pushes the building out of position. */
  chapterContent?: React.ReactNode;
  /** When false the guided-views/toggles are inert (neutral index state). */
  interactive?: boolean;
  className?: string;
}

/**
 * The ONE shared shell for every book page (index/home, Hat, Coat, Boots). It
 * always renders the SAME 3-column viewer in the SAME structure — chapter tabs +
 * chapter copy + guided views (left) | the shared building, fixed size and
 * position (centre) | per-layer toggles (right). Only `chapterFocus` and the
 * rail copy change between pages, so the building stays byte-identically
 * registered as you navigate (FR-001a / SC-009 — "one building, one coordinate
 * space, same UI everywhere"). The chapter copy lives in the rail, NOT above the
 * building, which is what keeps the centre stage from moving page-to-page.
 *
 * @category architecture
 */
export default function BookShell({
  chapterFocus,
  activeChapterId = null,
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

  const leftRail = (
    <div className="flex flex-col gap-4">
      <ChapterTabs
        chapters={chapters}
        taglines={CHAPTER_TAGLINES}
        activeId={activeChapterId}
      />
      {chapterContent}
    </div>
  );

  return (
    <LayeredDiagram
      manifest={hatManifest}
      chapterFocus={chapterFocus}
      initialPresetId={viewId}
      onPresetChange={handlePresetChange}
      interactive={interactive}
      leftRail={leftRail}
      className={className}
    />
  );
}
