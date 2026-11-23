import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Compatibility guard for Harness's React 18 renderer. The behavior is also
// checked in the installed desktop app: open, verify badge gone with list
// still visible, dismiss with Escape, verify the badge stays gone.
test('native popover subscribes directly and removes the listener on cleanup', () => {
  const source = readFileSync(new URL('../client.js', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /\bonToggle\s*:/, 'React 18 does not attach onToggle to this div');
  assert.match(source, /node\.addEventListener\('toggle', syncOpen\)/);
  assert.match(source, /node\.removeEventListener\('toggle', syncOpen\)/);
});

test('popover captures and acknowledges only pending items, retaining them until close', () => {
  const source = readFileSync(new URL('../client.js', import.meta.url), 'utf8');
  assert.match(source, /const openingBatch = unseenCompletions\(items, readViewed\(\)\);\s*setBatch\(openingBatch\);\s*setSeen\(markViewed\(openingBatch\)\);\s*\} else \{\s*setBatch\(\[\]\)/);
  assert.match(source, /const unread = pending\.length;/);
  assert.match(source, /const shown = isOpen \? batch : pending;/);
  assert.match(source, /\.\.\.shown\.map/);
  assert.doesNotMatch(source, /refreshProjections/);
});
