import test from 'node:test';
import assert from 'node:assert/strict';
import { nextSession, remainingSeconds } from './timer.mjs';
test('fourth focus ends with a long break and breaks return to focus', () => {
 assert.deepEqual(nextSession('focus', 3), {mode:'long', rounds:4});
 assert.deepEqual(nextSession('focus', 0), {mode:'break', rounds:1});
 assert.deepEqual(nextSession('long', 4), {mode:'focus', rounds:4});
});
test('deadline stays accurate after delayed ticks and never goes negative', () => {
 assert.equal(remainingSeconds(10000, 3500), 7);
 assert.equal(remainingSeconds(10000, 11000), 0);
});
