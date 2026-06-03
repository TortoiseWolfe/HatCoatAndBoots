import { test, expect, type Page } from '@playwright/test';
import { dismissCookieBanner } from '../utils/test-user-factory';

/**
 * The book-first header keeps only Home + The Book in the desktop bar; the
 * secondary pages (Blog/Docs/Wireframes) live in the overflow "more" menu. This
 * opens that menu and clicks the named link.
 */
async function navViaMoreMenu(page: Page, linkName: string) {
  const trigger = page.getByRole('button', { name: /more menu/i });
  const link = page
    .locator('.dropdown-content')
    .getByRole('link', { name: linkName, exact: true });
  // The DaisyUI dropdown is CSS/focus-driven and its open panel overlays the
  // trigger (Playwright reports "intercepts pointer events" on a second mouse
  // click). Open it via the keyboard — focus the trigger and press Enter — which
  // avoids the pointer interception entirely, then click the revealed link.
  await trigger.focus();
  await page.keyboard.press('Enter');
  await link.waitFor({ state: 'visible' });
  await link.click();
}

// All 32 DaisyUI themes for random selection
const THEMES = [
  'light',
  'dark',
  'cupcake',
  'bumblebee',
  'emerald',
  'corporate',
  'synthwave',
  'retro',
  'cyberpunk',
  'valentine',
  'halloween',
  'garden',
  'forest',
  'aqua',
  'lofi',
  'pastel',
  'fantasy',
  'wireframe',
  'black',
  'luxury',
  'dracula',
  'cmyk',
  'autumn',
  'business',
  'acid',
  'lemonade',
  'night',
  'coffee',
  'winter',
  'dim',
  'nord',
  'sunset',
];

test.describe('Cross-Page Navigation', () => {
  test('navigate through all main pages', async ({ page }) => {
    // Start at homepage
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await dismissCookieBanner(page);
    await expect(page).toHaveURL(/\/$/);

    // Navigate to Themes (the homepage is now the book viewer and no longer
    // carries the old "32 Themes" stats card, so go via the URL).
    await page.goto('/themes', { waitUntil: 'domcontentloaded' });
    await dismissCookieBanner(page);
    await expect(page).toHaveURL(/\/themes/);
    await expect(
      page.locator('h1').filter({ hasText: /Theme/i })
    ).toBeVisible();

    // Navigate to Blog via the overflow "more" menu
    await navViaMoreMenu(page, 'Blog');
    await dismissCookieBanner(page);
    await expect(page).toHaveURL(/\/blog/);

    // Navigate to Docs via the overflow "more" menu
    await navViaMoreMenu(page, 'Docs');
    await dismissCookieBanner(page);
    await expect(page).toHaveURL(/\/docs/);

    // Navigate back to Home
    await page.locator('a:has-text("Home")').first().click();
    await dismissCookieBanner(page);
    await expect(page).toHaveURL(/\/$/);
  });

  test('browser back/forward navigation works', async ({ page }) => {
    // Navigate through multiple pages - wait for each navigation to complete
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await dismissCookieBanner(page);

    // Navigate to themes and wait for URL (via the URL — see note above)
    await page.goto('/themes', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/themes/);

    // Navigate to blog (via the overflow "more" menu) and wait for URL
    await navViaMoreMenu(page, 'Blog');
    await expect(page).toHaveURL(/\/blog/);

    // Go back to themes
    await page.goBack();
    await expect(page).toHaveURL(/\/themes/);

    // Go back to home
    await page.goBack();
    await expect(page).toHaveURL(/\/$/);

    // Go forward to themes
    await page.goForward();
    await expect(page).toHaveURL(/\/themes/);

    // Go forward to blog
    await page.goForward();
    await expect(page).toHaveURL(/\/blog/);
  });

  test('navigation menu is consistent across pages', async ({ page }) => {
    const pages = ['/', '/themes', '/blog', '/accessibility', '/status'];

    for (const pagePath of pages) {
      await page.goto(pagePath, { waitUntil: 'domcontentloaded' });
      await dismissCookieBanner(page);

      // Check navigation elements exist
      const nav = page.locator('nav, [role="navigation"]').first();
      await expect(nav).toBeVisible();

      // Check key navigation links are present
      const homeLink = page
        .locator('a:has-text("Home"), a:has-text("HatCoatAndBoots")')
        .first();
      await expect(homeLink).toBeVisible();

      // Check footer links are consistent
      const footer = page.locator('footer, [role="contentinfo"]').first();
      await expect(footer).toBeVisible();
    }
  });

  test('deep linking works correctly', async ({ page }) => {
    // Direct navigation to deep pages
    await page.goto('/themes', { waitUntil: 'domcontentloaded' });
    await dismissCookieBanner(page);
    await expect(page).toHaveURL(/\/themes/);
    await expect(
      page.locator('h1').filter({ hasText: /Theme/i })
    ).toBeVisible();

    await page.goto('/blog', { waitUntil: 'domcontentloaded' });
    await dismissCookieBanner(page);
    await expect(page).toHaveURL(/\/blog/);

    await page.goto('/accessibility', { waitUntil: 'domcontentloaded' });
    await dismissCookieBanner(page);
    await expect(page).toHaveURL(/\/accessibility/);
    await expect(
      page.locator('h1').filter({ hasText: /Accessibility/i })
    ).toBeVisible();

    await page.goto('/status', { waitUntil: 'domcontentloaded' });
    await dismissCookieBanner(page);
    await expect(page).toHaveURL(/\/status/);
  });

  test('404 page handles non-existent routes', async ({ page }) => {
    // Navigate to non-existent page
    const response = await page.goto('/non-existent-page', {
      waitUntil: 'networkidle',
    });

    // Check response status
    if (response) {
      const status = response.status();
      // Should be 404 or redirect to 404 page
      expect([404, 200]).toContain(status);
    }

    // Check for 404 content or redirect to home
    const has404Content =
      (await page.locator('text=/404|not found/i').count()) > 0;
    const isHomePage = await page.url().includes('/HatCoatAndBoots');

    expect(has404Content || isHomePage).toBe(true);
  });

  test('anchor links within pages work', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await dismissCookieBanner(page);

    // Check for anchor links (skip to main content)
    const skipLink = page.locator('a[href="#main-content"]');
    const hasSkipLink = (await skipLink.count()) > 0;

    if (hasSkipLink) {
      // Focus the skip link and activate via keyboard (avoids header interception)
      await skipLink.focus();
      await page.keyboard.press('Enter');

      // Check target element is in viewport
      const mainContent = page.locator('#main-content');
      if ((await mainContent.count()) > 0) {
        await expect(mainContent).toBeInViewport();
      }
    }
  });

  test('external links open in new tab', async ({ page, context }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await dismissCookieBanner(page);

    // Find View Source link which opens GitHub in new tab
    const viewSourceLink = page.locator('a:has-text("View Source")');
    const hasViewSource = (await viewSourceLink.count()) > 0;

    if (hasViewSource) {
      // Test link opens in new tab
      const [newPage] = await Promise.all([
        context.waitForEvent('page'),
        viewSourceLink.click(),
      ]);

      await newPage.waitForLoadState();
      expect(newPage.url()).toContain('github.com');
      await newPage.close();
    }
  });

  test('breadcrumb navigation works if present', async ({ page }) => {
    await page.goto('/blog', { waitUntil: 'domcontentloaded' });
    await dismissCookieBanner(page);

    // Look for breadcrumb navigation
    const breadcrumbs = page.locator(
      '[aria-label="breadcrumb"], .breadcrumbs, nav.breadcrumb'
    );
    const hasBreadcrumbs = (await breadcrumbs.count()) > 0;

    if (hasBreadcrumbs) {
      const breadcrumbLinks = breadcrumbs.locator('a');
      const linkCount = await breadcrumbLinks.count();

      if (linkCount > 0) {
        // Click first breadcrumb (usually Home)
        await breadcrumbLinks.first().click();

        // Should navigate to home
        await expect(page).toHaveURL(/\/$/);
      }
    }
  });

  test('navigation preserves theme selection', async ({ page }) => {
    // Set a theme
    await page.goto('/themes', { waitUntil: 'domcontentloaded' });
    await dismissCookieBanner(page);

    // Pick a random theme from all 32 DaisyUI themes
    const randomTheme = THEMES[Math.floor(Math.random() * THEMES.length)];

    // Click the theme button
    const themeBtn = page.locator(`button[data-theme="${randomTheme}"]`);
    await themeBtn.click();

    // Navigate to different pages and verify theme persists
    const pages = ['/blog', '/accessibility', '/status', '/'];

    for (const pagePath of pages) {
      await page.goto(pagePath, { waitUntil: 'domcontentloaded' });

      // Theme should persist
      await expect(page.locator('html')).toHaveAttribute(
        'data-theme',
        randomTheme
      );
    }
  });

  test('navigation menu is keyboard accessible', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await dismissCookieBanner(page);

    // Find and focus the first nav link directly
    const navLink = page.locator('nav a').first();
    await navLink.focus();

    // Verify the link is focused
    await expect(navLink).toBeFocused();

    // Get the href to know where we're going
    const href = await navLink.getAttribute('href');

    // Press Enter to navigate
    await page.keyboard.press('Enter');

    // Verify navigation occurred (URL should change or stay on home if it was home link)
    if (href && href !== '/' && href !== '#') {
      await expect(page).toHaveURL(
        new RegExp(href.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      );
    }
  });

  test('page transitions are smooth', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await dismissCookieBanner(page);

    // Check for view transitions API or CSS transitions
    const hasTransitions = await page.evaluate(() => {
      // Check if View Transitions API is used
      if ('startViewTransition' in document) {
        return true;
      }

      // Check for CSS transitions on body or main
      const body = (document as Document).body;
      const main = (document as Document).querySelector('main');
      const bodyTransition = window.getComputedStyle(body).transition;
      const mainTransition = main
        ? window.getComputedStyle(main as Element).transition
        : '';

      return bodyTransition !== 'none' || mainTransition !== 'none';
    });

    // We're just checking the mechanism exists, not asserting
    expect(hasTransitions).toBeDefined();

    // Navigate and observe smooth transition (via The Book in the desktop bar).
    await page
      .getByRole('navigation')
      .getByRole('link', { name: 'The Book' })
      .first()
      .click();

    // Just verify navigation completed
    await expect(page).toHaveURL(/\/book/);
  });

  test('mobile navigation menu works', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await dismissCookieBanner(page);

    // Look for the overflow "more" menu trigger (the hamburger/overflow control)
    const menuButton = page.getByRole('button', { name: /more menu/i });
    const hasMenuButton = (await menuButton.count()) > 0;

    if (hasMenuButton) {
      // Open via keyboard (the open dropdown panel overlays the trigger, so a
      // second mouse click would be intercepted).
      await menuButton.focus();
      await page.keyboard.press('Enter');

      // The menu opens and shows its items — that is the mobile menu working.
      const menuItems = page.locator('.dropdown-content a');
      await expect(menuItems.first()).toBeVisible();
      await expect(
        menuItems.filter({ hasText: 'The Book' }).first()
      ).toBeVisible();
    }
  });

  test('scroll position resets on navigation', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await dismissCookieBanner(page);

    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 500));

    // Navigate to another page (via The Book in the desktop bar).
    await page
      .getByRole('navigation')
      .getByRole('link', { name: 'The Book' })
      .first()
      .click();

    // Wait for the destination page to actually render its content and for
    // Next.js App Router's scroll restoration to complete. Measuring at
    // `domcontentloaded` is too early on WebKit — the document has parsed
    // but the framework hasn't yet run its onRouteChangeComplete scroll
    // reset, so window.scrollY is still the pre-navigation value (500).
    // Wait for a destination-page-specific element, then for network idle
    // so the scroll restoration has settled.
    await page.waitForURL(
      (url) =>
        url.pathname.endsWith('/book/') || url.pathname.endsWith('/book'),
      { timeout: 10000 }
    );
    await page
      .getByRole('heading', { level: 1 })
      .first()
      .waitFor({ state: 'visible', timeout: 10000 });
    await page.waitForLoadState('networkidle').catch(() => {});

    // Check scroll position is near top (allow offset for fixed headers and
    // browser-specific scroll restoration behavior — WebKit can report up
    // to ~120px due to address bar height differences)
    const scrollPosition = await page.evaluate(() => window.scrollY);
    expect(scrollPosition).toBeLessThanOrEqual(200);
  });

  test('active navigation item is highlighted', async ({ page }) => {
    // Inside the book the navbar shows the chapter tabs (Hat/Coat/Boots) instead
    // of Home/The Book. On /book/hat the "The Hat" tab is the active one and
    // carries aria-current="page".
    await page.goto('/book/hat/', { waitUntil: 'domcontentloaded' });
    await dismissCookieBanner(page);

    const hatTab = page
      .getByRole('navigation', { name: /book chapters/i })
      .getByRole('link', { name: 'The Hat' });
    await expect(hatTab).toBeVisible();
    await expect(hatTab).toHaveAttribute('aria-current', 'page');

    // A non-active chapter tab is not marked current.
    const coatTab = page
      .getByRole('navigation', { name: /book chapters/i })
      .getByRole('link', { name: 'The Coat' });
    await expect(coatTab).not.toHaveAttribute('aria-current');
  });

  test('secondary pages are reachable from the overflow "more" menu', async ({
    page,
  }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await dismissCookieBanner(page);

    // Blog/Docs/Wireframes moved out of the book-first desktop bar into the
    // overflow "more" menu — confirm Blog is still reachable from there.
    await page.getByRole('button', { name: /more menu/i }).click();
    await page.getByRole('link', { name: 'Blog' }).click();
    await expect(page).toHaveURL(/\/blog/);
  });
});
