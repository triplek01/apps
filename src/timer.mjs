export function nextSession(mode, rounds) {
  if (mode !== 'focus') return { mode: 'focus', rounds };
  const completed = rounds + 1;
  return { mode: completed % 4 === 0 ? 'long' : 'break', rounds: completed };
}
export function remainingSeconds(deadline, now) { return Math.max(0, Math.ceil((deadline - now) / 1000)); }
