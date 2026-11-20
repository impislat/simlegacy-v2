export const RELATION_TYPES=[
 {group:'Семья',items:[['parent','Родитель'],['child','Сын / дочь'],['sibling','Брат / сестра'],['halfSibling','Единокровный / единоутробный брат или сестра'],['stepSibling','Сводный брат / сестра'],['grandparent','Дедушка / бабушка'],['grandchild','Внук / внучка'],['uncle','Дядя / тётя'],['nibling','Племянник / племянница'],['cousin','Двоюродный родственник'],['adoptiveParent','Приёмный родитель'],['adoptiveChild','Приёмный ребёнок'],['stepparent','Отчим / мачеха'],['stepchild','Пасынок / падчерица']]},
 {group:'Романтика',items:[['spouse','Муж / жена'],['partner','Парень / девушка'],['fiance','Жених / невеста'],['exSpouse','Бывший муж / бывшая жена'],['exPartner','Бывший партнёр']]}
];
export const LABELS=Object.fromEntries(RELATION_TYPES.flatMap(g=>g.items));
export const INVERSE={parent:'child',child:'parent',sibling:'sibling',halfSibling:'halfSibling',stepSibling:'stepSibling',grandparent:'grandchild',grandchild:'grandparent',uncle:'nibling',nibling:'uncle',cousin:'cousin',adoptiveParent:'adoptiveChild',adoptiveChild:'adoptiveParent',stepparent:'stepchild',stepchild:'stepparent',spouse:'spouse',partner:'partner',fiance:'fiance',exSpouse:'exSpouse',exPartner:'exPartner'};
export const ROMANCE=new Set(['spouse','partner','fiance','exSpouse','exPartner']);
const uid=()=>crypto.randomUUID();
export function setRelation(people,a,b,type){
 if(!a||!b||a===b||!INVERSE[type])throw Error('Выберите двух разных симов и тип связи');
 if(!people.some(p=>p.id===a)||!people.some(p=>p.id===b))throw Error('Персонаж не найден');
 const ancestor=(id,target,seen=new Set())=>{if(id===target)return true;if(seen.has(id))return false;seen.add(id);return (people.find(p=>p.id===id)?.parents||[]).some(x=>ancestor(x,target,seen))};
 if(['parent','child','adoptiveParent','adoptiveChild'].includes(type)){
   const parent=['parent','adoptiveParent'].includes(type)?a:b, child=parent===a?b:a;
   if(ancestor(parent,child))throw Error('Такая связь создаст цикл поколений');
   const current=people.find(p=>p.id===child)?.parents||[];
   if(parent!==child&&!current.includes(parent)&&current.length>=2)throw Error('В редакторе предусмотрено не более двух родителей');
 }
 if(ROMANCE.has(type)&&((people.find(p=>p.id===a)?.parents||[]).includes(b)||(people.find(p=>p.id===b)?.parents||[]).includes(a)))throw Error('Родитель и ребёнок не могут быть партнёрами');
 const changed=people.map(p=>({...p,parents:[...(p.parents||[])],relations:[...(p.relations||[])]}));
 const x=changed.find(p=>p.id===a),y=changed.find(p=>p.id===b);
 // Remove prior direct relationship between these two; retains their parent-child links unless this is a parent-type change.
 x.relations=x.relations.filter(r=>r.to!==b);y.relations=y.relations.filter(r=>r.to!==a);
 const parentType=['parent','child','adoptiveParent','adoptiveChild'].includes(type);
 if(parentType){const par=['parent','adoptiveParent'].includes(type)?x:y, kid=par===x?y:x;kid.parents=[...new Set([...kid.parents,par.id])];}
 else if(ROMANCE.has(type)){
  x.partner=type==='partner'||type==='spouse'||type==='fiance'?b:'';
  y.partner=type==='partner'||type==='spouse'||type==='fiance'?a:'';
 }
 x.relations.push({id:uid(),to:b,type});y.relations.push({id:uid(),to:a,type:INVERSE[type]});
 return changed;
}
export function removeRelation(people,a,b){return people.map(p=>{
  if(p.id!==a&&p.id!==b)return p;
  const other=p.id===a?b:a;
  const otherParent=(p.parents||[]).includes(other);
  return {...p,parents:otherParent?(p.parents||[]).filter(id=>id!==other):p.parents||[],partner:p.partner===other?'':p.partner,relations:(p.relations||[]).filter(r=>r.to!==other)};
})}
export function getRelations(person,people){if(!person)return[];const all=new Map();const add=(to,type,source='explicit')=>{if(!to||to===person.id||!people.some(p=>p.id===to))return;const k=to+':'+type;if(!all.has(k))all.set(k,{to,type,source})};
 for(const r of person.relations||[])add(r.to,r.type);
 for(const id of person.parents||[])if(!(person.relations||[]).some(r=>r.to===id))add(id,'parent');
 for(const p of people){if((p.parents||[]).includes(person.id)&&!(person.relations||[]).some(r=>r.to===p.id))add(p.id,'child');}
 if(person.partner&&!(person.relations||[]).some(r=>r.to===person.partner))add(person.partner,'partner');
 const parents=person.parents||[];
 for(const p of people){if(p.id===person.id)continue;const shared=parents.filter(id=>(p.parents||[]).includes(id));if(shared.length&&!(person.relations||[]).some(r=>r.to===p.id))add(p.id,shared.length>=2?'sibling':'halfSibling','inferred');}
 for(const p of people){if(p.id===person.id)continue;const otherParents=p.parents||[];if(otherParents.some(id=>parents.some(my=>people.find(q=>q.id===my)?.parents?.includes(id)))&&!all.has(p.id+':sibling')){ /* extended cousin inference omitted to avoid false positives */ }}
 return [...all.values()].map(r=>({...r,person:people.find(p=>p.id===r.to)}));}
