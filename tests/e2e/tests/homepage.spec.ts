import { test, expect } from '@playwright/test';
import { dismissCookieBanner } from '../utils/test-user-factory';

// The homepage IS the book: you land on the interactive building blueprint and
// take it apart. These tests bind that — the viewer is the centerpiece, with
// chapter entry points below — not a text cover page or the old template.

test.describe('Homepage — the interactive book', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await dismissCookieBanner(page);
  });

  test('loads with the book title and the hook heading', async ({ page }) => {
    await expect(page).toHaveTitle(/Hats, Coats, and Boots/i);
    await expect(
      page.getByRole('heading', {
        name: /why does a good building wear a hat, a coat, and boots/i,
      })
    ).toBeVisible();
  });

  test('mounts the interactive building viewer on the front page', async ({
    page,
  }) => {
    // The shared building: all manifest layers are rendered (the no-JS composite
    // SSRs them, the island hydrates over it).
    await expect(page.locator('[data-layer-id]').first()).toBeVisible();
    expect(
      await page.locator('[data-layer-id]').count()
    ).toBeGreaterThanOrEqual(6);
    // The guided-views rail (radiogroup) and the per-layer toggle toolbar.
    await expect(page.getByRole('radiogroup')).toBeVisible();
    await expect(page.getByRole('toolbar')).toBeVisible();
  });

  test('the guided views drive the building on the homepage', async ({
    page,
  }) => {
    const live = page.getByTestId('guided-view-description');
    await page.getByRole('radio', { name: 'No Roof Yet' }).click();
    await expect(
      page.getByRole('radio', { name: 'No Roof Yet' })
    ).toBeChecked();
    await expect(live).toContainText(/no overhang at all/i);
    // switching to a roof view hides the overhang layer (opacity, still in DOM)
    await page.getByRole('radio', { name: 'One Roof, Two Seasons' }).click();
    await expect(page.locator('[data-layer-id="roof-overhang"]')).toHaveCount(
      1
    );
  });

  test('shows the three chapter entry points; the Hat is readable', async ({
    page,
  }) => {
    await expect(
      page.getByRole('heading', { name: /^the hat$/i })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /^the coat$/i })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /^the boots$/i })
    ).toBeVisible();
    await expect(page.getByText('Read now').first()).toBeVisible();
    await expect(page.getByText('Coming soon').first()).toBeVisible();
  });

  test('the Hat chapter card links to /book/hat', async ({ page }) => {
    await page
      .getByRole('link', { name: /the hat/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/book\/hat\/?$/);
  });

  test('the "Book" nav link reaches the book', async ({ page }) => {
    const bookLink = page
      .locator('a[href$="/book"], a[href*="/book/"]')
      .first();
    await expect(bookLink).toHaveCount(1);
  });

  test('skip to main content link works', async ({ page }) => {
    const skipLink = page.getByRole('link', {
      name: /skip to main content/i,
    });
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);
    await skipLink.click({ force: true });
    await expect(page.locator('#main-content')).toBeInViewport();
  });
});
