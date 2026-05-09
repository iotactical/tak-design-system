import { type HTMLAttributes, type ReactNode, forwardRef, useCallback, useEffect } from 'react';
import styles from './RadialMenu.module.css';

export interface RadialMenuItem {
  key: string;
  icon?: ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export interface RadialMenuProps extends HTMLAttributes<HTMLDivElement> {
  open: boolean;
  onClose?: () => void;
  items: RadialMenuItem[];
  position?: { x: number; y: number };
  sectors?: 4 | 6 | 8;
  children?: ReactNode;
}

export const RadialMenu = forwardRef<HTMLDivElement, RadialMenuProps>(
  ({ open, onClose, items, position, sectors = 6, children, className, ...props }, ref) => {
    const handleKeyDown = useCallback(
      (e: KeyboardEvent) => {
        if (e.key === 'Escape' && onClose) {
          onClose();
        }
      },
      [onClose]
    );

    const handleClickOutside = useCallback(
      (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest(`.${styles.ring}`)) {
          return;
        }
        if (onClose) {
          onClose();
        }
      },
      [onClose]
    );

    useEffect(() => {
      if (!open) return;
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [open, handleKeyDown, handleClickOutside]);

    if (!open) return null;

    const sectorAngle = 360 / sectors;
    const radius = 80;

    const positionStyle = position
      ? { left: `${position.x}px`, top: `${position.y}px` }
      : undefined;

    const classNames = [styles.overlay, className].filter(Boolean).join(' ');

    return (
      <div ref={ref} className={classNames} style={positionStyle} {...props}>
        <div className={styles.ring} role="menu">
          {items.slice(0, sectors).map((item, index) => {
            const angle = sectorAngle * index - 90;
            const rad = (angle * Math.PI) / 180;
            const x = Math.cos(rad) * radius;
            const y = Math.sin(rad) * radius;

            return (
              <button
                key={item.key}
                type="button"
                role="menuitem"
                className={styles.item}
                style={{
                  transform: `translate(${x}px, ${y}px)`,
                }}
                onClick={item.onClick}
                disabled={item.disabled}
                aria-label={item.label}
              >
                {item.icon && (
                  <span className={styles.icon} aria-hidden="true">
                    {item.icon}
                  </span>
                )}
                <span className={styles.label}>{item.label}</span>
              </button>
            );
          })}
          {children}
        </div>
      </div>
    );
  }
);

RadialMenu.displayName = 'RadialMenu';
