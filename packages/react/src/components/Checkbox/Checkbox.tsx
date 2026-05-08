import { type InputHTMLAttributes, forwardRef } from 'react';
import styles from './Checkbox.module.css';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  disabled?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ checked, onChange, label, disabled, className, ...props }, ref) => {
    const wrapperClasses = [
      styles.wrapper,
      disabled ? styles.disabled : '',
      className,
    ].filter(Boolean).join(' ');

    return (
      <label className={wrapperClasses}>
        <span className={styles.control}>
          <input
            ref={ref}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className={styles.input}
            {...props}
          />
          <span className={styles.check} />
        </span>
        {label && <span className={styles.label}>{label}</span>}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
