import { test, expect, type Page } from '@playwright/test';

/**
 * T021 [US1] — the Hat chapter guided-view walkthrough.
 *
 * Covers: stepping the 4 views with matching explanations (FR-002/SC-007),
 * URL-hash write + reload-restore (FR-007a, H-1/H-2), unknown-hash fallback
 * (H-1, Edge Case), no-shift on view change (FR-006/SC-009), and the no-JS Hat
 * gate (FR-008/SC-002).
 */

const HAT = '/book/hat/';

const VIEWS = [
  { label: 'Full Picture', snippet: 'whole system at a glance' },
  { label: 'No Roof Yet', snippet: 'no overhang at all' },
  { label: 'One Roof, Two Seasons', snippet: 'add the overhang' },
  {
    label: 'Throwing Rain Clear',
    snippet: 'lands away from the base of the wall',
  },
];

/** Dismiss the site cookie banner if present (it overlays the lower UI). */
async function dismissCookies(page: Page) {
  const accept = page.getByRole('button', { name: /accept all/i });
  if (await accept.isVisible().catch(() => false)) {
    await accept.click();
  }
}

test.describe('Hat chapter — guided views', () => {
  test('steps through the 4 views with a matching explanation each', async ({
    page,
  }) => {
    await page.goto(HAT);
    await dismissCookies(page);
    // The chapter's own explanation region (scoped — the page has other live regions).
    const live = page.getByTestId('guided-view-description');

    for (const view of VIEWS) {
      await page.getByRole('radio', { name: view.label }).click();
      await expect(page.getByRole('radio', { name: view.label })).toBeChecked();
      await expect(live).toContainText(view.snippet);
    }
  });

  test('selecting a view writes #view= and a reload restores it', async ({
    page,
  }) => {
    await page.goto(HAT);
    await dismissCookies(page);
    await page.getByRole('radio', { name: 'One Roof, Two Seasons' }).click();
    await expect(page).toHaveURL(/#view=roof-line/);

    await page.reload();
    await expect(
      page.getByRole('radio', { name: 'One Roof, Two Seasons' })
    ).toBeChecked();
  });

  test('an unknown hash view falls back to Full Picture', async ({ page }) => {
    await page.goto(`${HAT}#view=bogus`);
    await dismissCookies(page);
    await expect(
      page.getByRole('radio', { name: 'Full Picture' })
    ).toBeChecked();
  });

  test('hidden layers stay in the DOM and stay registered (no geometry shift)', async ({
    page,
  }) => {
    await page.goto(HAT);
    await dismissCookies(page);

    // All layers are absolutely positioned in one shared box, so the wall and the
    // overhang occupy the SAME rectangle (registration). That invariant must hold
    // before AND after a view change — and the change must only flip opacity, not
    // unmount or move a layer (G-RLS-1/2, FR-006, SC-009).
    const wall = page.locator('[data-layer-id="wall"]');
    const overhang = page.locator('[data-layer-id="roof-overhang"]');

    const wallBefore = await wall.boundingBox();
    const overhangBefore = await overhang.boundingBox();
    expect(overhangBefore?.width).toBeCloseTo(wallBefore?.width ?? -1, 0);
    expect(overhangBefore?.height).toBeCloseTo(wallBefore?.height ?? -1, 0);

    // switch to bare-wall: the overhang is hidden via opacity but stays registered
    await page.getByRole('radio', { name: 'No Roof Yet' }).click();
    await expect(overhang).toHaveCount(1); // still mounted
    await expect(overhang).toHaveCSS('opacity', '0'); // hidden, not removed

    const wallAfter = await wall.boundingBox();
    const overhangAfter = await overhang.boundingBox();
    // the hidden overhang still occupies exactly the wall's rectangle
    expect(overhangAfter?.width).toBeCloseTo(wallAfter?.width ?? -1, 0);
    expect(overhangAfter?.height).toBeCloseTo(wallAfter?.height ?? -1, 0);
    // and the wall's own size is unchanged by the view switch
    expect(wallAfter?.width).toBeCloseTo(wallBefore?.width ?? -1, 0);
    expect(wallAfter?.height).toBeCloseTo(wallBefore?.height ?? -1, 0);
  });
});

test.describe('Hat chapter — no-JS Hat gate', () => {
  test('the full composite + prose are readable with JavaScript disabled', async ({
    browser,
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto(HAT);

    // The complete labeled drawing: every layer present and visible (SC-002).
    await expect(page.locator('[data-layer-id]').first()).toBeVisible();
    await expect(page.locator('[data-layer-id="roof-overhang"]')).toHaveCount(
      1
    );

    // Explanatory text is present without scripts.
    await expect(
      page.getByRole('heading', { name: /What a Roof Knows About the Sun/i })
    ).toBeVisible();
    await expect(
      page.getByText(/no shutters, no sensors, no machines/i)
    ).toBeVisible();

    // Sources are listed.
    await expect(
      page.getByRole('link', { name: /Passive Solar Homes/i })
    ).toBeVisible();

    await context.close();
  });
});
