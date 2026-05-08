import { type HTMLAttributes, forwardRef } from 'react';
import styles from './GPSStatus.module.css';

export type GPSFixType = 'none' | '2d' | '3d';

export interface GPSStatusProps extends HTMLAttributes<HTMLDivElement> {
  fixType: GPSFixType;
  satellites?: number;
  accuracy?: number;
}

const fixLabels: Record<GPSFixType, string> = {
  none: 'No Fix',
  '2d': '2D Fix',
  '3d': '3D Fix',
};

export const GPSStatus = forwardRef<HTMLDivElement, GPSStatusProps>(
  ({ fixType, satellites, accuracy, className, ...props }, ref) => {
    const classNames = [
      styles.root,
      styles[`fix-${fixType}`],
      className,
    ].filter(Boolean).join(' ');

    return (
      <div ref={ref} className={classNames} role="status" {...props}>
        <svg
          className={styles.icon}
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="8" cy="8" r="3" fill="currentColor" />
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <line x1="8" y1="0" x2="8" y2="3" stroke="currentColor" strokeWidth="1.5" />
          <line x1="8" y1="13" x2="8" y2="16" stroke="currentColor" strokeWidth="1.5" />
          <line x1="0" y1="8" x2="3" y2="8" stroke="currentColor" strokeWidth="1.5" />
          <line x1="13" y1="8" x2="16" y2="8" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <span className={styles.fixLabel}>{fixLabels[fixType]}</span>
        {satellites !== undefined && (
          <span className={styles.satellites}>{satellites} sats</span>
        )}
        {accuracy !== undefined && (
          <span className={styles.accuracy}>{accuracy}m</span>
        )}
      </div>
    );
  }
);

GPSStatus.displayName = 'GPSStatus';
