/**
 * The Coat building manifest — the SAME shared house cross-section as Hat/Boots,
 * focused on the envelope (wall) region. It reuses the identical
 * roof-overhang / wall / window / footing artwork (same `src`, same `z`, same
 * geometry) so the building is byte-identically registered across chapters
 * (FR-001a / SC-009 — the `[data-layer-id="wall"]` alignment gate). The Coat
 * teaching layers (cavity insulation, continuous wrap, air/vapor seal, thermal
 * mass) are ADDITIVE siblings inside the wall envelope; the roof and foundation
 * are present but dimmed (atmosphereOpacity 0.4) as aligned context.
 *
 * Strings resolve from `./coat.strings.ts` (the i18n seam) — never inline.
 */

import { coatStrings } from './coat.strings';
import { viewBox } from './hat.manifest';
import type {
  DiagramLayer,
  DiagramManifest,
  DiagramPreset,
  LabelOverlay,
} from './types';

const layers: DiagramLayer[] = [
  // --- shared context (dimmed during the Coat focus) -----------------------
  {
    id: 'footing',
    src: 'book/hat/footing.svg',
    label: coatStrings.layerLabels['footing'],
    alt: '',
    decorative: true,
    region: 'foundation',
    z: 20,
    defaultVisible: true,
    atmosphereOpacity: 0.4,
  },
  {
    id: 'roof-overhang',
    src: 'book/hat/roof-overhang.svg',
    label: coatStrings.layerLabels['roof-overhang'],
    alt: '',
    decorative: true,
    region: 'roof',
    z: 40,
    defaultVisible: true,
    atmosphereOpacity: 0.4,
  },
  // --- the envelope (the focus) — SAME wall/window geometry as every chapter -
  {
    id: 'wall',
    src: 'book/hat/wall.svg',
    label: coatStrings.layerLabels['wall'],
    alt: '',
    decorative: true,
    region: 'envelope',
    z: 30,
    defaultVisible: true,
  },
  {
    id: 'window',
    src: 'book/hat/window.svg',
    label: coatStrings.layerLabels['window'],
    alt: '',
    decorative: true,
    region: 'envelope',
    z: 31,
    defaultVisible: true,
  },
  // --- the Coat teaching layers (additive, inside the envelope) -------------
  {
    id: 'cavity-insulation',
    src: 'book/coat/cavity-insulation.svg',
    label: coatStrings.layerLabels['cavity-insulation'],
    alt: '',
    decorative: true,
    region: 'envelope',
    z: 32,
    defaultVisible: true,
  },
  {
    id: 'continuous-insulation',
    src: 'book/coat/continuous-insulation.svg',
    label: coatStrings.layerLabels['continuous-insulation'],
    alt: '',
    decorative: true,
    region: 'envelope',
    z: 33,
    defaultVisible: true,
  },
  {
    id: 'air-vapor-membrane',
    src: 'book/coat/air-vapor-membrane.svg',
    label: coatStrings.layerLabels['air-vapor-membrane'],
    alt: '',
    decorative: true,
    region: 'envelope',
    z: 34,
    defaultVisible: true,
  },
  {
    id: 'thermal-mass-interior',
    src: 'book/coat/thermal-mass-interior.svg',
    label: coatStrings.layerLabels['thermal-mass-interior'],
    alt: '',
    decorative: true,
    region: 'envelope',
    z: 35,
    defaultVisible: true,
  },
  {
    id: 'coat-labels',
    label: coatStrings.layerLabels['coat-labels'],
    alt: coatStrings.layerAlt['coat-labels'],
    decorative: false,
    region: 'envelope',
    z: 50,
    defaultVisible: true,
  },
];

const labels: LabelOverlay[] = [
  {
    id: 'lbl-thermal-bridge',
    text: coatStrings.labelText['lbl-thermal-bridge'],
    x: 150,
    y: 112,
  },
  {
    id: 'lbl-cavity-fill',
    text: coatStrings.labelText['lbl-cavity-fill'],
    x: 8,
    y: 170,
  },
  {
    id: 'lbl-ci-wrap',
    text: coatStrings.labelText['lbl-ci-wrap'],
    x: 8,
    y: 250,
  },
  {
    id: 'lbl-air-seal',
    text: coatStrings.labelText['lbl-air-seal'],
    x: 250,
    y: 150,
  },
  {
    id: 'lbl-thermal-mass',
    text: coatStrings.labelText['lbl-thermal-mass'],
    x: 248,
    y: 250,
  },
  { id: 'lbl-coat', text: coatStrings.labelText['lbl-coat'], x: 188, y: 130 },
];

const presets: DiagramPreset[] = [
  {
    id: 'coat-everything',
    label: coatStrings.presetLabels['coat-everything'],
    description: coatStrings.presetDescriptions['coat-everything'],
    takeaway: coatStrings.presetTakeaways['coat-everything'],
    visibleLayerIds: [
      'footing',
      'roof-overhang',
      'wall',
      'window',
      'cavity-insulation',
      'continuous-insulation',
      'air-vapor-membrane',
      'thermal-mass-interior',
      'coat-labels',
    ],
  },
  {
    id: 'coat-bare-wall',
    label: coatStrings.presetLabels['coat-bare-wall'],
    description: coatStrings.presetDescriptions['coat-bare-wall'],
    takeaway: coatStrings.presetTakeaways['coat-bare-wall'],
    visibleLayerIds: [
      'footing',
      'roof-overhang',
      'wall',
      'window',
      'coat-labels',
    ],
  },
  {
    id: 'coat-cavity-plus-wrap',
    label: coatStrings.presetLabels['coat-cavity-plus-wrap'],
    description: coatStrings.presetDescriptions['coat-cavity-plus-wrap'],
    takeaway: coatStrings.presetTakeaways['coat-cavity-plus-wrap'],
    visibleLayerIds: [
      'footing',
      'roof-overhang',
      'wall',
      'window',
      'cavity-insulation',
      'continuous-insulation',
      'coat-labels',
    ],
  },
  {
    id: 'coat-air-and-mass',
    label: coatStrings.presetLabels['coat-air-and-mass'],
    description: coatStrings.presetDescriptions['coat-air-and-mass'],
    takeaway: coatStrings.presetTakeaways['coat-air-and-mass'],
    visibleLayerIds: [
      'footing',
      'roof-overhang',
      'wall',
      'window',
      'cavity-insulation',
      'continuous-insulation',
      'air-vapor-membrane',
      'thermal-mass-interior',
      'coat-labels',
    ],
  },
];

export const coatManifest: DiagramManifest = {
  id: 'house-cross-section',
  title: coatStrings.chapterTitle,
  viewBox,
  layers,
  labels,
  presets,
  defaultPresetId: 'coat-everything',
  legend: coatStrings.legend,
};

// --- Compile-time allow-list guard (preset ids ⊆ layer ids) -----------------
const LAYER_IDS = [
  'footing',
  'roof-overhang',
  'wall',
  'window',
  'cavity-insulation',
  'continuous-insulation',
  'air-vapor-membrane',
  'thermal-mass-interior',
  'coat-labels',
] as const;
type LayerId = (typeof LAYER_IDS)[number];

const _presetIdGuard: readonly LayerId[][] = presets.map(
  (p) => p.visibleLayerIds as LayerId[]
);
void _presetIdGuard;
