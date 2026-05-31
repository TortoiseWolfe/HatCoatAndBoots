import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import HatViewer from './HatViewer';

expect.extend(toHaveNoViolations);

describe('HatViewer Accessibility', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<HatViewer />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('exposes the guided-view explanation in an aria-live region', () => {
    const { container } = render(<HatViewer />);
    expect(container.querySelector('[aria-live="polite"]')).toBeInTheDocument();
  });

  it('renders the guided-view radiogroup and the toggle toolbar', () => {
    render(<HatViewer />);
    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    expect(screen.getByRole('toolbar')).toBeInTheDocument();
  });
});
