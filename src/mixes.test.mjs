import test from 'node:test';
import assert from 'node:assert/strict';
import {activityMixes} from './mixes.mjs';
import {activityTracks} from './profiles.mjs';
test('each activity has five unique, distinct mixes using its own track pool',()=>{
 const names=new Set(),sounds=new Set();
 for(const activity of ['study','work','chores','creative']){
  const mixes=activityMixes(activity);assert.equal(mixes.length,5);
  for(const preset of mixes){assert.ok(activityTracks(activity).includes(preset.mix.trackId));assert.ok(!names.has(preset.name));names.add(preset.name);assert.ok(!sounds.has(JSON.stringify(preset.mix)));sounds.add(JSON.stringify(preset.mix));}
 }
 assert.equal(names.size,20);assert.equal(sounds.size,20);
});
