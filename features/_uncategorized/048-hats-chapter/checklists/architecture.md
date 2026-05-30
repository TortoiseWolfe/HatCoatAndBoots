# Checklist: One-Building Invariant & Structural Constraints — Requirements Quality

**Purpose**: Unit-test the _requirements_ (not the implementation) for the architecturally novel constraints that are subtle and easy to under-specify: the shared-coordinate "one building" invariant, the chapter-focus model, no-geometry-shift, URL-reflected state under static export, and i18n-readiness. Each item asks whether the spec is complete, clear, consistent, and measurable.
**Created**: 2026-05-30
**Feature**: [spec.md](../spec.md) · **Focus**: shared-building / chapter-focus / static-export / i18n-readiness invariants
**Depth**: Standard · **Audience**: Reviewer (PR) + spec author

## Requirement Completeness

- [ ] CHK001 - Is the "one building, shared coordinate space" invariant stated as a _requirement_ (MUST), not only as narrative in the Overview? [Completeness, Spec §FR-001/§FR-001a]
- [ ] CHK002 - Are the three regions (roof/Hat, envelope/Coat, foundation/Boots) and the exact set of Hat-region drawing elements (wall, overhang, summer sun, winter sun, rain, labels, foundation) enumerated as requirements? [Completeness, Spec §FR-001/§Key Entities]
- [ ] CHK003 - Are requirements defined for what the Coat/Boots "coming soon" content state must contain (so the shared building still renders) vs what is deferred? [Completeness, Spec §FR-007/§Edge Cases]
- [ ] CHK004 - Is the requirement that all reader-facing text be "externally-referenced strings" specified with enough precision to be checkable (what counts as a string, where they live)? [Completeness, Spec §FR-016/§SC-008]
- [ ] CHK005 - Is the "labels as HTML overlay, not baked into SVG" requirement stated for the labels element specifically, with the artwork required to be language-neutral? [Completeness, Spec §FR-001/§Key Entities: Drawing Element]

## Requirement Clarity

- [ ] CHK006 - Is "foregrounding/dimming a region MUST NOT move any element" defined with an observable criterion (positions identical before/after), not just "never changes geometry"? [Clarity, Spec §FR-001a/§FR-007b]
- [ ] CHK007 - Is "hidden elements remain part of the layout" (FR-006) tied to a concrete mechanism-agnostic guarantee (no reflow / no positional change) rather than implementation wording? [Clarity, Spec §FR-006]
- [ ] CHK008 - Is the URL-reflected state requirement clear about _what_ is encoded (active guided view AND chapter focus) vs what is NOT (manual "custom" toggles)? [Clarity, Spec §FR-007a/§FR-007b]
- [ ] CHK009 - Is the fallback behavior for an unrecognized view/focus in the address specified unambiguously (fall back to default "everything")? [Clarity, Spec §FR-007a/§Edge Cases]
- [ ] CHK010 - Is "shareable, survives reload" defined so it's testable under a static-export constraint (no server to resolve the address)? [Clarity/Ambiguity, Spec §FR-007a]

## Requirement Consistency

- [ ] CHK011 - Is the shared-coordinate invariant stated consistently across FR-001a (registration), FR-006 (no shift), FR-007b (focus doesn't move things), and SC-009 (focus switching moves nothing)? [Consistency, Spec §FR-001a/§FR-006/§FR-007b/§SC-009]
- [ ] CHK012 - Do the "one building / chapter = focus" requirement and the routing requirement (separate /book/hat, /book/coat, /book/boots locations) coexist without implying separate drawings? [Consistency, Spec §FR-007/§FR-007b]
- [ ] CHK013 - Are the i18n-readiness requirements (FR-016, SC-008) consistent with the English-only scope (no switcher, no translations this slice) so a reviewer can't read them as requiring multilingual now? [Consistency, Spec §FR-016/§Out of Scope]
- [ ] CHK014 - Is the "3D drops in later without rework" rationale consistently anchored to the shared-coordinate requirement rather than stated as an independent promise? [Consistency, Spec §FR-001a/§Assumptions: 2D now 3D later]

## Acceptance Criteria Quality

- [ ] CHK015 - Can SC-009 ("switching focus never moves any building element") be objectively verified (e.g., element coordinates identical across focuses)? [Measurability, Spec §SC-009]
- [ ] CHK016 - Can SC-005 ("toggling any single element changes only that element and never moves another") be measured against the full element set, not a sample? [Measurability, Spec §SC-005]
- [ ] CHK017 - Can SC-008 ("100% of reader-facing text is externally-referenced") be objectively verified, and is "100%" tied to an enumerable text inventory? [Measurability, Spec §SC-008]
- [ ] CHK018 - Is the <150 KB / ~11 KB SVG budget (SC-004) attributed to a concrete first-load definition so it's testable? [Measurability, Spec §SC-004]
- [ ] CHK019 - Is SC-007 ("displayed drawing and explanation match the view's definition exactly") backed by each view having an explicit element set in the requirements? [Measurability/Traceability, Spec §SC-007/§FR-002]

## Scenario & Edge-Case Coverage

- [ ] CHK020 - Are requirements defined for the "custom" state's relationship to the URL (sharing a custom toggle combination restores the default view, not the toggles)? [Coverage, Spec §Edge Cases: sharing custom]
- [ ] CHK021 - Are requirements defined for navigating to a Coat/Boots focus before its content exists (shared building still shows, coming-soon content state, never a dead end)? [Coverage, Spec §Edge Cases: not-yet-written chapter]
- [ ] CHK022 - Are the four guided views each defined by an exact, named element subset (everything/bare-wall/roof-line/how-it-sheds-water), so "shows a specific subset" is unambiguous? [Coverage, Spec §FR-002/§US1]
- [ ] CHK023 - Is the reading-sequence requirement (FR-015: bare wall → overhang → summer → winter → rain → measurements) reconciled with the four named views (which are not a strict 6-step sequence)? [Conflict/Ambiguity, Spec §FR-015/§FR-002]

## Dependencies, Assumptions & Boundaries

- [ ] CHK024 - Is the dependency relationship to the carved-out multilingual feature (issue #2 / 049) documented as a one-directional dependency (049 depends on this; this does not depend on 049)? [Dependency, Spec §Out of Scope]
- [ ] CHK025 - Is the assumption "sun angles are illustrative, not latitude-accurate" stated as a bounded scope decision with the latitude-accurate version explicitly out of scope? [Assumption/Boundary, Spec §Assumptions/§Out of Scope]
- [ ] CHK026 - Is the boundary between "shared building + navigable focuses + coming-soon state (in scope)" and "Coat/Boots teaching content (out of scope)" stated crisply enough to prevent scope creep? [Boundary, Spec §Out of Scope]
