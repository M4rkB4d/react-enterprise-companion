import { memo, type ReactElement, type CSSProperties, type ReactNode } from 'react';
import { List, useDynamicRowHeight } from 'react-window';
import { AutoSizer } from 'react-virtualized-auto-sizer';

interface OptimizedListProps<T> {
  items: T[];
  itemHeight: number;
  renderItem: (item: T, index: number) => ReactNode;
  overscanCount?: number;
  className?: string;
}

/**
 * Row props forwarded through List's rowProps mechanism
 */
interface ListRowProps {
  items: unknown[];
  renderItem: (item: unknown, index: number) => ReactNode;
}

/**
 * Row component compatible with react-window v2 API.
 * Receives ariaAttributes + index + style from List,
 * plus custom rowProps (items, renderItem).
 */
function ListRow({
  ariaAttributes,
  index,
  style,
  items,
  renderItem,
}: {
  ariaAttributes: { 'aria-posinset': number; 'aria-setsize': number; role: 'listitem' };
  index: number;
  style: CSSProperties;
} & ListRowProps): ReactElement | null {
  return (
    <div {...ariaAttributes} style={style}>
      {renderItem(items[index], index)}
    </div>
  );
}

/**
 * Virtualized list for rendering large datasets efficiently.
 * Uses react-window v2 List with fixed row heights and AutoSizer
 * to fill available container space.
 */
export const OptimizedList = memo(function OptimizedList<T>({
  items,
  itemHeight,
  renderItem,
  overscanCount = 5,
  className,
}: OptimizedListProps<T>) {
  return (
    <div className={className} style={{ height: '100%', width: '100%' }}>
      <AutoSizer
        renderProp={({ height }: { height: number | undefined; width: number | undefined }) => (
          <List<ListRowProps>
            rowComponent={ListRow}
            rowCount={items.length}
            rowHeight={itemHeight}
            rowProps={{
              items: items as unknown[],
              renderItem: renderItem as (item: unknown, index: number) => ReactNode,
            }}
            overscanCount={overscanCount}
            style={{ height: height ?? 400 }}
          />
        )}
      />
    </div>
  );
});

/**
 * Variable-size list for items with different heights.
 * Uses react-window v2's useDynamicRowHeight for automatic
 * row height measurement and caching.
 */
interface VariableOptimizedListProps<T> {
  items: T[];
  defaultItemHeight: number;
  renderItem: (item: T, index: number) => ReactNode;
  overscanCount?: number;
  className?: string;
}

export const VariableOptimizedList = memo(function VariableOptimizedList<T>({
  items,
  defaultItemHeight,
  renderItem,
  overscanCount = 5,
  className,
}: VariableOptimizedListProps<T>) {
  const dynamicRowHeight = useDynamicRowHeight({ defaultRowHeight: defaultItemHeight });

  return (
    <div className={className} style={{ height: '100%', width: '100%' }}>
      <AutoSizer
        renderProp={({ height }: { height: number | undefined; width: number | undefined }) => (
          <List<ListRowProps>
            rowComponent={ListRow}
            rowCount={items.length}
            rowHeight={dynamicRowHeight}
            rowProps={{
              items: items as unknown[],
              renderItem: renderItem as (item: unknown, index: number) => ReactNode,
            }}
            overscanCount={overscanCount}
            style={{ height: height ?? 400 }}
          />
        )}
      />
    </div>
  );
});
