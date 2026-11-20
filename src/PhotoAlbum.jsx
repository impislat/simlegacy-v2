import React,{useEffect,useState} from 'react';
import {createPortal} from 'react-dom';
import {Camera,ChevronLeft,ChevronRight,ImagePlus,Trash2,Check,Upload, X,Image as ImageIcon} from 'lucide-react';
import {normalizePhotos,appendPhoto,removePhoto,changeCaption,newPhoto} from './photoAlbum';
import './photo-album.css';

function GalleryLightbox({photos,index,onClose,onNavigate}){
  const photo=photos[index];
  useEffect(()=>{
    const key=e=>{if(e.key==='Escape')onClose();if(e.key==='ArrowLeft')onNavigate((index-1+photos.length)%photos.length);if(e.key==='ArrowRight')onNavigate((index+1)%photos.length)};
    document.addEventListener('keydown',key);
    return()=>document.removeEventListener('keydown',key);
  },[index,photos.length,onClose,onNavigate]);
  if(!photo)return null;
  return createPortal(<div className="album-lightbox" role="dialog" aria-modal="true" aria-label="Просмотр фотографии" onMouseDown={e=>e.target===e.currentTarget&&onClose()}>
    <button type="button" className="album-lightbox-close" onClick={onClose} aria-label="Закрыть"><X size={23}/></button>
    <div className="album-lightbox-content">
      {photos.length>1&&<button type="button" className="album-lightbox-arrow" onClick={()=>onNavigate((index-1+photos.length)%photos.length)} aria-label="Предыдущее фото"><ChevronLeft size={25}/></button>}
      <div className="album-lightbox-photo"><img src={photo.src} alt={photo.caption||`Фотография ${index+1}`}/>{photo.caption&&<div className="album-lightbox-caption">{photo.caption}</div>}</div>
      {photos.length>1&&<button type="button" className="album-lightbox-arrow" onClick={()=>onNavigate((index+1)%photos.length)} aria-label="Следующее фото"><ChevronRight size={25}/></button>}
    </div>
    <span className="album-lightbox-count">{index+1} / {photos.length}</span>
  </div>,document.body);
}

/** Controlled editor/viewer. Parent persists the album together with its person/tree. */
export default function PhotoAlbum({photos=[],onChange,onUpload,editable=false,title='Фотогалерея',description='',featuredSrc='',onSetFeatured,featuredLabel='Сделать главным фото',max=15,compact=false}){
  const pictures=normalizePhotos(photos);
  const [busy,setBusy]=useState(false),[error,setError]=useState(''),[lightbox,setLightbox]=useState(null);
  const [progress,setProgress]=useState('');
  useEffect(()=>{if(lightbox!==null&&lightbox>=pictures.length)setLightbox(pictures.length?pictures.length-1:null)},[pictures.length,lightbox]);
  async function addFiles(event){
    const files=Array.from(event.target.files||[]);
    event.target.value='';
    if(!files.length||!editable||!onUpload||!onChange)return;
    if(pictures.length+files.length>max){setError(`В альбоме можно хранить до ${max} фотографий.`);return}
    setBusy(true);setError('');
    let next=[...pictures];
    let succeeded=0;
    try{
      for(const file of files){
        setProgress(`Загрузка ${succeeded+1} из ${files.length}...`);
        const src=await onUpload(file);
        next=appendPhoto(next,newPhoto(src),max);
        succeeded++;
      }
      onChange(next);
    }catch(e){
      if(succeeded)onChange(next);
      setError(`Не все фотографии загружены: ${e.message}`);
    }finally{setBusy(false);setProgress('')}
  }
  return <section className={`photo-album ${compact?'photo-album-compact':''}`}>
    <div className="photo-album-heading"><div className="photo-album-heading-icon"><Camera size={19}/></div><div><h3>{title} <span className="photo-album-count">{pictures.length}</span></h3>{description&&<p>{description}</p>}</div></div>
    {editable&&<label className={`album-upload ${busy||pictures.length>=max?'album-upload-disabled':''}`}><ImagePlus size={21}/><div><b>{busy?progress:'Добавить фотографии'}</b><small>{`JPG, PNG или WEBP · ${pictures.length} из ${max}`}</small></div><Upload size={18}/><input disabled={busy||pictures.length>=max} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={addFiles}/></label>}
    {error&&<div className="photo-album-error" role="alert">{error}</div>}
    {pictures.length?<div className="album-photos-grid">{pictures.map((p,i)=><div className="album-photo" key={p.id}>
      <button type="button" className="album-photo-preview" onClick={()=>setLightbox(i)} aria-label={`Открыть фото ${i+1}`}><img loading="lazy" src={p.src} alt={p.caption||`Фото ${i+1}`}/><span className="album-photo-zoom"><ImageIcon size={18}/></span></button>
      {editable?<div className="album-photo-foot"><input type="text" maxLength={220} value={p.caption} onChange={e=>onChange(changeCaption(pictures,p.id,e.target.value))} placeholder="Подпись к моменту…" aria-label="Подпись к фото"/>
        <div className="album-photo-actions">{onSetFeatured&&<button type="button" className={featuredSrc===p.src?'album-set-cover active':'album-set-cover'} title={featuredLabel} onClick={()=>onSetFeatured(p.src)}>{featuredSrc===p.src?<><Check size={12}/> Главное фото</>:<><Camera size={12}/> {featuredLabel}</>}</button>}<button type="button" className="album-remove" title="Убрать фотографию" onClick={()=>onChange(removePhoto(pictures,p.id))}><Trash2 size={15}/></button></div>
      </div>:p.caption&&<p className="album-view-caption">{p.caption}</p>}
    </div>)}</div>:<div className="album-empty"><div><Camera size={32}/></div><strong>Здесь будет ваша история в фотографиях</strong><span>{editable?'Загружайте памятные моменты, свадьбы и семейные события.':'В этой галерее пока нет фотографий.'}</span></div>}
    {lightbox!==null&&pictures.length>0&&<GalleryLightbox photos={pictures} index={Math.min(lightbox,pictures.length-1)} onClose={()=>setLightbox(null)} onNavigate={setLightbox}/>}
  </section>
}
