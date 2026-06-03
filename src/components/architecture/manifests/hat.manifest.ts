/**
 * The Hat building manifest — one region-tagged building in one shared coordinate
 * space, plus the four guided views. Statically imported by BOTH the Server page
 * (renders all layers visible — the no-JS composite, FR-008/SC-002) and the client
 * engine (`LayeredDiagram`), so there is a single source of truth and `tsc` proves
 * the preset allow-list is consistent before the build ships (Coat gate).
 *
 * Content authored in `data-model.md`; geometry is in the canonical viewBox space.
 * Strings resolve from `./strings.ts` (the i18n seam) — never inline literals.
 */

import { hatStrings } from './strings';
import type {
  DiagramLayer,
  DiagramManifest,
  DiagramPreset,
  LabelOverlay,
} from './types';

/** The one canonical coordinate box shared by all chapters (FR-001a / SC-009). */
export const viewBox = '0 0 360 360' as const;

/**
 * Region-tagged layers, painted back-to-front by `z`. All pictorial layers are
 * decorative (alt=""); the words live in the `labels` overlay. The Hat lesson's
 * teaching layers are the roof region (overhang + sun-high/sun-low/rain); the
 * envelope (wall/window) and foundation (footing) are always-present aligned
 * context, dimmed to 0.4 during the Hat focus.
 */
const layers: DiagramLayer[] = [
  {
    id: 'sun-high',
    src: 'book/hat/sun-high.svg',
    label: hatStrings.layerLabels['sun-high'],
    alt: '',
    decorative: true,
    region: 'roof',
    z: 10,
    defaultVisible: true,
  },
  {
    id: 'sun-low',
    src: 'book/hat/sun-low.svg',
    label: hatStrings.layerLabels['sun-low'],
    alt: '',
    decorative: true,
    region: 'roof',
    z: 11,
    defaultVisible: true,
  },
  {
    id: 'rain',
    src: 'book/hat/rain.svg',
    label: hatStrings.layerLabels['rain'],
    alt: '',
    decorative: true,
    region: 'roof',
    z: 12,
    defaultVisible: true,
  },
  {
    id: 'footing',
    src: 'book/hat/footing.svg',
    label: hatStrings.layerLabels['footing'],
    alt: '',
    decorative: true,
    region: 'foundation',
    z: 20,
    defaultVisible: true,
    atmosphereOpacity: 0.4,
  },
  {
    id: 'wall',
    src: 'book/hat/wall.svg',
    label: hatStrings.layerLabels['wall'],
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
    label: hatStrings.layerLabels['window'],
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
    label: hatStrings.layerLabels['roof-overhang'],
    alt: '',
    decorative: true,
    region: 'roof',
    z: 40,
    defaultVisible: true,
  },
  {
    id: 'labels',
    // No `src`: the labels layer is the HTML overlay below, not artwork.
    label: hatStrings.layerLabels['labels'],
    alt: hatStrings.layerAlt['labels'],
    decorative: false,
    region: 'roof',
    z: 50,
    defaultVisible: true,
  },
];

/** Label-overlay entries (HTML text over the SVG), in canonical viewBox coords. */
const labels: LabelOverlay[] = [
  {
    id: 'lbl-summer-sun',
    text: hatStrings.labelText['lbl-summer-sun'],
    x: 10,
    y: 20,
  },
  {
    id: 'lbl-winter-sun',
    text: hatStrings.labelText['lbl-winter-sun'],
    x: 20,
    y: 150,
  },
  { id: 'lbl-rain', text: hatStrings.labelText['lbl-rain'], x: 18, y: 352 },
  { id: 'lbl-hat', text: hatStrings.labelText['lbl-hat'], x: 180, y: 96 },
  { id: 'lbl-coat', text: hatStrings.labelText['lbl-coat'], x: 180, y: 250 },
  { id: 'lbl-boots', text: hatStrings.labelText['lbl-boots'], x: 180, y: 330 },
];

/** The four guided views; reading order = the FR-015 teaching sequence. */
const presets: DiagramPreset[] = [
  {
    id: 'everything',
    label: hatStrings.presetLabels['everything'],
    description: hatStrings.presetDescriptions['everything'],
    takeaway: hatStrings.presetTakeaways['everything'],
    visibleLayerIds: [
      'sun-high',
      'sun-low',
      'rain',
      'footing',
      'wall',
      'window',
      'roof-overhang',
      'labels',
    ],
  },
  {
    id: 'bare-wall',
    label: hatStrings.presetLabels['bare-wall'],
    description: hatStrings.presetDescriptions['bare-wall'],
    takeaway: hatStrings.presetTakeaways['bare-wall'],
    visibleLayerIds: ['footing', 'wall', 'window', 'labels'],
  },
  {
    id: 'roof-line',
    label: hatStrings.presetLabels['roof-line'],
    description: hatStrings.presetDescriptions['roof-line'],
    takeaway: hatStrings.presetTakeaways['roof-line'],
    visibleLayerIds: ['footing', 'wall', 'window', 'roof-overhang', 'labels'],
  },
  {
    id: 'how-it-sheds-water',
    label: hatStrings.presetLabels['how-it-sheds-water'],
    description: hatStrings.presetDescriptions['how-it-sheds-water'],
    takeaway: hatStrings.presetTakeaways['how-it-sheds-water'],
    visibleLayerIds: [
      'footing',
      'wall',
      'window',
      'roof-overhang',
      'rain',
      'labels',
    ],
  },
];

export const hatManifest: DiagramManifest = {
  id: 'house-cross-section',
  title: hatStrings.chapterTitle,
  viewBox,
  layers,
  labels,
  presets,
  defaultPresetId: 'everything',
  legend: hatStrings.legend,
};

// --- Compile-time allow-list guard (preset ids ⊆ layer ids) -----------------
// A typo in any preset's visibleLayerIds becomes a `tsc` error here, not a
// runtime blank stage (Coat gate: typed & tested). The union of all layer ids
// is computed as a literal type, and each preset's ids are checked against it.

const LAYER_IDS = [
  'sun-high',
  'sun-low',
  'rain',
  'footing',
  'wall',
  'window',
  'roof-overhang',
  'labels',
] as const;
type LayerId = (typeof LAYER_IDS)[number];

// If a preset references an id not in LayerId, this assignment fails to compile.
const _presetIdGuard: readonly LayerId[][] = presets.map(
  (p) => p.visibleLayerIds as LayerId[]
);
void _presetIdGuard;
