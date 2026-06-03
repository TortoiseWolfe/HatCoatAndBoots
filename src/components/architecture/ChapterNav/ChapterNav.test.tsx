import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ChapterNav from './ChapterNav';
import type { ChapterFocusRecord } from '../manifests/types';

// usePathname drives the active-tab state; mock it per test via the holder.
const pathHolder = { current: '/book/hat' };
vi.mock('next/navigation', () => ({
  usePathname: () => pathHolder.current,
}));

const allAvailable: ChapterFocusRecord[] = [
  {
    id: 'hat',
    label: 'Hat',
    region: 'roof',
    available: true,
    href: '/book/hat',
  },
  {
    id: 'coat',
    label: 'Coat',
    region: 'envelope',
    available: true,
    href: '/book/coat',
  },
  {
    id: 'boots',
    label: 'Boots',
    region: 'foundation',
    available: false,
    href: '/book/boots',
  },
];

describe('ChapterNav', () => {
  it('renders a tab for every chapter in a "Book chapters" nav', () => {
    pathHolder.current = '/book/hat';
    render(<ChapterNav chapters={allAvailable} />);
    expect(
      screen.getByRole('navigation', { name: /book chapters/i })
    ).toBeInTheDocument();
    expect(screen.getByText('The Hat')).toBeInTheDocument();
    expect(screen.getByText('The Coat')).toBeInTheDocument();
    expect(screen.getByText('The Boots')).toBeInTheDocument();
  });

  it('renders available chapters as links and unavailable ones as a "Soon" badge', () => {
    pathHolder.current = '/book/hat';
    render(<ChapterNav chapters={allAvailable} />);
    expect(screen.getByRole('link', { name: /the hat/i })).toHaveAttribute(
      'href',
      '/book/hat'
    );
    expect(screen.getByRole('link', { name: /the coat/i })).toHaveAttribute(
      'href',
      '/book/coat'
    );
    // Boots is coming soon → not a link, shows "Soon"
    expect(
      screen.queryByRole('link', { name: /the boots/i })
    ).not.toBeInTheDocument();
    expect(screen.getByText('Soon')).toBeInTheDocument();
  });

  it('marks the chapter matching the current path with aria-current=page', () => {
    pathHolder.current = '/book/coat';
    render(<ChapterNav chapters={allAvailable} />);
    expect(screen.getByRole('link', { name: /the coat/i })).toHaveAttribute(
      'aria-current',
      'page'
    );
    expect(screen.getByRole('link', { name: /the hat/i })).not.toHaveAttribute(
      'aria-current'
    );
  });

  it('matches the active chapter even when the path has a trailing slash', () => {
    pathHolder.current = '/book/coat/';
    render(<ChapterNav chapters={allAvailable} />);
    expect(screen.getByRole('link', { name: /the coat/i })).toHaveAttribute(
      'aria-current',
      'page'
    );
  });
});
