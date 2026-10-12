import {TRACKS} from './music.mjs';
export const LAYERS = ['rain', 'thunder', 'vinyl', 'brown', 'cafe'];
export const DEFAULT_SETTINGS = {
  durations: { focus: 25, break: 5, long: 15 }, volume: .4, binauralLevel: .35,
  beat: 10, trackId: 0, shuffle: true, tickEnabled: true, breakVolume: .25,
  layers: { rain: 0, thunder: 0, vinyl: 0, brown: 0, cafe: 0 },
  activity: 'work', autoBreaks: true, animationMode:'system', animations: true, breakActivity: 'free', reactive: true, theme: 'twilight', showRewards: true, goalDraft: '', activeMix: 'Custom mix', mood: 'steady',
};
const number = (v, fallback, min, max) => typeof v === 'number' && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback;
const text = (v, limit = 200) => typeof v === 'string' ? v.slice(0, limit) : '';
const bool = (v, fallback) => typeof v === 'boolean' ? v : fallback;
export function cleanMix(raw = {}) {
  return { volume: number(raw.volume, .4, 0, 1), binauralLevel: number(raw.binauralLevel, .35, 0, 1),
    beat: [4,6,10,14].includes(raw.beat) ? raw.beat : 10,
    trackId: Math.round(number(raw.trackId, 0, 0, TRACKS.length-1)),
    layers: Object.fromEntries(LAYERS.map(name => [name, number(raw.layers?.[name], 0, 0, 1)])) };
}
export function cleanData(raw) {
  if (!raw || ![1,2].includes(raw.schemaVersion)) throw new Error('This is not a supported Focus Beat backup.');
  const s = raw.settings ?? {};
  const settings = { ...DEFAULT_SETTINGS, ...cleanMix(s),
    durations: Object.fromEntries(Object.entries(DEFAULT_SETTINGS.durations).map(([key,value]) => [key, Math.round(number(s.durations?.[key], value, 1, 180))])),
    shuffle: bool(s.shuffle, true), tickEnabled: bool(s.tickEnabled, true), breakVolume: number(s.breakVolume, .25, 0, 1),
    activity:['study','work','chores','creative'].includes(s.activity)?s.activity:'work',autoBreaks:bool(s.autoBreaks,true),animationMode:['system','on','off'].includes(s.animationMode)?s.animationMode:(s.animations===false?'off':'system'),animations: bool(s.animations,true), breakActivity: ['free','breathe','stretch','eyes','move'].includes(s.breakActivity)?s.breakActivity:'free', reactive: bool(s.reactive, true), showRewards: bool(s.showRewards, true),
    theme: ['twilight','ocean','sunrise','study','work','chores','creative'].includes(s.theme) ? s.theme : 'twilight', goalDraft: text(s.goalDraft), activeMix: text(s.activeMix,60)||'Custom mix', mood: text(s.mood,60)||'steady',
  };
  const presets = Array.isArray(raw.presets) ? raw.presets.filter(p => p && typeof p.id === 'string' && text(p.name, 60).trim()).map(p => ({id: text(p.id, 80), name: text(p.name, 60).trim(), mix: cleanMix(p.mix)})) : [];
  const sessions = Array.isArray(raw.sessions) ? raw.sessions.filter(s => s && typeof s.id === 'string' && Number.isFinite(s.startedAt) && Number.isFinite(s.endedAt) && s.startedAt > 0 && s.endedAt >= s.startedAt && ['completed','skipped','reset','switched'].includes(s.status)).map(s => ({
    id: text(s.id,80), startedAt: s.startedAt, endedAt: s.endedAt,
    seconds: Math.round(number(s.seconds,0,0,10800)), plannedMinutes: Math.round(number(s.plannedMinutes,25,1,180)), status: s.status, activity:['study','work','chores','creative'].includes(s.activity)?s.activity:null,
    goal: text(s.goal), outcome: ['done','progress','not_done'].includes(s.outcome) ? s.outcome : null,
    trackTitle: text(s.trackTitle,80), mixName: text(s.mixName,60), mood: text(s.mood,60),
  })) : [];
  const profiles=Object.fromEntries(['study','work','chores','creative'].filter(id=>raw.profiles?.[id]&&typeof raw.profiles[id]==='object').map(id=>[id,cleanData({schemaVersion:1,settings:raw.profiles[id]}).settings]));
  const tasks=Array.isArray(raw.tasks)?raw.tasks.filter(t=>t&&typeof t.id==='string'&&text(t.title).trim()&&['study','work','chores','creative'].includes(t.activity)).map(t=>({id:text(t.id,80),title:text(t.title).trim(),done:bool(t.done,false),activity:t.activity})):settings.goalDraft.trim()?[{id:'legacy-goal',title:settings.goalDraft.trim(),done:false,activity:settings.activity}]:[];
  return { schemaVersion: 2, settings, presets, sessions, profiles, tasks };
}
export const emptyData = () => cleanData({schemaVersion:1});
export async function loadData() {
  try {
    const raw = window.focusBeatStorage ? await window.focusBeatStorage.read() : JSON.parse(localStorage.getItem('focus-beat-data-v1') || 'null');
    const data=raw?cleanData(raw):emptyData(); if(!raw&&localStorage.getItem('focus-beat-motion')==='off')data.settings.animations=false;
    return { data, blocked: false, error: '' };
  } catch {
    return { data: emptyData(), blocked: true, error: 'Saved data could not be read. It has been preserved. Restore a backup to resume saving.' };
  }
}
export async function saveData(data) {
  if (window.focusBeatStorage) await window.focusBeatStorage.write(data);
  else localStorage.setItem('focus-beat-data-v1', JSON.stringify(data));
}
