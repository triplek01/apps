export function summarize(sessions) {
  const completed = sessions.filter(s=>s.status==='completed');
  const rated = completed.filter(s=>s.goal && s.outcome);
  const done = rated.filter(s=>s.outcome==='done');
  const seconds = sessions.reduce((sum,s)=>sum+s.seconds,0);
  const mixes = new Map(); const hours = new Map();
  for(const s of completed){const name=s.mixName||'Custom mix';mixes.set(name,(mixes.get(name)||0)+1);}
  for(const s of rated){const hour=new Date(s.startedAt).getHours();const item=hours.get(hour)||{hour,total:0,done:0};item.total++;if(s.outcome==='done')item.done++;hours.set(hour,item);}
  const hourOptions=[...hours.values()].filter(h=>h.total>=3).sort((a,b)=>b.done/b.total-a.done/a.total||b.total-a.total);
  return {completed:completed.length,seconds,goalsDone:done.length,rated: rated.length,
    goalRate:rated.length?Math.round(done.length/rated.length*100):null,
    average:completed.length?Math.round(completed.reduce((sum,s)=>sum+s.seconds,0)/completed.length/60):0,
    favoriteMix:[...mixes.entries()].sort((a,b)=>b[1]-a[1])[0]?.[0]||null,bestHour:hourOptions[0]||null};
}
export function milestones(stats) {
 const sessionBadges=[[1,'First chapter'],[4,'Finding a rhythm'],[10,'Double digits'],[25,'A growing practice'],[50,'Fifty little starts'],[100,'A hundred chapters'],[250,'Steady explorer'],[500,'A lasting rhythm']];
 const goalBadges=[[1,'Made it happen'],[5,'Five meaningful finishes'],[10,'Ideas into action'],[25,'A shelf of finished things'],[50,'Making room for results'],[100,'A hundred things done']];
 const hourBadges=[[1,'An hour for yourself'],[2,'Room for focus'],[5,'Five hours of space'],[10,'Deepening the practice'],[25,'Time well tended'],[50,'Fifty hours of focus']];
 return [
  ...sessionBadges.map(([target,title])=>({id:target===1?'first':target===4?'four':`sessions-${target}`,title,description:`Complete ${target} focus ${target===1?'session':'sessions'}.`,earned:stats.completed>=target,current:stats.completed,target})),
  ...goalBadges.map(([target,title])=>({id:target===1?'goal':`goals-${target}`,title,description:`Finish ${target} session ${target===1?'goal':'goals'}.`,earned:stats.goalsDone>=target,current:stats.goalsDone,target})),
  ...hourBadges.map(([hours,title])=>({id:hours===2?'hours':`hours-${hours}`,title,description:`Record ${hours} ${hours===1?'hour':'hours'} of timed focus.`,earned:stats.seconds>=hours*3600,current:Math.floor(stats.seconds/60),target:hours*60})),
 ];
}
export const THEMES = [
  {id:'twilight',name:'Velvet twilight',sessions:0},
  {id:'ocean',name:'Quiet ocean',sessions:1},
  {id:'sunrise',name:'Peach sunrise',sessions:8},
];
