import { type HTMLAttributes, type ReactNode, forwardRef, useState } from 'react';
import styles from './NavBar.module.css';

export interface NavBarAction {
  key: string;
  icon: ReactNode;
  onClick: () => void;
  label?: string;
}

export interface NavBarProps extends HTMLAttributes<HTMLDivElement> {
  onMenuClick?: () => void;
  title?: string;
  actions?: NavBarAction[];
  onSearch?: (query: string) => void;
  children?: ReactNode;
}

export const NavBar = forwardRef<HTMLDivElement, NavBarProps>(
  ({ onMenuClick, title, actions, onSearch, children, className, ...props }, ref) => {
    const [searchValue, setSearchValue] = useState('');
    const classNames = [styles.navbar, className].filter(Boolean).join(' ');

    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && onSearch) {
        onSearch(searchValue);
      }
    };

    return (
      <div ref={ref} className={classNames} role="toolbar" {...props}>
        {onMenuClick && (
          <button
            type="button"
            className={styles.menuButton}
            onClick={onMenuClick}
            aria-label="Menu"
          >
            <svg
              className={styles.menuIcon}
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
            </svg>
          </button>
        )}
        {title && <span className={styles.title}>{title}</span>}
        {children && <div className={styles.content}>{children}</div>}
        {onSearch && (
          <div className={styles.search}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              aria-label="Search"
            />
          </div>
        )}
        {actions && actions.length > 0 && (
          <div className={styles.actions}>
            {actions.map((action) => (
              <button
                key={action.key}
                type="button"
                className={styles.actionButton}
                onClick={action.onClick}
                aria-label={action.label}
              >
                {action.icon}
              </button>
            ))}
          </div>
        )}
        <button
          type="button"
          className={styles.overflowButton}
          aria-label="More options"
        >
          <svg
            className={styles.overflowIcon}
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
          </svg>
        </button>
      </div>
    );
  }
);

NavBar.displayName = 'NavBar';
