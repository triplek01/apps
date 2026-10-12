import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { SessionAudio } from './audio';
import { TRACKS } from './music.mjs';
import { advanceTrack } from './playlist.mjs';
import { nextSession, remainingSeconds } from './timer.mjs';
import '@fontsource-variable/inter';
import './style.css';
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
  return <div className="atmosphere" aria-hidden="true"><svg viewBox="0 0 1553 1013" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="wave" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#6960a3" stopOpacity=".2"/><stop offset=".55" stopColor="#26273f" stopOpacity=".1"/><stop offset="1" stopColor="#9e78da" stopOpacity=".16"/></linearGradient><filter id="glow"><feGaussianBlur stdDeviation="13"/></filter></defs><g className="wave-layer wave-upper"><path className="wave-glow" d="M-50 205C215 105 216 370 455 354S645 481 861 451 1109 253 1553-32"/><path fill="url(#wave)" d="M-50 205C215 105 216 370 455 354S645 481 861 451 1109 253 1553-32V-50H-50Z"/><path className="wave-edge" d="M-50 205C215 105 216 370 455 354S645 481 861 451 1109 253 1553-32"/></g><g className="wave-layer wave-lower"><path fill="url(#wave)" d="M-60 1020C119 660 278 797 466 733S793 898 974 591 1260 626 1610 162V1060Z"/><path className="wave-edge lower" d="M-60 1020C119 660 278 797 466 733S793 898 974 591 1260 626 1610 162"/></g>{Array.from({length:45},(_,i)=><circle className="star" style={{'--star-delay':`${i%9*-1.1}s`,'--star-opacity':i%3===0?.55:.2}} key={i} cx={(i*347+73)%1553} cy={(i*191+69)%1013} r={i%5===0?1.5:.8} fill="#d5b5ff" opacity={i%3===0?.55:.2}/>)}</svg></div>;
}
function App() {
  const [animations, setAnimations] = useState(() => {
    try { return localStorage.getItem('focus-beat-motion') !== 'off'; } catch { return true; }
  });
  const [reducedMotion, setReducedMotion] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(preference.matches);
    preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);
  function toggleAnimation() {
    const next = !animations; setAnimations(next);
    try { localStorage.setItem('focus-beat-motion', next ? 'on' : 'off'); } catch {}
  }
  const motionEnabled = animations && !reducedMotion;
  const [durations, setDurations] = useState({ focus: 25, break: 5, long: 15 });
  const [mode, setMode] = useState('focus'); const [rounds, setRounds] = useState(0);
  const [remaining, setRemaining] = useState(1500); const [running, setRunning] = useState(false);
  const [volume, setVolume] = useState(.4); const [binauralLevel, setBinauralLevel] = useState(.35);
  const [beat, setBeat] = useState(10); const [muted, setMuted] = useState(false);
  const [tickEnabled, setTickEnabled] = useState(true); const [breakVolume, setBreakVolume] = useState(.25);
  const [trackId, setTrackId] = useState(0); const [shuffle, setShuffle] = useState(true);
  const [error, setError] = useState('');
  const deadline = useRef(0); const audio = useRef(new SessionAudio()); const queue = useRef([]);
  const position = useRef({ id: 0, seconds: 0 }); const onTrackEnd = useRef(null);
  const track = TRACKS[trackId]; const focus = mode === 'focus';
  function nextTrack() {
    const next = advanceTrack(trackId, queue.current, shuffle, TRACKS.length);
    queue.current = next.queue; setTrackId(next.id);
  }
  onTrackEnd.current = nextTrack;
  function selectTrack(id) { queue.current = []; setTrackId(id); }
  function switchTo(next) {
    if (next === 'focus' && !focus) nextTrack();
    setMode(next); setRemaining(durations[next] * 60);
    if (running) deadline.current = Date.now() + durations[next] * 60000;
  }
  function advance() { const next = nextSession(mode, rounds); setRounds(next.rounds); switchTo(next.mode); }
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const seconds = remainingSeconds(deadline.current, Date.now()); setRemaining(seconds);
      if (!seconds) advance();
    }, 200);
    return () => clearInterval(id);
  }, [running, mode, rounds, durations]);
  useEffect(() => {
    setError('');
    if (running && (focus ? !muted : tickEnabled)) {
      const offset = focus && position.current.id === trackId ? Math.min(position.current.seconds, track.duration - .1) : 0;
      audio.current.start(mode, volume, beat, binauralLevel, trackId, () => onTrackEnd.current(), offset, breakVolume)
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
  function toggle() { if (!running) deadline.current = Date.now() + remaining * 1000; setRunning(!running); }
  const progress = Math.max(0, Math.min(100, 100 * (1 - remaining / (durations[mode] * 60))));
  const rangeStyle = value => ({ '--fill': `${value * 100}%` });
  return <div className={motionEnabled ? 'app motion-on' : 'app motion-off'}><Atmosphere/><main>
    <header><div className="brand"><span className="logo"/>FOCUS BEAT</div><div className="header-tools"><span className="badge">YOUR TIME, IN TUNE</span><button className="motion-toggle" aria-pressed={motionEnabled} disabled={reducedMotion} title={reducedMotion ? 'Your system’s reduced-motion setting pauses animation' : 'Toggle ambient animation'} onClick={toggleAnimation}>Animation {motionEnabled ? 'on' : 'off'}</button></div></header>
    <section className="intro"><p className="eyebrow">A LITTLE RHYTHM. A LOT OF FOCUS.</p><h1>Find your flow.</h1><p>Make room for deep work. Take a break that’s yours.</p></section>
    <section className="timer glass">
      <svg className="panel-wave" viewBox="0 0 970 450" preserveAspectRatio="none" aria-hidden="true"><path d="M-10 350C160 300 146 145 346 230S592 281 739 165 841 62 980 67"/><path d="M-10 377C160 327 171 213 346 270S592 316 739 233 841 140 980 142"/></svg>
      <nav aria-label="Session type">{Object.entries(labels).map(([key,label]) => <button key={key} aria-pressed={mode === key} className={mode === key ? 'selected' : ''} onClick={() => switchTo(key)}>{label}</button>)}</nav>
      <p className="session-label">{running ? (focus ? 'FINDING YOUR FLOW' : 'TIME TO RECHARGE') : 'READY WHEN YOU ARE'}</p>
      <div className="clock" role="timer" aria-label={`${Math.floor(remaining / 60)} minutes ${remaining % 60} seconds`}>{String(Math.floor(remaining / 60)).padStart(2,'0')}<span>:</span>{String(remaining % 60).padStart(2,'0')}</div>
      <div className="progress"><div style={{width:progress+'%'}}/></div>
      <div className="controls"><button className="icon" aria-label="Reset session" onClick={() => {setRunning(false); setRemaining(durations[mode]*60);}}><Icon name="reset"/></button><button className="primary" onClick={toggle}>{running ? 'Pause session' : 'Start session'}<Icon name={running?'pause':'play'}/></button><button className="icon" aria-label="Skip to next session" onClick={advance}><Icon name="skip"/></button></div>
      <div className="rounds"><div aria-hidden="true">{[0,1,2,3].map(i => <span key={i} className={i<rounds%4?'done':''}/>)}</div><p>{rounds} focus {rounds===1?'session':'sessions'} completed · long break every 4</p></div>
    </section>
    <section className="settings">
      <div className="sound glass">
        <div className="setting-heading"><h2><Icon name="music"/>Your soundtrack</h2><button disabled={!focus} onClick={() => setMuted(!muted)}>{muted?'Unmute':'Mute'}</button></div>
        <p className="sound-description">{focus ? '30 focus tracks · binaural tones · stereo headphones' : (tickEnabled ? 'A soft clock tick · time for whatever you need' : 'Silent break · time for whatever you need')}</p>
        {focus ? <><div className={'playlist '+(!focus?'inactive':'')}>
          <label className="sr-only" htmlFor="track">Focus track</label>
          <select id="track" value={trackId} disabled={!focus} onChange={e=>selectTrack(Number(e.target.value))}>{TRACKS.map(t=><option key={t.id} value={t.id}>{String(t.id+1).padStart(2,'0')} · {t.title}</option>)}</select>
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
      <div className="lengths glass"><h2><Icon name="clock"/>Session lengths</h2><p>Set a pace that works for you.</p>{Object.entries(labels).map(([key,label])=><label className="duration" key={key}>{label}<span><input aria-label={`${label} minutes`} type="number" min="1" max="180" disabled={running} value={durations[key]} onChange={e=>{const value=Math.max(1,Math.min(180,Number(e.target.value)||1));setDurations({...durations,[key]:value});if(key===mode)setRemaining(value*60);}}/> min</span></label>)}<div className="quiet-note"><Icon name="leaf"/><div><h3>A little space to breathe.</h3><p>A soft tick keeps time during breaks. Stretch, step outside, or put on your own music.</p></div></div></div>
    </section>
    <footer><span>One session at a time.</span><div className="footer-star" aria-hidden="true">✦</div><span>Keep listening at a comfortable volume.</span></footer>
  </main></div>;
}
createRoot(document.getElementById('root')).render(<App/>);
