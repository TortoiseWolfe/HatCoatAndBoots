import { test, expect, type Page } from '@playwright/test';

/**
 * The spec's core promise (FR-001a / SC-009): it is ONE building in one
 * coordinate space, so navigating between the CHAPTERS (Hat ↔ Coat ↔ Boots)
 * must NOT move or resize the building — it stays byte-identically registered.
 * This is the invariant that makes the three focuses read as one house.
 *
 * The home/index (`/`) is the neutral state and is NOT a chapter, so it does not
 * carry the chapter navbar row; its building therefore sits the navbar-row height
 * higher (same x / width / height, different y). We assert that separately.
 */

const CHAPTER_PAGES = ['/book/hat/', '/book/coat/', '/book/boots/'];

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

test.describe('Book — one building, aligned across chapters', () => {
  test('the building is byte-identical across Hat, Coat, and Boots', async ({
    page,
  }) => {
    // Fixed viewport so absolute coordinates are comparable.
    await page.setViewportSize({ width: 1440, height: 900 });

    const reference = await wallBox(page, CHAPTER_PAGES[0]);

    for (const url of CHAPTER_PAGES.slice(1)) {
      const box = await wallBox(page, url);
      // Same rectangle (position AND size) as the Hat chapter (1px sub-pixel slack).
      expect(box.x, `x on ${url}`).toBeCloseTo(reference.x, 0);
      expect(box.y, `y on ${url}`).toBeCloseTo(reference.y, 0);
      expect(box.width, `width on ${url}`).toBeCloseTo(reference.width, 0);
      expect(box.height, `height on ${url}`).toBeCloseTo(reference.height, 0);
    }
  });

  test('the home/index building shares the chapters’ x, width and height', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const chapter = await wallBox(page, CHAPTER_PAGES[0]);
    const home = await wallBox(page, '/');
    // Same coordinate space — only the vertical offset differs because the
    // index has no chapter navbar row above the viewer.
    expect(home.x, 'home x').toBeCloseTo(chapter.x, 0);
    expect(home.width, 'home width').toBeCloseTo(chapter.width, 0);
    expect(home.height, 'home height').toBeCloseTo(chapter.height, 0);
  });
});
