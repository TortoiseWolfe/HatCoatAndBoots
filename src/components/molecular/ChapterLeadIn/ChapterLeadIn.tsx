import React from 'react';

export interface ChapterLeadInProps {
  /** The full chapter title (the visible <h1>). */
  title: string;
  /** The chapter subtitle, shown under the title. */
  subtitle?: string;
  /** Intro paragraphs, rendered as a lead-in above the building. */
  intro?: string[];
  className?: string;
}

/**
 * The chapter lead-in: the visible <h1> title, subtitle, and intro paragraphs
 * shown above the building. SSR/no-JS readable — sets up the chapter before the
 * reader starts stepping through the views.
 *
 * @category molecular
 */
export function ChapterLeadIn({
  title,
  subtitle,
  intro,
  className = '',
}: ChapterLeadInProps) {
  return (
    <header className={`mx-auto max-w-3xl text-center ${className}`}>
      <h1 className="font-blueprint text-base-content text-2xl font-bold sm:text-3xl">
        {title}
      </h1>
      {subtitle && (
        <p className="text-base-content/80 mt-2 text-base italic sm:text-lg">
          {subtitle}
        </p>
      )}
      {intro && intro.length > 0 && (
        <div className="mt-4 space-y-3 text-left">
          {intro.map((para, i) => (
            <p key={i} className="text-base-content/90 leading-relaxed">
              {para}
            </p>
          ))}
        </div>
      )}
    </header>
  );
}

export default ChapterLeadIn;
