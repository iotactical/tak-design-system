import { type SelectHTMLAttributes, forwardRef } from 'react';
import styles from './Spinner.module.css';

export interface SpinnerProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: Array<{ value: string; label: string }>;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
}

/**
 * Dropdown select spinner for choosing from a list of predefined options.
 *
 * @example
 * ```tsx
 * <Spinner
 *   options={[{ value: 'mgrs', label: 'MGRS' }, { value: 'dd', label: 'Decimal Degrees' }]}
 *   value={coordFormat}
 *   onChange={handleFormatChange}
 * />
 * ```
 */
export const Spinner = forwardRef<HTMLSelectElement, SpinnerProps>(
  ({ options, value, onChange, disabled, className, ...props }, ref) => {
    const selectClasses = [
      styles.spinner,
      disabled ? styles.disabled : '',
      className,
    ].filter(Boolean).join(' ');

    return (
      <select
        ref={ref}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={selectClasses}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  }
);

Spinner.displayName = 'Spinner';
