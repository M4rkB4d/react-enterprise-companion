import { memo, type ReactNode, type ComponentType } from 'react';

/**
 * Deep comparison memo wrapper
 */
function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (typeof a !== 'object' || a === null || b === null) return false;

  const keysA = Object.keys(a as object);
  const keysB = Object.keys(b as object);

  if (keysA.length !== keysB.length) return false;

  return keysA.every((key) =>
    deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]),
  );
}

export function memoDeep<P extends object>(Component: ComponentType<P>): ComponentType<P> {
  return memo(Component, (prevProps, nextProps) => deepEqual(prevProps, nextProps));
}

/**
 * Selective memo - only compare specified props
 */
export function memoSelect<P extends object>(
  Component: ComponentType<P>,
  propsToCompare: (keyof P)[],
): ComponentType<P> {
  return memo(Component, (prevProps, nextProps) => {
    return propsToCompare.every((key) => prevProps[key] === nextProps[key]);
  });
}

/**
 * Memo with custom comparator
 */
export function memoWithComparator<P extends object>(
  Component: ComponentType<P>,
  comparator: (prevProps: P, nextProps: P) => boolean,
): ComponentType<P> {
  return memo(Component, comparator);
}

// Example: Memoized list item
interface ListItemProps {
  id: string;
  title: string;
  description: string;
  onSelect: (id: string) => void;
  isSelected: boolean;
}

export const MemoizedListItem = memo(function ListItem({
  id,
  title,
  description,
  onSelect,
  isSelected,
}: ListItemProps) {
  return (
    <div
      className={`p-4 border rounded ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
      onClick={() => onSelect(id)}
    >
      <h3 className="font-medium">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
});

// Example: Container that prevents unnecessary child re-renders
interface StableContainerProps {
  children: ReactNode;
  className?: string;
}

export const StableContainer = memo(function StableContainer({
  children,
  className,
}: StableContainerProps) {
  return <div className={className}>{children}</div>;
});
