import { type HTMLAttributes, forwardRef, type ReactNode } from 'react';
import styles from './ListView.module.css';

export interface ListItem {
  key: string;
  title: string;
  subtitle?: string;
  tertiary?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export interface ListViewProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  items: ListItem[];
  onItemClick?: (item: ListItem) => void;
  selectedKeys?: string[];
  onSelectionChange?: (keys: string[]) => void;
  multiSelect?: boolean;
  children?: ReactNode;
}

/**
 * Scrollable list with single or multi-select support, icon slots, and three-tier item layout.
 *
 * @example
 * ```tsx
 * <ListView
 *   items={[{ key: '1', title: 'ALPHA-1', subtitle: 'Friendly' }]}
 *   selectedKeys={['1']}
 *   onItemClick={(item) => openDetail(item.key)}
 * />
 * ```
 */
export const ListView = forwardRef<HTMLDivElement, ListViewProps>(
  ({ items, onItemClick, selectedKeys = [], onSelectionChange, multiSelect, children, className, ...props }, ref) => {
    const classNames = [styles.listView, className].filter(Boolean).join(' ');

    const handleItemClick = (item: ListItem) => {
      onItemClick?.(item);

      if (onSelectionChange) {
        if (multiSelect) {
          const isSelected = selectedKeys.includes(item.key);
          const next = isSelected
            ? selectedKeys.filter(k => k !== item.key)
            : [...selectedKeys, item.key];
          onSelectionChange(next);
        } else {
          onSelectionChange([item.key]);
        }
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, item: ListItem) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleItemClick(item);
      }
    };

    return (
      <div ref={ref} className={classNames} role="listbox" aria-multiselectable={multiSelect || undefined} {...props}>
        {items.map((item, index) => {
          const isSelected = selectedKeys.includes(item.key);
          const itemClasses = [
            styles.item,
            isSelected ? styles.selected : '',
            item.subtitle || item.tertiary ? styles.multiTier : '',
          ].filter(Boolean).join(' ');

          return (
            <div key={item.key}>
              <div
                className={itemClasses}
                role="option"
                aria-selected={isSelected}
                tabIndex={0}
                onClick={() => handleItemClick(item)}
                onKeyDown={(e) => handleKeyDown(e, item)}
              >
                {item.icon && <span className={styles.icon}>{item.icon}</span>}
                <div className={styles.content}>
                  <span className={styles.title}>{item.title}</span>
                  {item.subtitle && <span className={styles.subtitle}>{item.subtitle}</span>}
                  {item.tertiary && <span className={styles.tertiary}>{item.tertiary}</span>}
                </div>
                {item.action && <span className={styles.action}>{item.action}</span>}
              </div>
              {index < items.length - 1 && <div className={styles.divider} />}
            </div>
          );
        })}
        {children}
      </div>
    );
  }
);

ListView.displayName = 'ListView';
