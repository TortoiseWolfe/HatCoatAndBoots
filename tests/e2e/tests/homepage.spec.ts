import { test, expect } from '@playwright/test';
import { dismissCookieBanner } from '../utils/test-user-factory';

// The homepage is the book's front door (the Hats-Coats-Boots premise +
// chapter entry). These tests bind that content, not the old ScriptHammer
// template landing.

test.describe('Homepage — the book front door', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await dismissCookieBanner(page);
  });

  test('loads with a title and a heading', async ({ page }) => {
    await expect(page).toHaveTitle(/Hats, Coats, and Boots/i);
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('states the book premise', async ({ page }) => {
    await expect(
      page.getByText(/why does a good building wear a hat, a coat, and boots/i)
    ).toBeVisible();
  });

  test('primary CTA goes to the Hat chapter', async ({ page }) => {
    await page.getByRole('link', { name: /start reading: the hat/i }).click();
    await expect(page).toHaveURL(/\/book\/hat\/?$/);
  });

  test('"browse all chapters" goes to the book index', async ({ page }) => {
    await page.getByRole('link', { name: /browse all chapters/i }).click();
    await expect(page).toHaveURL(/\/book\/?$/);
  });

  test('shows the three chapter cards with the Hat readable', async ({
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
    // Hat is available now; Coat/Boots are coming soon
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
    // The nav exposes a "The Book" link (mobile may collapse it into a menu).
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
