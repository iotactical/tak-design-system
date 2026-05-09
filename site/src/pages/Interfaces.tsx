// rtmx:req REQ-XW-090
// rtmx:req REQ-XW-113
import { useEffect, useState } from 'react';
import styles from './Interfaces.module.css';
import externalInterfaces from '../../../data/tak-interfaces-external.json';
import internalInterfaces from '../../../data/tak-interfaces-internal.json';
import intentCatalog from '../../../data/atak-intents.json';

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

interface IntentEntry {
  type: string;
  class: string;
  action: string;
  description: string;
}

interface IntentGroup {
  namespace: string;
  intents: IntentEntry[];
}

type TabId = 'external' | 'internal' | 'intents';

const TABS: { id: TabId; label: string }[] = [
  { id: 'external', label: 'External' },
  { id: 'internal', label: 'Internal' },
  { id: 'intents', label: `Intents (${intentCatalog.totalCount})` },
];

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

function filterIntentGroups(groups: IntentGroup[], query: string): IntentGroup[] {
  if (!query) return groups;
  return groups
    .map((g) => ({
      namespace: g.namespace,
      intents: g.intents.filter(
        (i) =>
          matchesQuery(i.action, query) ||
          matchesQuery(i.type, query) ||
          matchesQuery(i.class, query) ||
          matchesQuery(i.description, query) ||
          matchesQuery(g.namespace, query)
      ),
    }))
    .filter((g) => g.intents.length > 0);
}

export default function Interfaces() {
  useEffect(() => { document.title = 'Interfaces - TAK Design System'; }, []);
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabId>('external');

  const allExternal = externalInterfaces as ExternalInterface[];
  const allInternal = internalInterfaces as InternalInterface[];
  const intentGroups = intentCatalog.groups as IntentGroup[];

  const filteredExternal = filterExternal(allExternal, query);
  const filteredInternal = filterInternal(allInternal, query);
  const filteredIntentGroups = filterIntentGroups(intentGroups, query);
  const filteredIntentCount = filteredIntentGroups.reduce((sum, g) => sum + g.intents.length, 0);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Interfaces</h1>
      <p className={styles.subtitle}>
        External and internal interfaces in the TAK ecosystem.
      </p>

      <div className={styles.tabBar}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <input
        className={styles.searchBar}
        type="text"
        placeholder="Filter interfaces..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {activeTab === 'external' && (
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
      )}

      {activeTab === 'internal' && (
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
      )}

      {activeTab === 'intents' && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>ATAK Intent Catalog</h2>
          <p className={styles.intentDescription}>
            {filteredIntentCount} intents across {filteredIntentGroups.length} namespaces,
            parsed from the ATAK SDK broadcast registry.
          </p>
          {filteredIntentGroups.length === 0 ? (
            <div className={styles.empty}>No intents match your filter.</div>
          ) : (
            filteredIntentGroups.map((group) => (
              <div key={group.namespace} className={styles.intentGroup}>
                <h3 className={styles.intentGroupTitle}>{group.namespace}</h3>
                <div className={styles.grid}>
                  {group.intents.map((intent, idx) => (
                    <div key={`${intent.action}-${idx}`} className={styles.card}>
                      <div className={styles.cardName}>{intent.action}</div>
                      <div className={styles.cardMeta}>
                        <span className={
                          intent.type === 'systembroadcast'
                            ? styles.badgeDirection
                            : styles.badge
                        }>
                          {intent.type}
                        </span>
                      </div>
                      <p className={styles.intentClass}>{intent.class}</p>
                      {intent.description && (
                        <p className={styles.cardDescription}>{intent.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </section>
      )}
    </div>
  );
}
