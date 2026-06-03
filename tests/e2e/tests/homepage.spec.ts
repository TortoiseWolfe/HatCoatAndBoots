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

  test('the navbar leads into the book, where the chapter tabs live', async ({
    page,
  }) => {
    // The chapter nav (Hat/Coat/Boots) moved to the navbar and appears on
    // /book/* pages, not on the home/index. From the homepage you enter the book
    // via the "The Book" link in the navbar.
    await expect(
      page.getByRole('navigation', { name: /chapters/i })
    ).toHaveCount(0);

    await page
      .getByRole('navigation')
      .getByRole('link', { name: 'The Book' })
      .first()
      .click();
    await expect(page).toHaveURL(/\/book\/?$/);

    // Inside the book, the chapter tabs are present in the navbar.
    const tabs = page.getByRole('navigation', { name: /book chapters/i });
    await expect(tabs).toBeVisible();
    await expect(tabs.getByText('The Hat', { exact: true })).toBeVisible();
    await expect(tabs.getByText('The Coat', { exact: true })).toBeVisible();
    await expect(tabs.getByText('The Boots', { exact: true })).toBeVisible();
  });

  test('the chapter tabs navigate into a chapter', async ({ page }) => {
    await page.goto('/book/hat/');
    await dismissCookieBanner(page);
    await page
      .getByRole('navigation', { name: /book chapters/i })
      .getByRole('link', { name: 'The Coat' })
      .click();
    await expect(page).toHaveURL(/\/book\/coat\/?$/);
  });

  test('the guided views drive the building on the homepage', async ({
    page,
  }) => {
    const live = page.getByTestId('guided-view-description');
    await page
      .getByRole('radio', { name: 'The Problem: Summer Glare' })
      .click();
    await expect(
      page.getByRole('radio', { name: 'The Problem: Summer Glare' })
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
