import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { PartTooltip } from './PartTooltip';

expect.extend(toHaveNoViolations);

describe('PartTooltip Accessibility', () => {
  it('should have no accessibility violations when open', async () => {
    const { container } = render(
      <PartTooltip open name="Roof overhang" verb="Tap to put the roof back" />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
