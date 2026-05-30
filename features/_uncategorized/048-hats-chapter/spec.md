# Feature Specification: The "Hat" Chapter

**Feature Branch**: `048-hats-chapter`
**Created**: 2026-05-29
**Status**: Draft
**Input**: User description: "The 'Hats' chapter — first content chapter of the HatsCoatsAndBoots book for students aged 13–18. Teaches why a roof needs an overhang (the building's hat): blocks high summer sun, admits low winter sun, sheds rain clear of the wall base. Interactive illustrated-blueprint layered-diagram viewer (port of The House That Code Built). No reader auth. Static export. Hat/Coat/Boots constitution gates + full accessibility."

## Overview

The first content chapter of the book teaches one idea: a generous roof overhang — the building's **hat** — does three jobs at once. It shades the wall and window from the high summer sun (so the room stays cool without machines), it lets the low winter sun reach in through the window (so the room warms for free), and it sheds rain away from the base of the wall (so the wall stays dry). The chapter teaches this not as a list of facts to memorize but as a **reasoning process a reader discovers by changing one thing at a time** on an interactive cross-section drawing — an "illustrated blueprint." The reader peels diagram elements on and off and watches what each one does.

**It is one building, wearing all three.** Hat, Coat, and Boots are not three separate drawings — they are three parts of the _same_ building, sharing one coordinate space: the hat (roof) sits on top of the coat (the insulated thermal envelope), which sits on the boots (the foundation). The chapter establishes a **single shared building viewer** in which a "chapter" is a _focus_ on one region of that one building. The Hat chapter foregrounds the roof region (and may dim the rest), but the whole building stays present and aligned, so a reader always sees how the roof connects to the wall below it and the foundation under that. Coat and Boots are focuses on the very same building, navigable from day one, with their region's teaching content filled in by later slices.

This shared-building viewer establishes the **reusable reading pattern** for the entire book: one aligned, layered model; chapter focuses that foreground a region; and individual element toggles. Proving it once here is the point of this slice.

The flat "illustrated blueprint" cross-section built in this slice is also the foundation for a future 3D building (a follow-up slice will add a real 3D model, with these flat layers becoming a teaching overlay that stays aligned to it; the flat cross-section remains the graceful fallback when 3D or scripts are unavailable). Because the building shares one coordinate space from day one, that 3D model drops in later without rework.

This chapter ships **English-only**. Multilingual support (English + Spanish + Simplified Chinese, a language switcher, URL-reflected language, and translated drawing labels) has been **carved out into its own feature** — issue [#2](https://github.com/TortoiseWolfe/HatsCoatsAndBoots/issues/2) (`049-i18n-multilingual`), with this chapter as its first consumer. To keep that future work rework-free, this slice still authors the drawing's dimension/angle labels as **HTML text overlaid on language-neutral artwork** (not baked into the SVG), and writes all reader-facing text as discrete externally-referenced strings, so 049 can add a translation layer without restructuring components.

## UI Mockup

Signed off: 2026-05-29

The book is **one building** drawn once in a shared coordinate space; each chapter is a _focus_ on one region of that building. All four wireframes embed a byte-identical building (`<g id="building" transform="translate(360,150)">`) so they register as transparency layers — only the per-region opacity emphasis and surrounding controls differ.

- Book index (one building → three chapters): [`wireframes/01-book-index.svg`](./wireframes/01-book-index.svg) (light)
- Hat chapter (roof focus): [`wireframes/02-book-hats-viewer.svg`](./wireframes/02-book-hats-viewer.svg) (light)
- Coat chapter (envelope focus, coming-soon): [`wireframes/03-book-coat-coming-soon.svg`](./wireframes/03-book-coat-coming-soon.svg) (light)
- Boots chapter (foundation focus, coming-soon): [`wireframes/04-book-boots-coming-soon.svg`](./wireframes/04-book-boots-coming-soon.svg) (light)

These wireframes are spec constraints — implementation should match their one-building/shared-coordinate layout, the chapter-focus model, the 3-region building, and the control structure (chapter rail + guided views + per-layer toggles). Deviations require spec revision.

**Notes carried into implementation:** (1) the no-JS Hat-gate (FR-008) is a state of the Hat page, not a separate screen; (2) the EN/ES/中文 language switcher shown is a forward-looking stub — live translation is deferred to feature 049 (issue #2), this slice is English-only; (3) building art is schematic at wireframe stage — the "illustrated blueprint" treatment is applied during implementation.

## Clarifications

### Session 2026-05-29

- Q: Should guided-view/toggle state be reflected in the page address (shareable, survives reload) or purely in-session? → A: URL-reflected views — selecting a guided view updates the address so a particular view is shareable and survives reload.
- Q: How should the chapter's display typography be sourced (font failure mode)? → A: Self-hosted/bundled font with a system fallback — no third-party request; if the font fails to load, a declared system font stack renders the text.
- Q: What language scope should this chapter target for this slice? → A: **English-only for this slice.** Multilingual was initially clarified into this spec, then carved out to its own feature (issue [#2](https://github.com/TortoiseWolfe/HatsCoatsAndBoots/issues/2) / `049-i18n-multilingual`) so this chapter ships English-first and i18n lands on top. The in-drawing labels are still authored as a translatable HTML overlay (not baked into the SVG) and text is authored as externally-referenced strings, so 049 has no rework. The carved-out 049 scope (decided during that clarification, now owned by the issue) is: EN + ES + Simplified Chinese (`zh-Hans`); a language switcher with URL-reflected language; the self-hosted "illustrated blueprint" display font is Latin-only while Chinese renders via the reader's system/device CJK font (no bundled CJK webfont, to protect the <150 KB budget); Spanish & Chinese ship as DRAFT translations explicitly flagged "needs native-speaker review."
- Q: Are Hat/Coat/Boots three separate viewers, or one building? → A: ONE building wearing all three, in one shared coordinate space (roof on coat on boots, always aligned). A "chapter" is a _focus_ on one region of that single building viewer, not a separate drawing/page.
- Q: How do the flat teaching layers relate to the 3D building this slice? → A: 2D-first now — build the shared-coordinate flat layered viewer this slice; add the real 3D building (reusing feature 047's R3F Scene/FallbackPanel) in a follow-up slice, where the flat layers become a teaching overlay aligned to the 3D model and the flat cross-section remains the fallback. The shared coordinate space is established now so 3D drops in without rework.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - A reader discovers why the overhang matters (Priority: P1)

A student aged 13–18 opens the Hat chapter and is shown a complete, labeled cross-section of a wall with a roof overhang, sun, and rain. Using guided chapter "views," they reveal the drawing one idea at a time: first the bare wall (the problem), then the overhang (the hat), then the summer sun being blocked, then the winter sun getting in, then the rain being shed. By the end they can explain in their own words why the overhang's reach is a deliberate design choice, not decoration.

**Why this priority**: This is the entire educational payload of the chapter. If only this works, the chapter already delivers its value — a reader leaves understanding the "hat" idea.

**Independent Test**: Load the chapter, step through each guided view in order, and confirm the drawing changes to show exactly the intended elements at each step with an explanation that updates to match. Verifiable without any other story.

**Acceptance Scenarios**:

1. **Given** the chapter has just loaded with no view specified in the address, **When** the reader looks at the default view, **Then** they see the full labeled cross-section (all elements visible) with an introductory explanation.
2. **Given** the reader selects the "bare wall" view, **When** the view applies, **Then** only the wall (and ground) is shown and the explanation describes the unprotected-wall problem.
3. **Given** the reader selects the "roof line" view, **When** the view applies, **Then** the wall plus the overhang are shown and the explanation names the overhang as the "hat."
4. **Given** the reader selects the "how it sheds water" view, **When** the view applies, **Then** the wall, overhang, and rain are shown and the explanation describes rain being shed clear of the wall base.
5. **Given** any view is active, **When** the reader reads the on-screen explanation, **Then** the explanation text always matches the elements currently visible.
6. **Given** the reader has selected a guided view, **When** they copy the page address and open it again (or reload), **Then** the chapter restores that same guided view rather than the default.

### User Story 2 - A reader explores freely by toggling individual elements (Priority: P2)

After (or instead of) the guided views, a curious reader switches individual diagram elements on and off themselves — turning off the overhang to compare, turning the summer and winter sun on together to contrast the two angles — to test their own questions about the drawing.

**Why this priority**: Exploration deepens the lesson and respects an older reader's curiosity, but the chapter still teaches its core idea through the guided views alone (P1). This builds on P1.

**Independent Test**: With the chapter loaded, toggle each element control individually and confirm only that element appears/disappears, and that hand-toggling away from a guided view is reflected as a non-preset ("custom") state.

**Acceptance Scenarios**:

1. **Given** a guided view is active, **When** the reader toggles one element off, **Then** only that element disappears and the chapter no longer reports a named view as active (it is now a custom combination).
2. **Given** an element is hidden, **When** the reader toggles it on, **Then** that element appears over the existing drawing without disturbing the others.
3. **Given** both the summer and winter sun elements are toggled on, **When** the reader compares them, **Then** the two sun angles are visually distinguishable from each other (not only by color).

### User Story 3 - Every reader can use the chapter, regardless of device or ability (Priority: P3)

The chapter is fully usable by a reader on a phone, by a reader using only a keyboard, by a reader using a screen reader, by a reader who has turned off animations, and by a reader whose browser never runs the interactive scripts at all. No reader is shut out, and no reader needs an account.

**Why this priority**: Accessibility and graceful degradation are constitutional requirements (the Hat and Coat gates), not optional polish. It is P3 only because P1/P2 define the behavior this story makes universally reachable.

**Independent Test**: Exercise the chapter with JavaScript disabled, with keyboard only, with a screen reader, at a narrow viewport, and with reduced-motion enabled — confirming the lesson remains legible and the controls remain operable (or gracefully inert) in each case.

**Acceptance Scenarios**:

1. **Given** the reader's browser does not run the interactive scripts, **When** the chapter loads, **Then** the complete labeled drawing (all elements) and the chapter text are fully visible and readable; controls are present but inert rather than broken.
2. **Given** a keyboard-only reader, **When** they tab into the controls and use arrow keys, **Then** focus moves between controls and Space/Enter activates them, with a visible focus indicator and a skip link to the main content.
3. **Given** a screen-reader reader, **When** they navigate the controls, **Then** each control announces its name and on/off state, and the explanation updates are announced when a view changes.
4. **Given** a reader on a narrow (phone) viewport, **When** the chapter loads, **Then** the three control/diagram regions stack into a single readable column and all controls remain large enough to tap.
5. **Given** a reader who prefers reduced motion, **When** they change views or toggle elements, **Then** the drawing updates without animated transitions.

### Edge Cases

- **Hand-toggling to an empty drawing**: if a reader turns every element off, the diagram stage is empty but the chapter remains stable and the reader can turn elements back on or pick a guided view to recover.
- **Returning to a guided view after custom toggling**: selecting a named view re-establishes exactly that view's element set, overriding any custom toggles.
- **Reaching a not-yet-written chapter**: focusing Coat or Boots enters the SAME shared building viewer with that region foregrounded; because their teaching layers/prose are not yet authored, the region's content area shows a clear "coming soon" state while the shared building remains visible — never a broken or empty page.
- **Pre-interactive moment**: in the brief window before scripts become ready (or if they fail to load), the reader still sees the complete drawing and text (same as the no-script case), never a blank stage.
- **Printing the page**: a printed copy shows the complete labeled drawing and the chapter text.
- **Unrecognized view in the address**: if the page address names a view that does not exist, the chapter falls back to the default "everything" view rather than erroring or showing an empty stage.
- **Sharing a custom toggle combination**: because manual toggles are not encoded in the address this slice, sharing the address of a hand-toggled "custom" state restores the default view, not the exact toggles (acceptable for this slice).

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The viewer MUST present a single labeled cross-section of ONE building in one shared coordinate space, organized into three regions that always align and stack: the **roof/Hat** region (roof and projecting overhang), the **envelope/Coat** region (the insulated wall and window), and the **foundation/Boots** region (the footing that lifts the building above the ground). The Hat chapter's elements — the roof overhang, the summer (high-angle) sun, the winter (low-angle) sun, the rain, and the dimension/angle labels — render in registration with the wall (envelope) and foundation beneath them, so the building reads as whole. The pictorial artwork MUST be language-neutral, and the words in the "labels" element MUST be rendered as HTML text overlaid on the drawing rather than fixed words baked into the artwork — so the carved-out multilingual feature (issue [#2](https://github.com/TortoiseWolfe/HatsCoatsAndBoots/issues/2) / `049-i18n-multilingual`) can translate the labels without re-authoring the artwork. (This slice authors only the English label text.)
- **FR-001a**: All drawing elements across all three regions MUST share one coordinate space such that every element registers in a fixed position relative to the others; foregrounding or dimming a region MUST NOT move any element. (This shared registration is what lets a later slice attach a 3D building behind the same layers without rework.)
- **FR-002**: The chapter MUST offer guided "views," each of which shows a specific, named subset of the drawing's elements and is accompanied by an explanation matching that subset. The required views are: **everything** (default), **bare wall**, **roof line**, and **how it sheds water**.
- **FR-003**: Selecting a guided view MUST update both the visible drawing elements and the on-screen explanation together, and MUST visibly indicate which view is active.
- **FR-004**: The reader MUST be able to toggle each individual drawing element on or off independently of the guided views.
- **FR-005**: When the reader's manual toggles no longer match any named view, the chapter MUST indicate that no named view is active (a "custom" combination) rather than falsely showing a named view as active.
- **FR-006**: Hidden elements MUST remain part of the drawing's layout (occupying their place, simply not shown) so that showing them again re-registers them in exactly the same position over the other elements — i.e., elements never shift when toggled.
- **FR-007**: The Hat chapter MUST be reachable at a stable, shareable location that enters the shared building viewer focused on the roof/Hat region, alongside discoverable entry points for the Coat and Boots chapters that enter the SAME viewer focused on their respective regions. Coat and Boots are navigable from day one; their region's teaching layers and prose are filled in by later slices, and until then those focuses present a clear "coming soon" state for the region's content while still showing the shared building.
- **FR-007b**: Selecting a chapter focus (Hat / Coat / Boots) MUST foreground that region's layers on the shared building and MAY dim the others, without ever implying the building is a different drawing; the building outline and the other regions remain present and aligned. The focus MUST be reflected in the page address consistently with FR-007a.
- **FR-007a**: Selecting a guided view MUST update the page address so that the address identifies the active view; opening or reloading that address MUST restore the same guided view. When the address specifies no view (or an unrecognized one), the chapter MUST fall back to the default "everything" view. Manual per-element toggles (the "custom" state) need not be encoded in the address this slice.
- **FR-008**: The chapter MUST be fully readable and the complete drawing fully visible **without** requiring interactive scripts to run; interactivity is an enhancement layered on top of a complete static reading experience.
- **FR-009**: The chapter MUST require **no reader account, sign-in, or personal data** of any kind; it is public and anonymous.
- **FR-010**: All controls MUST be operable by keyboard alone, with visible focus, arrow-key movement within each control group, Space/Enter activation, and a skip link to the main content.
- **FR-011**: All controls MUST expose their name and current on/off state to assistive technology, and explanation changes MUST be announced to assistive technology.
- **FR-012**: The two sun elements (summer and winter) MUST be distinguishable from each other by more than color alone (e.g., by shape and angle), so colorblind readers can tell them apart.
- **FR-013**: The chapter MUST honor a reader's reduced-motion preference (both the operating-system/browser preference and the application's own reduced-motion setting) by removing animated transitions.
- **FR-013a**: Any custom display typography used in the drawing or chapter MUST be served from within the site itself (no third-party request) and MUST declare a system-font fallback, so that if the custom font fails to load, all labels and text remain legible. (The custom display font is Latin-only; the system-CJK font strategy for Simplified Chinese is part of carved-out issue [#2](https://github.com/TortoiseWolfe/HatsCoatsAndBoots/issues/2), but using a self-hosted Latin-only font here keeps that future addition rework-free.)
- **FR-014**: On narrow viewports the three regions (guided views, drawing, element toggles) MUST reflow into a single readable column, and every interactive control MUST present a touch target of at least 44×44 pixels.
- **FR-015**: The reader's path through the chapter MUST be expressible as the reading sequence: bare wall (problem) → add overhang → summer sun blocked → winter sun admitted → rain shed → measurements — so the guided views and explanations reinforce a one-variable-at-a-time reasoning process.
- **FR-016**: This slice ships **English only**. To keep the carved-out multilingual feature (issue #2 / `049-i18n-multilingual`) rework-free, all reader-facing text — prose, guided-view names, explanations, element-toggle labels, and in-drawing labels — MUST be authored as discrete, externally-referenced strings (not hard-coded inline), so a translation layer can replace them later without restructuring the components. Building the language switcher, URL-reflected language, and the Spanish/Chinese strings themselves is **out of scope for this slice** and owned by issue #2.

### Key Entities _(include if feature involves data)_

- **Building**: the single subject of the whole book — one structure in one shared coordinate space, drawn as an aligned cross-section. Every chapter is a view of this same building. It is composed of three Regions whose layers always stack and register together.
- **Region**: one of the three parts of the building — **roof/Hat**, **envelope/Coat**, **foundation/Boots**. A region groups the Drawing Elements that belong to it and is the target of a chapter focus. Foregrounding a region (and optionally dimming the others) never changes the building's geometry.
- **Drawing Element (Layer)**: one named, individually-showable part of the building, tagged with the Region it belongs to (wall/envelope, roof overhang, summer sun, winter sun, rain, foundation, labels…). Carries a human-readable name, an on/off default, a stacking order in the shared coordinate space, and a text alternative for assistive technology. The pictorial elements are language-neutral artwork and decorative once the labels are present. The **labels** element is the exception: its words (dimension and angle callouts) are HTML text positioned over the drawing, not fixed artwork — authored in English this slice, but structured so the carved-out multilingual feature (issue [#2](https://github.com/TortoiseWolfe/HatsCoatsAndBoots/issues/2)) can translate them without re-authoring the artwork.
- **Guided View (Preset)**: a named teaching step within a chapter focus, defined as the exact set of Drawing Elements it makes visible, plus the explanation text shown while it is active. For the Hat focus the four named views are everything (default), bare wall, roof line, and how it sheds water. A "custom" state is the implicit view when the visible set matches no named view.
- **Chapter (Focus)**: a focus on one Region of the shared Building (Hat → roof, Coat → envelope, Boots → foundation), with a title, a stable location that enters the shared viewer pre-focused, an availability state for its teaching content (Hat content is available this slice; Coat and Boots content is coming soon), and ordering relative to its neighbors. A chapter is NOT a separate drawing or page.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A reader can move through all four guided views and reach the full "why the overhang matters" explanation in under 2 minutes, without instruction.
- **SC-002**: 100% of the chapter's lesson — the complete labeled drawing and all explanatory text — is visible and readable with interactive scripts disabled.
- **SC-003**: The chapter has zero WCAG 2.1 AA accessibility violations in automated testing, and every interactive control is reachable and operable by keyboard alone.
- **SC-004**: The chapter loads as a static page with no server dependency and a first-load payload well under the project's 150 KB budget (the full set of drawing elements totals on the order of ~11 KB).
- **SC-005**: Toggling any single element changes only that element's visibility and never causes any other element to move on screen.
- **SC-006**: On a phone-width viewport, all three regions are reachable in a single scroll column and every control meets the 44×44 px touch-target minimum.
- **SC-007**: Selecting a guided view always results in the displayed drawing and explanation matching that view's definition exactly (no mismatch between shown elements and described elements).
- **SC-008**: 100% of the chapter's reader-facing text (prose, view names, explanations, toggle labels, in-drawing labels) is authored as discrete externally-referenced strings rather than hard-coded inline, so the carved-out multilingual feature (issue #2) can add a translation layer without restructuring components.
- **SC-011**: Switching the chapter focus (Hat → Coat → Boots) never moves any building element on screen — the roof, envelope, and foundation stay aligned and registered in the same coordinate space across all focuses (the building reads as one structure, not three drawings).

## Assumptions

- **Audience & tone**: readers are 13–18; language builds intuition and respects the reader (not babyish, not jargon-heavy).
- **Language**: ships **English only**. Multilingual (EN + ES + Simplified Chinese, language switcher, URL-reflected language, translated labels, system-CJK font strategy, draft-translation discipline) is carved out to its own feature, issue [#2](https://github.com/TortoiseWolfe/HatsCoatsAndBoots/issues/2) (`049-i18n-multilingual`), with this chapter as its first consumer. This slice keeps the labels as an HTML overlay and authors text as externally-referenced strings so 049 has no rework.
- **Reading model**: chapter-per-route navigation (a dedicated Hat location, with Coat/Boots as discoverable coming-soon entries this slice) was chosen over a single long scroll or paginated spreads.
- **Visual style**: "illustrated blueprint" — the drawing reads as a precise architectural cross-section but is rendered with the warmth of a children's-book illustration; it is a deliberate evolution of the prior book _The House That Code Built_.
- **Sun angles**: the summer/winter sun angles in the drawing are illustrative (representative of a mid-latitude site), not computed for the reader's location; a short caption notes that the exact angles vary by latitude. A reader-adjustable overhang-depth control and latitude-accurate angles are explicitly **out of scope** for this slice and deferred to a later chapter.
- **One building, chapters = focus**: Hat/Coat/Boots are focuses on a single shared building in one coordinate space (roof on coat on boots), not separate viewers. This slice builds the shared building viewer and authors the Hat (roof) region's teaching content; Coat (envelope) and Boots (foundation) are navigable focuses whose region content is filled in by later slices.
- **2D now, 3D later**: this slice ships the flat illustrated-blueprint cross-section. A follow-up slice adds a real 3D building (reusing feature 047's R3F `Scene`/`FallbackPanel`), with these flat layers becoming an aligned teaching overlay and the flat cross-section remaining the no-3D/no-JS fallback. The shared coordinate space is established now so 3D needs no rework.
- **No persistence**: the chapter does not save reader progress this slice (anonymous, stateless); local-only progress saving may be revisited later. (The active view and chapter focus are reflected in the page address per FR-007a/FR-007b, which is shareable/restorable but not "saved progress." Language in the URL is part of carved-out issue #2.)

## Out of Scope (this slice)

- A drag-to-change overhang-depth control with live re-shading.
- Latitude-accurate or geolocated sun angles.
- The Coat (envelope) and Boots (foundation) region teaching content — their guided views, region-specific layers, and prose. (The shared building, their navigable focuses, and their "coming soon" content state ARE in scope; only the authored teaching content is deferred.)
- The 3D building model (R3F/Three.js). This slice is the flat shared-coordinate viewer only; 3D is a follow-up slice.
- Any reader account, login, saved progress, or personal-data collection.
- A guided linear "next step" stepper as a separate control (the guided views already encode the teaching order; a dedicated stepper is a possible later enhancement).
- **All multilingual work** — any language other than English, the language switcher, URL-reflected language, translated drawing labels, the system-CJK font strategy, and draft/native-reviewed Spanish & Chinese copy. This is carved out to issue [#2](https://github.com/TortoiseWolfe/HatsCoatsAndBoots/issues/2) (`049-i18n-multilingual`), which depends on this slice.
