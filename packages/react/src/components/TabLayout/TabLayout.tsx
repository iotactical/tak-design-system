import { type HTMLAttributes, forwardRef, useState, type ReactNode } from 'react';
import styles from './TabLayout.module.css';

export interface Tab {
  key: string;
  label: ReactNode;
  content: ReactNode;
}

export interface TabLayoutProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  tabs: Tab[];
  defaultActiveKey?: string;
  activeKey?: string;
  onChange?: (key: string) => void;
}

export const TabLayout = forwardRef<HTMLDivElement, TabLayoutProps>(
  ({ tabs, defaultActiveKey, activeKey: controlledKey, onChange, className, ...props }, ref) => {
    const [internalKey, setInternalKey] = useState(defaultActiveKey ?? tabs[0]?.key);
    const activeKey = controlledKey ?? internalKey;

    const handleSelect = (key: string) => {
      if (!controlledKey) setInternalKey(key);
      onChange?.(key);
    };

    const classNames = [styles.tabLayout, className].filter(Boolean).join(' ');
    const activeTab = tabs.find(t => t.key === activeKey);

    return (
      <div ref={ref} className={classNames} {...props}>
        <div className={styles.tabBar} role="tablist">
          {tabs.map(tab => (
            <button
              key={tab.key}
              role="tab"
              aria-selected={tab.key === activeKey}
              className={[styles.tab, tab.key === activeKey ? styles.active : ''].filter(Boolean).join(' ')}
              onClick={() => handleSelect(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className={styles.tabPanel} role="tabpanel">
          {activeTab?.content}
        </div>
      </div>
    );
  }
);

TabLayout.displayName = 'TabLayout';
