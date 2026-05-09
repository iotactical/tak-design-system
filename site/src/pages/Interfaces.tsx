import { useEffect, useState } from 'react';
import styles from './Interfaces.module.css';
import externalInterfaces from '../../../data/tak-interfaces-external.json';
import internalInterfaces from '../../../data/tak-interfaces-internal.json';

interface ExternalInterface {
  name: string;
  protocol: string;
  format: string;
  direction: string;
  port: string | null;
  description: string;
}

interface InternalInterface {
  name: string;
  type: string;
  mechanism: string;
  description: string;
}

function matchesQuery(text: string, query: string): boolean {
  return text.toLowerCase().includes(query.toLowerCase());
}

function filterExternal(items: ExternalInterface[], query: string): ExternalInterface[] {
  if (!query) return items;
  return items.filter(
    (i) =>
      matchesQuery(i.name, query) ||
      matchesQuery(i.protocol, query) ||
      matchesQuery(i.format, query) ||
      matchesQuery(i.direction, query) ||
      matchesQuery(i.description, query) ||
      (i.port && matchesQuery(i.port, query))
  );
}

function filterInternal(items: InternalInterface[], query: string): InternalInterface[] {
  if (!query) return items;
  return items.filter(
    (i) =>
      matchesQuery(i.name, query) ||
      matchesQuery(i.type, query) ||
      matchesQuery(i.mechanism, query) ||
      matchesQuery(i.description, query)
  );
}

export default function Interfaces() {
  useEffect(() => { document.title = 'Interfaces - TAK Design System'; }, []);
  const [query, setQuery] = useState('');

  const filteredExternal = filterExternal(externalInterfaces as ExternalInterface[], query);
  const filteredInternal = filterInternal(internalInterfaces as InternalInterface[], query);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Interfaces</h1>
      <p className={styles.subtitle}>
        External and internal interfaces in the TAK ecosystem.
      </p>

      <input
        className={styles.searchBar}
        type="text"
        placeholder="Filter interfaces..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>External Interfaces</h2>
        {filteredExternal.length === 0 ? (
          <div className={styles.empty}>No external interfaces match your filter.</div>
        ) : (
          <div className={styles.grid}>
            {filteredExternal.map((iface) => (
              <div key={iface.name} className={styles.card}>
                <div className={styles.cardName}>{iface.name}</div>
                <div className={styles.cardMeta}>
                  <span className={styles.badge}>{iface.protocol}</span>
                  <span className={styles.badge}>{iface.format}</span>
                  <span className={styles.badgeDirection}>{iface.direction}</span>
                  {iface.port && <span className={styles.badgePort}>:{iface.port}</span>}
                </div>
                <p className={styles.cardDescription}>{iface.description}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Internal Interfaces</h2>
        {filteredInternal.length === 0 ? (
          <div className={styles.empty}>No internal interfaces match your filter.</div>
        ) : (
          <div className={styles.grid}>
            {filteredInternal.map((iface) => (
              <div key={iface.name} className={styles.card}>
                <div className={styles.cardName}>{iface.name}</div>
                <div className={styles.cardMeta}>
                  <span className={styles.badge}>{iface.mechanism}</span>
                  <span className={styles.badge}>{iface.type}</span>
                </div>
                <p className={styles.cardDescription}>{iface.description}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
