import React from 'react';
import type { SourceCitation } from '@/components/organisms/BookViewer/manifests/types';

export interface SourcesNoteProps {
  /** Cradle-to-cradle "why it matters" note. */
  whyItMatters?: string;
  /** A short, citable aside. */
  sourcedAside?: string;
  /** Verified external sources. */
  sources?: SourceCitation[];
  className?: string;
}

/**
 * A disclosure under the ribbon holding the chapter's "why it matters" note, a
 * sourced aside, and the verified citations. Native <details> so it works without
 * JS; collapsed by default so it never competes with the active beat.
 *
 * @category molecular
 */
export function SourcesNote({
  whyItMatters,
  sourcedAside,
  sources,
  className = '',
}: SourcesNoteProps) {
  if (!whyItMatters && !sourcedAside && (!sources || sources.length === 0)) {
    return null;
  }
  return (
    <details
      className={`border-base-300 bg-base-100/60 rounded-lg border ${className}`}
    >
      <summary className="text-base-content hover:bg-base-200 flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold tracking-wider uppercase">
        Why it matters &amp; sources
      </summary>
      <div className="space-y-3 px-3 pt-1 pb-3 text-sm">
        {whyItMatters && (
          <p className="text-base-content/90 leading-relaxed">{whyItMatters}</p>
        )}
        {sourcedAside && (
          <p className="text-base-content/80 leading-relaxed italic">
            {sourcedAside}
          </p>
        )}
        {sources && sources.length > 0 && (
          <ul className="space-y-1.5">
            {sources.map((src) => (
              <li key={src.url}>
                <a
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link link-primary"
                >
                  {src.title}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </details>
  );
}

export default SourcesNote;
