# Hat Chapter — Content Source of Truth (Step 0)

This file is the **vetted source** for the Hat chapter's narrative strings (`strings.ts`, T009)
and for what the SVG art (T010–T015) may depict. It pairs a **cited facts sheet** (what is
TRUE and citable) with the **authored narrative** (the reader-facing copy), after an editor
fact-check pass reconciled the two.

**No-fabrication rule (constitution):** the chapter states only TRUE-UNIVERSAL facts
qualitatively; any specific number appears ONLY with its cited source and stated conditions.
Generated 2026-05-30 by a research agent (WebSearch/WebFetch over DOE / PNNL / Building Science
Corp / NOAA / US Navy) + a creative-writing agent, then editor-reconciled.

---

## Part A — Sourced Facts Sheet (the gate)

| #   | Claim                                                                             | Verdict                                              | Citable number?                                                                 | Source                                      |
| --- | --------------------------------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------- |
| 1   | Noon sun is higher in summer than winter at NH mid-latitudes                      | TRUE-UNIVERSAL                                       | Swing ≈ 47° (= 2×23.45°) is universal; absolute altitudes are latitude-specific | NOAA Solar Calculator; Wikipedia "Sun path" |
| 2   | A fixed eave over a south window shades high summer sun yet admits low winter sun | TRUE (mechanism) / SITE-SPECIFIC (full optimization) | No universal number                                                             | DOE Energy Saver; BASC (DOE/PNNL)           |
| 3   | Noon altitude = 90° − \|lat − declination\|; at 40°N ≈ 73° summer / ≈ 27° winter  | TRUE-SITE-SPECIFIC                                   | Yes, ONLY at 40°N on solstices                                                  | NOAA Solar Calculator; US Navy AA           |
| 4   | Overhang-sizing rule of thumb (depth ∝ window height, latitude-tied)              | TRUE-SITE-SPECIFIC                                   | e.g. 36″ window → ~19.25″ overhang **at ~40°N**                                 | BASC (DOE/PNNL), citing NREL 1995           |
| 5   | Overhang sheds rain clear of the wall base, protecting wall + foundation          | TRUE-UNIVERSAL                                       | ~50% less rain deposition (Straube/BSC) — cite if used                          | Building Science Corp BSD-013               |

### Safe to say (qualitative, true everywhere at NH mid-latitudes)

- Summer noon sun rides high; winter noon sun stays low.
- A fixed overhang casts a longer downward shadow in summer (sun high) and shorter in winter (sun low) — the geometric basis of eave design.
- A properly sized overhang can shade a south window in summer while admitting the low winter sun.
- The further north, the lower the winter sun — so sizing is location-specific.
- An overhang sheds rain away from the wall face and the building base, protecting wall + foundation.
- "Generous overhangs" are the recognized first step in controlling rainwater at the wall.

### MUST NOT say without a cited site-specific source

- Any specific solar angle (e.g. "72°/28°") stated as universal — only true at a named latitude/date.
- Any specific overhang depth/ratio as universal — tied to latitude + window height.
- "Reduces rain 50%" as a casual round number — real, but cite Straube/BSC if used.
- "A fixed overhang perfectly balances both seasons" — sources say "can," not "perfectly."
- Anything implying the Southern Hemisphere (seasons reversed there).

### Sources (for the page's Sources section)

1. U.S. DOE Energy Saver — Passive Solar Homes — https://www.energy.gov/energysaver/passive-solar-homes
2. Building America Solution Center (DOE/PNNL) — Shading and Solar Control for Windows and Skylights — https://basc.pnnl.gov/resource-guides/shading-and-solar-control-windows-and-skylights
3. Building Science Corp — BSD-013: Rain Control in Buildings (J. Straube) — https://buildingscience.com/documents/digests/bsd-013-rain-control-in-buildings
4. NOAA Global Monitoring Laboratory — Solar Position Calculator — https://gml.noaa.gov/grad/solcalc/azel.html
5. U.S. Navy Astronomical Applications — Altitude and Azimuth of the Sun — https://aa.usno.navy.mil/data/AltAz
6. Wikipedia — Passive solar building design — https://en.wikipedia.org/wiki/Passive_solar_building_design

---

## Part B — Authored Narrative (editor-reconciled, fact-check PASSED)

**Editor note:** every claim below was checked against Part A. The draft contained NO invented
numbers and NO MUST-NOT statements. No softening was required. McDonough's ethic appears only in
the why-it-matters note and makes no physics claim. APPROVED.

### Chapter title + subtitle

- **Title:** The Hat: What a Roof Knows About the Sun
- **Subtitle:** How a simple overhang does three jobs at once — without a single moving part.

### Intro prose

> Look up at the roof of an old farmhouse, a deep-shaded porch, or a traditional Japanese home.
> Notice how far the eave reaches out past the wall. That wasn't an accident, and it wasn't
> decoration. Someone thought carefully about where the sun would be in July versus where it
> would be in December — and they built the answer into the shape of the roof itself.
>
> Here is the puzzle: the same window that overheats a room in summer is exactly the window you
> want warming that room in winter. Block the summer sun and you lose the winter warmth. Let in
> the winter sun and you bake in August. How do you solve both problems at once, with no
> shutters, no sensors, no machines?
>
> The answer is geometry. The sun doesn't stay in the same spot. In summer it rides high
> overhead at midday; in winter it swings low across the sky. A roof that reaches out just far
> enough will shade the high summer sun and still let the low winter sun slip underneath,
> straight through the glass.

### The 4 guided views

| id                   | viewName              | explanation                                                                                                                                                                                                                                                                                                                                                                                                     |
| -------------------- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `everything`         | Full Picture          | This is the whole system at a glance: the wall, the window, the overhanging roof, two positions of the sun — one high in the summer sky, one low in the winter sky — and rain falling away from the building. Each element has a job, and they are all connected. Step through the other views to discover how each one works.                                                                                  |
| `bare-wall`          | No Roof Yet           | Here is just the wall and the window, with no overhang at all. In summer, when the sun rides high overhead, its light pours straight through the glass and turns the room into an oven. There is nothing to stop it. This is the problem the hat is designed to solve.                                                                                                                                          |
| `roof-line`          | One Roof, Two Seasons | Now add the overhang. The high summer sun, coming from nearly overhead, hits the underside of the eave and goes no further — the window stays in shade and the room stays cool. But the low winter sun, arriving from a much shallower angle, slides right underneath that same overhang and reaches the window. One fixed roof edge. Two opposite seasons. No adjustments required.                            |
| `how-it-sheds-water` | Throwing Rain Clear   | The overhang has a third job that has nothing to do with the sun. When rain falls, the roof catches it and carries it outward, so the water lands away from the base of the wall. Without that reach, rain runs down the face of the wall and pools at the foundation — and water sitting against a wall is one of the most reliable ways to damage a building over time. The hat keeps the wall and boots dry. |

### In-drawing labels (HTML overlay, NOT baked into SVG)

`summer sun (blocked)` · `winter sun (let in)` · `overhang` · `window` · `wall` · `rain — thrown clear` · `foundation`

### Toggle labels (6 layers)

wall · overhang · summer sun · winter sun · rain · labels

### 6-beat reasoning progression (FR-015)

1. **Bare wall** — wall + window only; the raw problem: an unprotected opening facing the sky.
2. **Add the overhang** — extend the roof edge; the building gets its hat.
3. **Summer sun blocked** — the high summer sun strikes the underside of the eave and stops; the window stays shaded.
4. **Winter sun admitted** — the low winter sun travels a shallower path, slips under the same overhang, reaches the glass.
5. **Rain shed** — rain lands on the roof and is carried outward, clear of the wall base.
6. **Labels revealed** — the annotation layer names each element, tying geometry to vocabulary.

### Why-it-matters note (cradle-to-cradle; no physics claim)

> A building with a well-designed overhang gives you comfort as a gift — cool shade in summer,
> free warmth in winter, a dry wall through every rainstorm — the way a tree gives shade without
> asking anything in return. That is the cradle-to-cradle idea at the heart of this book: the
> best-designed things don't just avoid harm; they give something back.

### Optional sourced aside (safe to include — universal + citable)

> At a typical mid-latitude, the noon sun sits about 47 degrees higher in midsummer than in
> midwinter — a huge swing of sky that a fixed roof edge can turn to your advantage.
> _(Source: NOAA Solar Position Calculator.)_
