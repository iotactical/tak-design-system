import { type HTMLAttributes, forwardRef, type ReactNode, useEffect, useRef, useCallback } from 'react';
import styles from './Modal.module.css';

export interface ModalProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  open: boolean;
  onClose?: () => void;
  title?: ReactNode;
}

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({ open, onClose, title, className, children, ...props }, ref) => {
    const backdropRef = useRef<HTMLDivElement>(null);

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

    const classNames = [styles.modal, className].filter(Boolean).join(' ');

    return (
      <div ref={backdropRef} className={styles.backdrop} onClick={(e) => {
        if (e.target === backdropRef.current && onClose) onClose();
      }}>
        <div ref={ref} className={classNames} role="dialog" aria-modal="true" {...props}>
          {title && (
            <div className={styles.header}>
              <span className={styles.title}>{title}</span>
              {onClose && (
                <button className={styles.close} onClick={onClose} aria-label="Close">
                  &times;
                </button>
              )}
            </div>
          )}
          <div className={styles.body}>{children}</div>
        </div>
      </div>
    );
  }
);

Modal.displayName = 'Modal';
