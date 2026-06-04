export type LayerId = string;

export interface Layer {
  /** Stable id; join key for steps, state, tabs. */
  id: LayerId;
  /** basePath-relative SVG path, e.g. 'book/hat/wall.svg'. Resolved at render. */
  src: string;
  /** Control label (button text). */
  label: string;
  /** Text alternative for assistive tech. */
  alt: string;
  /** Edge-tab accent colour (from the real SVG fill). */
  tabColor: string;
  /** One-word tab caption, e.g. 'WALL'. */
  tabWord: string;
  /** Stacking order in the shared 0 0 360 360 space (low draws behind). */
  z: number;
  /**
   * Translation applied when this layer is EXPLODED (docked = {0,0}), expressed
   * in VIEWBOX UNITS (0..360), so the real geometry moves apart — not a pixel
   * nudge on a full-canvas image.
   */
  explodeOffset: { x: number; y: number };
  /**
   * The layer's real ink bounding box in viewBox units, used to place its tap
   * control + colour tab on the actual part (not piled in a corner). Measured
   * from the source SVG.
   */
  bbox: { x: number; y: number; w: number; h: number };
}

export interface Step {
  /** Stable id for the beat. */
  id: string;
  /** Short headline shown in the ribbon. */
  heading: string;
  /** One or two sentences of narrative. */
  prose: string;
  /** Layers DOCKED (visible, in place) at this beat; others explode out. */
  dockedLayerIds: LayerId[];
  /** Optional single layer to spotlight (halo) at this beat. */
  spotlightLayerId?: LayerId;
}

export interface ChapterManifest {
  /** Route slug: 'hat' | 'coat' | 'boots'. */
  slug: string;
  meta: { title: string; kicker: string };
  layers: Layer[];
  steps: Step[];
}

export function isChapterManifest(v: unknown): v is ChapterManifest {
  if (!v || typeof v !== 'object') return false;
  const m = v as Record<string, unknown>;
  return (
    typeof m.slug === 'string' &&
    Array.isArray(m.layers) &&
    Array.isArray(m.steps) &&
    (m.steps as unknown[]).length > 0
  );
}
