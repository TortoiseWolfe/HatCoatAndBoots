import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ChapterLeadIn } from './ChapterLeadIn';

describe('ChapterLeadIn', () => {
  it('renders the title as an h1', () => {
    render(<ChapterLeadIn title="The Hat: What a Roof Knows" />);
    expect(
      screen.getByRole('heading', { level: 1, name: /what a roof knows/i })
    ).toBeInTheDocument();
  });

  it('renders the subtitle when provided', () => {
    render(<ChapterLeadIn title="The Hat" subtitle="three jobs at once" />);
    expect(screen.getByText(/three jobs at once/i)).toBeInTheDocument();
  });

  it('renders each intro paragraph', () => {
    render(
      <ChapterLeadIn
        title="The Hat"
        intro={['First paragraph here.', 'Second paragraph here.']}
      />
    );
    expect(screen.getByText('First paragraph here.')).toBeInTheDocument();
    expect(screen.getByText('Second paragraph here.')).toBeInTheDocument();
  });

  it('omits subtitle and intro when not provided', () => {
    const { container } = render(<ChapterLeadIn title="The Hat" />);
    expect(container.querySelectorAll('p')).toHaveLength(0);
  });
});
