'use client';

import React, { useEffect } from 'react';
import { ExplodedBuilding } from '../ExplodedBuilding';
import { StoryRibbon } from '../../molecular/StoryRibbon';
import { useScrollStory } from './useScrollStory';
import { useLayerState } from './useLayerState';
import type { ChapterManifest } from './manifests/types';

export interface ChapterViewerProps {
  manifest: ChapterManifest;
}

/**
 * The chapter viewer: a scroll-story whose beats dock/explode the building's
 * layers, with the parts themselves as controls. One source of truth for story
 * position (useScrollStory) and one for layer state (useLayerState); the story
 * sets state, reader taps mutate it, and "back to the story" re-syncs.
 *
 * @category organisms
 */
export function ChapterViewer({ manifest }: ChapterViewerProps) {
  const allIds = manifest.layers.map((l) => l.id);
  const { activeStepIndex, goNext, goPrev, goTo, registerStep } =
    useScrollStory(manifest.steps.length);
  const step = manifest.steps[activeStepIndex];
  const { mode, isDocked, syncStory, toggle, resumeStory } = useLayerState(
    allIds,
    manifest.steps[0].dockedLayerIds
  );

  // Story drives the docked set when the active beat changes (story mode only).
  // Reads only its own step index — never echoes layer state back (no prop-echo).
  useEffect(() => {
    syncStory(step.dockedLayerIds);
  }, [activeStepIndex, step.dockedLayerIds, syncStory]);

  const legend = manifest.layers.map((l) => ({
    id: l.id,
    tabColor: l.tabColor,
    docked: isDocked(l.id),
  }));

  return (
    <section className="relative flex min-h-0 flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,32%)] lg:items-end">
      <h1 className="sr-only">{manifest.meta.title}</h1>

      {/* The building (hero) */}
      <div className="lg:[grid-column:1]">
        <ExplodedBuilding
          layers={manifest.layers}
          isDocked={isDocked}
          onToggle={toggle}
          spotlightId={step.spotlightLayerId}
        />
      </div>

      {/* Narrative ribbon */}
      <div className="lg:[grid-column:2]">
        <StoryRibbon
          heading={step.heading}
          prose={step.prose}
          stepIndex={activeStepIndex}
          stepCount={manifest.steps.length}
          legend={legend}
          onPrev={goPrev}
          onNext={goNext}
        />
        {mode === 'reader' && (
          <button
            type="button"
            onClick={() => resumeStory(step.dockedLayerIds)}
            className="btn btn-sm mt-2"
          >
            ↺ back to the story
          </button>
        )}
      </div>

      {/* Invisible scroll spine — one anchor per step drives the IO. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        {manifest.steps.map((s, i) => (
          <div
            key={s.id}
            data-step-index={i}
            ref={registerStep(i)}
            onFocus={() => goTo(i)}
            className="h-screen"
          />
        ))}
      </div>
    </section>
  );
}

export default ChapterViewer;
