import { test, expect } from '@playwright/test';
import { dismissCookieBanner } from './utils/test-user-factory';

/**
 * The Coat chapter guided-view walkthrough — the same contract as the Hat spec,
 * for the envelope (wall) chapter: stepping the 4 views with matching band +
 * takeaway text, URL-hash write + reload-restore, unknown-hash fallback, no-shift
 * on view change, and the no-JS gate (heading + a key line + a sources link
 * readable with JavaScript disabled).
 */

const COAT = '/book/coat/';

const VIEWS = [
  {
    id: 'coat-everything',
    label: 'The Whole Coat',
    snippet: 'Here is the whole system',
    takeaway: 'each solving a different problem',
  },
  {
    id: 'coat-bare-wall',
    label: 'The Problem: Studs Leak Heat',
    snippet: 'thermal bridging',
    takeaway: 'every stud is a short-circuit',
  },
  {
    id: 'coat-cavity-plus-wrap',
    label: 'The Fix: Fill + Wrap',
    snippet: 'Two layers fix what one cannot',
    takeaway: 'a continuous wrap covers the studs',
  },
  {
    id: 'coat-air-and-mass',
    label: 'The Bonus: Stop Air, Store Heat',
    snippet: 'air through gaps, cracks, and penetrations',
    takeaway: 'smoothing the swings',
  },
];

test.describe('Coat chapter — guided views', () => {
  test('steps through the 4 views with a matching explanation each', async ({
    page,
  }) => {
    await page.goto(COAT);
    await dismissCookieBanner(page);
    const band = page.getByTestId('guided-view-description');
    const card = page.getByTestId('guided-view-takeaway');

    for (const view of VIEWS) {
      await page.getByRole('radio', { name: view.label }).click();
      await expect(page.getByRole('radio', { name: view.label })).toBeChecked();
      await expect(band).toContainText(view.snippet);
      await expect(card).toContainText(view.takeaway);
    }
  });

  test('selecting a view writes #view= and a reload restores it', async ({
    page,
  }) => {
    await page.goto(COAT);
    await dismissCookieBanner(page);
    await page.getByRole('radio', { name: 'The Fix: Fill + Wrap' }).click();
    await expect(page).toHaveURL(/#view=coat-cavity-plus-wrap/);

    await page.reload();
    await expect(
      page.getByRole('radio', { name: 'The Fix: Fill + Wrap' })
    ).toBeChecked();
  });

  test('an unknown hash view falls back to the default', async ({ page }) => {
    await page.goto(`${COAT}#view=bogus`);
    await dismissCookieBanner(page);
    await expect(
      page.getByRole('radio', { name: 'The Whole Coat' })
    ).toBeChecked();
  });

  test('hidden layers stay in the DOM and stay registered (no geometry shift)', async ({
    page,
  }) => {
    await page.goto(COAT);
    await dismissCookieBanner(page);

    const wall = page.locator('[data-layer-id="wall"]');
    const wrap = page.locator('[data-layer-id="continuous-insulation"]');

    const wallBefore = await wall.boundingBox();
    const wrapBefore = await wrap.boundingBox();
    expect(wrapBefore?.width).toBeCloseTo(wallBefore?.width ?? -1, 0);
    expect(wrapBefore?.height).toBeCloseTo(wallBefore?.height ?? -1, 0);

    // switch to the bare wall: the wrap is hidden via opacity but stays registered
    await page
      .getByRole('radio', { name: 'The Problem: Studs Leak Heat' })
      .click();
    await expect(wrap).toHaveCount(1);
    await expect(wrap).toHaveCSS('opacity', '0');

    const wallAfter = await wall.boundingBox();
    expect(wallAfter?.width).toBeCloseTo(wallBefore?.width ?? -1, 0);
    expect(wallAfter?.height).toBeCloseTo(wallBefore?.height ?? -1, 0);
  });
});

test.describe('Coat chapter — no-JS gate', () => {
  test('the composite + prose are readable with JavaScript disabled', async ({
    browser,
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto(COAT);

    await expect(page.locator('[data-layer-id]').first()).toBeVisible();
    await expect(page.locator('[data-layer-id="wall"]')).toHaveCount(1);

    await expect(
      page.getByRole('heading', { name: /What a Wall Knows About the Cold/i })
    ).toBeVisible();
    await expect(page.getByText(/warmth in, moisture out/i)).toBeVisible();
    await expect(
      page.getByRole('link', { name: /Air Leakage of US Homes/i })
    ).toBeVisible();

    await context.close();
  });
});
