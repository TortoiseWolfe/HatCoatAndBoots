import type { ChapterManifest } from './types';

// Geometry note: explodeOffset + bbox are in VIEWBOX UNITS (0..360), the shared
// coordinate space all 7 layers are drawn in. bbox values are the real measured
// ink bounds of each layer (see memory: hat-svg-real-bboxes). Offsets pull each
// part away from the assembled centre so the building genuinely separates.
export const hatManifest: ChapterManifest = {
  slug: 'hat',
  meta: { title: 'The Hat', kicker: 'Why a roof needs a brim' },
  layers: [
    {
      id: 'footing',
      src: 'book/hat/footing.svg',
      label: 'Footing',
      alt: 'The footing and piers the house stands on',
      tabColor: '#9aa7b3',
      tabWord: 'FOOTING',
      z: 10,
      explodeOffset: { x: 0, y: 70 },
      bbox: { x: 40, y: 300, w: 280, h: 44 },
    },
    {
      id: 'wall',
      src: 'book/hat/wall.svg',
      label: 'Walls',
      alt: 'The insulated wall',
      tabColor: '#c9a86a',
      tabWord: 'WALL',
      z: 20,
      explodeOffset: { x: -70, y: 0 },
      bbox: { x: 148, y: 116, w: 96, h: 188 },
    },
    {
      id: 'window',
      src: 'book/hat/window.svg',
      label: 'Window',
      alt: 'The window opening',
      tabColor: '#7fa8c9',
      tabWord: 'WINDOW',
      z: 30,
      explodeOffset: { x: 95, y: 30 },
      bbox: { x: 182, y: 150, w: 54, h: 103 },
    },
    {
      id: 'roof-overhang',
      src: 'book/hat/roof-overhang.svg',
      label: 'Roof overhang',
      alt: 'The roof and its overhang — the hat',
      tabColor: '#c8714a',
      tabWord: 'ROOF',
      z: 60,
      explodeOffset: { x: 0, y: -75 },
      bbox: { x: 110, y: 62, w: 188, h: 88 },
    },
    {
      id: 'sun-high',
      src: 'book/hat/sun-high.svg',
      label: 'Summer sun',
      alt: 'The high summer sun',
      tabColor: '#e8a02e',
      tabWord: 'SUMMER',
      z: 50,
      explodeOffset: { x: 70, y: -55 },
      bbox: { x: 250, y: 20, w: 90, h: 90 },
    },
    {
      id: 'sun-low',
      src: 'book/hat/sun-low.svg',
      label: 'Winter sun',
      alt: 'The low winter sun',
      tabColor: '#e6b455',
      tabWord: 'WINTER',
      z: 50,
      explodeOffset: { x: 95, y: 35 },
      bbox: { x: 280, y: 170, w: 70, h: 70 },
    },
    {
      id: 'rain',
      src: 'book/hat/rain.svg',
      label: 'Rain',
      alt: 'Rain shedding clear of the wall',
      tabColor: '#5b86a8',
      tabWord: 'RAIN',
      z: 55,
      explodeOffset: { x: 40, y: -45 },
      bbox: { x: 116, y: 34, w: 208, h: 60 },
    },
  ],
  steps: [
    {
      id: 'whole',
      heading: 'A house is layers',
      prose:
        'Every building is a stack of jobs. Pull a layer off to see what it does — start with the roof’s brim, the overhang.',
      dockedLayerIds: ['footing', 'wall', 'window', 'roof-overhang'],
      spotlightLayerId: 'roof-overhang',
    },
    {
      id: 'summer',
      heading: 'The summer sun is blocked',
      prose:
        'In summer the sun climbs high. The overhang reaches out past the wall and shades the window, so the room stays cool with no machine.',
      dockedLayerIds: [
        'footing',
        'wall',
        'window',
        'roof-overhang',
        'sun-high',
      ],
      spotlightLayerId: 'sun-high',
    },
    {
      id: 'winter',
      heading: 'The winter sun is let in',
      prose:
        'In winter the sun stays low. It slips under the same overhang and pours through the window, warming the room for free.',
      dockedLayerIds: ['footing', 'wall', 'window', 'roof-overhang', 'sun-low'],
      spotlightLayerId: 'sun-low',
    },
    {
      id: 'rain',
      heading: 'The rain is thrown clear',
      prose:
        'The overhang does one more job: it throws rain away from the wall’s base, so water never soaks the footing.',
      dockedLayerIds: ['footing', 'wall', 'window', 'roof-overhang', 'rain'],
      spotlightLayerId: 'rain',
    },
  ],
};
