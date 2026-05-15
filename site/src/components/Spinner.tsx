import styles from './Spinner.module.css';

export function Spinner({ size }: { size?: number }) {
  const sizeStyle = size ? { width: size, height: size } : undefined;
  return (
    <div
      className={`${styles.spinner} ${size ? '' : styles.spinnerDefault}`}
      style={sizeStyle}
    />
  );
}

export function LoadingCenter({ size }: { size?: number }) {
  return (
    <div className={styles.loadingCenter}>
      <Spinner size={size} />
    </div>
  );
}
