import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StoryRibbon } from './StoryRibbon';

const LEGEND = [
  { id: 'roof', tabColor: '#c8714a', docked: true },
  { id: 'wall', tabColor: '#c9a86a', docked: false },
];

describe('StoryRibbon', () => {
  it('shows the heading and prose of the active beat', () => {
    render(
      <StoryRibbon
        heading="Summer sun is blocked"
        prose="The overhang shades the window."
        stepIndex={1}
        stepCount={4}
        legend={LEGEND}
        onPrev={() => {}}
        onNext={() => {}}
      />
    );
    expect(
      screen.getByRole('heading', { name: /summer sun is blocked/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/overhang shades the window/i)).toBeInTheDocument();
  });

  it('fires onPrev / onNext from the pills', () => {
    const onPrev = vi.fn();
    const onNext = vi.fn();
    render(
      <StoryRibbon
        heading="h"
        prose="p"
        stepIndex={1}
        stepCount={4}
        legend={LEGEND}
        onPrev={onPrev}
        onNext={onNext}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /back/i }));
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(onPrev).toHaveBeenCalledOnce();
    expect(onNext).toHaveBeenCalledOnce();
  });

  it('disables Back on the first step and Next on the last', () => {
    const { rerender } = render(
      <StoryRibbon
        heading="h"
        prose="p"
        stepIndex={0}
        stepCount={3}
        legend={LEGEND}
        onPrev={() => {}}
        onNext={() => {}}
      />
    );
    expect(screen.getByRole('button', { name: /back/i })).toBeDisabled();
    rerender(
      <StoryRibbon
        heading="h"
        prose="p"
        stepIndex={2}
        stepCount={3}
        legend={LEGEND}
        onPrev={() => {}}
        onNext={() => {}}
      />
    );
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
  });

  it('renders one legend dot per layer, marking docked ones', () => {
    render(
      <StoryRibbon
        heading="h"
        prose="p"
        stepIndex={1}
        stepCount={4}
        legend={LEGEND}
        onPrev={() => {}}
        onNext={() => {}}
      />
    );
    const dots = screen.getAllByTestId('legend-dot');
    expect(dots).toHaveLength(2);
    expect(dots[0]).toHaveAttribute('data-docked', 'true');
    expect(dots[1]).toHaveAttribute('data-docked', 'false');
  });
});
