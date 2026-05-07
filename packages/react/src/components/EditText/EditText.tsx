import { type InputHTMLAttributes, forwardRef, type ReactNode } from 'react';
import styles from './EditText.module.css';

export interface EditTextProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
}

export const EditText = forwardRef<HTMLInputElement, EditTextProps>(
  ({ label, error, leading, trailing, className, ...props }, ref) => {
    const wrapperClasses = [
      styles.wrapper,
      error ? styles.hasError : '',
      className,
    ].filter(Boolean).join(' ');

    return (
      <div className={wrapperClasses}>
        {label && <label className={styles.label}>{label}</label>}
        <div className={styles.inputRow}>
          {leading && <span className={styles.leading}>{leading}</span>}
          <input ref={ref} className={styles.input} {...props} />
          {trailing && <span className={styles.trailing}>{trailing}</span>}
        </div>
        {error && <span className={styles.error}>{error}</span>}
      </div>
    );
  }
);

EditText.displayName = 'EditText';
