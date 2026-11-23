import { test } from 'node:test';
import assert from 'node:assert/strict';
import { projection as p } from '../index.js';
const start = (seq = 1) => ({ type: 'turn/start', seq });
const end = (kind, seq = 2, time = 123456) => ({ type: 'turn/end', seq, time, data: { reason: { kind } } });
const initial = p.init({}, 0);
test('blank and active sessions are not complete; successful end is surfaced', () => {
  assert.equal(p.wire.view(initial), null);
  assert.strictEqual(p.apply(initial, start()), initial);
  assert.equal(p.wire.view(p.apply(initial, end('completed'))), 123456);
});
test('a new turn clears the old completion; only normal completion brings it back', () => {
  const done = p.apply(initial, end('completed'));
  assert.equal(p.wire.view(p.apply(done, start(3))), null);
  for (const reason of ['error', 'blocked', 'aborted', 'interrupted', 'max-tokens', 'forked']) {
    assert.equal(p.wire.view(p.apply(done, end(reason, 4))), null);
  }
  assert.equal(p.wire.view(p.apply(done, end('completed', 4, 123999))), 123999);
});
test('subagents and inherited turns do not create completion notices', () => {
  const fork = p.init({}, 10);
  assert.strictEqual(p.apply(fork, end('completed', 9)), fork);
  assert.equal(p.wire.view(p.apply(fork, end('completed', 10))), 123456);
  assert.equal(p.apply(p.init({ origin: 'subagent' }, 0), end('completed')), null);
});
test('checkpoint and wire schemas validate their values', () => {
  assert.deepEqual(p.stateSchema.parse(initial), initial);
  assert.equal(p.wire.viewSchema.parse(123456), 123456);
  assert.throws(() => p.wire.viewSchema.parse(-1));
  assert.throws(() => p.stateSchema.parse({ ownFrom: '0', completedAt: null }));
});
