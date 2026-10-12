import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { SessionAudio } from './audio';
import { nextSession, remainingSeconds } from './timer.mjs';
import './style.css';
const labels = { focus: 'Focus', break: 'Short break', long: 'Long break' };
function App() {
  const [durations, setDurations] = useState({ focus: 25, break: 5, long: 15 });
  const [mode, setMode] = useState('focus'); const [rounds, setRounds] = useState(0);
  const [remaining, setRemaining] = useState(1500); const [running, setRunning] = useState(false);
  const [volume, setVolume] = useState(.3); const [binauralLevel, setBinauralLevel] = useState(.35); const [beat, setBeat] = useState(10); const [muted, setMuted] = useState(false);
  const [error, setError] = useState(''); const deadline = useRef(0); const audio = useRef(new SessionAudio());
  function switchTo(next) { setMode(next); setRemaining(durations[next] * 60); if (running) deadline.current = Date.now() + durations[next] * 60000; }
  function advance() { const next = nextSession(mode, rounds); setRounds(next.rounds); switchTo(next.mode); }
  useEffect(() => {
    if (!running) return;
    const tick = () => { const seconds = remainingSeconds(deadline.current, Date.now()); setRemaining(seconds); if (!seconds) advance(); };
    const id = setInterval(tick, 200); return () => clearInterval(id);
  }, [running, mode, rounds, durations]);
  useEffect(() => {
    setError('');
    if (running && !muted) audio.current.start(mode, volume, beat, binauralLevel).catch(() => setError('Audio could not start. Pause and try again.'));
    else audio.current.stop();
    return () => audio.current.stop();
  }, [running, mode, muted, beat]);
  useEffect(() => { audio.current.setVolume(volume); }, [volume]);
  useEffect(() => { audio.current.setBinauralLevel(binauralLevel); }, [binauralLevel]);
  function toggle() { if (!running) deadline.current = Date.now() + remaining * 1000; setRunning(!running); }
  const progress = Math.max(0, Math.min(100, 100 * (1 - remaining / (durations[mode] * 60))));
  return <main>
    <header><div className="brand"><span className="logo">◉</span> FOCUS BEAT</div><span className="badge">YOUR TIME, IN TUNE</span></header>
    <section className="intro"><p className="eyebrow">A LITTLE RHYTHM. A LOT OF FOCUS.</p><h1>Find your flow.</h1><p>Make room for deep work. Take a break that moves you.</p></section>
    <section className={'timer ' + (mode !== 'focus' ? 'break-mode' : '')}>
      <nav aria-label="Session type">{Object.entries(labels).map(([key, label]) => <button key={key} className={mode === key ? 'selected' : ''} onClick={() => switchTo(key)}>{label}</button>)}</nav>
      <p className="session-label">{running ? 'IN SESSION' : 'READY WHEN YOU ARE'}</p>
      <div className="clock" role="timer" aria-label={`${Math.floor(remaining / 60)} minutes ${remaining % 60} seconds`}>{String(Math.floor(remaining / 60)).padStart(2, '0')}<span>:</span>{String(remaining % 60).padStart(2, '0')}</div>
      <div className="progress"><div style={{ width: progress + '%' }}/></div>
      <div className="controls"><button className="icon" aria-label="Reset session" onClick={() => { setRunning(false); setRemaining(durations[mode] * 60); }}>↺</button><button className="primary" onClick={toggle}>{running ? 'Pause session' : 'Start session'} <span>{running ? 'Ⅱ' : '▶'}</span></button><button className="icon" aria-label="Skip to next session" onClick={advance}>⇥</button></div>
      <div className="rounds">{[0,1,2,3].map(i => <span key={i} className={i < rounds % 4 ? 'done' : ''}/>)}<p>{rounds} focus sessions completed · long break every 4</p></div>
    </section>
    <section className="settings"><div className="sound"><div className="setting-heading"><h2>♪ Your soundtrack</h2><button onClick={() => setMuted(!muted)}>{muted ? 'Unmute' : 'Mute'}</button></div><p>{mode === 'focus' ? 'Ambient keys + binaural tones · use stereo headphones' : 'Upbeat instrumental · keys, bass & drums · 112 BPM'}</p><label>Volume <span>{Math.round(volume * 100)}%</span><input aria-label="Volume" type="range" min="0" max="1" step=".01" value={volume} onChange={e => setVolume(Number(e.target.value))}/></label><label>Binaural tone level <span>{Math.round(binauralLevel * 100)}%</span><input aria-label="Binaural tone level" type="range" min="0" max="1" step=".01" value={binauralLevel} onChange={e => setBinauralLevel(Number(e.target.value))}/></label><label>Focus beat frequency <select value={beat} onChange={e => setBeat(Number(e.target.value))}>{[4,6,10,14].map(v => <option key={v} value={v}>{v} Hz</option>)}</select></label>{error && <p role="alert">{error}</p>}</div><div><h2>Session lengths</h2><p>Set a pace that works for you.</p>{Object.entries(labels).map(([key,label]) => <label className="duration" key={key}>{label}<span><input aria-label={`${label} minutes`} type="number" min="1" max="180" disabled={running} value={durations[key]} onChange={e => { const value = Math.max(1, Math.min(180, Number(e.target.value) || 1)); setDurations({...durations,[key]:value}); if (key === mode) setRemaining(value * 60); }}/> min</span></label>)}</div></section>
    <footer>One session at a time. <span>Keep listening at a comfortable volume.</span></footer>
  </main>;
}
createRoot(document.getElementById('root')).render(<App/>);
