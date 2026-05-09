import { type HTMLAttributes, forwardRef } from 'react';
import styles from './SkittleMarker.module.css';

/** The 15 ATAK team colors */
export type TeamColor =
  | 'white' | 'yellow' | 'orange' | 'magenta' | 'red'
  | 'maroon' | 'purple' | 'dark-blue' | 'blue' | 'cyan'
  | 'teal' | 'green' | 'dark-green' | 'brown' | 'pink';

export type SkittleState = 'connected' | 'stale' | 'expired';

export type SkittleRole =
  | 'team-member' | 'team-lead' | 'hq' | 'sniper'
  | 'medic' | 'forward-observer' | 'rto' | 'k9';

export type SkittleVariant = 'arrow' | 'dot';

export type SkittleAffiliation = 'friendly' | 'hostile' | 'neutral' | 'unknown';

export interface SkittleMarkerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'role'> {
  /** One of 15 ATAK team colors (default 'cyan') */
  teamColor?: TeamColor;
  /** Heading in degrees 0-360 for arrow rotation */
  heading?: number;
  /** Connectivity state (default 'connected') */
  state?: SkittleState;
  /** Team role indicator */
  role?: SkittleRole;
  /** Arrow (directional) or dot (simplified circle) */
  variant?: SkittleVariant;
  /** Affiliation for dot variant colors */
  affiliation?: SkittleAffiliation;
  /** Pixel size (default 32) */
  size?: number;
}

const TEAM_COLOR_HEX: Record<TeamColor, string> = {
  white: '#FFFFFF',
  yellow: '#FFFF00',
  orange: '#FF8C00',
  magenta: '#FF00FF',
  red: '#FF0000',
  maroon: '#800000',
  purple: '#800080',
  'dark-blue': '#00008B',
  blue: '#0000FF',
  cyan: '#00FFFF',
  teal: '#008080',
  green: '#00FF00',
  'dark-green': '#006400',
  brown: '#8B4513',
  pink: '#FFC0CB',
};

const AFFILIATION_COLOR: Record<SkittleAffiliation, string> = {
  friendly: '#00FFFF',
  hostile: '#FF0000',
  neutral: '#00FF00',
  unknown: '#FFFF00',
};

const STATE_OPACITY: Record<SkittleState, number> = {
  connected: 1,
  stale: 0.5,
  expired: 0.3,
};

const ROLE_LABELS: Record<SkittleRole, string> = {
  'team-member': 'TM',
  'team-lead': 'TL',
  hq: 'HQ',
  sniper: 'SR',
  medic: 'MD',
  'forward-observer': 'FO',
  rto: 'RT',
  k9: 'K9',
};

export const SkittleMarker = forwardRef<HTMLDivElement, SkittleMarkerProps>(
  (
    {
      teamColor = 'cyan',
      heading = 0,
      state = 'connected',
      role,
      variant = 'arrow',
      affiliation = 'friendly',
      size = 32,
      className,
      style,
      ...props
    },
    ref,
  ) => {
    const fillColor =
      variant === 'dot'
        ? AFFILIATION_COLOR[affiliation]
        : TEAM_COLOR_HEX[teamColor];

    const opacity = STATE_OPACITY[state];

    const classNames = [
      styles.skittleMarker,
      state === 'expired' ? styles.expired : undefined,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const badgeSize = Math.max(10, Math.round(size * 0.4));

    return (
      <div
        ref={ref}
        className={classNames}
        style={{
          width: size,
          height: size + (role ? badgeSize + 2 : 0),
          opacity,
          ...style,
        }}
        data-team-color={teamColor}
        data-state={state}
        data-variant={variant}
        {...props}
      >
        {variant === 'arrow' ? (
          <svg
            className={styles.arrow}
            width={size}
            height={size}
            viewBox="0 0 32 32"
            style={{ transform: `rotate(${heading}deg)` }}
            aria-hidden="true"
          >
            <polygon
              points="16,2 28,28 16,22 4,28"
              fill={fillColor}
              stroke="#000000"
              strokeWidth="1"
            />
          </svg>
        ) : (
          <svg
            className={styles.dot}
            width={size}
            height={size}
            viewBox="0 0 32 32"
            aria-hidden="true"
          >
            <circle
              cx="16"
              cy="16"
              r="12"
              fill={fillColor}
              stroke="#000000"
              strokeWidth="1"
            />
          </svg>
        )}

        {role && (
          <span
            className={styles.roleBadge}
            style={{
              fontSize: Math.max(7, Math.round(size * 0.25)),
              width: badgeSize,
              height: badgeSize,
              lineHeight: `${badgeSize}px`,
            }}
          >
            {ROLE_LABELS[role]}
          </span>
        )}
      </div>
    );
  },
);

SkittleMarker.displayName = 'SkittleMarker';
