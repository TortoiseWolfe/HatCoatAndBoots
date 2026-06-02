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
  /** Short chapter narrative (intro/hook, or a "coming soon" note) rendered in the
   *  LEFT column beside the building — visible without scrolling. Lives in the
   *  rail column so its per-page height never moves the building. */
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

  // The rail carries ONLY the chapter nav — kept short so the guided-view plates
  // below it stay above the fold. Chapter copy/hook renders BELOW the viewer,
  // never stacked in the rail above the controls (which pushed them off-screen).
  const leftRail = (
    <ChapterTabs
      chapters={chapters}
      taglines={CHAPTER_TAGLINES}
      activeId={activeChapterId}
    />
  );

  return (
    <div className={`flex min-h-0 flex-col ${className}`}>
      <LayeredDiagram
        manifest={hatManifest}
        chapterFocus={chapterFocus}
        initialPresetId={viewId}
        onPresetChange={handlePresetChange}
        interactive={interactive}
        leftRail={leftRail}
        narrativeRail={narrative}
        className="flex-1"
      />
      {chapterContent && (
        <div className="mx-auto mt-4 w-full max-w-3xl">{chapterContent}</div>
      )}
    </div>
  );
}
