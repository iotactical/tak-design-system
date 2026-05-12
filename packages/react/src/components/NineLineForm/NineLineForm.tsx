import { type HTMLAttributes, forwardRef, type ReactNode, useState, useCallback } from 'react';
import styles from './NineLineForm.module.css';

export interface NineLineLine {
  number: number;
  label: string;
  field: string;
  type?: 'text' | 'coordinate' | 'select';
  options?: string[];
}

export interface NineLineTemplate {
  name: string;
  lines: NineLineLine[];
}

export interface NineLineFormProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  template: NineLineTemplate;
  values?: Record<string, string>;
  onChange?: (field: string, value: string) => void;
  onSubmit?: (values: Record<string, string>) => void;
  readOnly?: boolean;
  children?: ReactNode;
}

/**
 * Structured 9-line CAS request form driven by a template definition. Supports controlled and uncontrolled field values.
 *
 * @example
 * ```tsx
 * <NineLineForm
 *   template={{ name: '9-Line CAS', lines: [{ number: 1, label: 'IP/BP', field: 'ip', type: 'text' }] }}
 *   onSubmit={(values) => sendCasRequest(values)}
 * />
 * ```
 */
export const NineLineForm = forwardRef<HTMLDivElement, NineLineFormProps>(
  (
    {
      template,
      values: controlledValues,
      onChange,
      onSubmit,
      readOnly = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const [internalValues, setInternalValues] = useState<Record<string, string>>({});
    const current = controlledValues ?? internalValues;

    const handleChange = useCallback(
      (field: string, value: string) => {
        if (readOnly) return;
        if (onChange) {
          onChange(field, value);
        } else {
          setInternalValues((prev) => ({ ...prev, [field]: value }));
        }
      },
      [readOnly, onChange]
    );

    const handleSubmit = () => {
      if (onSubmit) {
        onSubmit(current);
      }
    };

    const classNames = [styles.nineLineForm, className].filter(Boolean).join(' ');

    return (
      <div ref={ref} className={classNames} {...props}>
        <div className={styles.header}>{template.name}</div>

        <div className={styles.lines}>
          {template.lines.map((line) => (
            <div key={line.field} className={styles.line}>
              <span className={styles.lineNumber}>{line.number}.</span>
              <label className={styles.lineLabel} htmlFor={`nineline-${line.field}`}>
                {line.label}
              </label>
              <div className={styles.lineInput}>
                {line.type === 'select' && line.options ? (
                  <select
                    id={`nineline-${line.field}`}
                    className={styles.select}
                    value={current[line.field] ?? ''}
                    onChange={(e) => handleChange(line.field, e.target.value)}
                    disabled={readOnly}
                    aria-label={line.label}
                  >
                    <option value="">--</option>
                    {line.options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id={`nineline-${line.field}`}
                    className={styles.input}
                    type="text"
                    value={current[line.field] ?? ''}
                    onChange={(e) => handleChange(line.field, e.target.value)}
                    readOnly={readOnly}
                    placeholder={line.type === 'coordinate' ? 'DD.DDDDDD' : ''}
                    aria-label={line.label}
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        {children}

        {!readOnly && onSubmit && (
          <button
            className={styles.submitButton}
            onClick={handleSubmit}
            type="button"
            aria-label={`Submit ${template.name}`}
          >
            Submit
          </button>
        )}
      </div>
    );
  }
);

NineLineForm.displayName = 'NineLineForm';
