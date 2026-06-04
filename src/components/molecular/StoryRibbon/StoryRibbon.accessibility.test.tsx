import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { StoryRibbon } from './StoryRibbon';

expect.extend(toHaveNoViolations);

const LEGEND = [
  { id: 'roof', tabColor: '#c8714a', docked: true },
  { id: 'wall', tabColor: '#c9a86a', docked: false },
];

describe('StoryRibbon Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(
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
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
