import React,{useEffect,useState} from 'react';
import {ArrowRight,Check,Heart,MessageCircle,Send,Trash2,UserRound,Link2,Users} from 'lucide-react';
import {getTreeCommunity,toggleTreeLike,addTreeComment,deleteTreeComment,getUserProfile,saveUserProfile,getPublicProfile,db} from './backend';
import './community.css';

export function CommunityPanel({tree,user,onLogin}){
 const [busy,setBusy]=useState(true),[error,setError]=useState(''),[state,setState]=useState({likes:0,liked:false,comments:[]}),[message,setMessage]=useState(''),[posting,setPosting]=useState(false);
 const treeId=tree?.id;
 useEffect(()=>{if(!treeId)return;let alive=true;setBusy(true);getTreeCommunity(treeId,user?.id).then(data=>{if(alive){setState(data);setBusy(false)}}).catch(e=>{if(alive){setError(e.message);setBusy(false)}});return()=>{alive=false}},[treeId,user?.id]);
 async function liked(){if(!user){onLogin();return}try{await toggleTreeLike(treeId,user.id,state.liked);setState(s=>({...s,liked:!s.liked,likes:s.likes+(s.liked?-1:1)}))}catch(e){setError(e.message)}}
 async function post(e){e.preventDefault();if(!user){onLogin();return}setPosting(true);setError('');try{const item=await addTreeComment(treeId,user,message);setState(s=>({...s,comments:[item,...s.comments]}));setMessage('')}catch(e){setError(e.message)}finally{setPosting(false)}}
 async function remove(id){try{await deleteTreeComment(id,user.id);setState(s=>({...s,comments:s.comments.filter(x=>x.id!==id)}))}catch(e){setError(e.message)}}
 return <section className="community-panel"><div className="community-panel-heading"><h3>Обсуждение династии</h3><small>{tree?.author_name||'Автор'}</small></div>
 <div className="community-stats"><button className={state.liked?'liked':''} onClick={liked}><Heart size={18} fill={state.liked?'currentColor':'none'}/> {state.likes} нравится</button><span><MessageCircle size={17}/> {state.comments.length} комментариев</span></div>
 {error&&<p className="community-error">{error}</p>}
 {user?<form onSubmit={post} className="community-comment-form"><textarea maxLength={1000} rows={2} placeholder="Оставь добрый комментарий об истории…" value={message} onChange={e=>setMessage(e.target.value)}/><button disabled={posting||!message.trim()} type="submit"><Send size={15}/> Отправить</button></form>:<button className="community-login" onClick={onLogin}>Войти, чтобы поставить лайк или написать комментарий <ArrowRight size={16}/></button>}
 {busy?<p className="community-empty">Загружаем обсуждение…</p>:<div className="community-comments">{state.comments.length?state.comments.map(c=><div className="community-comment" key={c.id}><div className="comment-avatar"><UserRound size={15}/></div><div><div className="comment-by"><b>{c.author_name}</b><small>{new Date(c.created_at).toLocaleDateString('ru-RU')}</small></div><p>{c.body}</p></div>{user?.id===c.user_id&&<button onClick={()=>remove(c.id)} title="Удалить свой комментарий"><Trash2 size={15}/></button>}</div>):<div className="community-empty">Пока нет комментариев. Начни обсуждение первым!</div>}</div>}
 </section>
}
export function PublicGalleryControls({sort,setSort,filter,setFilter}){
 return <div className="community-filters"><label>Сортировка<select value={sort} onChange={e=>setSort(e.target.value)}><option value="new">Новые публикации</option><option value="popular">Популярные</option><option value="discussed">Обсуждаемые</option><option value="large">Большие династии</option></select></label><label>Поколения<select value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">Все династии</option><option value="2">2+ поколения</option><option value="3">3+ поколения</option><option value="5">5+ поколений</option></select></label></div>
}
export function UserProfileEditor({user,onClose}){
 const [username,setUsername]=useState(user?.user_metadata?.display_name||user?.email?.split('@')[0]||''),[bio,setBio]=useState(''),[busy,setBusy]=useState(true),[error,setError]=useState(''),[saved,setSaved]=useState(false);
 useEffect(()=>{let live=true;getUserProfile(user.id).then(p=>{if(live&&p){setUsername(p.username);setBio(p.bio)}}).catch(e=>{if(live)setError(e.message)}).finally(()=>{if(live)setBusy(false)});return()=>{live=false}},[user.id]);
 async function save(e){e.preventDefault();setBusy(true);try{await saveUserProfile(user.id,username,bio);await db.auth.updateUser({data:{display_name:username}});setSaved(true)}catch(e){setError(e.message)}finally{setBusy(false)}}
 return <section className="profile-editor"><span className="profile-overline">ПРОФИЛЬ АВТОРА</span><h2>Мой профиль</h2><p className="profile-email">{user.email}</p><form onSubmit={save} className="form"><label>Публичный никнейм<input required maxLength={64} value={username} onChange={e=>{setUsername(e.target.value);setSaved(false)}}/></label><label>О себе<textarea maxLength={800} rows={4} value={bio} onChange={e=>{setBio(e.target.value);setSaved(false)}} placeholder="Расскажи о своих династиях и любимых симах"/></label>{error&&<div className="community-error">{error}</div>}{saved&&<p className="profile-saved"><Check size={15}/> Профиль сохранён</p>}<button className="btn btn-green" disabled={busy}>Сохранить профиль</button></form></section>
}
export function LinkedPersonDialog({person,trees,currentId,onLink,onClose}){
 const [target,setTarget]=useState('');const [busy,setBusy]=useState(false),[error,setError]=useState('');const other=trees.filter(t=>t.id!==currentId);
 async function doLink(e){e.preventDefault();setBusy(true);try{await onLink(target);onClose()}catch(e){setError(e.message)}finally{setBusy(false)}}
 return <section className="profile-editor"><span className="profile-overline">ОБЩИЕ ПЕРСОНАЖИ</span><h2>Связать с другой династией</h2><p>Персонаж «{person?.name}» будет добавлен в выбранную династию. Его профиль, фото, навыки и события смогут синхронизироваться; родственные связи и положение останутся независимыми в каждом дереве.</p>
 {!other.length?<p className="community-empty">Сначала создай ещё одну династию.</p>:<form className="form" onSubmit={doLink}><label>Другая династия<select required value={target} onChange={e=>setTarget(e.target.value)}><option value="">Выбери династию</option>{other.map(t=><option key={t.id} value={t.id}>{t.title}</option>)}</select></label>{error&&<p className="community-error">{error}</p>}<button className="btn btn-green" disabled={!target||busy}><Link2 size={15}/> {busy?'Сохраняю…':'Добавить связанного сима'}</button></form>}
 </section>
}

export function AuthorDirectory({trees=[],onSelect}){
 const authors=[...new Map(trees.filter(t=>t.owner_id).map(t=>[t.owner_id,{id:t.owner_id,name:t.author_name||'Автор',count:trees.filter(s=>s.owner_id===t.owner_id).length,cover:t.cover}])).values()];
 return <div className="author-directory"><h2>Авторы сообщества</h2><p>Истории тех, кто делится своими династиями.</p><div className="author-directory-grid">{authors.map(a=><button type="button" key={a.id} onClick={()=>onSelect(a)}><span className="author-directory-avatar"><UserRound size={20}/></span><strong>{a.name}</strong><small>{a.count} династий</small><ArrowRight size={15}/></button>)}{!authors.length&&<div className="community-empty">Пока нет опубликованных авторов.</div>}</div></div>
}
export function PublicAuthorProfile({author,trees=[],onOpenTree}){
 const [profile,setProfile]=useState(null),[error,setError]=useState('');
 useEffect(()=>{let alive=true;getPublicProfile(author.id).then(x=>{if(alive)setProfile(x)}).catch(e=>{if(alive)setError(e.message)});return()=>{alive=false}},[author.id]);
 const own=trees.filter(t=>t.owner_id===author.id);
 return <div className="public-author-profile"><div className="public-author-heading"><span className="author-directory-avatar"><UserRound size={30}/></span><div><span className="profile-overline">АВТОР SIMLEGACY</span><h2>{profile?.username||author.name}</h2><p>{profile?.bio||'Этот автор пока не рассказал о себе.'}</p></div></div>{error&&<p className="community-error">{error}</p>}<h3>Опубликованные династии</h3>{own.map(t=><button type="button" className="author-tree" key={t.id} onClick={()=>onOpenTree(t)}><span>{t.cover?<img src={t.cover} alt=""/>:<Users size={25}/>}</span><div><b>{t.title}</b><small>{t.people?.length||0} персонажей</small></div><ArrowRight size={16}/></button>)}</div>;
}
