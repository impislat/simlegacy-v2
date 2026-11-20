/** Small, backwards-compatible photo album model. The sources live in tree JSON. */
export function normalizePhotos(items){
  if(!Array.isArray(items))return [];
  return items.filter(Boolean).map((item,index)=>{
    if(typeof item==='string')return {id:`legacy-${index}`,src:item,caption:'',createdAt:''};
    const src=String(item.src||item.url||item.photo||'');
    return {id:String(item.id||`legacy-${index}`),src,caption:String(item.caption||'').slice(0,220),createdAt:String(item.createdAt||'')};
  }).filter(item=>item.src);
}
export function appendPhoto(items,photo,max=24){
  const photos=normalizePhotos(items);
  if(photos.length>=max)throw Error(`Достигнут лимит альбома: ${max} фотографий`);
  const next=normalizePhotos([photo]);
  if(!next.length)throw Error('Не удалось добавить фотографию');
  return [...photos,...next];
}
export function changeCaption(items,id,caption){
  return normalizePhotos(items).map(p=>p.id===id?{...p,caption:String(caption||'').slice(0,220)}:p);
}
export function removePhoto(items,id){return normalizePhotos(items).filter(p=>p.id!==id)}
export function newPhoto(src){
  const id=typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return {id,src,caption:'',createdAt:new Date().toISOString()};
}
