/**
 * TAK Design System - Typed token constants
 *
 * Generated from W3C design tokens. Each value is a CSS custom property reference.
 * Use with inline styles or CSS-in-JS: style={{ backgroundColor: takTokens.button.primary.background }}
 */
export const takTokens = {
  button: {
    primary: {
      background: 'var(--tak-button-primary-background)',
      text: 'var(--tak-button-primary-text)',
      borderRadius: 'var(--tak-button-primary-border-radius)',
      paddingX: 'var(--tak-button-primary-padding-x)',
      paddingY: 'var(--tak-button-primary-padding-y)',
      fontSize: 'var(--tak-button-primary-font-size)',
      fontWeight: 'var(--tak-button-primary-font-weight)',
    },
    secondary: {
      background: 'var(--tak-button-secondary-background)',
      text: 'var(--tak-button-secondary-text)',
      borderRadius: 'var(--tak-button-secondary-border-radius)',
    },
    danger: {
      background: 'var(--tak-button-danger-background)',
      text: 'var(--tak-button-danger-text)',
      borderRadius: 'var(--tak-button-danger-border-radius)',
    },
  },
  toolbar: {
    height: 'var(--tak-toolbar-height)',
    backgroundDark: 'var(--tak-toolbar-background-dark)',
    backgroundLight: 'var(--tak-toolbar-background-light)',
    iconSize: 'var(--tak-toolbar-icon-size)',
    iconPadding: 'var(--tak-toolbar-icon-padding)',
  },
  surface: {
    backgroundDark: 'var(--tak-surface-background-dark)',
    backgroundLight: 'var(--tak-surface-background-light)',
    primaryDark: 'var(--tak-surface-primary-dark)',
    primaryLight: 'var(--tak-surface-primary-light)',
    elevatedDark: 'var(--tak-surface-elevated-dark)',
    elevatedLight: 'var(--tak-surface-elevated-light)',
    cardDark: 'var(--tak-surface-card-dark)',
    cardLight: 'var(--tak-surface-card-light)',
  },
  text: {
    primaryDark: 'var(--tak-text-primary-dark)',
    primaryLight: 'var(--tak-text-primary-light)',
    secondaryDark: 'var(--tak-text-secondary-dark)',
    secondaryLight: 'var(--tak-text-secondary-light)',
    disabledDark: 'var(--tak-text-disabled-dark)',
    disabledLight: 'var(--tak-text-disabled-light)',
    onAccent: 'var(--tak-text-on-accent)',
    coordinate: 'var(--tak-text-coordinate)',
  },
  accent: {
    primary: 'var(--tak-accent-primary)',
    secondary: 'var(--tak-accent-secondary)',
  },
  affiliation: {
    friendly: 'var(--tak-affiliation-friendly)',
    hostile: 'var(--tak-affiliation-hostile)',
    neutral: 'var(--tak-affiliation-neutral)',
    unknown: 'var(--tak-affiliation-unknown)',
    suspect: 'var(--tak-affiliation-suspect)',
    pending: 'var(--tak-affiliation-pending)',
  },
  team: {
    white: 'var(--tak-team-white)',
    yellow: 'var(--tak-team-yellow)',
    orange: 'var(--tak-team-orange)',
    magenta: 'var(--tak-team-magenta)',
    red: 'var(--tak-team-red)',
    maroon: 'var(--tak-team-maroon)',
    purple: 'var(--tak-team-purple)',
    darkBlue: 'var(--tak-team-dark-blue)',
    blue: 'var(--tak-team-blue)',
    cyan: 'var(--tak-team-cyan)',
    teal: 'var(--tak-team-teal)',
    green: 'var(--tak-team-green)',
    darkGreen: 'var(--tak-team-dark-green)',
    brown: 'var(--tak-team-brown)',
    pink: 'var(--tak-team-pink)',
  },
  brand: {
    primary: 'var(--tak-brand-primary)',
    secondary: 'var(--tak-brand-secondary)',
    text: 'var(--tak-brand-text)',
  },
  status: {
    success: 'var(--tak-status-success)',
    warning: 'var(--tak-status-warning)',
    error: 'var(--tak-status-error)',
    info: 'var(--tak-status-info)',
  },
} as const;
