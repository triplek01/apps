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

export function advanceInPool(current,queue,shuffle,pool,random=Math.random){
 const index=pool.indexOf(current);const mapped=queue.filter(id=>pool.includes(id)&&id!==current).map(id=>pool.indexOf(id));
 if(index<0&&!shuffle)return {id:pool[0],queue:[]};
 const next=advanceTrack(index<0?pool.length:index,mapped,shuffle,index<0?pool.length+1:pool.length,random);
 return {id:pool[next.id],queue:next.queue.map(i=>pool[i])};
}
