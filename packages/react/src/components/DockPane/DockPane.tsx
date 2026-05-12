import { type HTMLAttributes, forwardRef, type ReactNode, useEffect, useCallback } from 'react';
import styles from './DockPane.module.css';

export interface DockPaneProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  open: boolean;
  onClose?: () => void;
  title?: string;
  position?: 'left' | 'right' | 'bottom';
  width?: string | number;
  minimized?: boolean;
  onMinimize?: () => void;
  children?: ReactNode;
}

/**
 * Dockable side panel that slides in from the left, right, or bottom. Supports minimize and close actions.
 *
 * @example
 * ```tsx
 * <DockPane open={isPaneOpen} onClose={() => setPaneOpen(false)} title="Layer Manager" position="right">
 *   <ListView items={layers} />
 * </DockPane>
 * ```
 */
export const DockPane = forwardRef<HTMLDivElement, DockPaneProps>(
  (
    {
      open,
      onClose,
      title,
      position = 'right',
      width,
      minimized,
      onMinimize,
      className,
      children,
      style,
      ...props
    },
    ref
  ) => {
    const handleKeyDown = useCallback(
      (e: KeyboardEvent) => {
        if (e.key === 'Escape' && onClose) onClose();
      },
      [onClose]
    );

    useEffect(() => {
      if (open) {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
      }
    }, [open, handleKeyDown]);

    if (!open) return null;

    const resolvedWidth = width ?? 'var(--tak-sidebar-width, 280px)';
    const sizeStyle =
      position === 'bottom'
        ? { height: typeof resolvedWidth === 'number' ? `${resolvedWidth}px` : resolvedWidth }
        : { width: typeof resolvedWidth === 'number' ? `${resolvedWidth}px` : resolvedWidth };

    const classNames = [
      styles.pane,
      styles[position],
      minimized ? styles.minimized : undefined,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div
        ref={ref}
        className={classNames}
        role="complementary"
        style={{ ...sizeStyle, ...style }}
        {...props}
      >
        <div className={styles.header}>
          {title && <span className={styles.title}>{title}</span>}
          <span className={styles.actions}>
            {onMinimize && (
              <button
                className={styles.headerButton}
                onClick={onMinimize}
                aria-label={minimized ? 'Restore' : 'Minimize'}
              >
                {minimized ? '\u25A1' : '\u2013'}
              </button>
            )}
            {onClose && (
              <button
                className={styles.headerButton}
                onClick={onClose}
                aria-label="Close"
              >
                &times;
              </button>
            )}
          </span>
        </div>
        {!minimized && <div className={styles.body}>{children}</div>}
      </div>
    );
  }
);

DockPane.displayName = 'DockPane';
