import { type HTMLAttributes, forwardRef, type ReactNode, useEffect, useRef, useCallback } from 'react';
import styles from './DialogPanel.module.css';

export interface DialogAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'destructive';
}

export interface DialogPanelProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  open: boolean;
  onClose?: () => void;
  title?: string;
  variant?: 'standard' | 'alert' | 'fullscreen';
  actions?: DialogAction[];
  destructive?: boolean;
  children?: ReactNode;
}

export const DialogPanel = forwardRef<HTMLDivElement, DialogPanelProps>(
  (
    {
      open,
      onClose,
      title,
      variant = 'standard',
      actions,
      destructive = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const backdropRef = useRef<HTMLDivElement>(null);
    const dialogRef = useRef<HTMLDivElement>(null);

    const handleKeyDown = useCallback(
      (e: KeyboardEvent) => {
        if (e.key === 'Escape' && onClose) onClose();

        // Focus trap: keep Tab cycling within the dialog
        if (e.key === 'Tab' && dialogRef.current) {
          const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusable.length === 0) return;
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (e.shiftKey) {
            if (document.activeElement === first) {
              e.preventDefault();
              last.focus();
            }
          } else {
            if (document.activeElement === last) {
              e.preventDefault();
              first.focus();
            }
          }
        }
      },
      [onClose]
    );

    useEffect(() => {
      if (open) {
        document.addEventListener('keydown', handleKeyDown);
        // Focus the dialog on open for accessibility
        dialogRef.current?.focus();
        return () => document.removeEventListener('keydown', handleKeyDown);
      }
    }, [open, handleKeyDown]);

    if (!open) return null;

    const variantClass = styles[variant] ?? '';
    const classNames = [styles.dialog, variantClass, destructive ? styles.destructive : '', className]
      .filter(Boolean)
      .join(' ');

    return (
      <div
        ref={backdropRef}
        className={styles.backdrop}
        onClick={(e) => {
          if (e.target === backdropRef.current && onClose) onClose();
        }}
      >
        <div
          ref={(node) => {
            (dialogRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
            if (typeof ref === 'function') ref(node);
            else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
          }}
          className={classNames}
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
          {...props}
        >
          {title && (
            <div className={styles.header}>
              <span className={styles.title}>{title}</span>
              {onClose && variant !== 'fullscreen' && (
                <button className={styles.close} onClick={onClose} aria-label="Close">
                  &times;
                </button>
              )}
            </div>
          )}
          <div className={styles.body}>{children}</div>
          {actions && actions.length > 0 && (
            <div className={styles.actions}>
              {actions.map((action) => (
                <button
                  key={action.label}
                  className={[
                    styles.actionButton,
                    action.variant === 'destructive' ? styles.actionDestructive : '',
                    action.variant === 'secondary' ? styles.actionSecondary : '',
                    action.variant === 'primary' || !action.variant ? styles.actionPrimary : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={action.onClick}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
);

DialogPanel.displayName = 'DialogPanel';
