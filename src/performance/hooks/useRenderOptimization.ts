import { useRef, useEffect, useCallback, useState } from 'react';

interface RenderInfo {
  count: number;
  lastRenderTime: number;
  averageRenderTime: number;
  slowRenders: number;
}

const SLOW_RENDER_THRESHOLD = 16; // 16ms = 60fps

/**
 * Track render performance of a component
 */
export function useRenderTracking(componentName: string): RenderInfo {
  const renderCountRef = useRef(0);
  const renderTimesRef = useRef<number[]>([]);
  const lastRenderStartRef = useRef(performance.now());

  useEffect(() => {
    const renderTime = performance.now() - lastRenderStartRef.current;
    renderCountRef.current++;
    renderTimesRef.current.push(renderTime);

    // Keep only last 100 render times
    if (renderTimesRef.current.length > 100) {
      renderTimesRef.current.shift();
    }

    if (process.env.NODE_ENV === 'development' && renderTime > SLOW_RENDER_THRESHOLD) {
      console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
    }
  });

  // Record render start time
  lastRenderStartRef.current = performance.now();

  const times = renderTimesRef.current;
  const averageRenderTime =
    times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
  const slowRenders = times.filter((t) => t > SLOW_RENDER_THRESHOLD).length;

  return {
    count: renderCountRef.current,
    lastRenderTime: times[times.length - 1] || 0,
    averageRenderTime,
    slowRenders,
  };
}

/**
 * Detect unnecessary re-renders
 */
export function useWhyDidYouUpdate<P extends object>(componentName: string, props: P): void {
  const previousPropsRef = useRef<P | undefined>(undefined);

  useEffect(() => {
    if (previousPropsRef.current) {
      const allKeys = Object.keys({ ...previousPropsRef.current, ...props }) as (keyof P)[];
      const changedProps: Record<string, { from: unknown; to: unknown }> = {};

      allKeys.forEach((key) => {
        if (previousPropsRef.current![key] !== props[key]) {
          changedProps[key as string] = {
            from: previousPropsRef.current![key],
            to: props[key],
          };
        }
      });

      if (Object.keys(changedProps).length > 0 && process.env.NODE_ENV === 'development') {
        console.log(`[${componentName}] Props changed:`, changedProps);
      }
    }

    previousPropsRef.current = props;
  });
}

/**
 * Force re-render (use sparingly)
 */
export function useForceUpdate(): () => void {
  const [, setTick] = useState(0);
  return useCallback(() => setTick((t) => t + 1), []);
}
