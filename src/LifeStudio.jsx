import React,{useState} from 'react';
import {BookOpen,Camera,ChevronLeft,ChevronRight,ImagePlus,Plus,Sparkles,Star,Trash2,UserRound,X,PawPrint,SlidersHorizontal,Heart} from 'lucide-react';
import {SKILL_CATALOG,TRAIT_CATALOG,ASPIRATIONS,CAREERS,OCCULTS,PET_SPECIES,EVENT_KINDS,STANDARD_TAGS} from './featureData';
import {arr,setSkill,addTag,makeEntry,makeField} from './featureModel';
import './life-studio.css';
const safe=(s,max=250)=>String(s||'').slice(0,max);

function SkillIcon({name}){const category=SKILL_CATALOG.find(s=>s.name===name)?.category||'Знания';const icons={'Творчество':<Camera size={14}/>, 'Активность':<Heart size={14}/>, 'Природа':<Sparkles size={14}/>, 'Знания':<BookOpen size={14}/>, 'Общение':<UserRound size={14}/>, 'Ремёсла':<SlidersHorizontal size={14}/>};return <span className={`skill-icon skill-icon-${category}`} title={category}>{icons[category]}</span>}
export function GameDataEditor({draft,people=[],onChange}){
  const [newSkill,setNewSkill]=useState('');const [tagText,setTagText]=useState('');
  const skills=arr(draft.skills),tags=arr(draft.tags);
  const values=(field,value)=>onChange(field,value);
  function chooseTrait(trait){const current=arr(draft.traitList).length?arr(draft.traitList):String(draft.traits||'').split(',').map(x=>x.trim()).filter(Boolean);const next=current.includes(trait)?current.filter(x=>x!==trait):[...current,trait];values('traitList',next);values('traits',next.join(', '));}
  return <div className="studio-section">
    <div className="studio-heading"><Star/><div><h3>Игровая история</h3><p>Навыки, стремления, черты, карьера и теги персонажа.</p></div></div>
    <div className="studio-grid-two">
      <label>Стремление<select value={draft.aspiration||''} onChange={e=>values('aspiration',e.target.value)}><option value="">Не выбрано</option>{[...new Set([...ASPIRATIONS,draft.aspiration].filter(Boolean))].map(x=><option key={x}>{x}</option>)}</select></label>
      <label>Карьера<select value={draft.career||''} onChange={e=>values('career',e.target.value)}><option value="">Не выбрано</option>{[...new Set([...CAREERS,draft.career].filter(Boolean))].map(x=><option key={x}>{x}</option>)}</select></label>
      <label>Сверхъестественный тип<select value={draft.occult||''} onChange={e=>values('occult',e.target.value)}><option value="">Не указан</option>{[...new Set([...OCCULTS,draft.occult].filter(Boolean))].map(x=><option key={x}>{x}</option>)}</select></label>
      <label>Тип персонажа<select value={draft.kind||'sim'} onChange={e=>values('kind',e.target.value)}><option value="sim">Сим</option><option value="pet">Питомец</option></select></label>
      {draft.kind==='pet'&&<><label>Вид питомца<select value={draft.species||'Кошка'} onChange={e=>values('species',e.target.value)}>{PET_SPECIES.map(x=><option key={x}>{x}</option>)}</select></label><label>Хозяин<select value={draft.ownerId||''} onChange={e=>values('ownerId',e.target.value)}><option value="">Не выбран</option>{people.filter(p=>p.kind!=='pet'&&p.id!==draft.id).map(p=><option value={p.id} key={p.id}>{p.name}</option>)}</select></label></>}
    </div>
    <div className="studio-subheading"><span>Черты характера</span><small>Выбирай несколько или введи свои</small></div>
    <div className="studio-pills">{TRAIT_CATALOG.map(t=><button key={t} type="button" className={`studio-pill ${(arr(draft.traitList).length?arr(draft.traitList):String(draft.traits||'').split(',').map(s=>s.trim())).includes(t)?'chosen':''}`} onClick={()=>chooseTrait(t)}>{t}</button>)}</div>
    <label>Дополнительные черты<input value={draft.traits||''} onChange={e=>{values('traits',e.target.value);values('traitList',e.target.value.split(',').map(x=>x.trim()).filter(Boolean));}} placeholder="Например, романтик, гурман…"/></label>
    <div className="studio-subheading"><span>Навыки</span><small>Ползунок от 1 до 10 · значения сохраняются</small></div>
    <div className="skill-list">{skills.map(({name,level})=><div className="skill-row" key={name}><div className="skill-name"><SkillIcon name={name}/>{name}</div><input aria-label={`Уровень навыка ${name}`} type="range" min="0" max="10" value={level} onChange={e=>values('skills',setSkill(skills,name,e.target.value))}/><b>{level}<small>/10</small></b><button type="button" title="Удалить навык" onClick={()=>values('skills',setSkill(skills,name,0))}><X size={13}/></button></div>)}</div>
    <div className="studio-add-row"><select value={newSkill} onChange={e=>setNewSkill(e.target.value)}><option value="">Добавить навык…</option>{SKILL_CATALOG.filter(s=>!skills.some(p=>p.name===s.name)).map(s=><option key={s.name} value={s.name}>{s.category}: {s.name}</option>)}</select><button type="button" className="studio-add-btn" disabled={!newSkill} onClick={()=>{values('skills',setSkill(skills,newSkill,1));setNewSkill('')}}><Plus size={15}/> Добавить</button></div>
    <div className="studio-subheading"><span>Теги и фильтры</span><small>Используются в поиске по династии</small></div>
    <div className="studio-pills">{tags.map(t=><button type="button" className="studio-pill chosen" key={t} onClick={()=>values('tags',tags.filter(x=>x!==t))}>{t} <X size={12}/></button>)}{STANDARD_TAGS.filter(t=>!tags.includes(t)).slice(0,9).map(t=><button type="button" className="studio-pill" key={t} onClick={()=>values('tags',addTag(tags,t))}><Plus size={11}/>{t}</button>)}</div>
    <div className="studio-add-row"><input maxLength={48} placeholder="Свой тег…" value={tagText} onChange={e=>setTagText(e.target.value)}/><button type="button" className="studio-add-btn" onClick={()=>{values('tags',addTag(tags,tagText));setTagText('')}} disabled={!tagText.trim()}><Plus size={15}/> Тег</button></div>
  </div>;
}
export function JournalEditor({entries=[],onChange,onImage,editable=true}){
  const [busy,setBusy]=useState(false);const list=arr(entries);
  function update(id,patch){onChange(list.map(e=>e.id===id?{...e,...patch}:e))}
  return <div className="studio-section"><div className="studio-heading"><BookOpen/><div><h3>Дневник жизни</h3><p>Любовь, свадьбы, рождения, достижения и фотографии важных моментов.</p></div></div>
    {editable&&<button type="button" className="studio-add-btn studio-primary" onClick={()=>onChange([...list,makeEntry({title:'Новое воспоминание'})])}><Plus size={16}/> Добавить событие</button>}
    {list.length? <div className="journal-list">{[...list].map((ev,i)=><article className="journal-entry" key={ev.id||i}><span className="journal-pin"/><div className="journal-entry-content">
      {editable?<><div className="studio-grid-two"><label>Событие<select value={ev.kind||'memory'} onChange={e=>update(ev.id,{kind:e.target.value})}>{EVENT_KINDS.map(([id,title])=><option key={id} value={id}>{title}</option>)}</select></label><label>Дата / игровой день<input maxLength={65} value={ev.date||''} onChange={e=>update(ev.id,{date:safe(e.target.value,65)})} placeholder="Лето, год 3"/></label></div><input aria-label="Заголовок события" maxLength={120} value={ev.title||''} onChange={e=>update(ev.id,{title:safe(e.target.value,120)})} placeholder="Название события"/><textarea maxLength={3000} rows={3} value={ev.text||''} onChange={e=>update(ev.id,{text:safe(e.target.value,3000)})} placeholder="Что произошло?"/>
      <div className="journal-actions"><label className="studio-file-button"><Camera size={15}/>{busy?'Загружается…':ev.photo?'Заменить фото':'Прикрепить фото'}<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={async e=>{const f=e.target.files?.[0];if(!f)return;setBusy(true);try{update(ev.id,{photo:await onImage(f)})}catch(err){alert(err.message)}finally{setBusy(false)}}}/></label><label className="studio-check"><input type="checkbox" checked={ev.visibility!=='private'} onChange={e=>update(ev.id,{visibility:e.target.checked?'public':'private'})}/> Видно в публичном древе</label><button type="button" title="Удалить событие" onClick={()=>onChange(list.filter(x=>x.id!==ev.id))}><Trash2 size={16}/></button></div>
      </>:<><small>{EVENT_KINDS.find(([id])=>id===ev.kind)?.[1]||'Воспоминание'} {ev.date&&`· ${ev.date}`}</small><h4>{ev.title}</h4><p>{ev.text}</p></>}
      {ev.photo&&<img className="journal-photo" src={ev.photo} alt={ev.title||'Снимок события'}/>}</div></article>)}</div>:<div className="studio-empty">В дневнике ещё нет событий. Добавьте первую историю персонажа.</div>}
  </div>;
}
export function CustomFieldsEditor({fields=[],onChange}){
 const list=arr(fields);
 return <div className="studio-section"><div className="studio-heading"><SlidersHorizontal/><div><h3>Свои поля персонажа</h3><p>Например, любимое блюдо, тайна, характер, профессия — что угодно.</p></div></div>
 {list.map((f,i)=><div className="studio-custom-row" key={f.id||i}><input aria-label="Название поля" maxLength={70} placeholder="Название" value={f.label||''} onChange={e=>onChange(list.map(v=>v.id===f.id?{...v,label:e.target.value}:v))}/><input aria-label="Значение поля" maxLength={300} placeholder="Значение" value={f.value||''} onChange={e=>onChange(list.map(v=>v.id===f.id?{...v,value:e.target.value}:v))}/><label title="Публично"><input type="checkbox" checked={f.visibility!=='private'} onChange={e=>onChange(list.map(v=>v.id===f.id?{...v,visibility:e.target.checked?'public':'private'}:v))}/> Публично</label><button type="button" onClick={()=>onChange(list.filter(v=>v.id!==f.id))} aria-label="Удалить поле"><Trash2 size={16}/></button></div>)}
 <button type="button" className="studio-add-btn studio-primary" onClick={()=>onChange([...list,makeField()])}><Plus size={15}/> Добавить поле</button></div>;
}
export function ExtraViewer({person,people=[],onImage}){
 const skills=arr(person.skills),tags=arr(person.tags),events=arr(person.timeline),fields=arr(person.customFields);
 return <div className="studio-viewer">{person.kind==='pet'&&<div className="studio-petflag"><PawPrint size={16}/>{person.species||'Питомец'} {person.ownerId&&`· хозяин: ${people.find(p=>p.id===person.ownerId)?.name||'неизвестен'}`}</div>}
 {person.aspiration&&<div className="studio-viewer-highlight"><Sparkles size={17}/> <span><b>Стремление</b> {person.aspiration}</span></div>}
 {skills.length>0&&<><h3>Навыки</h3>{skills.map(s=><div className="viewer-skill" key={s.name}><span>{s.name}</span><div className="viewer-skill-track"><div style={{width:`${s.level*10}%`}}/></div><b>{s.level}</b></div>)}</>}
 {tags.length>0&&<><h3>Теги</h3><div className="studio-pills">{tags.map(t=><span key={t} className="studio-pill chosen">{t}</span>)}</div></>}
 {fields.length>0&&<><h3>Особенности</h3>{fields.map((f,i)=><div className="studio-viewer-field" key={f.id||i}><b>{f.label}</b><span>{f.value}</span></div>)}</>}
 {events.length>0&&<><h3>История жизни</h3><JournalEditor editable={false} entries={events}/></>}
 </div>;
}
export function FamilyBook({tree,onClose,onOpenPerson}){
 const levels=[...new Set((tree.people||[]).map(p=>Number(p.gen)||1))].sort((a,b)=>a-b);
 const [index,setIndex]=useState(0),[slide,setSlide]=useState(false);
 const gen=levels[index]||1,people=tree.people.filter(p=>(Number(p.gen)||1)===gen);
 function turn(delta){setSlide(true);setTimeout(()=>{setIndex(v=>Math.max(0,Math.min(levels.length-1,v+delta)));setSlide(false)},150)}
 return <div className="book-modal"><div className="book-toolbar"><div><span>SIMLEGACY / КНИГА ПОКОЛЕНИЙ</span><h2>{tree.title}</h2></div><button className="book-close" onClick={onClose}><X/></button></div><div className={`book-page ${slide?'turning':''}`}><div className="book-page-cover" style={tree.cover?{backgroundImage:`linear-gradient(45deg,#102319c9,#193b2c88),url(${tree.cover})`}:undefined}><BookOpen size={32}/><h3>Глава {gen}</h3><p>История {people.length} персонажей этого поколения</p></div><div className="book-page-content"><div className="book-person-grid">{people.map(p=><button key={p.id} onClick={()=>onOpenPerson(p)}><div className="book-photo">{p.photo?<img src={p.photo} alt={p.name}/>:<UserRound/>}</div><b>{p.name}</b><small>{p.role||p.life||'Персонаж'}</small></button>)}</div><h4>Моменты поколения</h4><div className="book-memories">{people.flatMap(p=>arr(p.timeline).map(ev=>({...ev,owner:p.name}))).slice(0,8).map((ev,i)=><div key={ev.id||i}>{ev.photo&&<img className="book-event-thumb" src={ev.photo} alt=""/>}<b>{ev.title}</b><small>{ev.date||ev.owner}</small></div>)}{!people.some(p=>arr(p.timeline).length>0)&&<p>В этом поколении пока нет записей дневника.</p>}</div></div></div><div className="book-footer"><button onClick={()=>turn(-1)} disabled={index===0}><ChevronLeft size={17}/> Назад</button><span>{index+1} / {levels.length||1}</span><button onClick={()=>turn(1)} disabled={index>=levels.length-1}>Дальше <ChevronRight size={17}/></button></div></div>;
}

export function PetCreator({people=[],onSave,onImage,onClose}){
 const [name,setName]=useState(''),[species,setSpecies]=useState('Кошка'),[ownerId,setOwnerId]=useState(''),[photo,setPhoto]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
 async function save(e){e.preventDefault();setBusy(true);try{await onSave({name:name.trim(),kind:'pet',species,ownerId,gender:'',life:'Взрослый',role:'Питомец',photo,status:'alive',gen:Math.max(1,people.find(p=>p.id===ownerId)?.gen||1),parents:[],relations:[]})}catch(e){setError(e.message)}finally{setBusy(false)}}
 return <div className="pet-creator"><div className="studio-heading"><PawPrint/><div><h3>Новый питомец</h3><p>Четвероногие тоже часть семейной истории.</p></div></div><form className="form" onSubmit={save}><div className="pet-kind-tiles">{PET_SPECIES.map(s=><button type="button" className={species===s?'selected':''} key={s} onClick={()=>setSpecies(s)}><PawPrint size={22}/><b>{s}</b></button>)}</div><label>Имя питомца<input required maxLength={80} value={name} onChange={e=>setName(e.target.value)} placeholder="Например, Барсик"/></label><label>Хозяин<select value={ownerId} onChange={e=>setOwnerId(e.target.value)}><option value="">Пока неизвестен</option>{people.filter(p=>p.kind!=='pet').map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label><label className="studio-file-button pet-photo-upload"><ImagePlus size={17}/>{photo?'Фотография загружена':'Загрузить фотографию'}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={async e=>{const f=e.target.files?.[0];if(!f)return;try{setPhoto(await onImage(f))}catch(err){setError(err.message)}}}/></label>{photo&&<img className="pet-photo-preview" src={photo} alt="Фото питомца"/>}{error&&<p className="form-message">{error}</p>}<div className="modal-bottom"><button type="button" className="btn btn-outline" onClick={onClose}>Отмена</button><button className="btn btn-green" disabled={busy}>Добавить питомца</button></div></form></div>;
}
