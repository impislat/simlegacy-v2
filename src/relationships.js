/**
 * Relationships are directional: setRelation(people, subject, other, 'parent')
 * means OTHER is SUBJECT's parent. The reverse relationship is written on the other sim.
 * Biological parents are also mirrored into the legacy `parents` array so older
 * trees render without migration. Additional ties are stored in `relations`.
 */
export const RELATION_TYPES = [
  {group:'Кровная семья', id:'family', items:[
    ['parent','Родитель'],['child','Сын / дочь'],['sibling','Брат / сестра'],
    ['halfSibling','Единокровный / единоутробный брат или сестра'],
    ['twin','Близнец'],['grandparent','Дедушка / бабушка'],['grandchild','Внук / внучка'],
    ['greatGrandparent','Прадедушка / прабабушка'],['greatGrandchild','Правнук / правнучка'],
    ['uncle','Дядя / тётя'],['nibling','Племянник / племянница'],
    ['greatUncle','Двоюродный дедушка / бабушка'],['greatNibling','Внучатый племянник / племянница'],
    ['cousin','Двоюродный брат / сестра'],['secondCousin','Троюродный брат / сестра'],
    ['thirdCousin','Четвероюродный брат / сестра']
  ]},
  {group:'Приёмная и смешанная семья', id:'blended', items:[
    ['adoptiveParent','Приёмный родитель'],['adoptiveChild','Приёмный ребёнок'],
    ['fosterParent','Опекун (приёмная семья)'],['fosterChild','Подопечный (приёмная семья)'],
    ['stepparent','Отчим / мачеха'],['stepchild','Пасынок / падчерица'],
    ['stepSibling','Сводный брат / сестра'],['fosterSibling','Брат / сестра по приёмной семье'],
    ['guardian','Опекун'],['ward','Подопечный'],['godparent','Крёстный / крёстная'],['godchild','Крестник / крестница'],
    ['parentInLaw','Свёкор / свекровь / тесть / тёща'],['childInLaw','Зять / невестка'],
    ['siblingInLaw','Шурин / золовка / деверь / свояченица'],['coParent','Второй родитель общих детей']
  ]},
  {group:'Романтические отношения', id:'romance', items:[
    ['spouse','Муж / жена'],['fiance','Жених / невеста'],['partner','Партнёр / партнёрша'],
    ['dating','Встречаются'],['romanticInterest','Романтический интерес'],['lover','Возлюбленный / возлюбленная'],
    ['crush','Влюблённость'],['exSpouse','Бывший муж / бывшая жена'],
    ['exFiance','Бывший жених / бывшая невеста'],['exPartner','Бывший партнёр / партнёрша'],
    ['widowed','Покойный супруг / супруга']
  ]},
  {group:'Другие отношения', id:'social', items:[
    ['bestFriend','Лучший друг / подруга'],['friend','Друг / подруга'],['acquaintance','Знакомый / знакомая'],
    ['enemy','Враг'],['rival','Соперник / соперница'],['roommate','Сосед по дому'],
    ['neighbor','Сосед / соседка'],['coworker','Коллега'],['mentor','Наставник / наставница'],
    ['apprentice','Ученик / ученица'],['custom','Своя связь (задать название)']
  ]}
];
export const LABELS=Object.fromEntries(RELATION_TYPES.flatMap(g=>g.items));
export const INVERSE={
  parent:'child',child:'parent',sibling:'sibling',halfSibling:'halfSibling',twin:'twin',
  grandparent:'grandchild',grandchild:'grandparent',greatGrandparent:'greatGrandchild',greatGrandchild:'greatGrandparent',
  uncle:'nibling',nibling:'uncle',greatUncle:'greatNibling',greatNibling:'greatUncle',
  cousin:'cousin',secondCousin:'secondCousin',thirdCousin:'thirdCousin',
  adoptiveParent:'adoptiveChild',adoptiveChild:'adoptiveParent',fosterParent:'fosterChild',fosterChild:'fosterParent',
  stepparent:'stepchild',stepchild:'stepparent',stepSibling:'stepSibling',fosterSibling:'fosterSibling',
  guardian:'ward',ward:'guardian',godparent:'godchild',godchild:'godparent',
  parentInLaw:'childInLaw',childInLaw:'parentInLaw',siblingInLaw:'siblingInLaw',coParent:'coParent',
  spouse:'spouse',fiance:'fiance',partner:'partner',dating:'dating',romanticInterest:'romanticInterest',
  lover:'lover',crush:'crush',exSpouse:'exSpouse',exFiance:'exFiance',exPartner:'exPartner',widowed:'widowed',
  bestFriend:'bestFriend',friend:'friend',acquaintance:'acquaintance',enemy:'enemy',rival:'rival',
  roommate:'roommate',neighbor:'neighbor',coworker:'coworker',mentor:'apprentice',apprentice:'mentor',custom:'custom'
};
export const ROMANCE=new Set(RELATION_TYPES.find(g=>g.id==='romance').items.map(x=>x[0]));
export const ACTIVE_ROMANCE=new Set(['spouse','fiance','partner','dating','lover']);
export const BIOLOGICAL=new Set(['parent','child']);
export const RELATION_GROUP=Object.fromEntries(RELATION_TYPES.flatMap(g=>g.items.map(([id])=>[id,g.id])));

const genderText={
 parent:['Отец','Мать'],child:['Сын','Дочь'],sibling:['Брат','Сестра'],halfSibling:['Неполнородный брат','Неполнородная сестра'],
 twin:['Брат-близнец','Сестра-близнец'],grandparent:['Дедушка','Бабушка'],grandchild:['Внук','Внучка'],
 greatGrandparent:['Прадедушка','Прабабушка'],greatGrandchild:['Правнук','Правнучка'],uncle:['Дядя','Тётя'],
 nibling:['Племянник','Племянница'],greatUncle:['Двоюродный дедушка','Двоюродная бабушка'],greatNibling:['Внучатый племянник','Внучатая племянница'],
 cousin:['Двоюродный брат','Двоюродная сестра'],secondCousin:['Троюродный брат','Троюродная сестра'],thirdCousin:['Четвероюродный брат','Четвероюродная сестра'],
 adoptiveParent:['Приёмный отец','Приёмная мать'],adoptiveChild:['Приёмный сын','Приёмная дочь'],
 fosterParent:['Приёмный отец (опека)','Приёмная мать (опека)'],fosterChild:['Приёмный сын (опека)','Приёмная дочь (опека)'],
 stepparent:['Отчим','Мачеха'],stepchild:['Пасынок','Падчерица'],stepSibling:['Сводный брат','Сводная сестра'],
 fosterSibling:['Приёмный брат','Приёмная сестра'],guardian:['Опекун','Опекун'],ward:['Подопечный','Подопечная'],
 godparent:['Крёстный','Крёстная'],godchild:['Крестник','Крестница'],
 parentInLaw:['Тесть / свёкор','Тёща / свекровь'],childInLaw:['Зять','Невестка'],siblingInLaw:['Родственник по браку','Родственница по браку'],
 spouse:['Муж','Жена'],fiance:['Жених','Невеста'],partner:['Партнёр','Партнёрша'],
 exSpouse:['Бывший муж','Бывшая жена'],exFiance:['Бывший жених','Бывшая невеста'],exPartner:['Бывший партнёр','Бывшая партнёрша'],
 widowed:['Покойный супруг','Покойная супруга'],lover:['Возлюбленный','Возлюбленная'],
 friend:['Друг','Подруга'],bestFriend:['Лучший друг','Лучшая подруга'],mentor:['Наставник','Наставница'],apprentice:['Ученик','Ученица']
};
export function relationLabel(type, target, relation={}) {
  if(type==='custom')return relation.customLabel||'Своя связь';
  const gender=target?.gender;
  if(gender==='male'&&genderText[type])return genderText[type][0];
  if(gender==='female'&&genderText[type])return genderText[type][1];
  return LABELS[type]||type;
}
export function relationShortLabel(type) {
  const labels={parent:'Родитель → ребёнок',child:'Родитель → ребёнок',spouse:'Супруги',fiance:'Помолвка',partner:'Партнёры',
    dating:'Встречаются',lover:'Роман',exSpouse:'Развод',exPartner:'Бывшие',exFiance:'Бывшие',widowed:'Вдовство',
    adoptiveParent:'Усыновление',adoptiveChild:'Усыновление',stepparent:'Отчим / мачеха',stepchild:'Сводная семья',
    sibling:'Брат / сестра',halfSibling:'Общий родитель',twin:'Близнецы',stepSibling:'Сводные',
    guardian:'Опека',ward:'Опека',friend:'Друзья',bestFriend:'Лучшие друзья',custom:'Своя связь'};
  return labels[type]||(LABELS[type]||type).split(' / ')[0];
}
const genId=()=>typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random()}`;
const asArray=x=>Array.isArray(x)?x:[];
const has=(people,id)=>people.some(p=>p.id===id);
const clonePeople=people=>people.map(p=>({...p,parents:[...asArray(p.parents)],relations:[...asArray(p.relations)]}));
export function isAncestor(people,ancestor,descendant){
  const seen=new Set();const visit=id=>{if(id===ancestor)return true;if(seen.has(id))return false;seen.add(id);
    return asArray(people.find(p=>p.id===id)?.parents).some(visit)};
  return visit(descendant);
}
function removePairType(people,a,b,type){
  const x=people.find(p=>p.id===a),y=people.find(p=>p.id===b);
  if(!x||!y)return;
  const ix=INVERSE[type];
  x.relations=x.relations.filter(r=>!(r.to===b&&r.type===type));
  y.relations=y.relations.filter(r=>!(r.to===a&&r.type===ix));
  if(type==='parent')x.parents=x.parents.filter(id=>id!==b);
  if(type==='child')y.parents=y.parents.filter(id=>id!==a);
}
function normalizePartner(people,id,excluded){
  const p=people.find(x=>x.id===id);if(!p)return;
  const active=p.relations.find(r=>ACTIVE_ROMANCE.has(r.type)&&r.to!==excluded);
  if(p.partner===excluded)p.partner=active?.to||'';
}
export function setRelation(people,a,b,type,options={}){
  if(!a||!b||a===b||!INVERSE[type])throw Error('Выберите двух разных симов и тип связи');
  if(!has(people,a)||!has(people,b))throw Error('Персонаж не найден');
  if(type==='custom'&&!String(options.customLabel||'').trim())throw Error('Укажите название своей связи');
  const checked=options.replaceType?removeRelation(people,a,b,options.replaceType):people;
  const parent=type==='parent'?b:type==='child'?a:null,child=type==='parent'?a:type==='child'?b:null;
  if(parent){
    if(isAncestor(checked,child,parent))throw Error('Нельзя создать цикл поколений: потомок не может стать предком');
    const existing=asArray(checked.find(p=>p.id===child)?.parents);
    if(!existing.includes(parent)&&existing.length>=2)throw Error('У сима уже два биологических родителя. Для других связей выберите «Приёмный родитель» или «Опекун».');
  }
  if(ROMANCE.has(type)){
    if(isAncestor(people,a,b)||isAncestor(people,b,a))throw Error('Прямые родственники по линии предков не могут быть партнёрами');
    const pa=asArray(people.find(p=>p.id===a)?.parents),pb=asArray(people.find(p=>p.id===b)?.parents);
    if(pa.some(id=>pb.includes(id)))throw Error('Братья и сёстры не могут быть партнёрами');
  }
  const next=clonePeople(checked),x=next.find(p=>p.id===a),y=next.find(p=>p.id===b);
  // A new romantic status replaces only the previous romantic status between this pair.
  // An additional family/social tie never destroys a spouse or a biological parent.
  const existing=asArray(x.relations).filter(r=>r.to===b);
  for(const prior of existing){
    if(prior.type===type||(ROMANCE.has(type)&&ROMANCE.has(prior.type))||(BIOLOGICAL.has(type)&&BIOLOGICAL.has(prior.type))){
      removePairType(next,a,b,prior.type);
    }
  }
  if(parent){const kid=next.find(p=>p.id===child);kid.parents=[...new Set([...kid.parents,parent])];}
  if(ROMANCE.has(type)){
    if(ACTIVE_ROMANCE.has(type)){x.partner=b;y.partner=a;}
    else{normalizePartner(next,a,b);normalizePartner(next,b,a);}
  }
  const shared={since:String(options.since||'').slice(0,30),notes:String(options.notes||'').slice(0,800)};
  x.relations.push({id:genId(),to:b,type,...shared,...(type==='custom'?{customLabel:String(options.customLabel).trim()}: {})});
  y.relations.push({id:genId(),to:a,type:INVERSE[type],...shared,...(type==='custom'?{customLabel:String(options.reverseLabel||options.customLabel).trim()}: {})});
  return next;
}
export function removeRelation(people,a,b,type){
  const next=clonePeople(people),x=next.find(p=>p.id===a),y=next.find(p=>p.id===b);
  if(!x||!y)return next;
  const types=type?[type]:x.relations.filter(r=>r.to===b).map(r=>r.type);
  for(const t of types){if(INVERSE[t])removePairType(next,a,b,t);}
  // Old data may only have legacy parents/partner without relations.
  if(!type){x.parents=x.parents.filter(id=>id!==b);y.parents=y.parents.filter(id=>id!==a);}
  if(type==='parent')x.parents=x.parents.filter(id=>id!==b);
  if(type==='child')y.parents=y.parents.filter(id=>id!==a);
  if(!type||ROMANCE.has(type)){
    const remaining=x.relations.some(r=>r.to===b&&ACTIVE_ROMANCE.has(r.type));
    if(!remaining){normalizePartner(next,a,b);normalizePartner(next,b,a);}
  }
  return next;
}
const familyDirect=new Set(['parent','child','sibling','halfSibling','twin','grandparent','grandchild','greatGrandparent','greatGrandchild','uncle','nibling','greatUncle','greatNibling','cousin','secondCousin','thirdCousin']);
function ancestors(people,id,max=4){
  const out=new Map();let frontier=[id];
  for(let depth=1;depth<=max;depth++){
    frontier=[...new Set(frontier.flatMap(cid=>asArray(people.find(p=>p.id===cid)?.parents)))].filter(x=>x!==id&&!out.has(x));
    for(const parent of frontier)out.set(parent,depth);
    if(!frontier.length)break;
  }
  return out;
}
function siblingsKind(a,b){const pa=asArray(a.parents),pb=asArray(b.parents),shared=pa.filter(id=>pb.includes(id));return shared.length>=2?'sibling':shared.length===1?'halfSibling':null;}
function activePartners(p){
  const found=new Set(asArray(p.relations).filter(r=>ACTIVE_ROMANCE.has(r.type)).map(r=>r.to));
  if(p.partner&&!asArray(p.relations).some(r=>r.to===p.partner&&ROMANCE.has(r.type)))found.add(p.partner);
  return [...found];
}
export function getRelations(person,people){
  if(!person)return[];const everyone=people.filter(p=>p.id!==person.id);const byId=new Map(people.map(p=>[p.id,p]));const result=[];
  const add=(to,type,source='inferred',extra={})=>{
    if(!to||to===person.id||!byId.has(to))return;
    if(result.some(r=>r.to===to&&r.type===type))return;
    if(source==='inferred'){
      // An explicit kinship decision takes precedence over calculated genealogy.
      if(familyDirect.has(type)&&result.some(r=>r.to===to&&familyDirect.has(r.type)))return;
      if(RELATION_GROUP[type]==='blended'&&result.some(r=>r.to===to&&RELATION_GROUP[r.type]==='blended'))return;
    }
    result.push({to,type,source,...extra,person:byId.get(to)});
  };
  for(const r of asArray(person.relations))if(INVERSE[r.type])add(r.to,r.type,'explicit',r);
  for(const pid of asArray(person.parents))add(pid,'parent','legacy');
  for(const other of everyone)if(asArray(other.parents).includes(person.id))add(other.id,'child','legacy');
  if(person.partner&&!asArray(person.relations).some(r=>r.to===person.partner&&ROMANCE.has(r.type)))add(person.partner,'partner','legacy');
  const myAnc=ancestors(people,person.id,4);
  for(const other of everyone){
    const anc=ancestors(people,other.id,4);
    const depth=myAnc.get(other.id),reverse=anc.get(person.id);
    if(depth&&depth>=2)add(other.id,depth===2?'grandparent':'greatGrandparent');
    if(reverse&&reverse>=2)add(other.id,reverse===2?'grandchild':'greatGrandchild');
    if(depth||reverse)continue;
    const shared=siblingsKind(person,other);if(shared){add(other.id,shared);continue;}
    const myParents=asArray(person.parents),theirParents=asArray(other.parents);
    // Parent's sibling is an aunt/uncle; sibling's child is a niece/nephew.
    if(myParents.some(pid=>siblingsKind(byId.get(pid)||{parents:[]},other))) {add(other.id,'uncle');continue;}
    if(theirParents.some(pid=>siblingsKind(person,byId.get(pid)||{parents:[]}))) {add(other.id,'nibling');continue;}
    // First/second cousins share grandparents/great-grandparents at equal depth.
    const sharedGrand=[...myAnc].some(([id,d])=>d===2&&anc.get(id)===2);
    const sharedGreat=[...myAnc].some(([id,d])=>d===3&&anc.get(id)===3);
    if(sharedGrand)add(other.id,'cousin');else if(sharedGreat)add(other.id,'secondCousin');
  }
  // Partner's parents, partner of parent, partner's sibling (derived when known).
  for(const partnerId of activePartners(person)){
    const partner=byId.get(partnerId);if(!partner)continue;
    for(const pid of asArray(partner.parents))add(pid,'parentInLaw');
  }
  for(const pid of asArray(person.parents)){
    const par=byId.get(pid);if(!par)continue;
    for(const pp of activePartners(par))if(pp!==person.id&&!asArray(person.parents).includes(pp))add(pp,'stepparent');
  }
  for(const kid of everyone.filter(p=>asArray(p.parents).includes(person.id)))for(const kp of activePartners(kid))add(kp,'childInLaw');
  return result.sort((a,b)=>{
    const rank={family:0,blended:1,romance:2,social:3};
    return (rank[RELATION_GROUP[a.type]]??4)-(rank[RELATION_GROUP[b.type]]??4)||a.person.name.localeCompare(b.person.name,'ru');
  });
}

/** Build once-per-pair visual edges for the tree canvas, with a human label. */
export function buildRelationshipEdges(people){
  const byId=new Map(people.map(p=>[p.id,p]));const edges=[];const seen=new Set();
  const push=(a,b,type,source)=>{
    if(!byId.has(a)||!byId.has(b)||a===b)return;
    const canonical=(BIOLOGICAL.has(type)?'parent':[type,INVERSE[type]||type].sort()[0]);
    const key=[a,b].sort().join('~')+'~'+canonical;
    if(seen.has(key))return;seen.add(key);
    edges.push({a:byId.get(a),b:byId.get(b),type,source,group:RELATION_GROUP[type],label:relationShortLabel(type)});
  };
  for(const p of people){
    for(const pid of asArray(p.parents))push(pid,p.id,'parent','legacy');
    for(const r of asArray(p.relations)){
      if(!INVERSE[r.type])continue;
      if(r.type==='parent')push(r.to,p.id,'parent','explicit');
      else if(r.type==='child')push(p.id,r.to,'parent','explicit');
      else if(r.type!=='parent')push(p.id,r.to,r.type,'explicit');
    }
    if(p.partner&&!asArray(p.relations).some(r=>r.to===p.partner&&ROMANCE.has(r.type)))push(p.id,p.partner,'partner','legacy');
  }
  return edges;
}
