import { describe, it, expect, beforeAll } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useScrollStory } from './useScrollStory';

beforeAll(() => {
  // jsdom lacks IntersectionObserver; stub a no-op so the hook mounts.
  class IO {
    observe() {}
    disconnect() {}
    unobserve() {}
  }
  // @ts-expect-error test stub
  globalThis.IntersectionObserver = IO;
});

describe('useScrollStory', () => {
  it('starts at step 0', () => {
    const { result } = renderHook(() => useScrollStory(4));
    expect(result.current.activeStepIndex).toBe(0);
  });

  it('goNext / goPrev clamp within bounds', () => {
    const { result } = renderHook(() => useScrollStory(3));
    act(() => result.current.goPrev());
    expect(result.current.activeStepIndex).toBe(0); // clamped low
    act(() => result.current.goNext());
    act(() => result.current.goNext());
    act(() => result.current.goNext()); // would be 3, clamp to 2
    expect(result.current.activeStepIndex).toBe(2);
  });

  it('goTo jumps to a specific in-range index', () => {
    const { result } = renderHook(() => useScrollStory(5));
    act(() => result.current.goTo(3));
    expect(result.current.activeStepIndex).toBe(3);
    act(() => result.current.goTo(99));
    expect(result.current.activeStepIndex).toBe(4); // clamped high
  });

  it('exposes a ref registrar for step anchors', () => {
    const { result } = renderHook(() => useScrollStory(2));
    expect(typeof result.current.registerStep).toBe('function');
  });
});
