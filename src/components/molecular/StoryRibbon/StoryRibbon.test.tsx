import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StoryRibbon } from './StoryRibbon';

describe('StoryRibbon', () => {
  it('shows the heading and prose of the active beat', () => {
    render(
      <StoryRibbon
        heading="Summer sun is blocked"
        prose="The overhang shades the window."
        stepIndex={1}
        stepCount={4}
        onPrev={() => {}}
        onNext={() => {}}
      />
    );
    expect(
      screen.getByRole('heading', { name: /summer sun is blocked/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/overhang shades the window/i)).toBeInTheDocument();
  });

  it('shows the takeaway when provided', () => {
    render(
      <StoryRibbon
        heading="h"
        prose="p"
        takeaway="One fixed roof edge, two seasons."
        stepIndex={1}
        stepCount={4}
        onPrev={() => {}}
        onNext={() => {}}
      />
    );
    expect(screen.getByText(/two seasons/i)).toBeInTheDocument();
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
        onPrev={() => {}}
        onNext={() => {}}
      />
    );
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
  });

  it('shows the step counter', () => {
    render(
      <StoryRibbon
        heading="h"
        prose="p"
        stepIndex={1}
        stepCount={4}
        onPrev={() => {}}
        onNext={() => {}}
      />
    );
    expect(screen.getByText('2 / 4')).toBeInTheDocument();
  });
});
