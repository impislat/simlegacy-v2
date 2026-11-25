import {createClient} from '@supabase/supabase-js';
import {sanitizePublicTree} from './featureModel';
const url=import.meta.env.VITE_SUPABASE_URL||'https://swxfdqnslmmkswwxpnji.supabase.co',key=import.meta.env.VITE_SUPABASE_ANON_KEY||'sb_publishable_7RPER6GbPCajEZT_tBVcCA_aPoVXKBB';
export const configured=Boolean(url&&key&&url.includes('supabase.co')&&!url.includes('YOUR_'));
export const db=configured?createClient(url,key):null;
const fail=({error,data})=>{if(error)throw error;return data};
const nameFor=(user)=>String(user?.user_metadata?.display_name||user?.email?.split('@')[0]||'Автор').slice(0,64);
export async function getTrees(userId){
 const data=fail(await db.from('trees').select('*').eq('owner_id',userId).order('updated_at',{ascending:false}));
 return data.map(t=>({...t,people:t.people||[],gallery:t.gallery||[],backgroundEnabled:!!t.background_enabled,style:t.style||{},layoutMode:t.layout_mode||'manual',heirId:t.heir_id||null,chronicles:t.chronicles||[]}));
}
export async function saveTree(tree,userId){
 const data=fail(await db.from('trees').upsert({
  id:tree.id,owner_id:userId,title:tree.title,description:tree.description||'',cover:tree.cover||'',
  gallery:tree.gallery||[],background_enabled:!!tree.backgroundEnabled,people:tree.people||[],chronicles:tree.chronicles||[],public:!!tree.public,
  style:tree.style||{},layout_mode:tree.layoutMode||'manual',heir_id:tree.heirId||null,updated_at:new Date().toISOString()
 }).select().single());
 if(tree.public){
  const snapshot=sanitizePublicTree({...tree,updated_at:data.updated_at});
  const auth=await db.auth.getUser();const user=auth?.data?.user;
  const author_name=nameFor(user);
  fail(await db.from('public_tree_snapshots').upsert({id:tree.id,owner_id:userId,title:tree.title,description:tree.description||'',cover:snapshot.cover,author_name,snapshot,updated_at:new Date().toISOString()}));
 }else{
  fail(await db.from('public_tree_snapshots').delete().eq('id',tree.id));
 }
 return data;
}
export async function removeTree(id){fail(await db.from('trees').delete().eq('id',id));}
export async function listGallery(){
 const data=fail(await db.from('public_tree_snapshots').select('id,owner_id,title,description,cover,author_name,snapshot,created_at,updated_at').order('updated_at',{ascending:false}).limit(100));
 if(!data.length)return [];
 const ids=data.map(t=>t.id);
 const [likes,comments]=await Promise.all([
  db.from('tree_likes').select('tree_id').in('tree_id',ids),
  db.from('tree_comments').select('tree_id').in('tree_id',ids)
 ]);
 if(likes.error)throw likes.error;if(comments.error)throw comments.error;
 const counts=values=>{const map={};for(const x of values.data||[])map[x.tree_id]=(map[x.tree_id]||0)+1;return map};
 const likeCounts=counts(likes),commentCounts=counts(comments);
 return data.map(t=>({...t.snapshot,id:t.id,title:t.title,description:t.description,cover:t.cover,author_name:t.author_name,owner_id:t.owner_id,updated_at:t.updated_at,likes:likeCounts[t.id]||0,comments:commentCounts[t.id]||0}));
}
export async function getPublicTree(id){
 const t=fail(await db.from('public_tree_snapshots').select('*').eq('id',id).single());
 return {...t.snapshot,id:t.id,title:t.title,description:t.description,cover:t.cover,author_name:t.author_name,owner_id:t.owner_id};
}
export async function getTreeCommunity(id,userId){
 const [likes,comments]=await Promise.all([db.from('tree_likes').select('user_id').eq('tree_id',id),db.from('tree_comments').select('id,user_id,author_name,body,created_at').eq('tree_id',id).order('created_at',{ascending:false}).limit(100)]);
 if(likes.error)throw likes.error;if(comments.error)throw comments.error;
 return {likes:(likes.data||[]).length,liked:!!userId&&(likes.data||[]).some(x=>x.user_id===userId),comments:comments.data||[]};
}
export async function toggleTreeLike(treeId,userId,liked){
 if(liked)fail(await db.from('tree_likes').delete().eq('tree_id',treeId).eq('user_id',userId));
 else fail(await db.from('tree_likes').insert({tree_id:treeId,user_id:userId}));
}
export async function addTreeComment(treeId,user,body){
 const text=String(body||'').trim();if(!text||text.length>1000)throw Error('Комментарий должен содержать 1–1000 символов');
 return fail(await db.from('tree_comments').insert({tree_id:treeId,user_id:user.id,author_name:nameFor(user),body:text}).select().single());
}
export async function deleteTreeComment(commentId,userId){fail(await db.from('tree_comments').delete().eq('id',commentId).eq('user_id',userId));}
export async function getUserProfile(userId){const {data,error}=await db.from('profiles').select('*').eq('id',userId).maybeSingle();if(error)throw error;return data||null;}
export async function saveUserProfile(userId,username,bio,avatar=''){
 return fail(await db.from('profiles').upsert({id:userId,username:String(username||'').trim().slice(0,64),bio:String(bio||'').slice(0,800),avatar:String(avatar||''),updated_at:new Date().toISOString()}).select().single());
}
export async function uploadPhoto(file,userId){
 if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw Error('Выберите JPG, PNG или WEBP');
 if(file.size>8*1024*1024)throw Error('Файл должен быть не больше 8 МБ');
 const ext=(file.name.split('.').pop()||'jpg').toLowerCase().replace(/[^a-z0-9]/g,'');const path=`${userId}/${crypto.randomUUID()}.${ext}`;
 fail(await db.storage.from('sim-images').upload(path,file,{upsert:false,contentType:file.type}));
 return db.storage.from('sim-images').getPublicUrl(path).data.publicUrl;
}

export async function getPublicProfile(userId){const {data,error}=await db.from('profiles').select('id,username,bio,avatar').eq('id',userId).maybeSingle();if(error)throw error;return data;}

const simNameFor=user=>String(user?.user_metadata?.display_name||user?.email?.split('@')[0]||'Автор').slice(0,64);
export async function listSimPosts(userId){
 const posts=fail(await db.from('simstagram_posts').select('*').order('created_at',{ascending:false}).limit(150));
 if(!posts.length)return [];
 const ids=posts.map(p=>p.id);
 const [likes,comments,reposts,saved]=await Promise.all([
  db.from('simstagram_likes').select('post_id,user_id').in('post_id',ids),
  db.from('simstagram_comments').select('post_id').in('post_id',ids),
  db.from('simstagram_reposts').select('post_id,user_id,author_name,created_at').in('post_id',ids).order('created_at',{ascending:false}),
  userId?db.from('simstagram_saved').select('post_id').eq('user_id',userId).in('post_id',ids):Promise.resolve({data:[],error:null})
 ]);
 for(const q of [likes,comments,reposts,saved])if(q.error)throw q.error;
 const count=(rows,key)=>rows.reduce((m,x)=>(m[x[key]]=(m[x[key]]||0)+1,m),{});
 const lm=count(likes.data||[],'post_id'),cm=count(comments.data||[],'post_id'),rm=count(reposts.data||[],'post_id');
 const enriched=posts.map(p=>({...p,likes:lm[p.id]||0,comments:cm[p.id]||0,reposts:rm[p.id]||0,liked:!!userId&&(likes.data||[]).some(x=>x.post_id===p.id&&x.user_id===userId),saved:!!userId&&(saved.data||[]).some(x=>x.post_id===p.id),reposted:!!userId&&(reposts.data||[]).some(x=>x.post_id===p.id&&x.user_id===userId)}));
 const byId=new Map(enriched.map(p=>[p.id,p]));
 const copies=(reposts.data||[]).filter(r=>userId===r.user_id).map(r=>({...byId.get(r.post_id),feed_type:'repost',repost_user_id:r.user_id,repost_author_name:r.author_name,repost_created_at:r.created_at})).filter(Boolean);
 return [...enriched,...copies].sort((a,b)=>Date.parse(b.repost_created_at||b.created_at)-Date.parse(a.repost_created_at||a.created_at));
}
export async function createSimPost(user,post){
 const caption=String(post.caption||'').slice(0,2200),tags=(post.tags||[]).map(t=>String(t).replace(/^#/,'').slice(0,40)).filter(Boolean).slice(0,20);
 if(!post.images?.length||post.images.length>10)throw Error('Добавь от 1 до 10 фото');
 return fail(await db.from('simstagram_posts').insert({user_id:user.id,author_name:simNameFor(user),caption,images:post.images,tree_id:post.tree_id||null,tree_title:post.tree_title||'',category:post.category||'Жизнь',tags}).select().single());
}
export async function editSimPost(id,post){
 return fail(await db.from('simstagram_posts').update({caption:String(post.caption||'').slice(0,2200),images:post.images||[],category:post.category||'Жизнь',tree_id:post.tree_id||null,tree_title:post.tree_title||'',tags:(post.tags||[]).map(t=>String(t).replace(/^#/,'').slice(0,40)).filter(Boolean).slice(0,20),updated_at:new Date().toISOString()}).eq('id',id).select().single());
}
export async function deleteSimPost(id,userId){fail(await db.from('simstagram_posts').delete().eq('id',id).eq('user_id',userId))}
export async function toggleSimLike(postId,userId,liked){if(liked)fail(await db.from('simstagram_likes').delete().eq('post_id',postId).eq('user_id',userId));else fail(await db.from('simstagram_likes').upsert({post_id:postId,user_id:userId},{onConflict:'post_id,user_id'}))}
export async function getSimComments(postId){return fail(await db.from('simstagram_comments').select('*').eq('post_id',postId).order('created_at',{ascending:true}).limit(100))}
export async function addSimComment(postId,user,body){const b=String(body||'').trim();if(!b||b.length>1000)throw Error('Комментарий должен содержать 1–1000 символов');return fail(await db.from('simstagram_comments').insert({post_id:postId,user_id:user.id,author_name:simNameFor(user),body:b}).select().single())}
export async function deleteSimComment(id,userId){fail(await db.from('simstagram_comments').delete().eq('id',id).eq('user_id',userId))}
export async function toggleSimSaved(postId,userId,saved){if(saved)fail(await db.from('simstagram_saved').delete().eq('post_id',postId).eq('user_id',userId));else fail(await db.from('simstagram_saved').upsert({post_id:postId,user_id:userId},{onConflict:'post_id,user_id'}))}
export async function toggleSimRepost(postId,user){const existing=fail(await db.from('simstagram_reposts').select('id').eq('post_id',postId).eq('user_id',user.id).maybeSingle());if(existing)fail(await db.from('simstagram_reposts').delete().eq('id',existing.id));else fail(await db.from('simstagram_reposts').insert({post_id:postId,user_id:user.id,author_name:simNameFor(user)}))}
