import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { SourcesNote } from './SourcesNote';

expect.extend(toHaveNoViolations);

describe('SourcesNote Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(
      <SourcesNote
        whyItMatters="It gives comfort back."
        sourcedAside="A short sourced aside."
        sources={[
          { title: 'U.S. Department of Energy', url: 'https://energy.gov/x' },
        ]}
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
