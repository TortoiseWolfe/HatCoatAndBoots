import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import BookShell from './BookShell';

describe('BookShell', () => {
  it('renders the shared building (all manifest layers) on the index/neutral state', () => {
    const { container } = render(<BookShell chapterFocus={null} />);
    expect(
      container.querySelectorAll('[data-layer-id]').length
    ).toBeGreaterThanOrEqual(6);
  });

  it('renders the page-specific narrative content (chapter nav now lives in the navbar)', () => {
    render(
      <BookShell chapterFocus="roof" narrative={<p>chapter intro here</p>} />
    );
    // The narrative content (chapter-level extras) is rendered once under the
    // viewer's full-width narrative band — present and visible.
    expect(screen.getByText('chapter intro here')).toBeInTheDocument();
    // The chapter nav (Hat/Coat/Boots) is NO LONGER in BookShell — it moved to
    // the navbar (GlobalNav → ChapterNav).
    expect(
      screen.queryByRole('navigation', { name: /chapters/i })
    ).not.toBeInTheDocument();
  });

  it('applies a custom className', () => {
    const { container } = render(
      <BookShell chapterFocus={null} className="custom-test-class" />
    );
    expect(container.querySelector('.custom-test-class')).toBeInTheDocument();
  });
});
