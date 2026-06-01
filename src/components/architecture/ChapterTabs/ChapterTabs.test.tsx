import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ChapterTabs from './ChapterTabs';
import { chapters } from '../manifests/chapters';

describe('ChapterTabs', () => {
  it('renders a tab for every chapter', () => {
    render(<ChapterTabs chapters={chapters} />);
    expect(screen.getByText('The Hat')).toBeInTheDocument();
    expect(screen.getByText('The Coat')).toBeInTheDocument();
    expect(screen.getByText('The Boots')).toBeInTheDocument();
  });

  it('makes the available chapter a link and coming-soon ones not', () => {
    render(<ChapterTabs chapters={chapters} />);
    // Hat is available → it is a link to /book/hat
    expect(screen.getByRole('link', { name: /the hat/i })).toHaveAttribute(
      'href',
      '/book/hat'
    );
    // Coat/Boots are coming soon → marked "Soon", not links
    expect(screen.getAllByText('Soon').length).toBeGreaterThanOrEqual(2);
    expect(
      screen.queryByRole('link', { name: /the coat/i })
    ).not.toBeInTheDocument();
  });

  it('marks the active chapter with aria-current', () => {
    render(<ChapterTabs chapters={chapters} activeId="hat" />);
    expect(screen.getByRole('link', { name: /the hat/i })).toHaveAttribute(
      'aria-current',
      'page'
    );
  });

  it('renders taglines when provided', () => {
    render(
      <ChapterTabs
        chapters={chapters}
        taglines={{ hat: 'the roof overhang' }}
      />
    );
    expect(screen.getByText('the roof overhang')).toBeInTheDocument();
  });

  it('applies a custom className', () => {
    const { container } = render(
      <ChapterTabs chapters={chapters} className="custom-test-class" />
    );
    expect(container.querySelector('.custom-test-class')).toBeInTheDocument();
  });
});
