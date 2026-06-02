import { test, expect } from '@playwright/test';

/**
 * Issue #32 — on mobile the three-column viewer spread must stay HORIZONTAL
 * (compact fit), not stack vertically: at phone widths the guided-view presets,
 * the building, and the layer toggles are all side-by-side on one screen with NO
 * horizontal scroll, and every control keeps a ≥44px touch target (#21).
 *
 * Runs in the blocking `book` project (testMatch /book-.*\.spec\.ts$/).
 */

const MOBILE_WIDTHS = [320, 375, 390, 428];

test.describe('Book — compact 3-column viewer on mobile', () => {
  for (const width of MOBILE_WIDTHS) {
    test(`at ${width}px: presets + building + toggles fit one row, no h-scroll`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 780 });
      await page.goto('/book/hat/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(300);

      // No horizontal scroll at any phone width.
      const { scrollW, clientW } = await page.evaluate(() => ({
        scrollW: document.documentElement.scrollWidth,
        clientW: document.documentElement.clientWidth,
      }));
      expect(scrollW, `no horizontal scroll at ${width}px`).toBeLessThanOrEqual(
        clientW + 1
      );

      // The three control regions are all present and laid out left → centre →
      // right (presets left of the building, toggles right of it).
      const presets = page.locator('[role="radiogroup"]');
      const toggles = page.locator('[role="toolbar"]');
      const wall = page.locator('[data-layer-id="wall"]');
      await expect(presets).toHaveCount(1);
      await expect(toggles).toHaveCount(1);

      const pBox = await presets.boundingBox();
      const tBox = await toggles.boundingBox();
      const wBox = await wall.boundingBox();
      if (!pBox || !tBox || !wBox) throw new Error('missing layout boxes');

      // Side-by-side: presets start left of the building, toggles start right of
      // the building's left edge (i.e. they flank it, not stacked under it).
      expect(pBox.x, 'presets left of building').toBeLessThan(wBox.x);
      expect(tBox.x, 'toggles right of building start').toBeGreaterThan(wBox.x);

      // Every preset radio and layer toggle keeps a 44px touch target.
      const controls = page.locator('[role="radio"], [role="toolbar"] button');
      const n = await controls.count();
      for (let i = 0; i < n; i++) {
        const box = await controls.nth(i).boundingBox();
        if (!box) continue;
        expect(
          Math.min(box.width, box.height),
          `control ${i} ≥44px at ${width}px`
        ).toBeGreaterThanOrEqual(43.5);
      }
    });
  }
});
