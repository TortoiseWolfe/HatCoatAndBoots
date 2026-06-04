import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { StoryRibbon } from './StoryRibbon';

expect.extend(toHaveNoViolations);

describe('StoryRibbon Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(
      <StoryRibbon
        heading="Summer sun is blocked"
        prose="The overhang shades the window."
        takeaway="One fixed roof edge, two seasons."
        stepIndex={1}
        stepCount={4}
        onPrev={() => {}}
        onNext={() => {}}
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
