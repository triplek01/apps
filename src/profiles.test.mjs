import test from 'node:test';import assert from 'node:assert/strict';
import {ACTIVITIES,activityTracks} from './profiles.mjs';import {TRACKS} from './music.mjs';import {advanceInPool} from './playlist.mjs';import {cleanData} from './data.mjs';import {milestones,summarize} from './insights.mjs';
test('activity defaults match the requested sessions and sound styles',()=>{
 assert.deepEqual(ACTIVITIES.map(p=>[p.id,p.durations.focus,p.durations.break,p.autoBreaks]),[['study',25,5,true],['work',25,5,true],['chores',15,5,true],['creative',60,10,false]]);
 for(const id of ['study','work'])assert.deepEqual(ACTIVITIES.find(p=>p.id===id).durations,{focus:25,break:5,long:15});
 assert.equal(new Set(ACTIVITIES.map(p=>p.theme)).size,4);
 for(const profile of ACTIVITIES){const pool=activityTracks(profile.id);assert.ok(pool.length>=17);assert.ok(pool.includes(profile.mix.trackId));assert.ok(pool.every(id=>profile.styles.includes(TRACKS[id].style)));}
});
test('profile shuffle visits every matching track without leaking another style',()=>{
 for(const profile of ACTIVITIES){const pool=activityTracks(profile.id);let id=pool[0],queue=[];const visited=[id];for(let i=1;i<pool.length;i++){({id,queue}=advanceInPool(id,queue,true,pool,()=>.27));visited.push(id);}assert.equal(new Set(visited).size,pool.length);assert.ok(visited.every(id=>pool.includes(id)));assert.notEqual(advanceInPool(id,queue,true,pool,()=>.27).id,id);}
});
test('saved profile settings survive backup round trips and expanded track IDs remain valid',()=>{
 const data=cleanData({schemaVersion:1,settings:{trackId:119},profiles:{study:{durations:{focus:55,break:10,long:20},theme:'study',animationMode:'on'},creative:{autoBreaks:false,theme:'creative'}}});
 assert.equal(data.settings.trackId,119);assert.equal(data.profiles.study.durations.focus,55);assert.equal(data.profiles.creative.autoBreaks,false);assert.deepEqual(cleanData(JSON.parse(JSON.stringify(data))),data);
});
test('twenty milestones have meaningful thresholds and unique identifiers',()=>{
 const badges=milestones(summarize([]));assert.equal(badges.length,20);assert.equal(new Set(badges.map(b=>b.id)).size,20);assert.ok(badges.every(b=>!b.earned&&b.target>0));assert.ok(milestones({completed:500,goalsDone:100,seconds:50*3600}).every(b=>b.earned));
});
