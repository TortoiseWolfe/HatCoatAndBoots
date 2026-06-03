/**
 * The Boots building manifest — the SAME shared house cross-section as Hat/Coat,
 * focused on the foundation region. It reuses the identical roof / wall / window /
 * footing artwork (same `src`, same `z`, same geometry) so the building is
 * byte-identically registered across chapters (FR-001a / SC-009 — the
 * `[data-layer-id="wall"]` alignment gate). The Boots teaching layers
 * (grade & drain, frost depth, capillary break) are ADDITIVE siblings around the
 * footing; the roof and envelope are present but dimmed (atmosphereOpacity 0.4).
 *
 * Strings resolve from `./boots.strings.ts` (the i18n seam) — never inline.
 */

import { bootsStrings } from './boots.strings';
import { viewBox } from './hat.manifest';
import type {
  DiagramLayer,
  DiagramManifest,
  DiagramPreset,
  LabelOverlay,
} from './types';

const layers: DiagramLayer[] = [
  // --- the foundation (the focus) — SAME footing geometry as every chapter ---
  {
    id: 'footing',
    src: 'book/hat/footing.svg',
    label: bootsStrings.layerLabels['footing'],
    alt: '',
    decorative: true,
    region: 'foundation',
    z: 20,
    defaultVisible: true,
  },
  // --- the Boots teaching layers (additive, around the footing) -------------
  {
    id: 'grade-and-drain',
    src: 'book/boots/grade-and-drain.svg',
    label: bootsStrings.layerLabels['grade-and-drain'],
    alt: '',
    decorative: true,
    region: 'foundation',
    z: 18,
    defaultVisible: true,
  },
  {
    id: 'frost-depth',
    src: 'book/boots/frost-depth.svg',
    label: bootsStrings.layerLabels['frost-depth'],
    alt: '',
    decorative: true,
    region: 'foundation',
    z: 19,
    defaultVisible: true,
  },
  {
    id: 'capillary-break',
    src: 'book/boots/capillary-break.svg',
    label: bootsStrings.layerLabels['capillary-break'],
    alt: '',
    decorative: true,
    region: 'foundation',
    z: 22,
    defaultVisible: true,
  },
  // --- shared context (dimmed during the Boots focus) -----------------------
  {
    id: 'wall',
    src: 'book/hat/wall.svg',
    label: bootsStrings.layerLabels['wall'],
    alt: '',
    decorative: true,
    region: 'envelope',
    z: 30,
    defaultVisible: true,
    atmosphereOpacity: 0.4,
  },
  {
    id: 'window',
    src: 'book/hat/window.svg',
    label: bootsStrings.layerLabels['window'],
    alt: '',
    decorative: true,
    region: 'envelope',
    z: 31,
    defaultVisible: true,
    atmosphereOpacity: 0.4,
  },
  {
    id: 'roof-overhang',
    src: 'book/hat/roof-overhang.svg',
    label: bootsStrings.layerLabels['roof-overhang'],
    alt: '',
    decorative: true,
    region: 'roof',
    z: 40,
    defaultVisible: true,
    atmosphereOpacity: 0.4,
  },
  {
    id: 'boots-labels',
    label: bootsStrings.layerLabels['boots-labels'],
    alt: bootsStrings.layerAlt['boots-labels'],
    decorative: false,
    region: 'foundation',
    z: 50,
    defaultVisible: true,
  },
];

const labels: LabelOverlay[] = [
  {
    id: 'lbl-frost-line',
    text: bootsStrings.labelText['lbl-frost-line'],
    x: 8,
    y: 318,
  },
  {
    id: 'lbl-footing-below',
    text: bootsStrings.labelText['lbl-footing-below'],
    x: 110,
    y: 352,
  },
  {
    id: 'lbl-gravel-drain',
    text: bootsStrings.labelText['lbl-gravel-drain'],
    x: 250,
    y: 352,
  },
  {
    id: 'lbl-grade-away',
    text: bootsStrings.labelText['lbl-grade-away'],
    x: 250,
    y: 300,
  },
  {
    id: 'lbl-capillary-break',
    text: bootsStrings.labelText['lbl-capillary-break'],
    x: 8,
    y: 288,
  },
  {
    id: 'lbl-boots',
    text: bootsStrings.labelText['lbl-boots'],
    x: 180,
    y: 200,
  },
];

const presets: DiagramPreset[] = [
  {
    id: 'boots-overview',
    label: bootsStrings.presetLabels['boots-overview'],
    description: bootsStrings.presetDescriptions['boots-overview'],
    takeaway: bootsStrings.presetTakeaways['boots-overview'],
    visibleLayerIds: [
      'footing',
      'wall',
      'window',
      'roof-overhang',
      'boots-labels',
    ],
  },
  {
    id: 'boots-frost',
    label: bootsStrings.presetLabels['boots-frost'],
    description: bootsStrings.presetDescriptions['boots-frost'],
    takeaway: bootsStrings.presetTakeaways['boots-frost'],
    visibleLayerIds: [
      'footing',
      'frost-depth',
      'wall',
      'window',
      'roof-overhang',
      'boots-labels',
    ],
  },
  {
    id: 'boots-water-path',
    label: bootsStrings.presetLabels['boots-water-path'],
    description: bootsStrings.presetDescriptions['boots-water-path'],
    takeaway: bootsStrings.presetTakeaways['boots-water-path'],
    visibleLayerIds: [
      'footing',
      'grade-and-drain',
      'wall',
      'window',
      'roof-overhang',
      'boots-labels',
    ],
  },
  {
    id: 'boots-capillary-break',
    label: bootsStrings.presetLabels['boots-capillary-break'],
    description: bootsStrings.presetDescriptions['boots-capillary-break'],
    takeaway: bootsStrings.presetTakeaways['boots-capillary-break'],
    visibleLayerIds: [
      'footing',
      'grade-and-drain',
      'capillary-break',
      'wall',
      'window',
      'roof-overhang',
      'boots-labels',
    ],
  },
];

export const bootsManifest: DiagramManifest = {
  id: 'house-cross-section',
  title: bootsStrings.chapterTitle,
  viewBox,
  layers,
  labels,
  presets,
  defaultPresetId: 'boots-overview',
  legend: bootsStrings.legend,
};

// --- Compile-time allow-list guard (preset ids ⊆ layer ids) -----------------
const LAYER_IDS = [
  'footing',
  'grade-and-drain',
  'frost-depth',
  'capillary-break',
  'wall',
  'window',
  'roof-overhang',
  'boots-labels',
] as const;
type LayerId = (typeof LAYER_IDS)[number];

const _presetIdGuard: readonly LayerId[][] = presets.map(
  (p) => p.visibleLayerIds as LayerId[]
);
void _presetIdGuard;
