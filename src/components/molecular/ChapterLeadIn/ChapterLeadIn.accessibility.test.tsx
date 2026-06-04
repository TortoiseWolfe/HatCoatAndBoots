import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ChapterLeadIn } from './ChapterLeadIn';

expect.extend(toHaveNoViolations);

describe('ChapterLeadIn Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(
      <ChapterLeadIn
        title="The Hat: What a Roof Knows About the Sun"
        subtitle="three jobs at once"
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
