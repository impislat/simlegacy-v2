/** Pure layout helpers for the Sims family tree; no React or browser dependencies. */
const number = (v, fallback=0) => Number.isFinite(Number(v)) ? Number(v) : fallback;
const ids = arr => Array.isArray(arr) ? arr : [];
export const NODE_WIDTH = 186;
export const NODE_HEIGHT = 174;

export function autoArrangeTree(people, options={}) {
  if(!Array.isArray(people) || !people.length) return [];
  const xGap=number(options.xGap,95),yGap=number(options.yGap,155);
  const byId=new Map(people.map(p=>[p.id,p]));
  const level=new Map(people.map(p=>[p.id,Math.max(1,number(p.gen,1))]));
  // Respect ancestor ordering without assuming all people have complete parent records.
  for(let pass=0;pass<people.length;pass++) {
    let changed=false;
    for(const p of people) {
      const parentLevels=ids(p.parents).filter(x=>byId.has(x)).map(x=>level.get(x));
      if(!parentLevels.length)continue;
      const next=Math.min(99,Math.max(level.get(p.id),...parentLevels.map(v=>v+1)));
      if(next!==level.get(p.id)){level.set(p.id,next);changed=true;}
    }
    if(!changed)break;
  }
  const rows=new Map();
  for(const p of people){const l=level.get(p.id);if(!rows.has(l))rows.set(l,[]);rows.get(l).push(p);}
  const sorted=[...rows.keys()].sort((a,b)=>a-b);
  const result=new Map();
  const step=NODE_WIDTH+xGap;
  for(const l of sorted){
    const row=rows.get(l);
    const weight=p=>{
      const parents=ids(p.parents).map(id=>result.get(id)).filter(Boolean);
      if(parents.length)return parents.reduce((v,q)=>v+q.x,0)/parents.length;
      const owner=result.get(p.ownerId);if(owner)return owner.x+step*.5;
      return number(p.x,0);
    };
    row.sort((a,b)=>weight(a)-weight(b)||String(a.name||'').localeCompare(String(b.name||''),'ru'));
    // Group partner cards next to each other where their generations match.
    for(let i=0;i<row.length;i++){
      const partner=row[i].partner || ids(row[i].relations).find(r=>['spouse','partner','fiance'].includes(r.type))?.to;
      if(!partner)continue;
      const j=row.findIndex(q=>q.id===partner);
      if(j>i+1){const [item]=row.splice(j,1);row.splice(i+1,0,item);}
    }
    const minX=90;
    const width=(row.length-1)*step;
    const origin=Math.max(minX,480-width/2);
    row.forEach((p,i)=>result.set(p.id,{...p,x:Math.round(origin+i*step),y:Math.round(95+(l-1)*(NODE_HEIGHT+yGap)),gen:l}));
  }
  return people.map(p=>result.get(p.id)||p);
}

export function descendantIds(people,rootId){
  const descendants=new Set(), frontier=[rootId];
  while(frontier.length){const current=frontier.shift();for(const p of people){if(ids(p.parents).includes(current)&&!descendants.has(p.id)&&p.id!==rootId){descendants.add(p.id);frontier.push(p.id)}}}
  return descendants;
}
export function visibleTreePeople(people,collapsedIds=[]){
  const hidden=new Set();
  for(const id of collapsedIds)for(const child of descendantIds(people,id))hidden.add(child);
  return people.filter(p=>!hidden.has(p.id));
}
export function treeGenerationStats(people){
  const generations=new Map();for(const p of people)generations.set(p.gen,(generations.get(p.gen)||0)+1);
  return [...generations.entries()].sort((a,b)=>a[0]-b[0]).map(([generation,count])=>({generation,count}));
}
