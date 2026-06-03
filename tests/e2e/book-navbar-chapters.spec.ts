import { test, expect } from '@playwright/test';
import { dismissCookieBanner } from './utils/test-user-factory';

/**
 * The chapter nav (Hat / Coat / Boots) lives in the NAVBAR on every book page,
 * not in the viewer. This spec checks it is present on each chapter, the active
 * chapter is marked (aria-current=page), and the links navigate between chapters
 * — including with JavaScript disabled (plain <a> links).
 */

const CHAPTERS = [
  { path: '/book/hat/', label: 'The Hat' },
  { path: '/book/coat/', label: 'The Coat' },
  { path: '/book/boots/', label: 'The Boots' },
];

test.describe('Book — chapter nav in the navbar', () => {
  for (const { path, label } of CHAPTERS) {
    test(`shows all three chapter tabs in the navbar on ${path}, with ${label} active`, async ({
      page,
    }) => {
      await page.goto(path);
      await dismissCookieBanner(page);

      const nav = page.getByRole('navigation', { name: /book chapters/i });
      await expect(nav).toBeVisible();
      for (const c of CHAPTERS) {
        await expect(nav.getByText(c.label, { exact: true })).toBeVisible();
      }
      // The current chapter is the active one.
      const active = nav.getByRole('link', { name: label });
      await expect(active).toHaveAttribute('aria-current', 'page');
    });
  }

  test('the chapter tabs navigate between chapters', async ({ page }) => {
    await page.goto('/book/hat/');
    await dismissCookieBanner(page);
    const nav = page.getByRole('navigation', { name: /book chapters/i });

    await nav.getByRole('link', { name: 'The Coat' }).click();
    await expect(page).toHaveURL(/\/book\/coat\/?$/);

    await nav.getByRole('link', { name: 'The Boots' }).click();
    await expect(page).toHaveURL(/\/book\/boots\/?$/);
  });

  test('the chapter tabs are plain links that work with JavaScript disabled', async ({
    browser,
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto('/book/hat/');

    const nav = page.getByRole('navigation', { name: /book chapters/i });
    await expect(nav.getByRole('link', { name: 'The Coat' })).toHaveAttribute(
      'href',
      /\/book\/coat/
    );

    await context.close();
  });
});
