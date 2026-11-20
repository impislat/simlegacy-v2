import React,{useEffect,useRef,useState} from 'react';
import {ArrowLeft,ArrowRight,Camera,Check,Heart,ImagePlus,Mars,Plus,ShieldCheck,Sparkles,Upload,Venus,X} from 'lucide-react';
import './wizard.css';
import {simName,validateWizardStep,buildSimFromWizard} from './simWizardModel';

const LIFE_STAGES=['Новорождённый','Младенец','Малыш','Ребёнок','Подросток','Молодой взрослый','Взрослый','Пожилой','Умерший'];
const TITLES=['Кого мы добавляем?','Как зовут вашего сима?','Расскажите о персонаже','Почти готово!'];
const DESCRIPTIONS=['Начнём с самого важного — создадим нового героя вашей династии.','У каждой легенды есть имя. Как будут звать вашего персонажа?','Возраст, поколение и роль в семье можно будет изменить в любой момент.','Добавьте фотографию из The Sims 4 и взгляните на будущую карточку.'];

export default function SimCreationWizard({people=[],onSave,onImage,onCancel}){
  const [step,setStep]=useState(0);
  const [phase,setPhase]=useState('still');
  const [gender,setGender]=useState('');
  const [first,setFirst]=useState('');
  const [last,setLast]=useState('');
  const [life,setLife]=useState('Молодой взрослый');
  const [gen,setGen]=useState(()=>people.length?Math.max(1,...people.map(p=>Number(p.gen)||1)):1);
  const [role,setRole]=useState(()=>people.length?'':'Основатель');
  const [photo,setPhoto]=useState('');
  const [bio,setBio]=useState('');
  const [saving,setSaving]=useState(false);
  const [photoBusy,setPhotoBusy]=useState(false);
  const [error,setError]=useState('');
  const lock=useRef(false);
  const timers=useRef([]);
  useEffect(()=>()=>timers.current.forEach(clearTimeout),[]);
  useEffect(()=>{const handle=e=>{if(e.key==='Escape')onCancel()};window.addEventListener('keydown',handle);return()=>window.removeEventListener('keydown',handle)},[onCancel]);
  const later=(cb,ms)=>timers.current.push(setTimeout(cb,ms));
  function slide(next){
    if(lock.current||next<0||next>3)return;
    lock.current=true;
    setError('');
    const direction=next>step?'next':'prev';
    setPhase('leave-'+direction);
    later(()=>{
      setStep(next);
      setPhase('enter-'+direction);
      later(()=>{setPhase('still');lock.current=false},360);
    },270);
  }
  function pickGender(value){if(lock.current)return;setGender(value);slide(1)}
  function advance(){
    if(lock.current||saving||photoBusy)return;
    const issue=validateWizardStep(step,{gender,first,last});
    if(issue){setError(issue);return}
    if(step<3)slide(step+1);else submit();
  }
  async function upload(file){
    if(!file)return;
    setError('');setPhotoBusy(true);
    try{setPhoto(await onImage(file))}
    catch(e){setError(e?.message||'Не удалось загрузить фотографию')}
    finally{setPhotoBusy(false)}
  }
  async function submit(){
    if(saving||photoBusy)return;
    setSaving(true);setError('');
    try{
      await onSave(buildSimFromWizard({gender,first,last,life,gen,role,photo,bio}));
    }catch(e){setError(e?.message||'Не удалось добавить персонажа');setSaving(false)}
  }
  const shownName=simName(first,last)||'Новый персонаж';
  return <div className="sim-wizard" role="region" aria-label="Создание персонажа">
    <div className="wizard-topline">
      <div className="wizard-kicker"><span className="wizard-kicker-symbol"><Sparkles size={15}/></span> SIMLEGACY <span className="wizard-kicker-divider"/> СОЗДАНИЕ ПЕРСОНАЖА</div>
      <div className="wizard-step-label">ШАГ <b>{String(step+1).padStart(2,'0')}</b><span> / 04</span></div>
    </div>
    <div className="wizard-progress" role="progressbar" aria-valuenow={step+1} aria-valuemin={1} aria-valuemax={4} aria-label="Прогресс создания персонажа">{[0,1,2,3].map(i=><div key={i} className={i<=step?'lit':''}/>)}</div>
    <div className="wizard-stage-head"><span className="wizard-head-number">0{step+1} / НОВАЯ ИСТОРИЯ</span><h2 id="wizard-heading">{TITLES[step]}</h2><p>{DESCRIPTIONS[step]}</p></div>
    <div className="wizard-stage-window">
      <div className={`wizard-stage wizard-${phase}`} key={`stage-${step}`}>
        {step===0&&<div className="wizard-gender-grid">
          <button type="button" className={`wizard-gender-card wizard-male ${gender==='male'?'picked':''}`} onClick={()=>pickGender('male')} aria-label="Выбрать мужчину">
            <span className="wizard-portrait-art"><span className="wizard-art-glow"/><span className="wizard-art-body"/><span className="wizard-art-neck"/><span className="wizard-art-head"/><span className="wizard-art-hair"/><span className="wizard-art-shoulder"/></span>
            <span className="wizard-card-foot"><span className="wizard-card-caption"><strong>Мужчина</strong><small>Создать сима</small></span><span className="wizard-card-icon"><Mars size={23}/></span></span>
          </button>
          <button type="button" className={`wizard-gender-card wizard-female ${gender==='female'?'picked':''}`} onClick={()=>pickGender('female')} aria-label="Выбрать женщину">
            <span className="wizard-portrait-art"><span className="wizard-art-glow"/><span className="wizard-art-body"/><span className="wizard-art-neck"/><span className="wizard-art-head"/><span className="wizard-art-hair"/><span className="wizard-art-shoulder"/></span>
            <span className="wizard-card-foot"><span className="wizard-card-caption"><strong>Женщина</strong><small>Создать симку</small></span><span className="wizard-card-icon"><Venus size={23}/></span></span>
          </button>
          <div className="wizard-gender-note"><ShieldCheck size={14}/> После создания любой параметр можно изменить в карточке персонажа.</div>
        </div>}
        {step===1&&<div className="wizard-names">
          <div className="wizard-name-visual"><div className="wizard-name-monogram">{first?.[0]?.toUpperCase()||'?'}<span>{last?.[0]?.toUpperCase()||''}</span></div><div><small>ИМЯ ВАШЕЙ ЛЕГЕНДЫ</small><strong>{shownName}</strong><p>Одна семья. Тысячи историй.</p></div></div>
          <form className="wizard-name-fields" onSubmit={e=>{e.preventDefault();advance()}}><label>Имя персонажа<input autoFocus value={first} maxLength={55} onChange={e=>{setFirst(e.target.value);setError('')}} placeholder="Например, Луна" autoComplete="off"/></label><label>Фамилия<input value={last} maxLength={55} onChange={e=>{setLast(e.target.value);setError('')}} placeholder="Например, Мун" autoComplete="off"/></label><button type="submit" className="wizard-hidden-submit" tabIndex={-1} aria-hidden="true"/></form>
        </div>}
        {step===2&&<div className="wizard-details">
          <div className="wizard-details-label">ЖИЗНЕННЫЙ ЭТАП</div><div className="wizard-age-grid">{LIFE_STAGES.map(item=><button type="button" key={item} className={`wizard-age ${life===item?'active':''}`} onClick={()=>setLife(item)} aria-pressed={life===item}>{item}{life===item&&<Check size={13}/>}</button>)}</div>
          <div className="wizard-info-grid"><label>Поколение<select value={gen} onChange={e=>setGen(e.target.value)}>{Array.from({length:Math.max(8,Number(gen)||1)},(_,i)=><option value={i+1} key={i}>Поколение {i+1}</option>)}</select></label><label>Роль в династии<input value={role} maxLength={75} onChange={e=>setRole(e.target.value)} placeholder="Например, наследник"/></label></div>
          <p className="wizard-detail-tip"><Sparkles size={14}/> Позже можно добавить родителей, партнёра, братьев, сестёр и другие связи.</p>
        </div>}
        {step===3&&<div className="wizard-final">
          <div className="wizard-final-preview"><div className="wizard-photo-frame" style={{'--wizard-photo-accent':gender==='female'?'#b89bbd':'#83b4a2'}}>{photo?<img src={photo} alt={`Портрет ${shownName}`}/>:<div className="wizard-photo-placeholder"><Camera size={46}/><span>Ваш портрет<br/>будет здесь</span></div>}</div><div className="wizard-preview-meta"><div className="wizard-preview-pill"><Heart size={12}/> ПЕРСОНАЖ ДИНАСТИИ</div><strong>{shownName}</strong><span>{life} · Поколение {gen}</span><small>{role||'Новая история начинается...'}</small></div></div>
          <label className={`wizard-photo-upload ${photoBusy?'busy':''}`} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();upload(e.dataTransfer.files?.[0])}}><span className="wizard-upload-icon"><ImagePlus size={21}/></span><span><strong>{photo?'Заменить фотографию':'Добавить фотографию сима'}</strong><small>{photoBusy?'Загружаем фотографию...':'Нажмите или перетащите JPG, PNG, WEBP · до 8 МБ'}</small></span><Upload size={17}/><input type="file" accept="image/png,image/jpeg,image/webp" disabled={photoBusy||saving} onChange={e=>{upload(e.target.files?.[0]);e.target.value=''}}/></label>
          {photo&&<button type="button" className="wizard-remove-photo" onClick={()=>setPhoto('')}><X size={13}/> Удалить фотографию</button>}
          <label className="wizard-bio-label">Начало истории <span>необязательно</span><textarea rows={2} value={bio} maxLength={2000} onChange={e=>setBio(e.target.value)} placeholder="Например, мечтает открыть цветочный магазин..."/></label>
        </div>}
      </div>
    </div>
    {error&&<div className="wizard-error" role="alert">{error}</div>}
    <div className="wizard-footer"><div className="wizard-footer-left">{step>0?<button type="button" className="wizard-back" onClick={()=>slide(step-1)} disabled={saving||photoBusy||phase!=='still'}><ArrowLeft size={18}/> Назад</button>:<button type="button" className="wizard-back" onClick={onCancel}>Отмена</button>}<span className="wizard-dot-decoration" aria-hidden="true">{[0,1,2,3].map(i=><i key={i} className={step===i?'active':''}/>)}</span></div>
      {step>0&&<button type="button" className="wizard-primary" onClick={advance} disabled={saving||photoBusy||phase!=='still'}>{step===3?(saving?'Сохраняем...':'Добавить в древо'):'Продолжить'} {step===3?<Check size={18}/>:<ArrowRight size={18}/>}</button>}{step===0&&<span className="wizard-first-tip">Выберите карточку для продолжения <ArrowRight size={15}/></span>}
    </div>
  </div>
}
