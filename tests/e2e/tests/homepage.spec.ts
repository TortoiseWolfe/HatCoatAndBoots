import { test, expect } from '@playwright/test';
import { dismissCookieBanner } from '../utils/test-user-factory';

test.describe('Homepage (book cover)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await dismissCookieBanner(page);
  });

  test('loads with the book title', async ({ page }) => {
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText(/Hat, Coat/i);
  });

  test('shows three chapter cards linking into the book', async ({ page }) => {
    for (const { name, href } of [
      { name: 'The Hat', href: '/book/hat' },
      { name: 'The Coat', href: '/book/coat' },
      { name: 'The Boots', href: '/book/boots' },
    ]) {
      const card = page.getByRole('link', { name: new RegExp(name, 'i') });
      await expect(card.first()).toBeVisible();
      await expect(card.first()).toHaveAttribute('href', new RegExp(href));
    }
  });

  test('clicking a chapter card opens that chapter', async ({ page }) => {
    await page
      .getByRole('link', { name: /The Hat/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/book\/hat/);
    await expect(
      page.getByRole('heading', { name: /What a Roof Knows/i })
    ).toBeVisible();
  });

  test('skip to main content link works', async ({ page }) => {
    const skipLink = page.getByRole('link', {
      name: /skip to main content/i,
    });
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);
    await skipLink.click({ force: true });
    const mainContent = page.locator('#main-content');
    await expect(mainContent).toBeInViewport();
  });
});
