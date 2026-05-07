import { type HTMLAttributes, forwardRef, type ReactNode } from 'react';
import styles from './ToolBar.module.css';

export interface ToolBarProps extends HTMLAttributes<HTMLDivElement> {
  leading?: ReactNode;
  title?: string;
  trailing?: ReactNode;
}

export const ToolBar = forwardRef<HTMLDivElement, ToolBarProps>(
  ({ leading, title, trailing, className, children, ...props }, ref) => {
    const classNames = [styles.toolbar, className].filter(Boolean).join(' ');

    return (
      <div ref={ref} className={classNames} role="toolbar" {...props}>
        {leading && <div className={styles.leading}>{leading}</div>}
        {title && <span className={styles.title}>{title}</span>}
        {children && <div className={styles.content}>{children}</div>}
        {trailing && <div className={styles.trailing}>{trailing}</div>}
      </div>
    );
  }
);

ToolBar.displayName = 'ToolBar';
