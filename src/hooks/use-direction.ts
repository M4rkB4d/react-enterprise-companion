// src/hooks/use-direction.ts

import { useMemo } from 'react';
import { useLocaleStore } from '@/i18n/locale-store';

type Direction = 'ltr' | 'rtl';

interface DirectionInfo {
  /** Current text direction */
  direction: Direction;
  /** Whether the current locale is RTL */
  isRTL: boolean;
  /** CSS logical value for "start" (left in LTR, right in RTL) */
  startSide: 'left' | 'right';
  /** CSS logical value for "end" (right in LTR, left in RTL) */
  endSide: 'left' | 'right';
}

/**
 * Hook that provides direction information based on the current locale.
 *
 * Use this when you need to:
 * - Conditionally render different content based on direction
 * - Apply direction-specific inline styles (prefer CSS logical props instead)
 * - Flip icons that should mirror in RTL
 *
 * @example
 * const { isRTL, direction } = useDirection();
 * <ChevronIcon className={isRTL ? 'rotate-180' : ''} />
 */
export function useDirection(): DirectionInfo {
  const direction = useLocaleStore((s) => s.direction);

  return useMemo(
    () => ({
      direction,
      isRTL: direction === 'rtl',
      startSide: (direction === 'rtl' ? 'right' : 'left') as 'left' | 'right',
      endSide: (direction === 'rtl' ? 'left' : 'right') as 'left' | 'right',
    }),
    [direction],
  );
}
