import { type HTMLAttributes, forwardRef } from 'react';
import styles from './ProgressBar.module.css';

export type ProgressBarVariant = 'default' | 'small';

export interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  variant?: ProgressBarVariant;
}

export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ value, variant = 'default', className, ...props }, ref) => {
    const clampedValue = Math.min(100, Math.max(0, value));
    const trackClasses = [
      styles.track,
      styles[variant],
      className,
    ].filter(Boolean).join(' ');

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
        className={trackClasses}
        {...props}
      >
        <div
          className={styles.fill}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    );
  }
);

ProgressBar.displayName = 'ProgressBar';
