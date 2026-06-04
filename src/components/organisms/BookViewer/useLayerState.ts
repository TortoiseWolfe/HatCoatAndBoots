import { useCallback, useMemo, useState } from 'react';
import type { LayerId } from './manifests/types';

type Mode = 'story' | 'reader';

export interface LayerStateApi {
  mode: Mode;
  isDocked: (id: LayerId) => boolean;
  /** Story-driven: set the docked set; ignored once the reader has taken over. */
  syncStory: (dockedIds: LayerId[]) => void;
  /** Reader-driven: flip one layer; switches to reader mode. */
  toggle: (id: LayerId) => void;
  /** Reader pressed "back to the story": re-apply the beat and return to story mode. */
  resumeStory: (dockedIds: LayerId[]) => void;
}

export function useLayerState(
  allIds: LayerId[],
  initialDockedIds: LayerId[]
): LayerStateApi {
  const [mode, setMode] = useState<Mode>('story');
  const [docked, setDocked] = useState<Set<LayerId>>(
    () => new Set(initialDockedIds)
  );

  const isDocked = useCallback((id: LayerId) => docked.has(id), [docked]);

  const syncStory = useCallback((dockedIds: LayerId[]) => {
    // Only the story writes the set while in story mode.
    setMode((m) => {
      if (m === 'story') setDocked(new Set(dockedIds));
      return m;
    });
  }, []);

  const toggle = useCallback((id: LayerId) => {
    setMode('reader');
    setDocked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const resumeStory = useCallback((dockedIds: LayerId[]) => {
    setDocked(new Set(dockedIds));
    setMode('story');
  }, []);

  return useMemo(
    () => ({ mode, isDocked, syncStory, toggle, resumeStory }),
    [mode, isDocked, syncStory, toggle, resumeStory]
  );
}
