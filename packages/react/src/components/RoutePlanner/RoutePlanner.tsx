import { type HTMLAttributes, forwardRef, type ReactNode } from 'react';
import styles from './RoutePlanner.module.css';

export interface Waypoint {
  name: string;
  coordinate: { lat: number; lon: number; alt?: number };
  type?: 'waypoint' | 'checkpoint' | 'target';
}

export interface RoutePlannerProps extends HTMLAttributes<HTMLDivElement> {
  waypoints: Waypoint[];
  onWaypointAdd?: (waypoint: Waypoint) => void;
  onWaypointRemove?: (index: number) => void;
  onWaypointReorder?: (fromIndex: number, toIndex: number) => void;
  totalDistance?: number;
  estimatedTime?: number;
  children?: ReactNode;
}

function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${Math.round(meters)} m`;
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) {
    return `${h}h ${m}m`;
  }
  return `${m}m`;
}

function legDistance(a: Waypoint, b: Waypoint): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.coordinate.lat - a.coordinate.lat);
  const dLon = toRad(b.coordinate.lon - a.coordinate.lon);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);
  const aVal =
    sinDLat * sinDLat +
    Math.cos(toRad(a.coordinate.lat)) *
      Math.cos(toRad(b.coordinate.lat)) *
      sinDLon * sinDLon;
  const c = 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));
  return R * c;
}

const waypointTypeLabel: Record<string, string> = {
  waypoint: 'WP',
  checkpoint: 'CP',
  target: 'TGT',
};

export const RoutePlanner = forwardRef<HTMLDivElement, RoutePlannerProps>(
  (
    {
      waypoints,
      onWaypointAdd,
      onWaypointRemove,
      onWaypointReorder,
      totalDistance,
      estimatedTime,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const classNames = [styles.routePlanner, className].filter(Boolean).join(' ');

    const handleMoveUp = (index: number) => {
      if (index > 0 && onWaypointReorder) {
        onWaypointReorder(index, index - 1);
      }
    };

    const handleMoveDown = (index: number) => {
      if (index < waypoints.length - 1 && onWaypointReorder) {
        onWaypointReorder(index, index + 1);
      }
    };

    return (
      <div ref={ref} className={classNames} {...props}>
        {/* Scrollable waypoint list */}
        <div className={styles.waypointList} role="list" aria-label="Waypoints">
          {waypoints.map((wp, index) => (
            <div key={`${wp.name}-${index}`}>
              <div className={styles.waypointItem} role="listitem">
                <span className={styles.waypointIndex}>{index + 1}</span>
                <span className={styles.waypointType}>
                  {waypointTypeLabel[wp.type ?? 'waypoint']}
                </span>
                <div className={styles.waypointInfo}>
                  <span className={styles.waypointName}>{wp.name}</span>
                  <span className={styles.waypointCoord}>
                    {wp.coordinate.lat.toFixed(6)}, {wp.coordinate.lon.toFixed(6)}
                    {wp.coordinate.alt !== undefined && ` ${Math.round(wp.coordinate.alt)}m`}
                  </span>
                </div>
                <div className={styles.waypointActions}>
                  {onWaypointReorder && (
                    <>
                      <button
                        className={styles.actionButton}
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        aria-label={`Move ${wp.name} up`}
                      >
                        ^
                      </button>
                      <button
                        className={styles.actionButton}
                        onClick={() => handleMoveDown(index)}
                        disabled={index === waypoints.length - 1}
                        aria-label={`Move ${wp.name} down`}
                      >
                        v
                      </button>
                    </>
                  )}
                  {onWaypointRemove && (
                    <button
                      className={styles.actionButton}
                      onClick={() => onWaypointRemove(index)}
                      aria-label={`Remove ${wp.name}`}
                    >
                      x
                    </button>
                  )}
                </div>
              </div>
              {/* Leg distance between waypoints */}
              {index < waypoints.length - 1 && (
                <div className={styles.legDistance}>
                  <span className={styles.legLine} />
                  <span className={styles.legLabel}>
                    {formatDistance(legDistance(wp, waypoints[index + 1]))}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Optional children slot */}
        {children}

        {/* Total summary bar */}
        <div className={styles.summaryBar}>
          <span className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Total</span>
            <span className={styles.summaryValue}>
              {totalDistance !== undefined
                ? formatDistance(totalDistance)
                : '--'}
            </span>
          </span>
          <span className={styles.summaryItem}>
            <span className={styles.summaryLabel}>ETA</span>
            <span className={styles.summaryValue}>
              {estimatedTime !== undefined
                ? formatTime(estimatedTime)
                : '--'}
            </span>
          </span>
          <span className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Waypoints</span>
            <span className={styles.summaryValue}>{waypoints.length}</span>
          </span>
        </div>
      </div>
    );
  }
);

RoutePlanner.displayName = 'RoutePlanner';
