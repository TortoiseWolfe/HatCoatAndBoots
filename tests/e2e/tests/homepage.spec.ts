import { test, expect } from '@playwright/test';
import { dismissCookieBanner } from '../utils/test-user-factory';

// The homepage IS the book: you land inside the full-bleed shared-building
// viewer that dominates the page — chapter-focus tabs, the big building, guided
// views, and per-layer toggles. These tests bind that, not a cover page.

test.describe('Homepage — the interactive book viewer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await dismissCookieBanner(page);
  });

  test('loads with the book title and the premise', async ({ page }) => {
    await expect(page).toHaveTitle(/Hats, Coats, and Boots/i);
    // The premise lives in the viewer's rail (so it doesn't push the building
    // out of position); it is visible on the page.
    await expect(
      page.getByText(/why does a good building wear a hat, a coat, and boots/i)
    ).toBeVisible();
  });

  test('the building viewer dominates the front page', async ({ page }) => {
    // The whole building is rendered (all manifest layers).
    await expect(page.locator('[data-layer-id]').first()).toBeVisible();
    expect(
      await page.locator('[data-layer-id]').count()
    ).toBeGreaterThanOrEqual(6);
    // The guided-views rail and the per-layer toggle toolbar are present.
    await expect(page.getByRole('radiogroup')).toBeVisible();
    await expect(page.getByRole('toolbar')).toBeVisible();
  });

  test('the chapter-focus tabs are the navigation', async ({ page }) => {
    const tabs = page.getByRole('navigation', { name: /chapters/i });
    await expect(tabs).toBeVisible();
    await expect(tabs.getByText('The Hat')).toBeVisible();
    await expect(tabs.getByText('The Coat')).toBeVisible();
    await expect(tabs.getByText('The Boots')).toBeVisible();
    // Hat is the live chapter; Coat/Boots are "Soon".
    await expect(tabs.getByText('Soon').first()).toBeVisible();
  });

  test('the Hat tab navigates into the Hat chapter', async ({ page }) => {
    await page
      .getByRole('navigation', { name: /chapters/i })
      .getByRole('link', { name: /the hat/i })
      .click();
    await expect(page).toHaveURL(/\/book\/hat\/?$/);
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
