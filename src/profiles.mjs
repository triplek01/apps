import {TRACKS} from './music.mjs';
export const ACTIVITIES=[
 {id:'study',icon:'📚',label:'Study',description:'Settle into reading, revision, or learning.',theme:'study',styles:['lofi'],durations:{focus:25,break:5,long:15},autoBreaks:true,mix:{volume:.4,binauralLevel:.2,beat:10,trackId:10,layers:{vinyl:.06}}},
 {id:'work',icon:'💻',label:'Work',description:'A calm atmosphere for your working day.',theme:'work',styles:['ambient'],durations:{focus:25,break:5,long:15},autoBreaks:true,mix:{volume:0,binauralLevel:0,beat:10,trackId:5,layers:{rain:.22,brown:.1}}},
 {id:'chores',icon:'🧹',label:'Chores',description:'A little upbeat energy to get things moving.',theme:'chores',styles:['energetic'],durations:{focus:15,break:5,long:15},autoBreaks:true,mix:{volume:.5,binauralLevel:0,beat:10,trackId:102,layers:{}}},
 {id:'creative',icon:'🎨',label:'Creative',description:'Room for ideas, making, and wandering thoughts.',theme:'creative',styles:['piano','ambient','bells','strings'],durations:{focus:60,break:10,long:20},autoBreaks:false,mix:{volume:.3,binauralLevel:.15,beat:10,trackId:20,layers:{rain:.1}}},
];
export function activityTracks(id){const profile=ACTIVITIES.find(p=>p.id===id);return TRACKS.filter(t=>!profile||profile.styles.includes(t.style)).map(t=>t.id);}
