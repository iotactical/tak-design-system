// rtmx:req REQ-XW-090
// rtmx:req REQ-XW-113
// rtmx:req REQ-XW-121
// rtmx:req REQ-XW-140
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useHighlight } from '../hooks/useHighlight';
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
  const { tab } = useParams();
  const navigate = useNavigate();

  useEffect(() => { document.title = 'Interfaces - TAK Design System'; }, []);
  useHighlight();
  const [query, setQuery] = useState('');
  const activeTab: TabId = (tab && ['external', 'internal', 'intents'].includes(tab) ? tab : 'external') as TabId;

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
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`${styles.tab} ${activeTab === t.id ? styles.tabActive : ''}`}
            onClick={() => navigate(`/interfaces/${t.id}`)}
          >
            {t.label}
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
                <div key={iface.name} className={styles.card} data-highlight={iface.name}>
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
                <div key={iface.name} className={styles.card} data-highlight={iface.name}>
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
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: '45%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '43%' }} />
              </colgroup>
              <thead>
                <tr style={{ borderBottom: '1px solid #444', color: '#878787', textAlign: 'left', position: 'sticky', top: 0, background: '#1A1A1A', zIndex: 1 }}>
                  <th style={{ padding: '8px', fontWeight: 500 }}>Action</th>
                  <th style={{ padding: '8px', fontWeight: 500 }}>Type</th>
                  <th style={{ padding: '8px', fontWeight: 500 }}>Class</th>
                </tr>
              </thead>
              <tbody>
                {filteredIntentGroups.map((group) => (
                  <>
                    <tr key={`ns-${group.namespace}`}>
                      <td colSpan={3} style={{ padding: '12px 8px 4px', color: '#FFE35E', fontWeight: 600, fontSize: 14, fontFamily: 'monospace', borderTop: '1px solid #333' }}>
                        {group.namespace}
                      </td>
                    </tr>
                    {group.intents.map((intent, idx) => (
                      <tr key={`${group.namespace}-${idx}`} data-highlight={intent.action} style={{ borderBottom: '1px solid #1E1E1E' }}>
                        <td style={{ padding: '4px 8px', color: '#DAD4BC', fontFamily: 'monospace', fontSize: 12, wordBreak: 'break-all' }}>{intent.action}</td>
                        <td style={{ padding: '4px 8px' }}>
                          <span className={intent.type === 'systembroadcast' ? styles.badgeDirection : styles.badge}>
                            {intent.type === 'localbroadcast' ? 'local' : 'system'}
                          </span>
                        </td>
                        <td style={{ padding: '4px 8px', color: '#585858', fontFamily: 'monospace', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis' }}>{intent.class}</td>
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}
    </div>
  );
}
