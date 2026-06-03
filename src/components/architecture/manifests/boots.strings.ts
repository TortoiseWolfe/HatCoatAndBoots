/**
 * Reader-facing strings for the Boots chapter — the i18n seam (FR-016 / SC-008).
 * Mirrors the shape of `hatStrings` exactly.
 *
 * Narrative authored + fact-checked 2026-06-03. The constitution's no-fabrication
 * rule is honoured strictly here: frost-line/footing DEPTH and grade-to-sill
 * HEIGHT are climate/site-specific and are ALWAYS stated as "set by your local
 * building code" — never a universal number. Universal mechanisms (capillary
 * rise, frost heave, drainage) are stated qualitatively. Sources: IRC/IBC via
 * ICC; Building Science Corporation (BSI-011 capillarity); DOE/PNNL; the frost
 * line ranges 0–8 ft across the contiguous US (climate-specific, never one value).
 */

import type { SourceCitation } from './strings';

export const bootsStrings = {
  chapterTitle: 'The Boots: What a Foundation Knows About Water',
  chapterSubtitle:
    'A great foundation holds the building up — and keeps the whole thing dry.',

  intro: [
    'Pull on a good pair of boots before you walk through a puddle and your feet stay dry. A building’s foundation works the same way — it holds the structure up, and it keeps water from climbing in. Get both jobs right and the building can last for generations. Miss either one and you are in trouble fast.',
    'The ground beneath a building is not just dirt; it is full of water. Even on a dry summer day, moisture moves through soil by capillary action — the same invisible pull that draws water up through a paper towel. Without a deliberate break in that path, ground moisture wicks straight up through the footing, into the foundation, and on into the wood and plaster above. The result is rot and decay, all from water nobody ever saw arrive.',
    'In cold places water does something even more dramatic: it freezes. Frozen water expands, and when it expands inside soil it pushes upward with enormous force — frost heave. A footing set above the frost line is lifted every winter and dropped every spring until the building above it cracks and tilts. The cure is simple once you know it: reach deep enough, drain well, and break the capillary path before it reaches the wall.',
  ],

  whyItMatters:
    'A dry foundation is a gift to the future. Traditional lime-mortared stone is vapor-open — it lets moisture move and evaporate rather than trapping it — so seasonal damp never turns into long-term rot. When a building stays dry all the way from its footings up, it can last for centuries instead of decades: no demolition rubble, no energy burned to make replacement materials, no waste to a landfill. Cradle-to-cradle thinking treats the foundation as a carefully designed system that keeps giving back by making everything above it last longer. The best foundations do not just hold a building up — they make tearing it down unnecessary.',

  /** ONE citeable universal mechanism (BSC BSI-011). No fabricated number. */
  sourcedAside:
    'Water is the single greatest cause of deterioration in masonry buildings. It works through several mechanisms at once: freeze-thaw that cracks stone as expanding ice forces the pores apart; salt crystallization that shatters material from the inside as dissolved minerals are left behind when water evaporates; and capillary action that pulls ground moisture continuously upward. The Building Science Corporation notes that a footing placed straight on soil with no capillary break will wick water up into the structure — and that this is one of the easiest problems to prevent in new construction, and one of the most expensive to fix later.',

  /** Guided-view button labels, keyed by preset id. */
  presetLabels: {
    'boots-overview': 'The Whole Foundation',
    'boots-frost': 'The Problem: Frost Heaves',
    'boots-water-path': 'Where the Water Goes',
    'boots-capillary-break': 'The Fix: A Capillary Break',
  } as Record<string, string>,

  /** Short per-view takeaway — distilled, no new claims. */
  presetTakeaways: {
    'boots-overview':
      'Footing, piers, and the ground line — the team that holds everything up and starts the water on its way out.',
    'boots-frost':
      'Frozen soil heaves upward, so the footing must reach below the frost line — a depth set by local code, never one universal number.',
    'boots-water-path':
      'Slope the grade away, add gravel and a perimeter drain, and water never pools against the footing.',
    'boots-capillary-break':
      'A capillary break — a membrane or coarse gravel — stops ground moisture from wicking up into the wall.',
  } as Record<string, string>,

  /** Guided-view explanations (announced via aria-live), keyed by preset id. */
  presetDescriptions: {
    'boots-overview':
      'The foundation is three parts working together: the footing — a wide pad that spreads the building’s weight across the soil — the piers rising from it to the floor above, and the ground line where the building meets the earth. Each part has a job, and each must be shaped so water runs away rather than in. Seeing the whole before zooming into one layer is how builders spot problems before they start.',
    'boots-frost':
      'Where soil freezes in winter, the water locked inside it expands into ice and pushes upward — frost heave. A footing sitting in the zone that freezes is lifted every winter and dropped every spring, cracking the building above. Building codes (such as the International Residential Code) require footings to be protected from frost, but the required depth is filled in by your local jurisdiction, because frost depth is entirely climate-specific — it ranges from a few inches to more than six feet across the United States. Always check your local code; there is no single universal footing depth.',
    'boots-water-path':
      'Even unfrozen, water pooling at the base of a foundation will find its way in. The first defense is the finish grade: building codes require the ground to slope away from the foundation so surface water runs outward, not inward. A band of coarse gravel against the foundation and a perimeter drain at the base of the footing then collect any water that still gets close and carry it off before pressure can build against the wall.',
    'boots-capillary-break':
      'Masonry and concrete are porous, and porous materials wick moisture upward by capillary action — the same pull that lifts liquid through a straw. Left uninterrupted, ground moisture travels from the footing into the wall and then into the framing above. A capillary break — a dampproofing layer, a sheet membrane, or a band of coarse gravel whose pores are too large for capillary suction — placed at the top of the footing stops the movement at its source. It is one of the easiest problems to prevent when building, and one of the most expensive to repair afterward.',
  } as Record<string, string>,

  /** Per-layer toggle labels (control text), keyed by layer id. */
  layerLabels: {
    'grade-and-drain': 'Grade & drain',
    'frost-depth': 'Frost zone',
    'capillary-break': 'Capillary break',
    footing: 'Footing',
    wall: 'Wall',
    window: 'Window',
    'roof-overhang': 'Roof',
    'boots-labels': 'Labels',
  } as Record<string, string>,

  /** Assistive-tech alt text for the one non-decorative layer (labels). */
  layerAlt: {
    'boots-labels':
      'Diagram labels naming the footing, the frost line, the gravel drain, the sloped grade, and the capillary break.',
  } as Record<string, string>,

  /** In-drawing label overlay text, keyed by overlay id. */
  labelText: {
    'lbl-frost-line': 'frost line — depth set by local code',
    'lbl-footing-below': 'footing sits below the frost line',
    'lbl-gravel-drain': 'gravel + drain carry water away',
    'lbl-grade-away': 'ground slopes away',
    'lbl-capillary-break': 'capillary break stops the wick',
    'lbl-boots': 'BOOTS',
  } as Record<string, string>,

  /** "How to read it" legend — colours mirror the actual SVG strokes. */
  legend: [
    {
      color: '#5b86a8',
      label: 'Frost line',
      hint: 'footing must sit below it',
      dashed: true,
    },
    {
      color: '#5b86a8',
      label: 'Grade & drain',
      hint: 'slope + gravel carry water off',
    },
    {
      color: '#38bdf8',
      label: 'Capillary break',
      hint: 'stops moisture wicking up',
    },
  ],

  /** Sources section heading + citations (verified 2026-06-03). */
  sourcesHeading: 'Sources',
  sources: [
    {
      title:
        'ICC — 2021 International Residential Code R403.1.4: Frost Protection (depth set locally)',
      url: 'https://codes.iccsafe.org/s/IRC2021P2/chapter-4-foundations/IRC2021P2-Pt03-Ch04-SecR403.1.4',
    },
    {
      title:
        'ICC — International Residential Code R401.3: Drainage (grade slopes away from the foundation)',
      url: 'https://codes.iccsafe.org/s/IRC2015/chapter-4-foundations/IRC2015-Pt03-Ch04-SecR401.3',
    },
    {
      title:
        'Building Science Corporation — BSI-011: Capillarity, Small Sacrifices (J. Lstiburek)',
      url: 'https://buildingscience.com/documents/insights/bsi-011-capillarity-small-sacrifices',
    },
    {
      title:
        'Building America Solution Center (DOE/PNNL) — Foundation Capillary Break over Aggregate',
      url: 'https://basc.pnnl.gov/building-science-measures/foundation-capillary-break-over-aggregate',
    },
    {
      title:
        'Building America Solution Center (DOE/PNNL) — Final Grade Slopes Away from Foundation',
      url: 'https://basc.pnnl.gov/resource-guides/final-grade-slopes-away-foundation',
    },
    {
      title: 'Wikipedia — Frost line (range 0–8 ft across the contiguous US)',
      url: 'https://en.wikipedia.org/wiki/Frost_line',
    },
  ] as SourceCitation[],
} as const;

export type BootsStrings = typeof bootsStrings;
