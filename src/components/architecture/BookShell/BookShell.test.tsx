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

  it('renders the chapter-focus tabs and the page-specific narrative content', () => {
    render(
      <BookShell
        chapterFocus="roof"
        activeChapterId="hat"
        narrative={<p>chapter intro here</p>}
      />
    );
    expect(
      screen.getByRole('navigation', { name: /chapters/i })
    ).toBeInTheDocument();
    // The narrative content (chapter-level extras) is rendered once under the
    // viewer's full-width narrative band — present and visible.
    expect(screen.getByText('chapter intro here')).toBeInTheDocument();
  });

  it('applies a custom className', () => {
    const { container } = render(
      <BookShell chapterFocus={null} className="custom-test-class" />
    );
    expect(container.querySelector('.custom-test-class')).toBeInTheDocument();
  });
});
