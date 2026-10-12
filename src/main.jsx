import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { SessionAudio } from './audio';
import { TRACKS } from './music.mjs';
import { advanceInPool } from './playlist.mjs';
import { nextSession, remainingSeconds } from './timer.mjs';
import '@fontsource-variable/inter';
import './style.css';
import Studio from './Studio';
import Progress from './Progress';
import BreakGuide from './BreakGuide';
import {cleanData,cleanMix,loadData,saveData,DEFAULT_SETTINGS} from './data.mjs';
import {MOODS,summarize} from './insights.mjs';
import {ACTIVITIES,activityTracks} from './profiles.mjs';
const labels = { focus: 'Focus', break: 'Short break', long: 'Long break' };
const paths = {
  music: 'M9 18V5l12-2v13 M9 8l12-2 M9 18c0 2-6 3-6 0s6-3 6 0 M21 16c0 2-6 3-6 0s6-3 6 0',
  clock: 'M12 7v5l3 2 M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
  reset: 'M4 9a8 8 0 1 1 0 6 M4 3v6h6',
  skip: 'm5 5 10 7-10 7z M19 5v14',
  shuffle: 'M3 6h3c5 0 7 12 12 12h3 M17 14l4 4-4 4 M3 18h3c2 0 4-3 6-6s4-6 6-6h3 M17 2l4 4-4 4',
  play: 'm8 5 11 7-11 7z', pause: 'M8 5v14 M16 5v14',
  leaf: 'M20 4C6 2 2 10 6 17s15 2 14-13 M7 17l9-9',
};
function Icon({name, ...props}) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}><path d={paths[name]}/></svg>; }
function Atmosphere() {
  return <div className="atmosphere" aria-hidden="true"><svg viewBox="0 0 1553 1013" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="wave" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#6960a3" stopOpacity=".2"/><stop offset=".55" stopColor="#26273f" stopOpacity=".1"/><stop offset="1" stopColor="#9e78da" stopOpacity=".16"/></linearGradient><filter id="glow"><feGaussianBlur stdDeviation="13"/></filter></defs><g className="wave-layer wave-upper"><path className="wave-glow" d="M-50 205C215 105 216 370 455 354S645 481 861 451 1109 253 1553-32"/><path className="wave-fill" fill="url(#wave)" d="M-50 205C215 105 216 370 455 354S645 481 861 451 1109 253 1553-32V-50H-50Z"/><path className="wave-edge" d="M-50 205C215 105 216 370 455 354S645 481 861 451 1109 253 1553-32"/></g><g className="wave-layer wave-lower"><path className="wave-fill" fill="url(#wave)" d="M-60 1020C119 660 278 797 466 733S793 898 974 591 1260 626 1610 162V1060Z"/><path className="wave-edge lower" d="M-60 1020C119 660 278 797 466 733S793 898 974 591 1260 626 1610 162"/></g>{Array.from({length:45},(_,i)=><circle className="star" style={{'--star-delay':`${i%9*-1.1}s`,'--star-opacity':i%3===0?.55:.2}} key={i} cx={(i*347+73)%1553} cy={(i*191+69)%1013} r={i%5===0?1.5:.8} fill="#d5b5ff" opacity={i%3===0?.55:.2}/>)}</svg></div>;
}
function App({initial}) {
  const seed = initial.data.settings;
  const [animationMode,setAnimationMode]=useState(seed.animationMode); const animations=animationMode!=='off';
  const [reducedMotion, setReducedMotion] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(preference.matches);
    preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);
  function toggleAnimation() {
    const next = !motionEnabled; setAnimationMode(next?'on':'off');
    try { localStorage.setItem('focus-beat-motion', next ? 'on' : 'off'); } catch {}
  }
  const motionEnabled = animationMode==='on'||animationMode==='system'&&!reducedMotion;
  const [durations, setDurations] = useState(seed.durations);
  const [mode, setMode] = useState('focus'); const [rounds, setRounds] = useState(summarize(initial.data.sessions).completed);
  const [remaining, setRemaining] = useState(seed.durations.focus*60); const [running, setRunning] = useState(false);
  const [volume, setVolume] = useState(seed.volume); const [binauralLevel, setBinauralLevel] = useState(seed.binauralLevel);
  const [beat, setBeat] = useState(seed.beat); const [muted, setMuted] = useState(false);
  const [tickEnabled, setTickEnabled] = useState(seed.tickEnabled); const [breakVolume, setBreakVolume] = useState(seed.breakVolume);
  const [trackId, setTrackId] = useState(seed.trackId); const [shuffle, setShuffle] = useState(seed.shuffle);
  const [selectedActivity,setSelectedActivity]=useState(null);const [profiles,setProfiles]=useState(initial.data.profiles);const [autoBreaks,setAutoBreaks]=useState(seed.autoBreaks);
  const [view,setView]=useState('focus'); const [breakActivity,setBreakActivity]=useState(seed.breakActivity);
  const [layers,setLayers]=useState(seed.layers);const [presets,setPresets]=useState(initial.data.presets);
  const [sessions,setSessions]=useState(initial.data.sessions);const [goal,setGoal]=useState(seed.goalDraft);
  const [activeMix,setActiveMix]=useState(seed.activeMix);const [mood,setMood]=useState(seed.mood);
  const [reactive,setReactive]=useState(seed.reactive);const [theme,setTheme]=useState(seed.theme);const [showRewards,setShowRewards]=useState(seed.showRewards);
  const [pendingGoal,setPendingGoal]=useState(null);const [pendingImport,setPendingImport]=useState(null);
  const [storageError,setStorageError]=useState(initial.error);const [storageBlocked,setStorageBlocked]=useState(initial.blocked);
  const sessionStart=useRef(null);const appElement=useRef(null);
  const [error, setError] = useState('');
  const deadline = useRef(0); const audio = useRef(new SessionAudio()); const queue = useRef([]);
  const position = useRef({ id: 0, seconds: 0 }); const onTrackEnd = useRef(null);
  const track = TRACKS[trackId]; const focus = mode === 'focus';
  function nextTrack() {
    const next = advanceInPool(trackId,queue.current,shuffle,activityTracks(selectedActivity));
    queue.current = next.queue; setTrackId(next.id);
  }
  onTrackEnd.current = nextTrack;
  function selectTrack(id) { queue.current = []; setTrackId(id); }
  const settings={activity:selectedActivity||seed.activity,autoBreaks,animationMode,animations,breakActivity,durations,volume,binauralLevel,beat,trackId,shuffle,tickEnabled,breakVolume,layers,reactive,theme,showRewards,goalDraft:goal,activeMix,mood};
  const data={schemaVersion:2,settings,presets,sessions,profiles:selectedActivity?{...profiles,[selectedActivity]:settings}:profiles};
  useEffect(()=>{
    if(storageBlocked)return;
    saveData(data).then(()=>setStorageError('')).catch(()=>setStorageError('Your latest changes could not be saved. Export a backup from Progress to keep them.'));
  },[selectedActivity,profiles,autoBreaks,animationMode,animations,breakActivity,durations,volume,binauralLevel,beat,trackId,shuffle,tickEnabled,breakVolume,layers,reactive,theme,showRewards,goal,activeMix,mood,presets,sessions,storageBlocked]);
  function setMix(next) {
    const mix=cleanMix(next);setVolume(mix.volume);setBinauralLevel(mix.binauralLevel);setBeat(mix.beat);setTrackId(mix.trackId);setLayers(mix.layers);setActiveMix('Custom mix');
    if(mix.trackId!==trackId)queue.current=[];
  }
  function applyMix(mix,name){setMix(mix);setActiveMix(name);}
  function finishSession(status) {
    if(mode!=='focus'||!sessionStart.current)return;
    const seconds=status==='completed'?durations.focus*60:Math.max(0,Math.min(durations.focus*60,durations.focus*60-(running?remainingSeconds(deadline.current,Date.now()):remaining)));
    if(seconds>0){const session={id:crypto.randomUUID(),startedAt:sessionStart.current,endedAt:Date.now(),seconds,plannedMinutes:durations.focus,status,activity:selectedActivity,goal:goal.trim(),outcome:null,trackTitle:volume>0?track.title:'Atmosphere only',mixName:activeMix,mood};setSessions(old=>[...old,session]);if(status==='completed'&&session.goal){setPendingGoal(session);setGoal('');}}
    sessionStart.current=null;
  }
  function applyMood(id){const preset=MOODS.find(m=>m.id===id);if(!preset)return;finishSession('reset');setDurations(preset.durations);setRemaining(preset.durations[mode]*60);applyMix(preset.mix,preset.label);setMood(id);}
  function exportBackup(){const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download='focus-beat-backup.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  async function restoreBackup(file){try{setPendingImport(cleanData(JSON.parse(await file.text())));}catch{setStorageError('That file is not a valid Focus Beat backup. Your current data has not changed.');}}
  function confirmRestore(){const restored=pendingImport;const s=restored.settings;setAnimationMode(s.animationMode);setAutoBreaks(s.autoBreaks);setProfiles(restored.profiles);setSelectedActivity(s.activity);setBreakActivity(s.breakActivity);setRunning(false);sessionStart.current=null;position.current={id:s.trackId,seconds:0};setDurations(s.durations);setRemaining(s.durations.focus*60);setMode('focus');setMix(s);setShuffle(s.shuffle);setTickEnabled(s.tickEnabled);setBreakVolume(s.breakVolume);setReactive(s.reactive);setTheme(s.theme);setShowRewards(s.showRewards);setGoal(s.goalDraft);setActiveMix(s.activeMix);setMood(s.mood);setPresets(restored.presets);setSessions(restored.sessions);setRounds(summarize(restored.sessions).completed);setPendingImport(null);setPendingGoal(null);setStorageBlocked(false);}
  function switchTo(next, automatic=false) {
    if(!automatic)finishSession('switched');
    if (next === 'focus' && !focus) nextTrack();
    setMode(next); setRemaining(durations[next] * 60);
    if (running) { deadline.current = Date.now() + durations[next] * 60000; if(next==='focus')sessionStart.current=Date.now(); }
  }
  function advance(completed=false) { if(completed&&mode==='focus'&&!autoBreaks){finishSession('completed');setRounds(r=>r+1);setRunning(false);setRemaining(durations.focus*60);nextTrack();return;} finishSession(completed?'completed':'skipped'); const next=completed||mode!=='focus'?nextSession(mode,rounds):{mode:'break',rounds};setRounds(next.rounds);switchTo(next.mode,true); }
  const advanceRef=useRef(advance);
  advanceRef.current=advance;
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const seconds = remainingSeconds(deadline.current, Date.now()); setRemaining(seconds);
      if (!seconds) advanceRef.current(true);
    }, 200);
    return () => clearInterval(id);
  }, [running, mode, rounds, durations, autoBreaks]);
  useEffect(() => {
    setError('');
    if (running && (focus ? !muted : tickEnabled)) {
      const offset = focus && position.current.id === trackId ? Math.min(position.current.seconds, track.duration - .1) : 0;
      audio.current.start(mode, volume, beat, binauralLevel, trackId, () => onTrackEnd.current(), offset, breakVolume, layers)
        .catch(() => setError('Audio could not start. Pause and try again.'));
    } else audio.current.stop();
    return () => {
      if (focus && audio.current.ctx) position.current = { id: trackId, seconds: audio.current.getPosition() };
      audio.current.stop();
    };
  }, [running, mode, muted, beat, trackId, tickEnabled]);
  useEffect(() => { audio.current.setVolume(volume); }, [volume]);
  useEffect(() => { audio.current.setBinauralLevel(binauralLevel); }, [binauralLevel]);
  useEffect(() => { audio.current.setBreakVolume(breakVolume); }, [breakVolume]);
  useEffect(()=>{audio.current.setLayers(layers);},[layers]);
  useEffect(()=>{
    const element=appElement.current;if(!element)return;
    element.style.setProperty('--energy','0');
    if(!running||!motionEnabled||!reactive||view!=='focus')return;
    const id=setInterval(()=>element.style.setProperty('--energy',String(audio.current.getEnergy())),100);return()=>clearInterval(id);
  },[running,motionEnabled,reactive,mode,view]);
  function toggle() { if(running)setRemaining(remainingSeconds(deadline.current,Date.now())); if (!running && mode==='focus' && !sessionStart.current) sessionStart.current=Date.now(); if (!running) deadline.current = Date.now() + remaining * 1000; setRunning(!running); }
  const progress = Math.max(0, Math.min(100, 100 * (1 - remaining / (durations[mode] * 60))));
  const rangeStyle = value => ({ '--fill': `${value * 100}%` });
  const activity=ACTIVITIES.find(p=>p.id===selectedActivity);
  const trackPool=activityTracks(selectedActivity);
  const playlist=TRACKS.filter(t=>trackPool.includes(t.id)||t.id===trackId);
  function chooseActivity(id,reset=false){
    const profile=ACTIVITIES.find(p=>p.id===id);
    const s=(!reset&&profiles[id])||cleanData({schemaVersion:1,settings:{...DEFAULT_SETTINGS,...profile.mix,durations:profile.durations,theme:profile.theme,activity:id,autoBreaks:profile.autoBreaks,animationMode:'on',goalDraft:reset?goal:Object.keys(profiles).length===0?seed.goalDraft:'',activeMix:`${profile.label} atmosphere`,mood:'custom'}}).settings;
    setRunning(false);sessionStart.current=null;queue.current=[];position.current={id:s.trackId,seconds:0};
    setDurations(s.durations);setRemaining(s.durations.focus*60);setMode('focus');setMix(s);setShuffle(s.shuffle);setTickEnabled(s.tickEnabled);setBreakVolume(s.breakVolume);setReactive(s.reactive);setTheme(s.theme);setShowRewards(s.showRewards);setGoal(s.goalDraft);setActiveMix(s.activeMix);setMood(s.mood);setAutoBreaks(s.autoBreaks);setAnimationMode(s.animationMode);setBreakActivity(s.breakActivity);setSelectedActivity(id);setView('focus');setPendingGoal(null);
  }
  function changeActivity(){finishSession('switched');setProfiles(old=>({...old,[selectedActivity]:settings}));setRunning(false);setSelectedActivity(null);}
  const motionButton=<button className="motion-toggle" aria-pressed={motionEnabled} title={animationMode==='system'?'Following your system motion preference':'Toggle ambient animation'} onClick={toggleAnimation}>Animation {motionEnabled?'on':animationMode==='system'?'off (system)':'off'}</button>;
  if(!selectedActivity)return <div ref={appElement} className={`app activity-chooser ${motionEnabled?'motion-on':'motion-off'} ${animationMode==='on'?'motion-explicit':''}`}><Atmosphere/><main><header><div className="brand"><span className="logo"/>FOCUS BEAT</div>{motionButton}</header><section className="intro chooser-intro"><p className="eyebrow">A RHYTHM FOR EVERY PART OF YOUR DAY.</p><h1>What are we doing today?</h1><p>Choose an activity. We’ll set the pace, sound, and atmosphere.</p></section>{storageError&&<p role="alert" className="storage-banner">{storageError}</p>}<div className="activity-grid">{ACTIVITIES.map(p=><button key={p.id} className={`activity-card activity-${p.id}`} onClick={()=>chooseActivity(p.id)}><div className="activity-art" aria-hidden="true"><span>{p.icon}</span><i/><i/></div><h2>{p.label}</h2><p>{p.description}</p><div className="profile-spec"><strong>{profiles[p.id]?.durations.focus||p.durations.focus} min</strong><span>{p.id==='study'?'Lo-fi music':p.id==='work'?'Ambient noise':p.id==='chores'?'Energetic music':'Relaxing soundscapes'}</span><small>{(profiles[p.id]?.autoBreaks??p.autoBreaks)?`${profiles[p.id]?.durations.break??p.durations.break}-minute breaks`:'Optional breaks'}</small></div><div className="choose-label">Choose {p.label.toLowerCase()} →</div>{profiles[p.id]&&<small className="saved-profile">Your saved settings are ready</small>}</button>)}</div><p className="chooser-footnote">Each activity has its own animated theme and saved settings. Everything works offline.</p></main></div>;

  return <div ref={appElement} className={`app theme-${theme} ${focus?'scene-focus':'scene-break'} ${motionEnabled?'motion-on':'motion-off'} ${animationMode==='on'?'motion-explicit':''}`}><Atmosphere/><main>
    <header><div className="brand"><span className="logo"/>FOCUS BEAT</div><div className="header-tools"><span className="badge">YOUR TIME, IN TUNE</span>{motionButton}</div></header>
    <div className="activity-bar"><span>{activity.icon} {activity.label}</span><div><button className="text-button" disabled={running} onClick={()=>{finishSession('reset');chooseActivity(selectedActivity,true);}}>Reset profile</button><button className="text-button" title="End the current timer and choose another activity" onClick={changeActivity}>Change activity</button></div></div>
    <div className="app-nav" role="tablist" aria-label="App sections">{[['focus','Focus'],['studio','Sound Studio'],['progress','Progress']].map(([id,label])=><button role="tab" id={`view-${id}`} aria-selected={view===id} tabIndex={view===id?0:-1} key={id} onKeyDown={e=>{const list=['focus','studio','progress'];let index=list.indexOf(id);if(e.key==='ArrowRight')index=(index+1)%3;else if(e.key==='ArrowLeft')index=(index+2)%3;else if(e.key==='Home')index=0;else if(e.key==='End')index=2;else return;e.preventDefault();setView(list[index]);document.getElementById(`view-${list[index]}`).focus();}} onClick={()=>setView(id)}>{label}</button>)}</div>
    {view!=='focus'&&<div className="mini-session"><span>{labels[mode]} · {String(Math.floor(remaining/60)).padStart(2,'0')}:{String(remaining%60).padStart(2,'0')}</span><button className="small-primary" onClick={toggle}>{running?'Pause session':'Start session'}</button><button className="text-button" onClick={()=>setView('focus')}>Back to timer</button></div>}
    {storageError&&<p className="storage-banner" role="alert">{storageError}</p>}
    {pendingImport&&<div className="glass restore-confirm" role="alert"><p>Restore {pendingImport.sessions.length} sessions and {pendingImport.presets.length} saved mixes? This replaces your current data. Export a backup first if you want to keep it.</p><button className="small-primary" onClick={confirmRestore}>Replace my data</button><button className="text-button" onClick={()=>setPendingImport(null)}>Cancel</button></div>}
    <div role="tabpanel" aria-labelledby={`view-${view}`}>
    <section className="intro"><p className="eyebrow">A LITTLE RHYTHM. A LOT OF FOCUS.</p><h1>{view==='focus'?'Find your flow.':view==='studio'?'Make it your own.':'A little progress, every day.'}</h1><p>{view==='focus'?'Make room for deep work. Take a break that’s yours.':view==='studio'?'Your music. Your atmosphere. Your space.':'Notice your rhythm, without judging your pace.'}</p></section>
    {view==='focus'&&<>
    <div className="session-prep glass"><label htmlFor="session-goal">What are you working on?<input id="session-goal" placeholder="One small thing is enough (optional)" maxLength="200" value={goal} disabled={running} onChange={e=>setGoal(e.target.value)}/></label><label htmlFor="mood">Pace adjustment<select id="mood" value={mood} disabled={running} onChange={e=>applyMood(e.target.value)}><option value="custom">Profile settings</option>{MOODS.map(m=><option value={m.id} key={m.id}>{m.label}</option>)}</select></label></div>
    <section className="timer glass">
      {reactive&&<div className="audio-orb" aria-hidden="true"/>}
      <svg className="panel-wave" viewBox="0 0 970 450" preserveAspectRatio="none" aria-hidden="true"><path d="M-10 350C160 300 146 145 346 230S592 281 739 165 841 62 980 67"/><path d="M-10 377C160 327 171 213 346 270S592 316 739 233 841 140 980 142"/></svg>
      <nav aria-label="Session type">{Object.entries(labels).map(([key,label]) => <button key={key} aria-pressed={mode === key} className={mode === key ? 'selected' : ''} onClick={() => switchTo(key)}>{label}</button>)}</nav>
      <p className="session-label">{running ? (focus ? 'FINDING YOUR FLOW' : 'TIME TO RECHARGE') : 'READY WHEN YOU ARE'}</p>
      <div className="clock" role="timer" aria-label={`${Math.floor(remaining / 60)} minutes ${remaining % 60} seconds`}>{String(Math.floor(remaining / 60)).padStart(2,'0')}<span>:</span>{String(remaining % 60).padStart(2,'0')}</div>
      <div className="progress"><div style={{width:progress+'%'}}/></div>
      <div className="controls"><button className="icon" aria-label="Reset session" onClick={() => {finishSession('reset');setRunning(false); setRemaining(durations[mode]*60);}}><Icon name="reset"/></button><button className="primary" onClick={toggle}>{running ? 'Pause session' : 'Start session'}<Icon name={running?'pause':'play'}/></button><button className="icon" aria-label="Skip to next session" onClick={()=>advance(false)}><Icon name="skip"/></button></div>
      <div className="rounds"><div aria-hidden="true">{[0,1,2,3].map(i => <span key={i} className={i<rounds%4?'done':''}/>)}</div><p>{rounds} focus {rounds===1?'session':'sessions'} completed · long break every 4</p></div>
    </section>
    {pendingGoal&&<div className="glass goal-check"><div><h2>How did it go?</h2><p>{pendingGoal.goal}</p></div><div>{[['done','Finished'],['progress','Made progress'],['not_done','Not this time']].map(([value,label])=><button className="small-primary" key={value} onClick={()=>{setSessions(old=>old.map(s=>s.id===pendingGoal.id?{...s,outcome:value}:s));setPendingGoal(null);}}>{label}</button>)}<button className="text-button" onClick={()=>setPendingGoal(null)}>Later</button></div></div>}
    <section className="settings">
      <div className="sound glass">
        <div className="setting-heading"><h2><Icon name="music"/>Your soundtrack</h2><button disabled={!focus} onClick={() => setMuted(!muted)}>{muted?'Unmute':'Mute'}</button></div>
        <p className="sound-description">{focus ? `${trackPool.length} profile tracks · ${TRACKS.length} in the library · stereo headphones` : (tickEnabled ? 'A soft clock tick · time for whatever you need' : 'Silent break · time for whatever you need')}</p>
        {focus ? <><div className={'playlist '+(!focus?'inactive':'')}>
          <label className="sr-only" htmlFor="track">Focus track</label>
          <select id="track" value={trackId} disabled={!focus} onChange={e=>selectTrack(Number(e.target.value))}>{playlist.map(t=><option key={t.id} value={t.id}>{String(t.id+1).padStart(2,'0')} · {t.title}</option>)}</select>
          <div className="track-meta"><span>{track.family} · {track.bpm} BPM</span><div><button className={shuffle?'active':''} aria-label="Shuffle playlist" aria-pressed={shuffle} disabled={!focus} onClick={()=>{queue.current=[];setShuffle(!shuffle);}}><Icon name="shuffle"/></button><button aria-label="Next focus track" disabled={!focus} onClick={nextTrack}><Icon name="skip"/></button></div></div>
        </div>
        <label className="slider-label">Music volume<span>{Math.round(volume*100)}%</span><input aria-label="Music volume" type="range" min="0" max="1" step=".01" style={rangeStyle(volume)} value={volume} onChange={e=>setVolume(Number(e.target.value))}/></label>
        <label className="slider-label">Binaural volume<span>{Math.round(binauralLevel*100)}%</span><input aria-label="Binaural volume" type="range" min="0" max="1" step=".01" style={rangeStyle(binauralLevel)} value={binauralLevel} onChange={e=>setBinauralLevel(Number(e.target.value))}/></label>
        <label className="frequency">Focus beat frequency<select aria-label="Focus beat frequency" value={beat} onChange={e=>setBeat(Number(e.target.value))}>{[4,6,10,14].map(v=><option key={v} value={v}>{v} Hz</option>)}</select></label>
        </> : <div className="break-audio">
          <label className="tick-toggle">Soft clock ticking<input aria-label="Soft clock ticking" type="checkbox" checked={tickEnabled} onChange={e=>setTickEnabled(e.target.checked)}/></label>
          <p>One gentle tick each second. No music or binaural tones.</p>
          <label className="slider-label">Tick volume<span>{Math.round(breakVolume*100)}%</span><input aria-label="Tick volume" type="range" min="0" max="1" step=".01" disabled={!tickEnabled} style={rangeStyle(breakVolume)} value={breakVolume} onChange={e=>setBreakVolume(Number(e.target.value))}/></label>
          <p className="break-hint">Switch ticking off whenever you’d prefer complete silence.</p>
        </div>}
        {error&&<p className="error" role="alert">{error}</p>}
      </div>
      <div className="lengths glass"><h2><Icon name="clock"/>Session lengths</h2><p>Set a pace that works for you.</p><label className="tick-toggle auto-breaks">Automatic breaks<input aria-label="Automatic breaks" type="checkbox" checked={autoBreaks} onChange={e=>setAutoBreaks(e.target.checked)}/></label><p className="subtle">{autoBreaks?'A break starts after each completed session.':'Sessions finish without starting a break. You can take one manually.'}</p>{Object.entries(labels).map(([key,label])=><label className="duration" key={key}>{label}<span><input aria-label={`${label} minutes`} type="number" min="1" max="180" disabled={running} value={durations[key]} onChange={e=>{const value=Math.max(1,Math.min(180,Number(e.target.value)||1));if(key===mode)finishSession('reset');setMood('custom');setDurations({...durations,[key]:value});if(key===mode)setRemaining(value*60);}}/> min</span></label>)}{!focus?<BreakGuide running={running} activity={breakActivity} setActivity={setBreakActivity}/>:<div className="quiet-note"><Icon name="leaf"/><div><h3>A little space to breathe.</h3><p>A soft tick keeps time during breaks. Stretch, step outside, or put on your own music.</p></div></div>}</div>
    </section>
    </>}
    {view==='studio'&&<Studio activity={selectedActivity} mix={{volume,binauralLevel,beat,trackId,layers}} setMix={setMix} presets={presets} setPresets={setPresets} applyMix={applyMix} activeMix={activeMix} reactive={reactive} setReactive={setReactive} showRewards={showRewards} setShowRewards={setShowRewards} animationMode={animationMode} setAnimationMode={setAnimationMode} reducedMotion={reducedMotion}/>}
    {view==='progress'&&<Progress sessions={sessions} setSessions={setSessions} showRewards={showRewards} theme={theme} setTheme={setTheme} exportBackup={exportBackup} restoreBackup={restoreBackup} activity={activity}/>}
    </div>
    <footer><span>One session at a time.</span><div className="footer-star" aria-hidden="true">✦</div><span>Keep listening at a comfortable volume.</span></footer>
  </main></div>;
}
loadData().then(initial=>createRoot(document.getElementById('root')).render(<App initial={initial}/>));
