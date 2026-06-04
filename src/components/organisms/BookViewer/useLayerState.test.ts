import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLayerState } from './useLayerState';

const LAYER_IDS = ['roof', 'wall', 'window'];

describe('useLayerState', () => {
  it('starts in story mode with the given docked set', () => {
    const { result } = renderHook(() =>
      useLayerState(LAYER_IDS, ['roof', 'wall'])
    );
    expect(result.current.mode).toBe('story');
    expect(result.current.isDocked('roof')).toBe(true);
    expect(result.current.isDocked('window')).toBe(false);
  });

  it('syncStory updates docked set while in story mode', () => {
    const { result } = renderHook(() => useLayerState(LAYER_IDS, ['roof']));
    act(() => result.current.syncStory(['roof', 'window']));
    expect(result.current.isDocked('window')).toBe(true);
  });

  it('toggling a layer flips to reader mode and inverts just that layer', () => {
    const { result } = renderHook(() =>
      useLayerState(LAYER_IDS, ['roof', 'wall'])
    );
    act(() => result.current.toggle('roof'));
    expect(result.current.mode).toBe('reader');
    expect(result.current.isDocked('roof')).toBe(false);
    expect(result.current.isDocked('wall')).toBe(true);
  });

  it('in reader mode, syncStory does NOT override the reader (until resumed)', () => {
    const { result } = renderHook(() => useLayerState(LAYER_IDS, ['roof']));
    act(() => result.current.toggle('roof')); // reader now
    act(() => result.current.syncStory(['roof', 'wall'])); // story beat changes
    expect(result.current.isDocked('roof')).toBe(false); // reader wins
  });

  it('resumeStory re-applies the story set and returns to story mode', () => {
    const { result } = renderHook(() => useLayerState(LAYER_IDS, ['roof']));
    act(() => result.current.toggle('roof'));
    act(() => result.current.resumeStory(['roof', 'window']));
    expect(result.current.mode).toBe('story');
    expect(result.current.isDocked('roof')).toBe(true);
    expect(result.current.isDocked('window')).toBe(true);
  });
});
