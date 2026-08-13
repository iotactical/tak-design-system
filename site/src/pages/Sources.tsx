import { useEffect } from 'react';
import styles from './Sources.module.css';

interface SourceEntry {
  name: string;
  url: string;
  description: string;
  category: string;
  note?: string;
}

const SOURCES: SourceEntry[] = [
  // TAK.gov
  {
    name: 'ATAK-CIV',
    url: 'https://tak.gov/products/atak-civ',
    description: 'Official ATAK Civil Use distribution on TAK.gov. Download the Android Tactical Assault Kit.',
    category: 'TAK.gov',
  },
  {
    name: 'WinTAK-CIV',
    url: 'https://tak.gov/products/wintak-civ',
    description: 'Official WinTAK Civil Use distribution on TAK.gov. Download the Windows Tactical Assault Kit.',
    category: 'TAK.gov',
  },
  // Figma
  {
    name: 'ATAK Design System (Figma)',
    url: 'https://www.figma.com/community/file/1571370238280853168/atak-design-system-tactical-assault-kit-team-awareness-kit',
    description: 'Community Figma UI kit for ATAK. Android component specifications, color tokens, typography scales, and layout patterns. Unofficial and not affiliated with the TAK Product Center.',
    category: 'Design',
    note: 'Figma community file -- duplicating it into a library needs a desktop browser',
  },
  {
    name: 'WinTAK Design System (Figma)',
    url: 'https://www.figma.com/community/file/1573375430276099247/wintak-design-system-windows-tactical-assault-kit-team-awareness-kit',
    description: 'Community Figma UI kit for WinTAK. Windows component specifications, WPF control styles, and desktop layout patterns. Unofficial and not affiliated with the TAK Product Center.',
    category: 'Design',
    note: 'Figma community file -- duplicating it into a library needs a desktop browser',
  },
  // GitHub
  {
    name: 'ATAK-CIV (GitHub)',
    url: 'https://github.com/TAK-Product-Center/atak-civ',
    description: 'Official ATAK civilian source, published by the TAK Product Center. Source of icon palettes, color definitions, vehicle models, and CoT schema used by this design system.',
    category: 'GitHub',
  },
  {
    name: 'TAK Server (GitHub)',
    url: 'https://github.com/TAK-Product-Center/Server',
    description: 'Official TAK Server source, published by the TAK Product Center. Reference for server-side CoT handling, mission packages, and data sync protocols.',
    category: 'GitHub',
  },
  // Standards
  {
    name: 'MIL-STD-2525 -- Common Warfighting Symbology',
    url: 'https://quicksearch.dla.mil/qsDocDetails.aspx?ident_number=114934',
    description: 'Joint military symbology standard defining symbol identification codes (SIDC), frames, icons, modifiers, and tactical graphics. Versions B through E are used across TAK platforms. This link points to the current 2525E revision (March 2023).',
    category: 'Standards',
  },
];

export default function Sources() {
  useEffect(() => {
    document.title = 'Sources -- TAK Design System';
  }, []);

  const categories = [...new Set(SOURCES.map((s) => s.category))];

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Sources</h1>
      <p className={styles.subtitle}>
        Authoritative references, design files, and standards used by the TAK Design System.
      </p>

      {categories.map((cat) => (
        <div key={cat} className={styles.section}>
          <h2 className={styles.sectionTitle}>{cat}</h2>
          <div className={styles.grid}>
            {SOURCES.filter((s) => s.category === cat).map((source) => (
              <a
                key={source.name}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.card}
              >
                <div className={styles.cardName}>{source.name}</div>
                <div className={styles.cardDesc}>{source.description}</div>
                {source.note && <div className={styles.cardNote}>{source.note}</div>}
                <div className={styles.cardUrl}>{new URL(source.url).hostname}</div>
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
