import React from 'react';

export interface ChapterLeadInProps {
  /** The full chapter title (the visible <h1>). */
  title: string;
  /** Optional one-line subtitle, shown beside/under the title. */
  subtitle?: string;
  className?: string;
}

/**
 * The chapter lead-in: just the <h1> title (and an optional one-line subtitle)
 * above the building. Deliberately compact — the chapter's intro prose lives in
 * the FIRST scroll step (in the ribbon), not as a static block above the house,
 * so nothing dead competes with the building for the fold.
 *
 * @category molecular
 */
export function ChapterLeadIn({
  title,
  subtitle,
  className = '',
}: ChapterLeadInProps) {
  return (
    <header className={`text-center ${className}`}>
      <h1 className="font-blueprint text-base-content text-2xl font-bold sm:text-3xl">
        {title}
      </h1>
      {subtitle && (
        <p className="text-base-content/70 mt-1 text-sm italic">{subtitle}</p>
      )}
    </header>
  );
}

export default ChapterLeadIn;
