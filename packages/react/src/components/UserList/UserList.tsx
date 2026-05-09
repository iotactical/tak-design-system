import { type HTMLAttributes, forwardRef, type ReactNode } from 'react';
import styles from './UserList.module.css';

export interface UserEntry {
  uid: string;
  callsign: string;
  team?: string;
  role?: string;
  status: 'online' | 'stale' | 'offline';
  lastUpdate?: Date;
}

export interface UserListProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  users: UserEntry[];
  onUserClick?: (user: UserEntry) => void;
  selectedKeys?: string[];
  onSelectionChange?: (keys: string[]) => void;
  filter?: 'all' | 'online' | 'stale';
  children?: ReactNode;
}

/**
 * Map team names to CSS custom-property token names.
 * Covers the 15-color ATAK team palette.
 */
const TEAM_TOKEN: Record<string, string> = {
  white: 'var(--tak-team-white, #ffffff)',
  yellow: 'var(--tak-team-yellow, #ffeb3b)',
  orange: 'var(--tak-team-orange, #ff9800)',
  magenta: 'var(--tak-team-magenta, #e040fb)',
  red: 'var(--tak-team-red, #f44336)',
  maroon: 'var(--tak-team-maroon, #b71c1c)',
  purple: 'var(--tak-team-purple, #9c27b0)',
  'dark blue': 'var(--tak-team-dark-blue, #1a237e)',
  blue: 'var(--tak-team-blue, #2196f3)',
  cyan: 'var(--tak-team-cyan, #00bcd4)',
  teal: 'var(--tak-team-teal, #009688)',
  green: 'var(--tak-team-green, #4caf50)',
  'dark green': 'var(--tak-team-dark-green, #1b5e20)',
  brown: 'var(--tak-team-brown, #795548)',
  pink: 'var(--tak-team-pink, #e91e63)',
};

function teamColor(team: string | undefined): string | undefined {
  if (!team) return undefined;
  return TEAM_TOKEN[team.toLowerCase()] ?? undefined;
}

export const UserList = forwardRef<HTMLDivElement, UserListProps>(
  ({ users, onUserClick, selectedKeys = [], onSelectionChange, filter = 'all', children, className, ...props }, ref) => {
    const classNames = [styles.userList, className].filter(Boolean).join(' ');

    const filtered = filter === 'all'
      ? users
      : users.filter(u => u.status === filter);

    const handleClick = (user: UserEntry) => {
      onUserClick?.(user);

      if (onSelectionChange) {
        const isSelected = selectedKeys.includes(user.uid);
        const next = isSelected
          ? selectedKeys.filter(k => k !== user.uid)
          : [...selectedKeys, user.uid];
        onSelectionChange(next);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, user: UserEntry) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleClick(user);
      }
    };

    return (
      <div ref={ref} className={classNames} role="listbox" {...props}>
        {filtered.map((user, index) => {
          const isSelected = selectedKeys.includes(user.uid);
          const itemClasses = [
            styles.item,
            styles[user.status],
            isSelected ? styles.selected : '',
          ].filter(Boolean).join(' ');

          const dotStyle = teamColor(user.team)
            ? { backgroundColor: teamColor(user.team) }
            : undefined;

          return (
            <div key={user.uid}>
              <div
                className={itemClasses}
                role="option"
                aria-selected={isSelected}
                tabIndex={0}
                onClick={() => handleClick(user)}
                onKeyDown={(e) => handleKeyDown(e, user)}
              >
                <span className={styles.statusDot} aria-hidden="true" />
                {dotStyle && (
                  <span className={styles.teamDot} style={dotStyle} aria-hidden="true" />
                )}
                <div className={styles.content}>
                  <span className={styles.callsign}>{user.callsign}</span>
                  {user.role && <span className={styles.role}>{user.role}</span>}
                </div>
              </div>
              {index < filtered.length - 1 && <div className={styles.divider} />}
            </div>
          );
        })}
        {children}
      </div>
    );
  }
);

UserList.displayName = 'UserList';
