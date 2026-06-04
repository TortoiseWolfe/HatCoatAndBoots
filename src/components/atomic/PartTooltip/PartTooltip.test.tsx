import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PartTooltip } from './PartTooltip';

describe('PartTooltip', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <PartTooltip
        open={false}
        name="Roof overhang"
        verb="Tap to take the roof off"
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the name and verb line when open', () => {
    render(
      <PartTooltip open name="Roof overhang" verb="Tap to take the roof off" />
    );
    expect(screen.getByText('Roof overhang')).toBeInTheDocument();
    expect(screen.getByText(/take the roof off/i)).toBeInTheDocument();
  });

  it('is a polite live region so SR users hear the teaching', () => {
    render(
      <PartTooltip open name="Roof overhang" verb="Tap to take the roof off" />
    );
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
