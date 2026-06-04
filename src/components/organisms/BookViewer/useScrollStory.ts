import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export interface ScrollStoryApi {
  activeStepIndex: number;
  goNext: () => void;
  goPrev: () => void;
  goTo: (index: number) => void;
  /** Attach to each step anchor element so scrolling can set the active step. */
  registerStep: (index: number) => (el: HTMLElement | null) => void;
}

export function useScrollStory(stepCount: number): ScrollStoryApi {
  const [activeStepIndex, setActive] = useState(0);
  const clamp = useCallback(
    (i: number) => Math.max(0, Math.min(stepCount - 1, i)),
    [stepCount]
  );

  const goTo = useCallback((i: number) => setActive(clamp(i)), [clamp]);
  const goNext = useCallback(() => setActive((i) => clamp(i + 1)), [clamp]);
  const goPrev = useCallback(() => setActive((i) => clamp(i - 1)), [clamp]);

  const els = useRef<Map<number, HTMLElement>>(new Map());
  const registerStep = useCallback(
    (index: number) => (el: HTMLElement | null) => {
      if (el) els.current.set(index, el);
      else els.current.delete(index);
    },
    []
  );

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      (entries) => {
        // The most-visible intersecting anchor wins.
        let best: { index: number; ratio: number } | null = null;
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const index = Number((e.target as HTMLElement).dataset.stepIndex);
          if (!best || e.intersectionRatio > best.ratio)
            best = { index, ratio: e.intersectionRatio };
        }
        if (best) setActive(best.index);
      },
      { threshold: [0.5, 0.75, 1] }
    );
    els.current.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [stepCount]);

  return useMemo(
    () => ({ activeStepIndex, goNext, goPrev, goTo, registerStep }),
    [activeStepIndex, goNext, goPrev, goTo, registerStep]
  );
}
