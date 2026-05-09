import { type HTMLAttributes, forwardRef } from 'react';
import styles from './MapOverlay.module.css';

/* ---------- ScaleBar ---------- */

export interface ScaleBarProps extends HTMLAttributes<HTMLDivElement> {
  /** Distance in meters */
  distance: number;
  /** Display unit system */
  unit?: 'metric' | 'imperial';
}

function formatDistance(meters: number, unit: 'metric' | 'imperial'): string {
  if (unit === 'imperial') {
    const feet = meters * 3.28084;
    if (feet >= 5280) {
      return `${(feet / 5280).toFixed(1)} mi`;
    }
    return `${Math.round(feet)} ft`;
  }
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${Math.round(meters)} m`;
}

export const ScaleBar = forwardRef<HTMLDivElement, ScaleBarProps>(
  ({ distance, unit = 'metric', className, style, ...props }, ref) => {
    const classNames = [styles.scaleBar, className].filter(Boolean).join(' ');
    const barWidth = Math.max(40, Math.min(200, distance / 10));

    return (
      <div ref={ref} className={classNames} style={style} {...props}>
        <div
          className={styles.scaleBarTrack}
          style={{ width: `${barWidth}px` }}
        />
        <span className={styles.scaleBarLabel}>
          {formatDistance(distance, unit)}
        </span>
      </div>
    );
  },
);

ScaleBar.displayName = 'ScaleBar';

/* ---------- CompassHeading ---------- */

export interface CompassHeadingProps extends HTMLAttributes<HTMLDivElement> {
  /** Heading in degrees 0-360 */
  heading: number;
  /** Widget size in pixels (default 54 from ATAK compass token) */
  size?: number;
}

const CARDINALS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] as const;

function headingToCardinal(heading: number): string {
  const normalized = ((heading % 360) + 360) % 360;
  const index = Math.round(normalized / 45) % 8;
  return CARDINALS[index];
}

export const CompassHeading = forwardRef<HTMLDivElement, CompassHeadingProps>(
  ({ heading, size = 54, className, style, ...props }, ref) => {
    const classNames = [styles.compassHeading, className]
      .filter(Boolean)
      .join(' ');
    const normalized = Math.round(((heading % 360) + 360) % 360);

    return (
      <div
        ref={ref}
        className={classNames}
        style={{ width: size, minHeight: size, ...style }}
        {...props}
      >
        <span className={styles.compassDegrees}>{normalized}&deg;</span>
        <span className={styles.compassCardinal}>
          {headingToCardinal(heading)}
        </span>
      </div>
    );
  },
);

CompassHeading.displayName = 'CompassHeading';

/* ---------- ElevationProfile ---------- */

export interface ElevationPoint {
  /** Cumulative distance along path */
  distance: number;
  /** Elevation value */
  elevation: number;
}

export interface ElevationProfileProps extends HTMLAttributes<HTMLDivElement> {
  /** Array of distance/elevation data points */
  points: ElevationPoint[];
  /** SVG width in pixels */
  width?: number;
  /** SVG height in pixels */
  height?: number;
}

export const ElevationProfile = forwardRef<HTMLDivElement, ElevationProfileProps>(
  ({ points, width = 200, height = 80, className, ...props }, ref) => {
    const classNames = [styles.elevationProfile, className]
      .filter(Boolean)
      .join(' ');

    const padding = 4;
    const chartW = width - padding * 2;
    const chartH = height - padding * 2;

    let linePath = '';
    let fillPath = '';

    if (points.length >= 2) {
      const dists = points.map((p) => p.distance);
      const elevs = points.map((p) => p.elevation);
      const minD = Math.min(...dists);
      const maxD = Math.max(...dists);
      const minE = Math.min(...elevs);
      const maxE = Math.max(...elevs);
      const rangeD = maxD - minD || 1;
      const rangeE = maxE - minE || 1;

      const coords = points.map((p) => {
        const x = padding + ((p.distance - minD) / rangeD) * chartW;
        const y = padding + chartH - ((p.elevation - minE) / rangeE) * chartH;
        return { x, y };
      });

      linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x},${c.y}`).join(' ');
      fillPath = `${linePath} L${coords[coords.length - 1].x},${padding + chartH} L${coords[0].x},${padding + chartH} Z`;
    }

    return (
      <div ref={ref} className={classNames} {...props}>
        <svg
          className={styles.elevationSvg}
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="Elevation profile"
        >
          {/* Axes */}
          <line
            className={styles.elevationAxis}
            x1={padding}
            y1={padding}
            x2={padding}
            y2={padding + chartH}
          />
          <line
            className={styles.elevationAxis}
            x1={padding}
            y1={padding + chartH}
            x2={padding + chartW}
            y2={padding + chartH}
          />
          {points.length >= 2 && (
            <>
              <path className={styles.elevationFill} d={fillPath} />
              <path className={styles.elevationLine} d={linePath} />
            </>
          )}
        </svg>
      </div>
    );
  },
);

ElevationProfile.displayName = 'ElevationProfile';
