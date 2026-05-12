import { type HTMLAttributes, forwardRef } from 'react';
import styles from './ConnectionStatus.module.css';

export type ConnectionStatusValue = 'online' | 'offline' | 'connecting' | 'error';

export interface ConnectionStatusProps extends HTMLAttributes<HTMLDivElement> {
  status: ConnectionStatusValue;
  label?: string;
}

/**
 * Network connection status indicator with a color-coded dot for online, offline, connecting, or error states.
 *
 * @example
 * ```tsx
 * <ConnectionStatus status="online" label="TAK Server" />
 * ```
 */
export const ConnectionStatus = forwardRef<HTMLDivElement, ConnectionStatusProps>(
  ({ status, label, className, ...props }, ref) => {
    const classNames = [
      styles.root,
      styles[status],
      className,
    ].filter(Boolean).join(' ');

    return (
      <div ref={ref} className={classNames} role="status" {...props}>
        <span className={styles.dot} aria-hidden="true" />
        {label && <span className={styles.label}>{label}</span>}
      </div>
    );
  }
);

ConnectionStatus.displayName = 'ConnectionStatus';
