import React,{useEffect,useState} from 'react';
const prompts={stretch:['Relax your jaw and let your shoulders settle.','Gently roll your shoulders, then stretch your hands.','Change your position and take a comfortable breath.'],eyes:['Look away from the screen at something across the room.','Let your eyes rest while you notice the light around you.'],move:['Stand or move in a way that feels comfortable.','Take a few steps, get some water, or open a window.']};
export default function BreakGuide({running,activity,setActivity}) {
  const [seconds,setSeconds]=useState(0);
  useEffect(()=>{setSeconds(0);},[activity]);
  useEffect(()=>{if(!running||activity==='free')return;const id=setInterval(()=>setSeconds(s=>s+1),1000);return()=>clearInterval(id);},[running,activity]);
  const inhale=seconds%10<4;
  return <div className="break-guide"><h3>Your break, your way</h3><label className="sr-only" htmlFor="break-activity">Break activity</label><select id="break-activity" value={activity} onChange={e=>setActivity(e.target.value)}><option value="free">Free break</option><option value="breathe">Gentle breathing</option><option value="stretch">Stretch reminder</option><option value="eyes">Eye rest</option><option value="move">A little movement</option></select>{activity==='free'?<p>Leave the screen, stretch, or do whatever you need.</p>:activity==='breathe'?<div className={'breathing '+(inhale?'inhale':'exhale')}><div className="breath-orb"/><p>{inhale?'Breathe in gently':'Breathe out slowly'}<span>{inhale?4-seconds%10:10-seconds%10}s · follow a comfortable pace</span></p></div>:<p className="break-prompt">{prompts[activity][Math.floor(seconds/20)%prompts[activity].length]}</p>}</div>;
}
