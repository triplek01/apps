export const MOODS = [
  {id:'ease',label:'Ease in',description:'A small, gentle start.',durations:{focus:15,break:5,long:15},mix:{volume:.32,binauralLevel:.2,beat:10,trackId:5,layers:{rain:.12}}},
  {id:'steady',label:'Steady focus',description:'Your familiar Pomodoro rhythm.',durations:{focus:25,break:5,long:15},mix:{volume:.4,binauralLevel:.35,beat:10,trackId:0,layers:{}}},
  {id:'deep',label:'Deep work',description:'More time for one meaningful task.',durations:{focus:45,break:10,long:20},mix:{volume:.35,binauralLevel:.25,beat:10,trackId:20,layers:{brown:.06}}},
  {id:'sprint',label:'Short sprint',description:'A little momentum when you need it.',durations:{focus:10,break:3,long:10},mix:{volume:.4,binauralLevel:.2,beat:14,trackId:25,layers:{vinyl:.05}}},
];
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
  return [
    {id:'first',title:'First chapter',description:'Complete your first focus session.',earned:stats.completed>=1},
    {id:'four',title:'Finding a rhythm',description:'Complete four focus sessions.',earned:stats.completed>=4},
    {id:'goal',title:'Made it happen',description:'Finish one session goal.',earned:stats.goalsDone>=1},
    {id:'hours',title:'Room for focus',description:'Record two hours of timed focus.',earned:stats.seconds>=7200},
  ];
}
export const THEMES = [
  {id:'twilight',name:'Velvet twilight',sessions:0},
  {id:'ocean',name:'Quiet ocean',sessions:1},
  {id:'sunrise',name:'Peach sunrise',sessions:8},
];
