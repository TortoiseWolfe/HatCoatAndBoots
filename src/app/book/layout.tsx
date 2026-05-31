import type { ReactNode } from 'react';

/**
 * Shared chrome for the book chapters. Server Component, no client state.
 * Real prev/next chapter nav (from `chapters.ts`) is wired in Step 3.
 */
export default function BookLayout({ children }: { children: ReactNode }) {
  return <div className="book-shell">{children}</div>;
}
