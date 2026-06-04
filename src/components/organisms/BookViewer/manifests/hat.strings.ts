/**
 * Reader-facing strings for the Hat chapter — the i18n seam. Every word the
 * reader sees resolves from here (not an inline literal), so a future translation
 * layer can add locales with zero re-authoring of components or art.
 *
 * Narrative authored + fact-checked against the McDonough Construction sources.
 */
import type { SourceCitation } from './types';

export const hatStrings = {
  chapterTitle: 'The Hat: What a Roof Knows About the Sun',
  chapterSubtitle:
    'How a simple overhang does three jobs at once — without a single moving part.',

  intro: [
    'Look up at the roof of an old farmhouse, a deep-shaded porch, or a traditional Japanese home. Notice how far the eave reaches out past the wall. That wasn’t an accident, and it wasn’t decoration. Someone thought carefully about where the sun would be in July versus where it would be in December — and they built the answer into the shape of the roof itself.',
    'Here is the puzzle: the same window that overheats a room in summer is exactly the window you want warming that room in winter. Block the summer sun and you lose the winter warmth. Let in the winter sun and you bake in August. How do you solve both problems at once, with no shutters, no sensors, no machines?',
    'The answer is geometry. The sun doesn’t stay in the same spot. In summer it rides high overhead at midday; in winter it swings low across the sky. A roof that reaches out just far enough will shade the high summer sun and still let the low winter sun slip underneath, straight through the glass.',
  ],

  whyItMatters:
    'A building with a well-designed overhang gives you comfort as a gift — cool shade in summer, free warmth in winter, a dry wall through every rainstorm — the way a tree gives shade without asking anything in return. That is the cradle-to-cradle idea at the heart of this book: the best-designed things don’t just avoid harm; they give something back.',

  sourcedAside:
    'At a typical mid-latitude, the noon sun sits about 47 degrees higher in midsummer than in midwinter — a huge swing of sky that a fixed roof edge can turn to your advantage.',

  presetLabels: {
    everything: 'The Whole System',
    'bare-wall': 'The Problem: Summer Glare',
    'roof-line': 'The Fix: Two Seasons, One Roof',
    'how-it-sheds-water': 'The Bonus: Rain Thrown Clear',
  } as Record<string, string>,

  presetTakeaways: {
    everything:
      'One building, six parts, each with a job. Step through the views to see how the roof earns its keep.',
    'bare-wall':
      'No overhang: the high summer sun pours straight through the glass and bakes the room. This is the problem.',
    'roof-line':
      'One fixed roof edge. Summer sun is blocked, winter sun slips underneath. Two seasons, no moving parts.',
    'how-it-sheds-water':
      'The eave also throws rain clear of the wall — so water never pools at the foundation. The hat keeps the boots dry.',
  } as Record<string, string>,

  presetDescriptions: {
    everything:
      'This is the whole system at a glance: the wall, the window, the overhanging roof, two positions of the sun — one high in the summer sky, one low in the winter sky — and rain falling away from the building. Each element has a job, and they are all connected. Step through the other views to discover how each one works.',
    'bare-wall':
      'Here is just the wall and the window, with no overhang at all. In summer, when the sun rides high overhead, its light pours straight through the glass and turns the room into an oven. There is nothing to stop it. This is the problem the hat is designed to solve.',
    'roof-line':
      'Now add the overhang. The high summer sun, coming from nearly overhead, hits the underside of the eave and goes no further — the window stays in shade and the room stays cool. But the low winter sun, arriving from a much shallower angle, slides right underneath that same overhang and reaches the window. One fixed roof edge. Two opposite seasons. No adjustments required.',
    'how-it-sheds-water':
      'The overhang has a third job that has nothing to do with the sun. When rain falls, the roof catches it and carries it outward, so the water lands away from the base of the wall. Without that reach, rain runs down the face of the wall and pools at the foundation — and water sitting against a wall is one of the most reliable ways to damage a building over time. The hat keeps the wall and boots dry.',
  } as Record<string, string>,

  layerLabels: {
    'sun-high': 'Summer sun',
    'sun-low': 'Winter sun',
    rain: 'Rain',
    footing: 'Foundation',
    wall: 'Wall',
    window: 'Window',
    'roof-overhang': 'Overhang',
  } as Record<string, string>,

  sources: [
    {
      title: 'U.S. Department of Energy — Passive Solar Homes',
      url: 'https://www.energy.gov/energysaver/passive-solar-homes',
    },
    {
      title:
        'Building America Solution Center (DOE/PNNL) — Shading and Solar Control for Windows and Skylights',
      url: 'https://basc.pnnl.gov/resource-guides/shading-and-solar-control-windows-and-skylights',
    },
    {
      title:
        'Building Science Corporation — BSD-013: Rain Control in Buildings (J. Straube)',
      url: 'https://buildingscience.com/documents/digests/bsd-013-rain-control-in-buildings',
    },
    {
      title: 'NOAA Global Monitoring Laboratory — Solar Position Calculator',
      url: 'https://gml.noaa.gov/grad/solcalc/azel.html',
    },
  ] as SourceCitation[],
};

export type HatStrings = typeof hatStrings;
