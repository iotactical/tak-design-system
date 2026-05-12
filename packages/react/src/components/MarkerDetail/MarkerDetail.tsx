import { type HTMLAttributes, forwardRef, type ReactNode } from 'react';
import styles from './MarkerDetail.module.css';

export type MarkerAffiliation = 'friendly' | 'hostile' | 'neutral' | 'unknown' | 'suspect' | 'pending';

export interface MarkerAction {
  key: string;
  icon?: ReactNode;
  label: string;
  onClick: () => void;
}

export interface MarkerDetailProps extends HTMLAttributes<HTMLDivElement> {
  callsign: string;
  type?: string;
  affiliation?: MarkerAffiliation;
  coordinate?: { lat: number; lon: number; alt?: number };
  lastUpdate?: Date;
  stale?: boolean;
  actions?: MarkerAction[];
  icon?: ReactNode;
  children?: ReactNode;
}

const AFFILIATION_COLORS: Record<MarkerAffiliation, string> = {
  friendly: '#2196F3',
  hostile: '#F44336',
  neutral: '#4CAF50',
  unknown: '#FFEB3B',
  suspect: '#FF9800',
  pending: '#9E9E9E',
};

function formatCoord(value: number, decimals: number): string {
  return value.toFixed(decimals);
}

function formatTimestamp(date: Date): string {
  const hh = String(date.getUTCHours()).padStart(2, '0');
  const mm = String(date.getUTCMinutes()).padStart(2, '0');
  const ss = String(date.getUTCSeconds()).padStart(2, '0');
  return `${hh}:${mm}:${ss}Z`;
}

/**
 * Map marker detail view displaying callsign, affiliation, coordinates, staleness, and action buttons.
 *
 * @example
 * ```tsx
 * <MarkerDetail
 *   callsign="BRAVO-6"
 *   affiliation="friendly"
 *   coordinate={{ lat: 34.0522, lon: -118.2437 }}
 *   actions={[{ key: 'pan', label: 'Pan To', onClick: handlePan }]}
 * />
 * ```
 */
export const MarkerDetail = forwardRef<HTMLDivElement, MarkerDetailProps>(
  (
    {
      callsign,
      type,
      affiliation,
      coordinate,
      lastUpdate,
      stale = false,
      actions,
      icon,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const borderColor = affiliation ? AFFILIATION_COLORS[affiliation] : undefined;

    const classNames = [styles.markerDetail, stale ? styles.stale : '', className]
      .filter(Boolean)
      .join(' ');

    return (
      <div
        ref={ref}
        className={classNames}
        style={borderColor ? { borderLeftColor: borderColor } : undefined}
        data-affiliation={affiliation}
        data-stale={stale || undefined}
        {...props}
      >
        <div className={styles.header}>
          {icon && <span className={styles.icon}>{icon}</span>}
          <span className={stale ? styles.callsignStale : styles.callsign}>
            {callsign}
          </span>
          {type && <span className={styles.cotType}>{type}</span>}
          {stale && <span className={styles.staleIndicator}>STALE</span>}
        </div>

        {coordinate && (
          <div className={styles.coordinates}>
            <span className={styles.coordValue}>
              {formatCoord(coordinate.lat, 6)}, {formatCoord(coordinate.lon, 6)}
            </span>
            {coordinate.alt != null && (
              <span className={styles.altitude}>{coordinate.alt.toFixed(0)}m</span>
            )}
          </div>
        )}

        {lastUpdate && (
          <div className={styles.lastUpdate}>
            Last update: {formatTimestamp(lastUpdate)}
          </div>
        )}

        {children && <div className={styles.body}>{children}</div>}

        {actions && actions.length > 0 && (
          <div className={styles.actionBar}>
            {actions.map((action) => (
              <button
                key={action.key}
                className={styles.actionButton}
                onClick={action.onClick}
                title={action.label}
              >
                {action.icon && <span className={styles.actionIcon}>{action.icon}</span>}
                <span className={styles.actionLabel}>{action.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  },
);

MarkerDetail.displayName = 'MarkerDetail';
