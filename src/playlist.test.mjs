import test from 'node:test';
import assert from 'node:assert/strict';
import { TRACKS, arrangement } from './music.mjs';
import { advanceTrack } from './playlist.mjs';
test('all 120 scores have distinct musical content and valid note events', () => {
  assert.equal(TRACKS.length, 120);
  const fingerprints = new Set();
  for (const track of TRACKS) {
    const score = [];
    for (let step = 0; step < track.totalSteps; step++) {
      const events = arrangement('focus', step, track.id);
      for (const event of events) {
        assert.ok(event.level > 0 && event.level < .2);
        for (const note of event.notes ?? []) {
          assert.ok(Number.isFinite(note) && note >= 24 && note <= 96);
          assert.ok(event.duration > 0);
        }
      }
      score.push(events);
    }
    fingerprints.add(JSON.stringify(score));
  }
  assert.equal(fingerprints.size, 120);
});
test('both break modes contain no music events for any track', () => {
  for (const track of TRACKS) for (const mode of ['break','long']) {
    for (let step = 0; step < track.totalSteps; step++) assert.deepEqual(arrangement(mode, step, track.id), []);
  }
});
test('shuffle plays all library tracks before repeating and does not repeat at a cycle boundary', () => {
  let id = 0, queue = []; const heard = [id];
  for (let i = 0; i < TRACKS.length-1; i++) {
    ({id, queue} = advanceTrack(id, queue, true, TRACKS.length, () => .37)); heard.push(id);
  }
  assert.equal(new Set(heard).size, TRACKS.length);
  assert.equal(queue.length, 0);
  assert.notEqual(advanceTrack(id, queue, true, TRACKS.length, () => .37).id, id);
});
test('ordered playback advances and wraps', () => {
  assert.equal(advanceTrack(8, [], false, TRACKS.length).id, 9);
  assert.equal(advanceTrack(TRACKS.length-1, [], false, TRACKS.length).id, 0);
});
