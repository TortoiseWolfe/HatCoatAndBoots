<!--
Sync Impact Report - v1.0.0 Ratification (Cradle-to-Cradle Reframe)
Ratification Date: 2026-05-28
Version: (forked from ScriptHammer post-PR-#114) → 1.0.0 (FRESH RATIFICATION)
Project: HatsCoatsAndBoots — a kids' book on sustainable natural building

Rationale for fresh v1.0.0 rather than v1.x.x amendment:
  This is a fork from ScriptHammer (commit cb35131, post-PR-#114) followed
  by a wholesale principle reframe. The new constitution puts William
  McDonough's cradle-to-cradle ethics in the top slots (I–V) and demotes
  ScriptHammer's six original principles (component pattern, TDD, PRP/SpecKit,
  Docker, progressive enhancement, privacy) into a "Mandatory Constraints"
  section beneath them — the structural pattern used by SpokeToWork's v1.0.0
  constitution. This is a fresh constitution for a new project, not an
  amendment of the upstream's; semantic versioning starts at 1.0.0 here.

Source-of-truth for principles I–V:
  - TranScripts/Construction/Construction_Edited/cradle_to_cradle_design_mcdonough_ted2007.md
  - TranScripts/Construction/Construction_Edited/resource_abundance_by_design_mcdonough_wef2015.md
  Both .md files carry clickable [H:MM:SS](?t=SECONDS) anchors that link
  back to specific moments in the source talks. Cite those anchors when
  amending or interpreting any principle below.

Constitutional Alignment at v1.0.0:
  I. Design Is Intention                          (McDonough TED2007 ?t=175)
  II. Be More Good, Not Just Less Bad             (McDonough WEF2015 ?t=634)
  III. Two Metabolisms — Biological & Technical   (McDonough TED2007 ?t=821)
  IV. Buildings (and Components) as Assets        (McDonough TED2007 ?t=509)
  V. Hats, Coats, and Boots                       (project-specific synthesis)

Template Consistency (carried forward from ScriptHammer cb35131):
  ✅ .specify/templates/plan-template.md            (no change required)
  ✅ .specify/templates/spec-template.md            (no change required)
  ✅ .specify/templates/tasks-template.md           (no change required)
  ✅ .specify/templates/commands/*.md               (no change required)
  ✅ Wireframe gate from ScriptHammer v1.0.2        (preserved in Constraints)

Family Position:
  HatsCoatsAndBoots is a ScriptHammer family fork (web/Next.js/Docker/SpecKit
  stack — sibling of SpokeToWork and TurtleWolfe). Its content domain is a
  children's book on sustainable natural building, not a generic web app.
  See /home/TurtleWolfe/repos/CLAUDE.md for the 5-track family context.

Inherited from ScriptHammer PR #114 (squash merge cb35131):
  - The deprecated `src/middleware.ts` pattern has been removed from
    ScriptHammer. Route protection lives in the `<ProtectedRoute>` client
    component. This fork inherits the cleaner state and never has to
    re-explain the middleware-vs-output:export tension.

Future planning-repo extraction:
  When this book ships, extract HatsCoatsAndBoots_planning/ as a sibling
  paper/design repo for a real-world physical sustainable build (mirrors
  the GrimGlow → grimglow-unity extraction). The same I–V apply; the
  artifacts there become site analysis, materials lists, and building
  drawings instead of React components.
-->

# HatsCoatsAndBoots Constitution

**Project:** A children's book teaching sustainable natural building through the
"Hats, Coats, and Boots" mnemonic for good vernacular architecture, governed
by William McDonough's cradle-to-cradle design ethics. A fork of ScriptHammer
(web/Next.js/Docker/SpecKit) — same machinery, ethics-first reframe.

The five principles below apply on **both layers simultaneously**: they shape
what the book teaches kids AND how the codebase is built. The disciplines
under "Mandatory Constraints" are the _how_; the principles above them are
the _why_.

## Core Principles

### I. Design Is Intention

Every artifact reflects a choice about what kind of world it serves. Before
writing a page or a component, ask McDonough's question:
_"How do we love all the children of all species for all time?"_
(see `TranScripts/Construction/Construction_Edited/cradle_to_cradle_design_mcdonough_ted2007.md`
→ `?t=175`).

**Forbidden:** the "strategy of tragedy" — outcomes nobody intended (pollution,
tech debt, dark patterns) becoming the _de facto_ plan because there was no
better plan. If a feature's plan is silent on what the world looks like when
it succeeds, the plan is incomplete.

**Required:** every PRP states explicitly what _thriving_ looks like, not just
what doesn't fail. Every book page makes its intention legible to a child.

### II. Be More Good, Not Just Less Bad

_"If we intend to be less bad, we'll still be bad — just less so by definition."_
(`...resource_abundance_by_design_mcdonough_wef2015.md` → `?t=634`).

**Concretely for the book:** pages don't just avoid greenwashing claims; they
teach what _thriving_ buildings actively give back — oxygen, rainwater,
habitat, daylight, soil health.

**Concretely for the code:** components don't just avoid bugs; they actively
make the next component easier to write. A merged PR must leave the codebase
in a better state than it found it — not "neutral with the bug fixed."
Reduction _and_ increase, simultaneously.

### III. Two Metabolisms — Biological & Technical

Every material (in the book) and every dependency/asset (in the codebase)
belongs in one of two closed loops
(`...cradle_to_cradle_design_mcdonough_ted2007.md` → `?t=821`):

- **Biological nutrition** — returns safely to the soil. Book examples: cob,
  straw, hemp, timber, thatch, lime plaster. Code corollary: user-generated
  content, learning state, drawings — owned by the user, exportable,
  regenerable. Stored in formats they can take with them (Markdown, JSON,
  SVG), never trapped.
- **Technical nutrition** — stays in closed industrial cycles forever. Book
  examples: steel, glass, aluminum (since 1850, ~75% of all aluminum ever
  made is still in circulation). Code corollary: dependencies, infrastructure,
  build artifacts — must be replaceable, kept in Docker so they don't bleed
  into the host, and chosen against lock-in.

**Downcycling is failure.** Never let car steel become rebar (book lesson).
Never let production code become an abandoned `lib/legacy/` (code lesson).
If a dependency cannot be removed cleanly, it doesn't belong in this codebase.

### IV. Buildings (and Components) as Assets, Not Liabilities

The bird's-eye test
(`...cradle_to_cradle_design_mcdonough_ted2007.md` → `?t=509`): a sealed
Houston glass tower is a "vertical gas chamber"; a roofed-in meadow is a
nesting ground.

**For the book:** every example structure must demonstrably _give back_ —
make oxygen, harvest rainwater, host wildlife, produce food, generate
energy. Liabilities (carbon emitters, water consumers, habitat destroyers)
appear only as cautionary contrasts.

**For the code:** every component must _give back_ — be exported with a
Storybook story (so the next builder finds it), a unit test (so they trust
it), and an accessibility test (so it serves everyone). Components without
all three are liabilities; CI rejects them. Documentation is part of the
component, not separate from it.

### V. Hats, Coats, and Boots — First-Principles Architecture

The book's spine and the project's quality gate. A good building has:

- **A hat** — generous roof overhang that protects walls from sun and
  rain; the canonical natural-building defense against water damage.
- **A coat** — continuous insulated thermal envelope; the body of the
  building stays warm in winter, cool in summer, with minimal energy.
- **Boots** — foundation that lifts the structure above wet ground and
  rotting organics; prevents capillary moisture from destroying everything
  above.

**For kids:** protect the head, warm the body, keep the feet dry. Three
parts every shelter needs. Same as a person.

**For code:** every feature has its own hat, coat, and boots, operationalized
as the Quality Gate below. Nothing ships missing one of the three.

## Mandatory Constraints

These are the operational disciplines inherited from ScriptHammer. They are
_how_ we build; principles I–V are _why_. Constraints stay enforced by CI;
violations break the build.

### Docker-First Development

All development happens in containers. Never install packages on the host
(`pnpm install` runs _inside_ the container). Never `sudo` to fix permissions.
The container runs as your user with correct UID/GID. This is also Principle
III in operational form: dependencies stay in their closed technical-nutrition
loop, isolated from the host.

### 5-File Component Pattern

Every component MUST ship as five files in its own directory:

```
ComponentName/
  index.tsx                          # barrel export
  ComponentName.tsx                  # the component
  ComponentName.test.tsx             # Vitest unit + RTL component tests
  ComponentName.stories.tsx          # Storybook story (printable spread)
  ComponentName.accessibility.test.tsx  # Pa11y a11y test
```

Generate with `pnpm run generate:component` — never create by hand. CI rejects
components missing any of the five files. This is Principle IV in operational
form: every component gives back via test + story + a11y.

### Test-First Development

RED → GREEN → REFACTOR. Tests precede implementation. Stack:

- **Vitest** — unit + component tests; 25%+ coverage minimum, critical paths
  comprehensive.
- **Playwright** — E2E for user workflows.
- **Pa11y** — accessibility (WCAG 2.1 AA, zero violations).
- **Storybook** — visual + component documentation; every component has a
  story (which doubles as the book's printable spread).

Tests run on pre-push via Husky.

### SpecKit Workflow (with the v1.0.2 Wireframe Gate)

All features flow through:

```
/specify → /clarify
       → /wireframe.generate → /wireframe.review     [HARD GATE]
       → /plan → /checklist → /tasks
       → /analyze → /implement
       → /wireframe.screenshots                      [post-implement regression]
```

The wireframe gate (inherited from ScriptHammer v1.0.2) is mandatory.
Pure-infrastructure PRPs ship a "no UI" wireframe stub rather than skipping
the step. For this book project, the wireframe step doubles as **page layout
review** — the visual design of a book page is a wireframe.

### Route Protection: Client-Side, Not Middleware

Routes that require auth use the `<ProtectedRoute>` client component
(`src/components/auth/ProtectedRoute/`) inherited from ScriptHammer. The
Next.js `middleware.ts` pattern doesn't run with `output: 'export'` and was
removed from ScriptHammer in PR #114. Data security is enforced at the
database layer via Postgres RLS policies, not at the request layer. Defense
in depth.

### Static Hosting

Deploys to GitHub Pages. No server-side API routes. All server logic lives in
Supabase (database, Edge Functions, triggers). The book itself must work
offline — Principle V's "boots" applied to deployment.

### Progressive Enhancement + WCAG AA

Core HTML works first. Then PWA (offline support). Then a11y (colorblind
modes, font scaling, keyboard nav, screen reader). Then performance (90+
Lighthouse across Performance, Accessibility, Best Practices, SEO). A child
using a screen reader must be able to read this book.

### Privacy & Compliance First

GDPR-honest by default. Cookie consent before any tracking. Analytics only
after explicit consent. Geolocation only after explicit permission. RLS on
every Supabase table. No third-party services without a consent modal. A
kids' book that surveils its readers fails Principle I.

## Quality Gates (Operationalizing Principle V)

Every PR / feature ships with all three. CI is configured to fail any of them.

### Hat — Graceful Failure & Resilience

- Every interactive feature has an error boundary.
- Every page has a no-JS fallback story (HTML works without JavaScript).
- Every external dependency has a degraded mode (Supabase down → local fallback;
  font CDN down → system fonts).
- Lighthouse Best Practices ≥ 90.

### Coat — Typed, Tested, Insulated

- `pnpm tsc --noEmit` returns zero errors.
- `pnpm test` (Vitest) green; coverage ≥ 25% on changed files, no regression
  in overall coverage.
- `pnpm test:e2e` (Playwright) green.
- `pnpm test:a11y` (Pa11y) zero WCAG AA violations.
- `pnpm lint` zero errors, zero new warnings.
- ESLint + Prettier + Husky pre-commit hooks pass.

### Boots — Deployable, Grounded

- `pnpm build` succeeds with zero warnings.
- Static export generates successfully (GitHub Pages compatibility).
- First Load JS under 150 KB.
- Lighthouse Performance ≥ 90, Accessibility ≥ 95.
- CI green on the PR's target branch.
- Preview deploy reachable.

## Governance

### Amendment Procedure

- Amendments use `/speckit.constitution` which auto-syncs `.specify/templates/`
  and writes a Sync Impact Report at the top of this file.
- Amendments cite the McDonough timestamp anchor(s) they hang from. New
  evidence from additional sources (e.g., when ADA / building-code transcripts
  are added to `TranScripts/Construction_Edited/`) is welcome and required if
  it changes the meaning of an existing principle.
- Each amendment documents rationale, impact analysis, and migration plan if
  breaking.

### Versioning (Semver)

- **MAJOR** — principle removal, redefinition, or governance restructure.
- **MINOR** — principle addition, materially expanded scope.
- **PATCH** — clarifications, wording, typos.

### Compliance & Enforcement

- All PRs verify constitutional compliance — CI enforces the technical
  Mandatory Constraints automatically; reviewers check principle adherence
  for the ethical reframe.
- This constitution supersedes all other practices. Sprint constitutions may
  temporarily override for focused work, with documented rationale.
- Use `CLAUDE.md` at the repo root for AI-assistance development guidance.

### Source-of-Truth Discipline

When a principle is ambiguous, **return to the source**. The McDonough
transcripts at `TranScripts/Construction/Construction_Edited/*.md` carry
clickable timestamp anchors — read the actual passage before interpreting.
The No-Fabrication policy from `TranScripts/CLAUDE.md` applies here too: do
not invent McDonough quotes or principles not present in the source.

**Version**: 1.0.0 | **Ratified**: 2026-05-28 | **Last Amended**: 2026-05-28

## Amendment Log

### v1.0.0 — 2026-05-28 — Ratification

Fresh ratification of a constitution for the HatsCoatsAndBoots project (forked
from ScriptHammer cb35131 — post-PR-#114 cleanup, then wholesale-reframed).
Five principles in the Core slots derive from William McDonough's two
Construction transcripts; six ScriptHammer disciplines move into Mandatory
Constraints. Structural pattern mirrors SpokeToWork's v1.0.0. The cleaner
inheritance (no dead middleware) is courtesy of PR #114's upstream fix. See
the Sync Impact Report at the top of this file for full alignment notes.
