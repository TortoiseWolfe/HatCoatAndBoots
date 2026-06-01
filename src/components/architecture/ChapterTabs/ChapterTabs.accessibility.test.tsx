import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import ChapterTabs from './ChapterTabs';
import { chapters } from '../manifests/chapters';

expect.extend(toHaveNoViolations);

describe('ChapterTabs Accessibility', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(
      <ChapterTabs chapters={chapters} activeId="hat" />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('is a labelled navigation landmark', () => {
    render(<ChapterTabs chapters={chapters} />);
    expect(
      screen.getByRole('navigation', { name: /chapters/i })
    ).toBeInTheDocument();
  });

  it('renders the chapters as a list', () => {
    render(<ChapterTabs chapters={chapters} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(chapters.length);
  });
});
