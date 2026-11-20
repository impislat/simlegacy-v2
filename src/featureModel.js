export const arr=v=>Array.isArray(v)?v:[];
const uuid=()=>globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`;
export function makeEntry(data={}){return {id:uuid(),title:String(data.title||'Новое событие'),kind:String(data.kind||'memory'),date:String(data.date||''),text:String(data.text||''),photo:String(data.photo||''),visibility:data.visibility==='private'?'private':'public'};}
export function makeField(label='',value='',visibility='public'){return{id:uuid(),label,value,visibility};}
export function setSkill(peopleSkills,name,level){const current=arr(peopleSkills).filter(x=>x.name!==name);const n=Math.max(0,Math.min(10,Math.floor(Number(level)||0)));return n?[...current,{name,level:n}].sort((a,b)=>a.name.localeCompare(b.name,'ru')):current;}
export function addTag(tags,text){const value=String(text||'').trim().slice(0,48);return value?[...new Set([...arr(tags),value])]:arr(tags)}
// The public snapshot is a separate storage entity. Never expose the private tree row via RLS.
export function sanitizePublicTree(tree){
  const publicPhotos=photos=>arr(photos).filter(p=>p&&p.visibility!=='private').map(({id,src,caption,folder,visibility})=>({id,src,caption,folder,visibility:'public'}));
  return {
    id:tree.id,title:tree.title,description:tree.description||'',cover:arr(tree.gallery).some(x=>x.src===tree.cover&&x.visibility==='private')?'':(tree.cover||''),
    backgroundEnabled:!!tree.backgroundEnabled,style:tree.style||{},heirId:tree.heirId||null,
    gallery:publicPhotos(tree.gallery),created_at:tree.created_at||null,updated_at:new Date().toISOString(),
    people:arr(tree.people).map(p=>{
      const {notes,privateNotes,owner_id,email,sharedSimId,crossTreeLinks,...rest}=p;
      const photo=arr(p.gallery).some(f=>f.src===p.photo&&f.visibility==='private')?'':(p.photo||'');return {...rest,photo,gallery:publicPhotos(p.gallery),timeline:arr(p.timeline).filter(ev=>ev.visibility!=='private'),customFields:arr(p.customFields).filter(f=>f.visibility!=='private')};
    })
  };
}
export const SHARED_FIELDS=['name','firstName','lastName','photo','gallery','bio','traits','status','life','deathCause','deathDetails','birthDate','deathDate','career','aspiration','occult','residence','skills','timeline','customFields','tags','gender','kind','species'];
export function cloneSharedCharacter(person){
  const fields=Object.fromEntries(SHARED_FIELDS.filter(x=>person[x]!==undefined).map(key=>[key,structuredClone(person[key])]));
  return {...fields,id:uuid(),sharedSimId:person.sharedSimId||person.id,parents:[],partner:'',relations:[],gen:1,x:120,y:100};
}
export function syncSharedPerson(people,source){return arr(people).map(p=>p.sharedSimId&&source.sharedSimId&&p.sharedSimId===source.sharedSimId?{...p,...Object.fromEntries(SHARED_FIELDS.filter(k=>source[k]!==undefined).map(k=>[k,structuredClone(source[k])]))}:p)}
