import { test, expect } from '@playwright/test';
import { dismissCookieBanner } from './utils/test-user-factory';

/**
 * The Boots chapter guided-view walkthrough — the same contract as the Hat spec,
 * for the foundation chapter: stepping the 4 views with matching band + takeaway
 * text, URL-hash write + reload-restore, unknown-hash fallback, no-shift on view
 * change, and the no-JS gate (heading + a key line + a sources link readable with
 * JavaScript disabled). Frost depth is always stated as set by local code.
 */

const BOOTS = '/book/boots/';

const VIEWS = [
  {
    id: 'boots-overview',
    label: 'The Whole Foundation',
    snippet: 'three parts working together',
    takeaway: 'holds everything up',
  },
  {
    id: 'boots-frost',
    label: 'The Problem: Frost Heaves',
    snippet: 'frost heave',
    takeaway: 'set by local code',
  },
  {
    id: 'boots-water-path',
    label: 'Where the Water Goes',
    snippet: 'slope away from the foundation',
    takeaway: 'water never pools',
  },
  {
    id: 'boots-capillary-break',
    label: 'The Fix: A Capillary Break',
    snippet: 'capillary action',
    takeaway: 'wicking up into the wall',
  },
];

test.describe('Boots chapter — guided views', () => {
  test('steps through the 4 views with a matching explanation each', async ({
    page,
  }) => {
    await page.goto(BOOTS);
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
    await page.goto(BOOTS);
    await dismissCookieBanner(page);
    await page
      .getByRole('radio', { name: 'The Fix: A Capillary Break' })
      .click();
    await expect(page).toHaveURL(/#view=boots-capillary-break/);

    await page.reload();
    await expect(
      page.getByRole('radio', { name: 'The Fix: A Capillary Break' })
    ).toBeChecked();
  });

  test('an unknown hash view falls back to the default', async ({ page }) => {
    await page.goto(`${BOOTS}#view=bogus`);
    await dismissCookieBanner(page);
    await expect(
      page.getByRole('radio', { name: 'The Whole Foundation' })
    ).toBeChecked();
  });

  test('hidden layers stay in the DOM and stay registered (no geometry shift)', async ({
    page,
  }) => {
    await page.goto(BOOTS);
    await dismissCookieBanner(page);

    const wall = page.locator('[data-layer-id="wall"]');
    const capillary = page.locator('[data-layer-id="capillary-break"]');

    // The capillary break is hidden in the default overview view but mounted.
    await expect(capillary).toHaveCount(1);
    await expect(capillary).toHaveCSS('opacity', '0');

    const wallBefore = await wall.boundingBox();

    // switch to the fix: the capillary break becomes visible, the wall does not move
    await page
      .getByRole('radio', { name: 'The Fix: A Capillary Break' })
      .click();
    await expect(capillary).toHaveCount(1);

    const wallAfter = await wall.boundingBox();
    expect(wallAfter?.width).toBeCloseTo(wallBefore?.width ?? -1, 0);
    expect(wallAfter?.height).toBeCloseTo(wallBefore?.height ?? -1, 0);
    expect(wallAfter?.x).toBeCloseTo(wallBefore?.x ?? -1, 0);
    expect(wallAfter?.y).toBeCloseTo(wallBefore?.y ?? -1, 0);
  });
});

test.describe('Boots chapter — no-JS gate', () => {
  test('the composite + prose are readable with JavaScript disabled', async ({
    browser,
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto(BOOTS);

    await expect(page.locator('[data-layer-id]').first()).toBeVisible();
    await expect(page.locator('[data-layer-id="wall"]')).toHaveCount(1);

    await expect(
      page.getByRole('heading', {
        name: /What a Foundation Knows About Water/i,
      })
    ).toBeVisible();
    await expect(page.getByText(/hold it up, and keep it dry/i)).toBeVisible();
    await expect(
      page.getByRole('link', { name: /Frost Protection/i })
    ).toBeVisible();

    await context.close();
  });
});
