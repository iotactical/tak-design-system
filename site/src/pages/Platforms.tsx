import { useEffect, useState } from 'react';
import styles from './Platforms.module.css';

// Android XML
import takColorsXml from '@platforms/atak/res/values/tak_colors.xml?raw';
import takDimensXml from '@platforms/atak/res/values/tak_dimens.xml?raw';

// Compose Kotlin
import takColorsKt from '@platforms/atak/compose/generated/TakColors.kt?raw';

// CSS
import takTokensCss from '@platforms/web/generated/tak-tokens.css?raw';

// VS Code theme
import takDarkTheme from '@platforms/vscode/generated/tak-dark-theme.json?raw';

// mil-sym Bridge
import milSymTs from '@platforms/bridge/mil-sym-ts-colors.json?raw';
import milSymJava from '@platforms/bridge/mil-sym-java-colors.properties?raw';
import milSymAndroid from '@platforms/bridge/mil-sym-android-colors.xml?raw';

interface FileEntry {
  label: string;
  path: string;
  content: string;
  language: string;
}

interface PlatformTab {
  id: string;
  label: string;
  files: FileEntry[];
}

const platforms: PlatformTab[] = [
  {
    id: 'android',
    label: 'Android',
    files: [
      {
        label: 'tak_colors.xml',
        path: 'platforms/atak/res/values/tak_colors.xml',
        content: takColorsXml,
        language: 'xml',
      },
      {
        label: 'tak_dimens.xml',
        path: 'platforms/atak/res/values/tak_dimens.xml',
        content: takDimensXml,
        language: 'xml',
      },
    ],
  },
  {
    id: 'compose',
    label: 'Compose',
    files: [
      {
        label: 'TakColors.kt',
        path: 'platforms/atak/compose/generated/TakColors.kt',
        content: takColorsKt,
        language: 'kotlin',
      },
    ],
  },
  {
    id: 'css',
    label: 'CSS',
    files: [
      {
        label: 'tak-tokens.css',
        path: 'platforms/web/generated/tak-tokens.css',
        content: takTokensCss,
        language: 'css',
      },
    ],
  },
  {
    id: 'vscode',
    label: 'VS Code',
    files: [
      {
        label: 'tak-dark-theme.json',
        path: 'platforms/vscode/generated/tak-dark-theme.json',
        content: takDarkTheme,
        language: 'json',
      },
    ],
  },
  {
    id: 'bridge',
    label: 'mil-sym Bridge',
    files: [
      {
        label: 'mil-sym-ts-colors.json',
        path: 'platforms/bridge/mil-sym-ts-colors.json',
        content: milSymTs,
        language: 'json',
      },
      {
        label: 'mil-sym-java-colors.properties',
        path: 'platforms/bridge/mil-sym-java-colors.properties',
        content: milSymJava,
        language: 'properties',
      },
      {
        label: 'mil-sym-android-colors.xml',
        path: 'platforms/bridge/mil-sym-android-colors.xml',
        content: milSymAndroid,
        language: 'xml',
      },
    ],
  },
];

function CodeBlock({ file }: { file: FileEntry }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(file.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className={styles.fileSection}>
      <div className={styles.fileName}>{file.path}</div>
      <div className={styles.codeWrapper}>
        <button className={styles.copyButton} onClick={handleCopy}>
          {copied ? 'Copied' : 'Copy'}
        </button>
        <pre className={styles.codeBlock}>
          <code>{file.content}</code>
        </pre>
      </div>
    </div>
  );
}

export default function Platforms() {
  useEffect(() => { document.title = 'Platforms - TAK Design System'; }, []);
  const [activeTab, setActiveTab] = useState('android');
  const active = platforms.find((p) => p.id === activeTab) ?? platforms[0];

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Platform Output</h1>
      <p className={styles.subtitle}>
        Generated platform-specific files from the TAK design tokens.
      </p>

      <div className={styles.tabBar}>
        {platforms.map((p) => (
          <button
            key={p.id}
            className={`${styles.tab} ${activeTab === p.id ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(p.id)}
          >
            {p.label}
          </button>
        ))}
      </div>

      {active.files.map((file) => (
        <CodeBlock key={file.path} file={file} />
      ))}
    </div>
  );
}
