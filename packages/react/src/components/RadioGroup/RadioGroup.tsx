import { type HTMLAttributes, forwardRef } from 'react';
import styles from './RadioGroup.module.css';

export interface RadioOption {
  value: string;
  label: string;
}

export interface RadioGroupProps extends Omit<HTMLAttributes<HTMLFieldSetElement>, 'onChange'> {
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  name: string;
  disabled?: boolean;
}

/**
 * Radio button group for single-selection among mutually exclusive options.
 *
 * @example
 * ```tsx
 * <RadioGroup
 *   name="affiliation"
 *   options={[{ value: 'friendly', label: 'Friendly' }, { value: 'hostile', label: 'Hostile' }]}
 *   value={affiliation}
 *   onChange={setAffiliation}
 * />
 * ```
 */
export const RadioGroup = forwardRef<HTMLFieldSetElement, RadioGroupProps>(
  ({ options, value, onChange, name, disabled, className, ...props }, ref) => {
    const fieldsetClasses = [
      styles.fieldset,
      disabled ? styles.disabled : '',
      className,
    ].filter(Boolean).join(' ');

    return (
      <fieldset ref={ref} className={fieldsetClasses} {...props}>
        {options.map((opt) => (
          <label key={opt.value} className={styles.option}>
            <span className={styles.control}>
              <input
                type="radio"
                name={name}
                value={opt.value}
                checked={value === opt.value}
                onChange={() => onChange?.(opt.value)}
                disabled={disabled}
                className={styles.input}
              />
              <span className={styles.radio} />
            </span>
            <span className={styles.label}>{opt.label}</span>
          </label>
        ))}
      </fieldset>
    );
  }
);

RadioGroup.displayName = 'RadioGroup';
