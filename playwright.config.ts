import { defineConfig, devices } from '@playwright/test';
import { TEST_VIEWPORTS } from './src/config/test-viewports';
import type { TestViewport } from './src/types/mobile-first';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
require('dotenv').config();

/**
 * Convert TestViewport to Playwright device config
 */
function createDeviceConfig(viewport: TestViewport) {
  return {
    viewport: {
      width: viewport.width,
      height: viewport.height,
    },
    deviceScaleFactor: viewport.deviceScaleFactor,
    hasTouch: viewport.hasTouch,
    isMobile: viewport.isMobile,
    ...(viewport.userAgent && { userAgent: viewport.userAgent }),
  };
}

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests/e2e',
  /* Global setup runs once before all tests - validates prerequisites */
  globalSetup: './tests/e2e/global-setup.ts',
  /* Run test files sequentially on CI to avoid parallel database contention.
   * Shard 2 messaging tests share test users in Supabase — parallel execution
   * causes page.goto timeouts, missing conversations, and Realtime failures.
   * Locally, parallel is fine (single user, no contention). */
  fullyParallel: !process.env.CI,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* 1 worker on CI: with 6 shards × 3 browsers = 18 parallel jobs,
   * intra-shard parallelism causes cross-file interference (e.g.
   * friend-requests deletes connections while encrypted-messaging
   * verifies they exist). Sequential execution within each shard
   * is fast enough since load is spread across 18 jobs. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
    process.env.CI ? ['github'] : ['line'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    /* Take screenshot on every failure */
    screenshot: 'on',
    /* Retain video on failure */
    video: 'retain-on-failure',
    /* Maximum time each action can take. 15s accounts for Supabase free tier
     * query latency after conversation selection in messaging tests. */
    actionTimeout: 15000,
    /* Navigation timeout — 60s to account for Argon2id key derivation
     * during handleReAuthModal after each page.goto('/messages') */
    navigationTimeout: 60000,
    /* Emulate mobile device capabilities */
    isMobile: false,
    /* Block service workers — they intercept navigations and cause
     * ERR_ABORTED / "frame was detached" errors during page.goto()
     * and page.reload() across all browsers, not just WebKit. */
    serviceWorkers: 'block',
    /* Context options */
    contextOptions: {
      ignoreHTTPSErrors: true,
    },
  },

  /* Configure projects with ordered execution for rate-limiting isolation */
  /* Note: storageState is set per-project (setup uses base, others use authenticated) */
  projects: [
    // ============================================================
    // BOOK LANE (BLOCKING): the book chapter specs. Backend-free — runs
    // against the static export only with NO setup dependency, NO
    // authenticated storageState, NO Supabase. Runs in CI via
    // `--project=book` with BOOK_E2E=1 (which short-circuits global-setup).
    // This is the gating lane for the book feature (e.g. the Hat chapter,
    // feature 048) and is independently verified green. Kept first so it is
    // obvious this lane is independent of the auth chain.
    // ============================================================
    {
      name: 'book',
      testMatch: [/book-.*\.spec\.ts$/],
      use: {
        ...devices['Desktop Chrome'],
      },
    },

    // ============================================================
    // STATIC LANE (NON-BLOCKING): the other backend-free static specs
    // (theme switching, mobile UX, PWA, a11y, homepage, etc.). Same
    // secret-free mechanism (BOOK_E2E=1, no setup dep, no storageState),
    // but run as a separate `--project=static` job with continue-on-error
    // in CI: these upstream specs predate this fork and some are flaky or
    // failing against the static export (e.g. game-3d asserts zero console
    // 404s), so they REPORT signal on every PR without gating merges. A
    // spec graduates to the blocking `book` lane once it is confirmed green
    // in real CI.
    //
    // testMatch is an EXPLICIT ALLOW-LIST, never a directory glob — the
    // safety boundary that keeps any auth/messaging/payment spec (and any
    // future backend spec dropped into tests/e2e/) out of the secret-free
    // lane. Each entry was verified backend-free (imports only
    // @playwright/test + the inert dismissCookieBanner UI helper; visits
    // only public/static routes; asserts only on DOM/CSS/localStorage).
    // map.spec.ts and broken-links.spec.ts are omitted (backend-free but
    // flaky on external resources); mobile-touch-targets is omitted
    // (genuinely auth-coupled by default project routing).
    // ============================================================
    {
      name: 'static',
      testMatch: [
        /game-3d\.spec\.ts$/,
        /color-contrast\.spec\.ts$/,
        /mobile-check\.spec\.ts$/,
        /mobile-dropdown-screenshot\.spec\.ts$/,
        /accessibility\/colorblind-toggle\.spec\.ts$/,
        /accessibility\/contact-form-keyboard\.spec\.ts$/,
        /tests\/accessibility\.spec\.ts$/,
        /tests\/blog-mobile-ux-iphone\.spec\.ts$/,
        /tests\/blog-mobile-ux-pixel\.spec\.ts$/,
        /tests\/blog-touch-targets\.spec\.ts$/,
        /tests\/cross-page-navigation\.spec\.ts$/,
        /tests\/form-submission\.spec\.ts$/,
        /tests\/homepage\.spec\.ts$/,
        /tests\/mobile-buttons\.spec\.ts$/,
        /tests\/mobile-card-layout\.spec\.ts$/,
        /tests\/mobile-footer\.spec\.ts$/,
        /tests\/mobile-form-inputs\.spec\.ts$/,
        /tests\/mobile-horizontal-scroll\.spec\.ts$/,
        /tests\/mobile-images\.spec\.ts$/,
        /tests\/mobile-navigation\.spec\.ts$/,
        /tests\/mobile-orientation\.spec\.ts$/,
        /tests\/mobile-typography\.spec\.ts$/,
        /tests\/pwa-installation\.spec\.ts$/,
        /tests\/theme-switching\.spec\.ts$/,
        /examples\/homepage-with-pom\.spec\.ts$/,
      ],
      use: {
        ...devices['Desktop Chrome'],
      },
    },

    // ============================================================
    // AUTH SETUP: Runs once, saves authenticated browser state
    // All parallel projects depend on this and reuse the cached state.
    // ============================================================
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
      use: {
        storageState: './tests/e2e/fixtures/storage-state.json',
      },
    },

    // ============================================================
    // ORDERED PROJECTS: Rate-limiting tests run FIRST (unauthenticated)
    // This prevents sign-up tests from exhausting Supabase's
    // IP-based rate limits before rate-limiting tests can run.
    // ============================================================

    // Rate-limiting tests - run FIRST with clean IP quota
    {
      name: 'rate-limiting',
      testDir: './tests/e2e/auth',
      testMatch: /rate-limiting\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: './tests/e2e/fixtures/storage-state.json',
      },
    },

    // Brute-force tests - run after rate-limiting
    {
      name: 'brute-force',
      testDir: './tests/e2e/security',
      testMatch: /brute-force\.spec\.ts/,
      dependencies: ['rate-limiting'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: './tests/e2e/fixtures/storage-state.json',
      },
    },

    // Sign-up tests - run LAST (consumes rate limit quota)
    {
      name: 'signup',
      testDir: './tests/e2e/auth',
      testMatch: /sign-up\.spec\.ts/,
      dependencies: ['brute-force'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: './tests/e2e/fixtures/storage-state.json',
      },
    },

    // ============================================================
    // PARALLEL PROJECTS: Pre-authenticated via storageState
    // These exclude rate-limiting, brute-force, and sign-up tests
    // ============================================================

    // Messaging tests isolated into their own project — sharded separately
    // in CI to prevent state contention (friend-requests deletes connections
    // that encrypted-messaging/group-chat/offline-queue need).
    {
      name: 'chromium-msg',
      testMatch: '**/messaging/**',
      testIgnore: ['**/examples/**'],
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: './tests/e2e/fixtures/storage-state-auth.json',
      },
    },

    // General (non-messaging) tests
    {
      name: 'chromium-gen',
      testIgnore: [
        '**/messaging/**', // handled by chromium-msg
        '**/examples/**', // POM tutorial, not production tests
        '**/rate-limiting.spec.ts',
        '**/brute-force.spec.ts',
        '**/sign-up.spec.ts',
      ],
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: './tests/e2e/fixtures/storage-state-auth.json',
      },
    },

    // Firefox: split into msg/gen the same way as chromium
    {
      name: 'firefox-msg',
      testMatch: '**/messaging/**',
      testIgnore: ['**/examples/**'],
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Firefox'],
        storageState: './tests/e2e/fixtures/storage-state-auth.json',
      },
    },
    {
      name: 'firefox-gen',
      testIgnore: [
        '**/messaging/**',
        '**/examples/**',
        '**/rate-limiting.spec.ts',
        '**/brute-force.spec.ts',
        '**/sign-up.spec.ts',
      ],
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Firefox'],
        storageState: './tests/e2e/fixtures/storage-state-auth.json',
      },
    },

    // WebKit: split into msg/gen the same way as chromium
    {
      name: 'webkit-msg',
      testMatch: '**/messaging/**',
      testIgnore: ['**/examples/**'],
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Safari'],
        storageState: './tests/e2e/fixtures/storage-state-auth.json',
      },
    },
    {
      name: 'webkit-gen',
      testIgnore: [
        '**/messaging/**',
        '**/examples/**',
        '**/rate-limiting.spec.ts',
        '**/brute-force.spec.ts',
        '**/sign-up.spec.ts',
      ],
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Safari'],
        storageState: './tests/e2e/fixtures/storage-state-auth.json',
      },
    },

    /* Mobile-first test viewports (PRP-017) */
    ...TEST_VIEWPORTS.filter((v) => v.category === 'mobile').map(
      (viewport) => ({
        name: `Mobile - ${viewport.name}`,
        testIgnore: [
          '**/examples/**',
          '**/rate-limiting.spec.ts',
          '**/brute-force.spec.ts',
          '**/sign-up.spec.ts',
        ],
        dependencies: ['setup'],
        use: {
          ...createDeviceConfig(viewport),
          storageState: './tests/e2e/fixtures/storage-state-auth.json',
        },
      })
    ),

    /* Tablet viewports */
    ...TEST_VIEWPORTS.filter((v) => v.category === 'tablet').map(
      (viewport) => ({
        name: `Tablet - ${viewport.name}`,
        testIgnore: [
          '**/examples/**',
          '**/rate-limiting.spec.ts',
          '**/brute-force.spec.ts',
          '**/sign-up.spec.ts',
        ],
        dependencies: ['setup'],
        use: {
          ...createDeviceConfig(viewport),
          storageState: './tests/e2e/fixtures/storage-state-auth.json',
        },
      })
    ),

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: process.env.SKIP_WEBSERVER
    ? undefined
    : process.env.CI
      ? {
          command: 'npx serve out -l 3000',
          url: 'http://localhost:3000',
          reuseExistingServer: false,
          timeout: 60 * 1000,
          stdout: 'pipe',
          stderr: 'pipe',
        }
      : {
          command: 'pnpm run dev',
          url: 'http://localhost:3000',
          reuseExistingServer: true,
          timeout: 120 * 1000,
          stdout: 'pipe',
          stderr: 'pipe',
        },

  /* Output folders */
  outputDir: 'test-results/',
});
