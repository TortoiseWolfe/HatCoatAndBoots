# CLAUDE.md

HatCoatAndBoots — a ScriptHammer-family fork (Next.js 15 / React 19 / Tailwind 4 / DaisyUI / Supabase / PWA), static-exported to GitHub Pages.

Workspace conventions (Docker-first mandate, 5-file component pattern, SpecKit `/specify → … → /implement`, testing stack, deploy/code-quality) live in `/home/TurtleWolfe/repos/CLAUDE.md`. This file only carries what is specific to this repo.

## Environment facts

- Docker service name is **`scripthammer`** (kept from upstream). All commands run inside it, e.g. `docker compose exec scripthammer pnpm …`. Dev server + wireframe viewer are on **port 3000**.
- Commit from **inside the container** (`docker compose exec scripthammer git commit …`) so husky hooks run with the right identity; `git push` from the host (uses your SSH keys).
- **Static hosting (GitHub Pages):** no server-side API routes in prod, no non-`NEXT_PUBLIC_*` env in the browser. All server logic goes in Supabase (Edge Functions / Vault).
- Supabase Cloud free tier auto-pauses after 7 days idle → wake it with `docker compose exec scripthammer pnpm run prime`.
- E2E runs in CI across chromium + firefox + webkit (28 shards) — not local-only.
- Touch targets: `min-h-11 min-w-11` (44px, mobile-first).
- GitHub Actions deploy secrets: see `README.md`. Docs index: see `docs/`.

## Test users

- Primary: `test@example.com` / `TestPassword123!`
- Secondary (email-verification tests): set `TEST_USER_SECONDARY_EMAIL` / `TEST_USER_SECONDARY_PASSWORD` in `.env`.

## Supabase migrations — monolithic only

- **NEVER create separate migration files** (no `032_add_*.sql`, no Supabase CLI migrations — free tier doesn't support them). Edit the single file directly: `supabase/migrations/20251006_complete_monolithic_setup.sql`.
- All statements idempotent (`IF NOT EXISTS`), inside the existing `BEGIN;…COMMIT;`.
- Execute via the Supabase **Management API** with `SUPABASE_ACCESS_TOKEN` (+ `NEXT_PUBLIC_SUPABASE_PROJECT_REF`). Never tell the user to paste SQL into the dashboard, never install psql/pg locally, never open a direct DB connection from Docker (DNS fails).

## Destructive-op & permission rules

- Never `sudo` and never `rm -rf node_modules`/`.next` on the host — the container owns those files. For permission errors or a wedged `.next`: `docker compose down && docker compose up` (restarts + cleans), or `pnpm run docker:clean` in-container.
- Never install packages on the host (`npm/pnpm/yarn install`, `npx …`) — use `docker compose exec scripthammer pnpm add …`.

## CI / E2E safety (hard-won, Round 10 lessons)

- **Never merge a PR while another PR's CI is running against the same shared Supabase backend** — concurrent E2E runs race each other's cleanup hooks and one hits the 60-min job cap. Now guarded by a repo-wide `concurrency:` mutex in `.github/workflows/e2e.yml`; the rule still applies to any future shared backend.
- **Never `git commit --no-verify`** — husky + lint-staged + gitleaks run pre-commit and have caught real secrets. User forbids the bypass. If a hook fails, fix the file it names and re-commit.
- **WebKit gotcha:** assigning `el.scrollTop = N` does not reliably fire a `scroll` event in WebKit (Chromium/Firefox do). In tests that expect scroll-driven UI, dispatch it explicitly: `el.dispatchEvent(new Event('scroll', { bubbles: true }))`.
- **Branch hygiene:** `delete_branch_on_merge=true` is set — don't undo it; `git fetch --prune origin` after each merge; avoid stacked PRs (when a parent merges, GitHub auto-closes a child based on it — re-target the child to `main`).
- Trust `gh run view <id> --json status,conclusion,jobs` for CI state, not the Actions list-page timestamp (it shows the last sub-job's start, which misleads).

## Planning factory (multi-terminal workflow)

This repo also carries the ScriptHammer planning-factory tooling.

- **Terminal git rule: COMMIT ONLY, NEVER PUSH.** Only the Operator has SSH push access. Stay in your lane.
- Roles and their context live in `.claude/roles/` (assembly line: STRATEGY → DESIGN → CODE → TEST → DOCS → RELEASE). Wireframe work is now absorbed into the SpecKit `/speckit.wireframe.*` skills.
- Feature specs: `features/<category>/<NNN-name>/` (+ per-feature `wireframes/`); dependency order in `features/IMPLEMENTATION_ORDER.md`; run `/refresh-inventories` after spec changes. SVG wireframe constants are validated by `.specify/extensions/wireframe/scripts/validate.py`.
