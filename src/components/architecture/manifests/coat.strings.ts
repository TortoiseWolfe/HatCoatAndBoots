/**
 * Reader-facing strings for the Coat chapter — the i18n seam (FR-016 / SC-008).
 * Mirrors the shape of `hatStrings` exactly. EN only this slice; every reader-
 * facing word resolves from here so the i18n layer (049) adds translations with
 * zero re-authoring of artwork or components.
 *
 * Narrative authored + fact-checked 2026-06-03. Every specific number is sourced
 * (see `sources`); climate/zone-specific values (required R-values) are stated as
 * "set by your local energy code", NEVER as universal constants — the
 * constitution's no-fabrication rule. Universal mechanisms are stated
 * qualitatively. Key facts: air leakage ≈ one-third of HVAC energy (LBNL/Sherman
 * 2008); thermal bridging through wood framing (BSC BSD-011); continuous
 * insulation removes bridges (ASHRAE 90.1); thermal-mass benefit is greatest in
 * high-diurnal-swing climates (DOE/PNNL).
 */

import type { SourceCitation } from './strings';

export const coatStrings = {
  chapterTitle: 'The Coat: What a Wall Knows About the Cold',
  chapterSubtitle:
    'Four layers that stop heat, cover the gaps, block the air, and store warmth — without a furnace.',

  intro: [
    'Put your hand flat on an outside wall on a cold morning. If you feel a chill through the drywall, the wall is leaking heat — not through a hole you could plug, but through every stud, every gap, and every place where warm indoor air sneaks out and cold air sneaks in. A coat does the same thing when it has a gap at the collar: no matter how thick the fabric, that one gap undoes most of the warmth.',
    'A real building coat is not one material — it is a system of layers working together. Insulation fills the cavities between the framing. A second layer wraps the outside continuously, covering the framing members that cavity insulation misses entirely. An air barrier stops the invisible flow of air that carries heat out far faster than it would seep through solid material. And on the inside, dense materials like brick, concrete, or packed earth soak up heat slowly and release it slowly — smoothing the swing between day and night so the rooms stay comfortable long after the heat turns off.',
    'Each layer solves a problem the others cannot. Take any one away and the wall underperforms. Put them all back and something remarkable happens: the building starts doing most of the work itself.',
  ],

  whyItMatters:
    'A well-coated wall is one of the most honest examples of the cradle-to-cradle idea. Insulation made from cellulose (shredded recycled paper), sheep’s wool, hemp, straw, or cork are biological nutrients: at the end of a building’s long life they can return to the soil instead of a landfill. And while they are in the wall, they are doing real work — cutting the energy a building needs to stay warm or cool, and keeping rooms livable even when the machines are off. The best-designed coat does not just avoid harm; it gives comfort back.',

  /** ONE citeable universal fact (LBNL/Sherman 2008 — a U.S. housing-stock average,
   *  not "every home loses a third"). */
  sourcedAside:
    'A Lawrence Berkeley National Laboratory study found that air leakage consumes roughly one-third of the energy U.S. houses use for heating and cooling. That single finding is why sealing air gaps is treated as the highest-return move a builder can make — before adding more insulation, before upgrading windows, before anything else.',

  /** Guided-view button labels, keyed by preset id. */
  presetLabels: {
    'coat-everything': 'The Whole Coat',
    'coat-bare-wall': 'The Problem: Studs Leak Heat',
    'coat-cavity-plus-wrap': 'The Fix: Fill + Wrap',
    'coat-air-and-mass': 'The Bonus: Stop Air, Store Heat',
  } as Record<string, string>,

  /** Short per-view takeaway — distilled, no new claims beyond the descriptions. */
  presetTakeaways: {
    'coat-everything':
      'One wall, four layers, each solving a different problem. Step through to see what each one does.',
    'coat-bare-wall':
      'Wood carries heat far better than the insulation beside it — every stud is a short-circuit. This is the problem.',
    'coat-cavity-plus-wrap':
      'Cavity insulation fills the gaps; a continuous wrap covers the studs. Together they close both leaks.',
    'coat-air-and-mass':
      'Air sealing stops the invisible flow that undoes insulation. Thermal mass stores heat and releases it slowly, smoothing the swings.',
  } as Record<string, string>,

  /** Guided-view explanations (announced via aria-live), keyed by preset id. */
  presetDescriptions: {
    'coat-everything':
      'Here is the whole system: framing surrounded by cavity insulation, wrapped in a continuous outer layer, sealed by an air-and-vapor membrane, and backed on the inside by thermal mass. Every layer has a distinct job, and they work together. Step through the other views to see each problem and each solution in turn.',
    'coat-bare-wall':
      'Look at the studs. Wood carries heat far better than the insulation packed between them — each stud is a short-circuit that moves heat straight through the wall, bypassing whatever the cavity insulation is rated for. Building scientists call this thermal bridging. The wall’s real heat resistance ends up meaningfully lower than the number on the insulation bag, even when the insulation is installed perfectly, because in a wood-framed wall the framing can cover roughly a quarter of the wall area.',
    'coat-cavity-plus-wrap':
      'Two layers fix what one cannot. Cavity insulation — cellulose, mineral wool, sheep’s wool, hemp, or similar — fills the space between the studs and handles most of the wall. Then a continuous layer wraps the outside of the framing without interruption, covering every stud and erasing the thermal bridges that cavity-only insulation leaves behind. How much of each you need is set by your local energy code, which varies by climate zone — there is no single R-value that is correct everywhere.',
    'coat-air-and-mass':
      'Air sealing solves a different problem from insulation. The air-and-vapor membrane is not about slowing heat through solid material — it stops the actual movement of air through gaps, cracks, and penetrations, which is where much of a building’s heat is lost. On the inside, thermal mass — brick, concrete, rammed earth — soaks up heat as the room warms and releases it slowly as the room cools, softening the temperature swings that make heating and cooling systems work hard. The benefit is greatest in places with a big difference between day and night temperatures; where the daily swing is small, the effect is modest.',
  } as Record<string, string>,

  /** Per-layer toggle labels (control text), keyed by layer id. */
  layerLabels: {
    'cavity-insulation': 'Cavity insulation',
    'continuous-insulation': 'Continuous wrap',
    'air-vapor-membrane': 'Air + vapor seal',
    'thermal-mass-interior': 'Thermal mass',
    footing: 'Foundation',
    wall: 'Wall',
    window: 'Window',
    'roof-overhang': 'Roof',
    'coat-labels': 'Labels',
  } as Record<string, string>,

  /** Assistive-tech alt text for the one non-decorative layer (labels). */
  layerAlt: {
    'coat-labels':
      'Diagram labels naming the wall, the cavity insulation, the continuous wrap, the air seal, and the interior thermal mass.',
  } as Record<string, string>,

  /** In-drawing label overlay text, keyed by overlay id. */
  labelText: {
    'lbl-thermal-bridge': 'heat escapes through the studs',
    'lbl-cavity-fill': 'insulation fills the cavity',
    'lbl-ci-wrap': 'continuous wrap covers the studs',
    'lbl-air-seal': 'air barrier stops air flow',
    'lbl-thermal-mass': 'mass stores & releases heat slowly',
    'lbl-coat': 'COAT',
  } as Record<string, string>,

  /** "How to read it" legend — colours mirror the actual SVG strokes. */
  legend: [
    {
      color: '#c9a86a',
      label: 'Cavity fill',
      hint: 'insulation between the studs',
    },
    {
      color: '#5b86a8',
      label: 'Continuous wrap',
      hint: 'covers the studs, no gaps',
    },
    {
      color: '#38bdf8',
      label: 'Air + vapor seal',
      hint: 'stops air leaking through',
    },
    {
      color: '#b07a3c',
      label: 'Thermal mass',
      hint: 'stores & releases heat slowly',
    },
  ],

  /** Sources section heading + citations (verified 2026-06-03). */
  sourcesHeading: 'Sources',
  sources: [
    {
      title:
        'Lawrence Berkeley National Laboratory — Air Leakage of US Homes (Sherman, 2008): air leakage ≈ one-third of heating & cooling energy',
      url: 'https://homes.lbl.gov/publications/air-leakage-us-homes',
    },
    {
      title: 'U.S. Department of Energy — Insulation Materials',
      url: 'https://www.energy.gov/energysaver/insulation-materials',
    },
    {
      title: 'U.S. Department of Energy — Air Sealing Your Home',
      url: 'https://www.energy.gov/energysaver/air-sealing-your-home',
    },
    {
      title:
        'Building Science Corporation — BSD-011: Thermal Control in Buildings (thermal bridging; continuous insulation)',
      url: 'https://buildingscience.com/documents/digests/bsd-011-thermal-control-in-buildings',
    },
    {
      title:
        'Building America Solution Center (DOE/PNNL) — High Thermal Mass Construction',
      url: 'https://basc.pnnl.gov/resource-guides/high-thermal-mass-construction',
    },
    {
      title:
        'ICC — 2021 International Energy Conservation Code, Ch. 4 (insulation requirements by climate zone)',
      url: 'https://codes.iccsafe.org/content/IECC2021P1/chapter-4-re-residential-energy-efficiency',
    },
  ] as SourceCitation[],
} as const;

export type CoatStrings = typeof coatStrings;
