import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import ChapterNav from './ChapterNav';

expect.extend(toHaveNoViolations);

vi.mock('next/navigation', () => ({
  usePathname: () => '/book/hat',
}));

describe('ChapterNav Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<ChapterNav />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('exposes a labelled navigation landmark', () => {
    const { getByRole } = render(<ChapterNav />);
    expect(getByRole('navigation', { name: /book chapters/i })).toBeVisible();
  });

  it('chapter links have a 44px touch target', () => {
    const { container } = render(<ChapterNav />);
    container.querySelectorAll('a').forEach((link) => {
      expect(link.className).toMatch(/min-h-11/);
    });
  });
});
