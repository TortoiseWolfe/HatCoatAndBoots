/**
 * Reader-facing strings for the Coat chapter — the i18n seam. Mirrors hatStrings.
 *
 * Narrative authored + fact-checked. Climate/zone-specific values (R-values) are
 * always stated as "set by your local energy code", never universal constants.
 * Key facts: air leakage ≈ one-third of HVAC energy (LBNL/Sherman 2008); thermal
 * bridging through framing (BSC BSD-011); continuous insulation removes bridges.
 */
import type { SourceCitation } from './types';

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

  sourcedAside:
    'A Lawrence Berkeley National Laboratory study found that air leakage consumes roughly one-third of the energy U.S. houses use for heating and cooling. That single finding is why sealing air gaps is treated as the highest-return move a builder can make — before adding more insulation, before upgrading windows, before anything else.',

  presetLabels: {
    'coat-everything': 'The Whole Coat',
    'coat-bare-wall': 'The Problem: Studs Leak Heat',
    'coat-cavity-plus-wrap': 'The Fix: Fill + Wrap',
    'coat-air-and-mass': 'The Bonus: Stop Air, Store Heat',
  } as Record<string, string>,

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

  layerLabels: {
    'cavity-insulation': 'Cavity insulation',
    'continuous-insulation': 'Continuous wrap',
    'air-vapor-membrane': 'Air + vapor seal',
    'thermal-mass-interior': 'Thermal mass',
    footing: 'Foundation',
    wall: 'Wall',
    window: 'Window',
    'roof-overhang': 'Roof',
  } as Record<string, string>,

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
};

export type CoatStrings = typeof coatStrings;
