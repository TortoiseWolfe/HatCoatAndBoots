import React from 'react';
import Link from 'next/link';
import type { ChapterFocusRecord } from '../manifests/types';

export interface ChapterTabsProps {
  /** The chapters (Hat/Coat/Boots), in reading order. */
  chapters: readonly ChapterFocusRecord[];
  /** Short "what part this is" line per chapter id (optional). */
  taglines?: Record<string, string>;
  /** The currently-focused chapter id, or null in the neutral index state. */
  activeId?: string | null;
  className?: string;
}

/**
 * The chapter-focus navigation rail (Hat / Coat / Boots). Choosing a tab IS the
 * navigation into that chapter's focus (FR-007). The available chapter is a
 * link; coming-soon chapters are shown with a muted "soon" state but stay
 * present (the reader sees all three from day one).
 *
 * @category architecture
 */
export default function ChapterTabs({
  chapters,
  taglines = {},
  activeId = null,
  className = '',
}: ChapterTabsProps) {
  return (
    <nav aria-label="Chapters" className={className}>
      <h2 className="text-base-content mb-2 hidden text-sm font-bold tracking-wide uppercase md:block">
        Chapters
      </h2>
      <ul className="flex flex-col gap-2">
        {chapters.map((chapter) => {
          const active = chapter.id === activeId;
          const tagline = taglines[chapter.id];
          const inner = (
            <>
              <span className="flex items-center justify-between gap-1">
                <span
                  className="text-sm font-semibold md:text-base"
                  style={{ fontFamily: 'var(--font-blueprint)' }}
                >
                  The {chapter.label}
                </span>
                {!chapter.available && (
                  <span className="badge badge-neutral badge-sm hidden shrink-0 md:inline-flex">
                    Soon
                  </span>
                )}
              </span>
              {/* Tagline is supplementary — hidden on the narrow mobile column. */}
              {tagline && (
                <span className="text-base-content mt-0.5 hidden text-xs leading-snug md:block">
                  {tagline}
                </span>
              )}
            </>
          );

          const base =
            'block rounded-lg border px-2 py-2 text-left transition-colors md:px-3';
          const state = active
            ? 'border-primary bg-primary/15'
            : 'border-base-300 bg-base-100 hover:bg-base-200';

          return (
            <li key={chapter.id}>
              {chapter.available ? (
                <Link
                  href={chapter.href}
                  aria-current={active ? 'page' : undefined}
                  className={`${base} ${state} focus-visible:ring-primary focus-visible:ring-2`}
                >
                  {inner}
                </Link>
              ) : (
                <div className={`${base} ${state} cursor-default`}>{inner}</div>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
