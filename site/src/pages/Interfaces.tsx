// rtmx:req REQ-XW-089
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

/** Lightweight syntax highlighter for code snippets */
function highlightCode(code: string): JSX.Element[] {
  const lines = code.split('\n');
  return lines.map((line, i) => {
    const parts: JSX.Element[] = [];
    let remaining = line;
    let key = 0;

    // Process the line token by token
    const push = (text: string, color: string) => {
      parts.push(<span key={key++} style={{ color }}>{text}</span>);
    };

    // Comments
    if (remaining.trimStart().startsWith('//')) {
      const indent = remaining.match(/^(\s*)/)?.[0] || '';
      if (indent) push(indent, '#DAD4BC');
      push(remaining.trimStart(), '#6A9955');
      return <span key={i}>{parts}{i < lines.length - 1 ? '\n' : ''}</span>;
    }

    // Process tokens
    const tokenRe = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\/\/.*$|\b(?:import|export|from|const|let|var|val|fun|new|return|public|private|void|class|interface|object|override|async|await|function|extends|implements|static|final|this|super|true|false|null|undefined|string|number|boolean|int|long|double|float|String|Intent|Context|BroadcastReceiver|AtakBroadcast|TakMessage|DocumentedIntentFilter|Socket|TcpClient|HttpClient|HttpURLConnection|URL)\b|[{}()[\]<>;,.:=]|=>|\S+)/g;

    let match;
    let lastIndex = 0;
    while ((match = tokenRe.exec(remaining)) !== null) {
      if (match.index > lastIndex) {
        push(remaining.slice(lastIndex, match.index), '#DAD4BC');
      }
      const tok = match[0];
      if (tok.startsWith('"') || tok.startsWith("'")) {
        push(tok, '#CE9178');
      } else if (tok.startsWith('//')) {
        push(tok, '#6A9955');
      } else if (/^(?:import|export|from|const|let|var|val|fun|new|return|public|private|void|class|interface|object|override|async|await|function|extends|implements|static|final|this|super|true|false|null|undefined)$/.test(tok)) {
        push(tok, '#569CD6');
      } else if (/^(?:string|number|boolean|int|long|double|float|String|Intent|Context|BroadcastReceiver|AtakBroadcast|TakMessage|DocumentedIntentFilter|Socket|TcpClient|HttpClient|HttpURLConnection|URL)$/.test(tok)) {
        push(tok, '#4EC9B0');
      } else if (/^[{}()[\]<>;,.:=]$/.test(tok) || tok === '=>') {
        push(tok, '#878787');
      } else {
        push(tok, '#DAD4BC');
      }
      lastIndex = match.index + tok.length;
    }
    if (lastIndex < remaining.length) {
      push(remaining.slice(lastIndex), '#DAD4BC');
    }

    return <span key={i}>{parts}{i < lines.length - 1 ? '\n' : ''}</span>;
  });
}

/** Generate code snippets for sending/receiving an Android broadcast intent */
function intentSnippets(intent: IntentEntry, namespace: string) {
  const action = intent.action;
  const isLocal = intent.type === 'localbroadcast';

  const java = isLocal
    ? `// Send (Java - ATAK Plugin)
Intent intent = new Intent("${action}");
AtakBroadcast.getInstance().sendBroadcast(intent);

// Receive
BroadcastReceiver receiver = new BroadcastReceiver() {
    @Override
    public void onReceive(Context context, Intent intent) {
        // handle broadcast
    }
};
AtakBroadcast.getInstance().registerReceiver(receiver,
    new DocumentedIntentFilter("${action}"));`
    : `// Send (Java - ATAK Plugin)
Intent intent = new Intent("${action}");
AtakBroadcast.getInstance().sendSystemBroadcast(intent);

// Receive
BroadcastReceiver receiver = new BroadcastReceiver() {
    @Override
    public void onReceive(Context context, Intent intent) {
        // handle broadcast
    }
};
AtakBroadcast.getInstance().registerSystemReceiver(receiver,
    new DocumentedIntentFilter("${action}"));`;

  const kotlin = isLocal
    ? `// Send (Kotlin - ATAK Plugin)
val intent = Intent("${action}")
AtakBroadcast.getInstance().sendBroadcast(intent)

// Receive
val receiver = object : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        // handle broadcast
    }
}
AtakBroadcast.getInstance().registerReceiver(
    receiver, DocumentedIntentFilter("${action}"))`
    : `// Send (Kotlin - ATAK Plugin)
val intent = Intent("${action}")
AtakBroadcast.getInstance().sendSystemBroadcast(intent)

// Receive
val receiver = object : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        // handle broadcast
    }
}
AtakBroadcast.getInstance().registerSystemReceiver(
    receiver, DocumentedIntentFilter("${action}"))`;

  const typescript = isLocal
    ? `// WebTAK (TypeScript)
import { TakBroadcast } from "@iotactical/tak-core";

// Send
TakBroadcast.send("${action}");

// Receive
TakBroadcast.on("${action}", (payload) => {
    // handle broadcast
});`
    : `// WebTAK (TypeScript)
import { TakBroadcast } from "@iotactical/tak-core";

// Send (system-wide)
TakBroadcast.sendSystem("${action}");

// Receive
TakBroadcast.onSystem("${action}", (payload) => {
    // handle broadcast
});`;

  const csharp = `// WinTAK (.NET)
// WinTAK uses a message bus pattern instead of Android intents
messageBus.Subscribe<TakMessage>(
    msg => msg.Action == "${action}",
    msg => {
        // handle broadcast
    });

// Send
messageBus.Publish(new TakMessage("${action}"));`;

  return { java, kotlin, typescript, csharp };
}

/** Generate code snippets for external interfaces */
function externalSnippets(iface: ExternalInterface) {
  const snippets: Record<string, string> = {};
  const port = iface.port || '8089';

  if (iface.protocol === 'TCP' || iface.protocol === 'UDP') {
    snippets.java = `// Connect to ${iface.name} on port ${port}
Socket socket = new Socket("host", ${port});
// ${iface.format} ${iface.direction}`;
    snippets.typescript = `// Connect to ${iface.name} on port ${port}
import { createConnection } from "net";
const socket = createConnection(${port}, "host");
// ${iface.format} ${iface.direction}`;
    snippets.csharp = `// Connect to ${iface.name} on port ${port}
var client = new TcpClient("host", ${port});
// ${iface.format} ${iface.direction}`;
  } else if (iface.protocol === 'HTTP' || iface.protocol === 'HTTPS') {
    snippets.java = `// ${iface.name} (${iface.format})
URL url = new URL("${iface.protocol.toLowerCase()}://host${iface.port ? ':' + iface.port : ''}/api");
HttpURLConnection conn = (HttpURLConnection) url.openConnection();`;
    snippets.typescript = `// ${iface.name} (${iface.format})
const response = await fetch(
    "${iface.protocol.toLowerCase()}://host${iface.port ? ':' + iface.port : ''}/api"
);`;
    snippets.csharp = `// ${iface.name} (${iface.format})
var client = new HttpClient();
var response = await client.GetAsync(
    "${iface.protocol.toLowerCase()}://host${iface.port ? ':' + iface.port : ''}/api");`;
  }

  return snippets;
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
  const [expandedIntent, setExpandedIntent] = useState<string | null>(null);
  const [expandedIface, setExpandedIface] = useState<string | null>(null);
  const [snippetLang, setSnippetLang] = useState<'java' | 'kotlin' | 'typescript' | 'csharp'>('java');
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
              {filteredExternal.map((iface) => {
                const isExp = expandedIface === iface.name;
                const snips = isExp ? externalSnippets(iface) : null;
                return (
                  <div
                    key={iface.name}
                    className={styles.card}
                    data-highlight={iface.name}
                    data-testid="external-card"
                    onClick={() => setExpandedIface(isExp ? null : iface.name)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className={styles.cardName}>{iface.name}</div>
                    <div className={styles.cardMeta}>
                      <span className={styles.badge}>{iface.protocol}</span>
                      <span className={styles.badge}>{iface.format}</span>
                      <span className={styles.badgeDirection}>{iface.direction}</span>
                      {iface.port && <span className={styles.badgePort}>:{iface.port}</span>}
                    </div>
                    <p className={styles.cardDescription}>{iface.description}</p>
                    {isExp && snips && Object.keys(snips).length > 0 && (
                      <div data-testid="iface-detail" style={{ marginTop: 12, borderTop: '1px solid #2E2E2E', paddingTop: 12 }}>
                        {Object.entries(snips).map(([lang, code]) => (
                          <div key={lang} style={{ marginBottom: 8 }}>
                            <div style={{ fontSize: 10, color: '#878787', marginBottom: 4, fontFamily: "'Roboto Mono', monospace" }}>
                              {lang === 'csharp' ? 'C#' : lang === 'typescript' ? 'TypeScript' : lang.charAt(0).toUpperCase() + lang.slice(1)}
                            </div>
                            <pre style={{
                              background: '#0D0D0D',
                              border: '1px solid #2E2E2E',
                              borderRadius: 6,
                              padding: 10,
                              margin: 0,
                              fontSize: 11,
                              lineHeight: 1.5,
                              color: '#DAD4BC',
                              fontFamily: "'Roboto Mono', monospace",
                              overflowX: 'auto',
                              whiteSpace: 'pre-wrap',
                            }}>
                              {highlightCode(code)}
                            </pre>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
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
                    {group.intents.map((intent, idx) => {
                      const intentKey = `${group.namespace}-${idx}`;
                      const isExpanded = expandedIntent === intentKey;
                      const snippets = isExpanded ? intentSnippets(intent, group.namespace) : null;
                      return (
                        <>
                          <tr
                            key={intentKey}
                            data-highlight={intent.action}
                            data-testid="intent-row"
                            onClick={() => setExpandedIntent(isExpanded ? null : intentKey)}
                            style={{ borderBottom: '1px solid #1E1E1E', cursor: 'pointer' }}
                          >
                            <td style={{ padding: '4px 8px', color: '#DAD4BC', fontFamily: 'monospace', fontSize: 12, wordBreak: 'break-all' }}>
                              {isExpanded ? '\u25BC ' : '\u25B6 '}{intent.action}
                            </td>
                            <td style={{ padding: '4px 8px' }}>
                              <span className={intent.type === 'systembroadcast' ? styles.badgeDirection : styles.badge}>
                                {intent.type === 'localbroadcast' ? 'local' : 'system'}
                              </span>
                            </td>
                            <td style={{ padding: '4px 8px', color: '#585858', fontFamily: 'monospace', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis' }}>{intent.class}</td>
                          </tr>
                          {isExpanded && snippets && (
                            <tr key={`${intentKey}-detail`}>
                              <td colSpan={3} style={{ padding: '0 8px 12px', background: '#141414' }}>
                                <div data-testid="intent-detail" style={{ display: 'flex', gap: 8, marginBottom: 8, marginTop: 8 }}>
                                  {(['java', 'kotlin', 'typescript', 'csharp'] as const).map((lang) => (
                                    <button
                                      key={lang}
                                      onClick={(e) => { e.stopPropagation(); setSnippetLang(lang); }}
                                      style={{
                                        padding: '3px 10px',
                                        fontSize: 11,
                                        fontFamily: "'Roboto Mono', monospace",
                                        background: snippetLang === lang ? '#c8a951' : '#2E2E2E',
                                        color: snippetLang === lang ? '#000' : '#878787',
                                        border: 'none',
                                        borderRadius: 4,
                                        cursor: 'pointer',
                                      }}
                                    >
                                      {lang === 'csharp' ? 'C#' : lang === 'typescript' ? 'TypeScript' : lang.charAt(0).toUpperCase() + lang.slice(1)}
                                    </button>
                                  ))}
                                </div>
                                <pre style={{
                                  background: '#0D0D0D',
                                  border: '1px solid #2E2E2E',
                                  borderRadius: 6,
                                  padding: 12,
                                  margin: 0,
                                  fontSize: 11,
                                  lineHeight: 1.5,
                                  color: '#DAD4BC',
                                  fontFamily: "'Roboto Mono', monospace",
                                  overflowX: 'auto',
                                  whiteSpace: 'pre-wrap',
                                }}>
                                  {highlightCode(snippets[snippetLang])}
                                </pre>
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })}
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
