import test from 'node:test';import assert from 'node:assert/strict';
import {summarize,milestones} from './insights.mjs';
const session=(id,status,outcome,goal='Task')=>({id,status,outcome,goal,seconds:60,startedAt:new Date(2026,9,12,9).getTime(),mixName:'Midnight Study'});
test('goal statistics exclude unrated goals and incomplete sessions',()=>{
 const stats=summarize([session('a','completed','done'),session('b','completed','progress'),session('c','completed',null),session('d','skipped','done')]);
 assert.equal(stats.completed,3);assert.equal(stats.seconds,240);assert.equal(stats.goalsDone,1);assert.equal(stats.goalRate,50);assert.equal(stats.average,1);assert.equal(stats.bestHour,null);assert.equal(stats.favoriteMix,'Midnight Study');
});
test('best-rated hour needs enough feedback and milestones do not depend on streaks',()=>{
 const stats=summarize([session('a','completed','done'),session('b','completed','done'),session('c','completed','progress')]);assert.equal(stats.bestHour.hour,9);assert.equal(stats.bestHour.total,3);assert.equal(stats.bestHour.done,2);assert.equal(milestones(stats).find(b=>b.id==='first').earned,true);
});
