import { type InputHTMLAttributes, forwardRef } from 'react';
import styles from './Toggle.module.css';

export interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  disabled?: boolean;
}

/**
 * Toggle switch for binary on/off settings, rendered with ATAK dark styling.
 *
 * @example
 * ```tsx
 * <Toggle label="Night mode" checked={nightMode} onChange={handleChange} />
 * ```
 */
export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  ({ checked, onChange, label, disabled, className, ...props }, ref) => {
    const wrapperClasses = [
      styles.wrapper,
      disabled ? styles.disabled : '',
      className,
    ].filter(Boolean).join(' ');

    return (
      <label className={wrapperClasses}>
        <span className={styles.track}>
          <input
            ref={ref}
            type="checkbox"
            role="switch"
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className={styles.input}
            {...props}
          />
          <span className={styles.thumb} />
        </span>
        {label && <span className={styles.label}>{label}</span>}
      </label>
    );
  }
);

Toggle.displayName = 'Toggle';
