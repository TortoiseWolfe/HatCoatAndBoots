'use client';

import React, { useEffect } from 'react';
import { ExplodedBuilding } from '../ExplodedBuilding';
import { StoryRibbon } from '../../molecular/StoryRibbon';
import { ChapterLeadIn } from '../../molecular/ChapterLeadIn';
import { LayerToggles } from '../../molecular/LayerToggles';
import { SourcesNote } from '../../molecular/SourcesNote';
import { useScrollStory } from './useScrollStory';
import { useLayerState } from './useLayerState';
import type { ChapterManifest, Step } from './manifests/types';

export interface ChapterViewerProps {
  manifest: ChapterManifest;
}

/**
 * The chapter viewer: a lead-in (title + intro) above a scroll-story whose beats
 * dock/explode the building's layers. The parts are tappable, and a visible
 * LayerToggles control lets the reader turn each layer on and off. One source of
 * truth for story position (useScrollStory) and one for layer state
 * (useLayerState); the story sets state, reader taps mutate it, and "back to the
 * story" re-syncs. Sources live in a disclosure under the ribbon.
 *
 * @category organisms
 */
export function ChapterViewer({ manifest }: ChapterViewerProps) {
  const allIds = manifest.layers.map((l) => l.id);

  // The chapter intro is the FIRST slide, not a static block above the house: a
  // synthetic opening step that shows the whole assembled building while the
  // ribbon carries the intro prose. The authored views follow.
  const introStep: Step[] =
    manifest.intro && manifest.intro.length > 0
      ? [
          {
            id: 'intro',
            heading: manifest.subtitle ?? 'Start here',
            prose: manifest.intro.join('\n\n'),
            dockedLayerIds: allIds,
          },
        ]
      : [];
  const steps: Step[] = [...introStep, ...manifest.steps];

  const { activeStepIndex, goNext, goPrev, goTo, registerStep } =
    useScrollStory(steps.length);
  const step = steps[activeStepIndex];
  const { mode, isDocked, syncStory, toggle, resumeStory } = useLayerState(
    allIds,
    steps[0].dockedLayerIds
  );

  // Story drives the docked set when the active beat changes (story mode only).
  // Reads only its own step index — never echoes layer state back (no prop-echo).
  useEffect(() => {
    syncStory(step.dockedLayerIds);
  }, [activeStepIndex, step.dockedLayerIds, syncStory]);

  return (
    <div className="flex flex-col gap-6">
      {/* Lead-in: title only. The intro prose lives in the first slide, not as a
          static block above the house. */}
      <ChapterLeadIn title={manifest.displayTitle ?? manifest.meta.title} />

      <section className="relative flex min-h-0 flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,34%)] lg:items-start">
        {/* The building (hero). */}
        <div className="lg:[grid-column:1]">
          <ExplodedBuilding
            chapter={manifest.slug}
            layers={manifest.layers}
            isDocked={isDocked}
            onToggle={toggle}
            spotlightId={step.spotlightLayerId}
          />
        </div>

        {/* Narrative + controls column. */}
        <div className="flex flex-col gap-3 lg:[grid-column:2]">
          <StoryRibbon
            heading={step.heading}
            prose={step.prose}
            takeaway={step.takeaway}
            stepIndex={activeStepIndex}
            stepCount={steps.length}
            onPrev={goPrev}
            onNext={goNext}
          />
          {mode === 'reader' && (
            <button
              type="button"
              onClick={() => resumeStory(step.dockedLayerIds)}
              className="btn btn-sm self-start"
            >
              ↺ back to the story
            </button>
          )}

          {/* Visible layer controls — turn each part on/off. */}
          <div>
            <p className="text-base-content/60 mb-2 text-xs font-bold tracking-wider uppercase">
              Take it apart — tap a part to show or hide it
            </p>
            <LayerToggles
              layers={manifest.layers}
              isDocked={isDocked}
              onToggle={toggle}
            />
          </div>

          <SourcesNote
            whyItMatters={manifest.whyItMatters}
            sourcedAside={manifest.sourcedAside}
            sources={manifest.sources}
          />
        </div>

        {/* Invisible scroll spine — one anchor per step drives the IO. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
        >
          {steps.map((s, i) => (
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
    </div>
  );
}

export default ChapterViewer;
