import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import BookShell from './BookShell';

expect.extend(toHaveNoViolations);

describe('BookShell Accessibility', () => {
  it('has no violations in the neutral (index) state', async () => {
    const { container } = render(<BookShell chapterFocus={null} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no violations in a chapter focus state', async () => {
    const { container } = render(
      <BookShell chapterFocus="roof" activeChapterId="hat" />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('decorative building layers carry empty alt', () => {
    const { container } = render(<BookShell chapterFocus={null} />);
    container.querySelectorAll('img').forEach((img) => {
      expect(img).toHaveAttribute('alt', '');
    });
  });
});
