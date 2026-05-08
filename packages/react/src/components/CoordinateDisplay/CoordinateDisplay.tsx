import { type HTMLAttributes, forwardRef, useCallback, useState } from 'react';
import styles from './CoordinateDisplay.module.css';

export type CoordinateFormat = 'MGRS' | 'DD' | 'DMS' | 'UTM';

const FORMAT_CYCLE: CoordinateFormat[] = ['MGRS', 'DD', 'DMS', 'UTM'];

export interface CoordinateDisplayProps extends HTMLAttributes<HTMLDivElement> {
  latitude: number;
  longitude: number;
  altitude?: number;
  format?: CoordinateFormat;
  onFormatChange?: (format: CoordinateFormat) => void;
}

function toDD(lat: number, lon: number): string {
  return `${lat.toFixed(6)}\u00B0 ${lon.toFixed(6)}\u00B0`;
}

function toDMS(decimal: number, isLat: boolean): string {
  const abs = Math.abs(decimal);
  const d = Math.floor(abs);
  const mFloat = (abs - d) * 60;
  const m = Math.floor(mFloat);
  const s = ((mFloat - m) * 60).toFixed(1);
  const dir = isLat
    ? (decimal >= 0 ? 'N' : 'S')
    : (decimal >= 0 ? 'E' : 'W');
  return `${d}\u00B0${String(m).padStart(2, '0')}'${String(s).padStart(4, '0')}"${dir}`;
}

function toUTM(lat: number, lon: number): string {
  const zoneNumber = Math.floor((lon + 180) / 6) + 1;
  const letter = lat >= 0 ? 'N' : 'S';
  return `${zoneNumber}${letter} ${Math.abs(lon).toFixed(0)}mE ${Math.abs(lat).toFixed(0)}mN`;
}

function toMGRS(lat: number, lon: number): string {
  const zoneNumber = Math.floor((lon + 180) / 6) + 1;
  const latBands = 'CDEFGHJKLMNPQRSTUVWX';
  const bandIndex = Math.min(
    Math.max(Math.floor((lat + 80) / 8), 0),
    latBands.length - 1,
  );
  const band = latBands[bandIndex];
  const easting = Math.round(((lon + 180) % 6) / 6 * 100000);
  const northing = Math.round(((lat % 8) + (lat < 0 ? 8 : 0)) / 8 * 100000);
  return `${zoneNumber}${band} ${String(easting).padStart(5, '0')} ${String(northing).padStart(5, '0')}`;
}

function formatCoordinate(lat: number, lon: number, format: CoordinateFormat): string {
  switch (format) {
    case 'DD':
      return toDD(lat, lon);
    case 'DMS':
      return `${toDMS(lat, true)} ${toDMS(lon, false)}`;
    case 'UTM':
      return toUTM(lat, lon);
    case 'MGRS':
    default:
      return toMGRS(lat, lon);
  }
}

export const CoordinateDisplay = forwardRef<HTMLDivElement, CoordinateDisplayProps>(
  (
    {
      latitude,
      longitude,
      altitude,
      format: controlledFormat,
      onFormatChange,
      className,
      onClick,
      ...props
    },
    ref,
  ) => {
    const [internalFormat, setInternalFormat] = useState<CoordinateFormat>('MGRS');
    const format = controlledFormat ?? internalFormat;

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        const currentIndex = FORMAT_CYCLE.indexOf(format);
        const nextFormat = FORMAT_CYCLE[(currentIndex + 1) % FORMAT_CYCLE.length];
        setInternalFormat(nextFormat);
        onFormatChange?.(nextFormat);
        onClick?.(e);
      },
      [format, onFormatChange, onClick],
    );

    const classNames = [styles.coordinateDisplay, className]
      .filter(Boolean)
      .join(' ');

    const coordText = formatCoordinate(latitude, longitude, format);

    return (
      <div
        ref={ref}
        className={classNames}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        {...props}
      >
        <span className={styles.format}>{format}</span>
        <span className={styles.coords}>{coordText}</span>
        {altitude != null && (
          <span className={styles.altitude}>{altitude.toFixed(0)}m</span>
        )}
      </div>
    );
  },
);

CoordinateDisplay.displayName = 'CoordinateDisplay';
