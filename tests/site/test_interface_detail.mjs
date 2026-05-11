// rtmx:test REQ-XW-089
import assert from 'assert';
import fs from 'fs';

const src = fs.readFileSync('site/src/pages/Interfaces.tsx', 'utf8');

// Intent detail: clickable rows with code snippets
assert.ok(src.includes('intentSnippets'), 'intentSnippets generator function exists');
assert.ok(src.includes('expandedIntent'), 'expandable intent state exists');
assert.ok(src.includes('intent-detail'), 'intent detail testid exists');

// Multi-language code snippets for intents (4 languages)
assert.ok(src.includes("'java'"), 'Java snippet language option');
assert.ok(src.includes("'kotlin'"), 'Kotlin snippet language option');
assert.ok(src.includes("'typescript'"), 'TypeScript snippet language option');
assert.ok(src.includes("'csharp'"), 'C# snippet language option');
assert.ok(src.includes('AtakBroadcast'), 'Java ATAK broadcast snippet');
assert.ok(src.includes('TakBroadcast.send'), 'TypeScript WebTAK broadcast snippet');
assert.ok(src.includes('messageBus'), 'C# WinTAK message bus snippet');

// Syntax highlighting
assert.ok(src.includes('highlightCode'), 'Syntax highlighter function exists');
assert.ok(src.includes('#569CD6'), 'Keyword color (blue) for syntax highlighting');
assert.ok(src.includes('#CE9178'), 'String color (orange) for syntax highlighting');
assert.ok(src.includes('#6A9955'), 'Comment color (green) for syntax highlighting');
assert.ok(src.includes('#4EC9B0'), 'Type color (teal) for syntax highlighting');

// External interface detail: clickable cards with code snippets
assert.ok(src.includes('externalSnippets'), 'externalSnippets generator function exists');
assert.ok(src.includes('expandedIface'), 'expandable interface state exists');
assert.ok(src.includes('iface-detail'), 'interface detail testid exists');
assert.ok(src.includes('external-card'), 'external card testid exists');

// Snippet language switcher
assert.ok(src.includes('snippetLang'), 'snippet language state');
assert.ok(src.includes('setSnippetLang'), 'snippet language setter');

console.log('PASS: REQ-XW-089 Interface detail with multi-language code snippets and syntax highlighting (19 assertions)');
