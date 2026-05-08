import { type HTMLAttributes, forwardRef } from 'react';
import styles from './ConnectionStatus.module.css';

export type ConnectionStatusValue = 'online' | 'offline' | 'connecting' | 'error';

export interface ConnectionStatusProps extends HTMLAttributes<HTMLDivElement> {
  status: ConnectionStatusValue;
  label?: string;
}

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
