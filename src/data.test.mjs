import test from 'node:test';import assert from 'node:assert/strict';
import {cleanData,emptyData} from './data.mjs';
test('settings are validated without losing legitimate history or presets',()=>{
 const raw={schemaVersion:1,settings:{volume:99,beat:7,durations:{focus:-2},layers:{rain:.4,brown:-1}},presets:[{id:'a',name:'My mix',mix:{layers:{vinyl:.2}}}],sessions:[{id:'s',startedAt:1000,endedAt:61000,seconds:60,plannedMinutes:1,status:'completed',goal:'Read a page',outcome:'done'}]};
 const clean=cleanData(raw);assert.equal(clean.settings.volume,1);assert.equal(clean.settings.durations.focus,1);assert.equal(clean.settings.beat,10);assert.equal(clean.settings.layers.rain,.4);assert.equal(clean.settings.layers.brown,0);assert.equal(clean.sessions[0].goal,'Read a page');assert.equal(clean.presets[0].mix.layers.vinyl,.2);
 assert.deepEqual(cleanData(JSON.parse(JSON.stringify(clean))),clean);
});
test('unknown backups are rejected and malformed history does not crash startup',()=>{
 assert.throws(()=>cleanData({settings:{}}),/backup/);assert.throws(()=>cleanData(null),/backup/);
 assert.deepEqual(cleanData({schemaVersion:1,sessions:[null,{id:'bad',startedAt:3,endedAt:1}]}).sessions,[]);assert.equal(emptyData().settings.tickEnabled,true);
});

test('version-one backups migrate without dropping saved goals and mixes',()=>{
 const legacy={schemaVersion:1,settings:{trackId:29,goalDraft:'Continue my project'},presets:[{id:'old',name:'My old mix',mix:{trackId:10}}],sessions:[{id:'old-session',startedAt:1000,endedAt:61000,seconds:60,plannedMinutes:1,status:'completed',goal:'My project',outcome:'done'}]};
 const data=cleanData(legacy);assert.equal(data.schemaVersion,2);assert.equal(data.settings.goalDraft,'Continue my project');assert.equal(data.presets[0].mix.trackId,10);assert.equal(data.sessions[0].goal,'My project');assert.equal(data.sessions[0].activity,null);
});

test('activity checklists survive backups and legacy goals migrate only once',()=>{
 const raw={schemaVersion:2,settings:{activity:'study',goalDraft:'Old goal'},tasks:[{id:'a',title:'  Read chapter  ',done:true,activity:'study'},{id:'b',title:'Clean desk',done:false,activity:'chores'},null,{id:'bad',title:'',activity:'work'},{id:'other',title:'Bad profile',activity:'unknown'}]};
 const data=cleanData(raw);assert.equal(data.tasks.length,2);assert.equal(data.tasks[0].title,'Read chapter');assert.equal(data.tasks[0].done,true);assert.equal(data.tasks[1].activity,'chores');assert.deepEqual(cleanData(JSON.parse(JSON.stringify(data))),data);
 const migrated=cleanData({schemaVersion:1,settings:{activity:'study',goalDraft:'Read a page'}});assert.deepEqual(migrated.tasks,[{id:'legacy-goal',title:'Read a page',done:false,activity:'study'}]);migrated.tasks=[];assert.deepEqual(cleanData(migrated).tasks,[]);
});
