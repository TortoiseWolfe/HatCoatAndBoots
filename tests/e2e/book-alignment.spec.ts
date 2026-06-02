import { test, expect, type Page } from '@playwright/test';

/**
 * The spec's core promise (FR-001a / SC-009): it is ONE building in one
 * coordinate space, and the SAME viewer shell on every page — so the building is
 * byte-identically positioned and sized on the index/home, Hat, Coat, and Boots
 * pages. Navigating between them must NOT move or resize the building. This spec
 * loads all four pages and asserts a shared building element (the wall) occupies
 * the same on-screen rectangle on each.
 */

const PAGES = ['/', '/book/hat/', '/book/coat/', '/book/boots/'];

async function wallBox(page: Page, url: string) {
  await page.goto(url);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
  const wall = page.locator('[data-layer-id="wall"]');
  await expect(wall).toHaveCount(1);
  const box = await wall.boundingBox();
  if (!box) throw new Error(`no wall box on ${url}`);
  return box;
}

test.describe('Book — one building, aligned on every page', () => {
  test('the building is identically positioned and sized across all pages', async ({
    page,
  }) => {
    // Fixed viewport so absolute coordinates are comparable.
    await page.setViewportSize({ width: 1440, height: 900 });

    const reference = await wallBox(page, PAGES[0]);

    for (const url of PAGES.slice(1)) {
      const box = await wallBox(page, url);
      // Same position AND size as the home/index page (allow 1px sub-pixel slack).
      expect(box.x, `x on ${url}`).toBeCloseTo(reference.x, 0);
      expect(box.y, `y on ${url}`).toBeCloseTo(reference.y, 0);
      expect(box.width, `width on ${url}`).toBeCloseTo(reference.width, 0);
      expect(box.height, `height on ${url}`).toBeCloseTo(reference.height, 0);
    }
  });
});
