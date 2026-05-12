import { type HTMLAttributes, type ReactNode, forwardRef } from 'react';
import styles from './RangeBearing.module.css';

export type DistanceUnit = 'meters' | 'kilometers' | 'miles' | 'nautical-miles';

export interface RangeBearingProps extends HTMLAttributes<HTMLDivElement> {
  distance: number;
  bearing: number;
  unit?: DistanceUnit;
  from?: { lat: number; lon: number };
  to?: { lat: number; lon: number };
  children?: ReactNode;
}

const UNIT_LABELS: Record<DistanceUnit, string> = {
  meters: 'm',
  kilometers: 'km',
  miles: 'mi',
  'nautical-miles': 'NM',
};

function convertDistance(meters: number, unit: DistanceUnit): number {
  switch (unit) {
    case 'kilometers':
      return meters / 1000;
    case 'miles':
      return meters / 1609.344;
    case 'nautical-miles':
      return meters / 1852;
    case 'meters':
    default:
      return meters;
  }
}

function formatDistance(meters: number, unit: DistanceUnit): string {
  const converted = convertDistance(meters, unit);
  const label = UNIT_LABELS[unit];
  if (converted >= 100) {
    return `${converted.toFixed(0)} ${label}`;
  }
  if (converted >= 10) {
    return `${converted.toFixed(1)} ${label}`;
  }
  return `${converted.toFixed(2)} ${label}`;
}

function formatBearing(degrees: number): string {
  const normalized = ((degrees % 360) + 360) % 360;
  return `${normalized.toFixed(1)}\u00B0`;
}

function formatCoord(lat: number, lon: number): string {
  return `${lat.toFixed(6)}\u00B0, ${lon.toFixed(6)}\u00B0`;
}

/**
 * Range and bearing display showing distance and azimuth between two points, with configurable distance units.
 *
 * @example
 * ```tsx
 * <RangeBearing
 *   distance={4500}
 *   bearing={45.2}
 *   unit="meters"
 *   from={{ lat: 34.05, lon: -118.24 }}
 *   to={{ lat: 34.08, lon: -118.20 }}
 * />
 * ```
 */
export const RangeBearing = forwardRef<HTMLDivElement, RangeBearingProps>(
  (
    {
      distance,
      bearing,
      unit = 'meters',
      from,
      to,
      children,
      className,
      ...props
    },
    ref,
  ) => {
    const classNames = [styles.rangeBearing, className]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={ref} className={classNames} {...props}>
        <div className={styles.values}>
          <span className={styles.distance}>
            {formatDistance(distance, unit)}
          </span>
          <span className={styles.separator}>{' | '}</span>
          <span className={styles.bearing}>
            {formatBearing(bearing)}
          </span>
        </div>
        {from && (
          <div className={styles.coord}>
            <span className={styles.label}>FROM</span>
            <span className={styles.coordValue}>{formatCoord(from.lat, from.lon)}</span>
          </div>
        )}
        {to && (
          <div className={styles.coord}>
            <span className={styles.label}>TO</span>
            <span className={styles.coordValue}>{formatCoord(to.lat, to.lon)}</span>
          </div>
        )}
        {children}
      </div>
    );
  },
);

RangeBearing.displayName = 'RangeBearing';
