import { useState, useEffect } from 'react';

const TAK_VERSIONS = ['ATAK 4.x', 'ATAK 5.0', 'ATAK 5.1', 'ATAK 5.2'];
const STORAGE_KEY = 'tak-version';

export function VersionSelector() {
  const [version, setVersion] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || TAK_VERSIONS[TAK_VERSIONS.length - 1];
    } catch {
      return TAK_VERSIONS[TAK_VERSIONS.length - 1];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, version);
    } catch {
      // localStorage unavailable
    }
  }, [version]);

  return (
    <div style={{ padding: '12px 24px 0' }}>
      <label
        htmlFor="tak-version-select"
        style={{ display: 'block', fontSize: 11, color: '#878787', marginBottom: 4 }}
      >
        TAK Version
      </label>
      <select
        id="tak-version-select"
        value={version}
        onChange={(e) => setVersion(e.target.value)}
        style={{
          width: '100%',
          padding: '6px 8px',
          background: '#242424',
          color: '#DAD4BC',
          border: '1px solid #2E2E2E',
          borderRadius: 4,
          fontSize: 13,
          cursor: 'pointer',
        }}
      >
        {TAK_VERSIONS.map((v) => (
          <option key={v} value={v}>{v}</option>
        ))}
      </select>
    </div>
  );
}

export { TAK_VERSIONS, STORAGE_KEY };
