import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SourcesNote } from './SourcesNote';

const SOURCES = [
  {
    title: 'U.S. Department of Energy — Passive Solar',
    url: 'https://energy.gov/x',
  },
  { title: 'NOAA Solar Position Calculator', url: 'https://noaa.gov/y' },
];

describe('SourcesNote', () => {
  it('renders nothing when there is no content', () => {
    const { container } = render(<SourcesNote />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the why-it-matters note, aside, and source links', () => {
    render(
      <SourcesNote
        whyItMatters="It gives comfort back."
        sourcedAside="The sun swings 47 degrees."
        sources={SOURCES}
      />
    );
    expect(screen.getByText(/gives comfort back/i)).toBeInTheDocument();
    expect(screen.getByText(/47 degrees/i)).toBeInTheDocument();
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute('href', 'https://energy.gov/x');
    expect(links[0]).toHaveAttribute('target', '_blank');
    expect(links[0]).toHaveAttribute(
      'rel',
      expect.stringContaining('noopener')
    );
  });

  it('renders a disclosure (summary) so it can collapse', () => {
    render(<SourcesNote sources={SOURCES} />);
    expect(screen.getByText(/why it matters/i)).toBeInTheDocument();
  });
});
