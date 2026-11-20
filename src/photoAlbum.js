/** Backwards-compatible album model. Visibility controls publication in sanitized snapshots. */
export function normalizePhotos(items){
  if(!Array.isArray(items))return [];
  return items.filter(Boolean).map((item,index)=>{
    if(typeof item==='string')return {id:`legacy-${index}`,src:item,caption:'',createdAt:'',folder:'Все снимки',visibility:'public'};
    const src=String(item.src||item.url||item.photo||'');
    return {id:String(item.id||`legacy-${index}`),src,caption:String(item.caption||'').slice(0,220),createdAt:String(item.createdAt||''),folder:String(item.folder||'Все снимки').slice(0,60),visibility:item.visibility==='private'?'private':'public'};
  }).filter(item=>item.src);
}
export function appendPhoto(items,photo,max=24){
  const photos=normalizePhotos(items);
  if(photos.length>=max)throw Error(`Достигнут лимит альбома: ${max} фотографий`);
  const next=normalizePhotos([photo]);
  if(!next.length)throw Error('Не удалось добавить фотографию');
  return [...photos,...next];
}
export function changeCaption(items,id,caption){return normalizePhotos(items).map(p=>p.id===id?{...p,caption:String(caption||'').slice(0,220)}:p)}
export function setPhotoFolder(items,id,folder){return normalizePhotos(items).map(p=>p.id===id?{...p,folder:String(folder||'Все снимки').slice(0,60)}:p)}
export function setPhotoVisibility(items,id,visibility){return normalizePhotos(items).map(p=>p.id===id?{...p,visibility:visibility==='private'?'private':'public'}:p)}
export function photoFolders(items){return ['Все снимки',...new Set(normalizePhotos(items).map(p=>p.folder).filter(x=>x!=='Все снимки'))]}
export function removePhoto(items,id){return normalizePhotos(items).filter(p=>p.id!==id)}
export function newPhoto(src,folder='Все снимки'){
  const id=typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return {id,src,caption:'',createdAt:new Date().toISOString(),folder,visibility:'public'};
}
