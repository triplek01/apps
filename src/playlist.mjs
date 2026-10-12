export function advanceTrack(current, queue, shuffle, count, random = Math.random) {
  if (!shuffle) return { id: (current + 1) % count, queue: [] };
  const remaining = queue.length ? [...queue] : Array.from({ length: count }, (_, i) => i).filter(i => i !== current);
  if (!queue.length) {
    for (let i = remaining.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1)); [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
    }
  }
  return { id: remaining.shift() ?? current, queue: remaining };
}
