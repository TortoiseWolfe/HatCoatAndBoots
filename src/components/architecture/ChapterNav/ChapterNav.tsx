'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { chapters as defaultChapters } from '../manifests/chapters';
import type { ChapterFocusRecord } from '../manifests/types';

export interface ChapterNavProps {
  /** The chapters (Hat/Coat/Boots), in reading order. Defaults to the registry. */
  chapters?: readonly ChapterFocusRecord[];
  /** Additional CSS classes on the <nav>. */
  className?: string;
}

/**
 * The book's chapter navigation — Hat / Coat / Boots as a horizontal tab strip
 * for the navbar (it lives in `GlobalNav` as a second row on `/book/*`, not in
 * the viewer's rail). It is route-aware: the active chapter is derived from the
 * current path and underlined. Available chapters are links; a chapter that is
 * not yet written shows a muted "Soon" badge but stays present, so the reader
 * sees all three from day one (FR-007).
 *
 * @category architecture
 */
export default function ChapterNav({
  chapters = defaultChapters,
  className = '',
}: ChapterNavProps) {
  const pathname = usePathname() ?? '';

  return (
    <nav
      aria-label="Book chapters"
      className={`flex items-center gap-1 sm:gap-2 ${className}`}
    >
      {chapters.map((chapter) => {
        // Active when the current path is this chapter's route (basePath-tolerant:
        // match the trailing `/book/<id>` segment rather than the absolute href).
        const active = pathname
          .replace(/\/$/, '')
          .endsWith(`/book/${chapter.id}`);

        const label = (
          <span
            className="text-sm font-semibold sm:text-base"
            style={{ fontFamily: 'var(--font-blueprint)' }}
          >
            The {chapter.label}
          </span>
        );

        // The active tab is underlined in the primary colour (no background
        // shift — the calm blueprint treatment); inactive tabs underline on hover.
        const base =
          'inline-flex min-h-11 items-center gap-1.5 border-b-2 px-2 py-1.5 transition-colors';
        const state = active
          ? 'border-primary text-primary'
          : 'border-transparent text-base-content hover:border-base-content/40 hover:text-primary';

        if (!chapter.available) {
          return (
            <span
              key={chapter.id}
              className={`${base} text-base-content cursor-default border-transparent`}
            >
              {label}
              <span className="badge badge-neutral badge-sm shrink-0">
                Soon
              </span>
            </span>
          );
        }

        return (
          <Link
            key={chapter.id}
            href={chapter.href}
            aria-current={active ? 'page' : undefined}
            className={`${base} ${state} focus-visible:ring-primary focus-visible:rounded-sm focus-visible:ring-2`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
