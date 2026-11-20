import test from 'node:test';import assert from 'node:assert/strict';
import {autoArrangeTree,descendantIds,visibleTreePeople,treeGenerationStats} from '../src/treeEngine.js';
import {arr,makeEntry,makeField,setSkill,addTag,sanitizePublicTree,cloneSharedCharacter,syncSharedPerson} from '../src/featureModel.js';
import {normalizePhotos,setPhotoFolder,setPhotoVisibility,photoFolders} from '../src/photoAlbum.js';

const persons=[
 {id:'dad',name:'Отец',gen:1,parents:[],x:100,y:100},
 {id:'mom',name:'Мать',gen:1,parents:[],x:130,y:100,partner:'dad'},
 {id:'daughter',name:'Дочь',gen:1,parents:['dad','mom'],x:150,y:100},
 {id:'grandson',name:'Внук',gen:3,parents:['daughter'],x:160,y:100}
];
test('smart layout separates generations, adjusts child to parent generation',()=>{
 const newPeople=autoArrangeTree(persons),byId=new Map(newPeople.map(p=>[p.id,p]));
 assert.equal(byId.get('daughter').gen,2);assert.equal(byId.get('grandson').gen,3);
 assert.ok(byId.get('daughter').y>byId.get('dad').y);
 assert.ok(Math.abs(byId.get('mom').x-byId.get('dad').x)>=200);
 assert.equal(persons[2].gen,1);
});
test('automatic layout handles empty and disconnected branches',()=>{
 assert.deepEqual(autoArrangeTree([]),[]);
 const layout=autoArrangeTree([{id:'1',name:'Один',gen:1},{id:'2',name:'Два',gen:2}]);assert.equal(layout.length,2);assert.ok(layout.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)));
});
test('descendants can be collapsed without touching tree data',()=>{
 assert.deepEqual([...descendantIds(persons,'dad')].sort(),['daughter','grandson']);
 assert.deepEqual(visibleTreePeople(persons,['dad']).map(x=>x.id),['dad','mom']);
 assert.equal(persons.length,4);
});
test('generation counts are sorted',()=>assert.deepEqual(treeGenerationStats(persons),[{generation:1,count:3},{generation:3,count:1}]));
test('skill levels clamp to 1–10 and can be removed',()=>{
 const s=setSkill([],'Кулинария',15);assert.equal(s[0].level,10);
 assert.deepEqual(setSkill(s,'Кулинария',0),[]);assert.deepEqual(setSkill([], 'Программирование',3),[{name:'Программирование',level:3}]);
});
test('tags deduplicate; custom fields and journal events have IDs',()=>{
 assert.deepEqual(addTag(['любовь'],'любовь'),['любовь']);assert.equal(makeEntry({kind:'wedding'}).kind,'wedding');assert.ok(makeField('Секрет','Да').id);
});
test('public snapshot removes private notes, pictures, events, custom fields and cross tree IDs',()=>{
 const tree={id:'tree',title:'Test',cover:'private.jpg',gallery:[{src:'private.jpg',visibility:'private'},{src:'public.jpg'}],people:[{id:'p',name:'Женя',photo:'private.jpg',notes:'TOP SECRET',privateNotes:'SECRET',sharedSimId:'shared',gallery:[{src:'private.jpg',visibility:'private'},{src:'public.jpg'}],timeline:[{id:'a',title:'Публичный'}, {id:'b',title:'Секрет',visibility:'private'}],customFields:[{id:'a',label:'Hidden',visibility:'private'},{id:'b',label:'Open'}]}]};
 const clean=sanitizePublicTree(tree);
 assert.equal(clean.cover,'');assert.equal(clean.gallery.length,1);assert.equal(clean.people[0].photo,'');
 assert.equal(clean.people[0].notes,undefined);assert.equal(clean.people[0].sharedSimId,undefined);
 assert.equal(clean.people[0].gallery.length,1);assert.equal(clean.people[0].timeline.length,1);assert.equal(clean.people[0].customFields.length,1);
 assert.ok(JSON.stringify(clean).indexOf('TOP SECRET')<0);
});
test('linked character copies identity but not parents or position and syncs only profile fields',()=>{
 const source={id:'a',name:'Эмма',sharedSimId:'s1',parents:['x'],x:12,y:18,bio:'История',skills:[{name:'Рисование',level:5}]};
 const linked=cloneSharedCharacter(source);assert.notEqual(linked.id,source.id);assert.deepEqual(linked.parents,[]);assert.equal(linked.name,'Эмма');
 const synced=syncSharedPerson([{...linked,name:'Старое имя',x:400,parents:['p'],relations:[{to:'q',type:'parent'}]}],{...source,name:'Новое имя'});
 assert.equal(synced[0].name,'Новое имя');assert.equal(synced[0].x,400);assert.deepEqual(synced[0].parents,['p']);assert.equal(synced[0].relations.length,1);
});
test('album folders and privacy flags survive normalization',()=>{
 const original=[{id:'one',src:'a.jpg',folder:'Свадьба',visibility:'public'}];
 const b=setPhotoVisibility(original,'one','private');assert.equal(b[0].visibility,'private');assert.equal(original[0].visibility,'public');
 assert.equal(setPhotoFolder(b,'one','Питомцы')[0].folder,'Питомцы');
 assert.deepEqual(photoFolders(setPhotoFolder(b,'one','Питомцы')),['Все снимки','Питомцы']);
 assert.equal(normalizePhotos(['one.jpg'])[0].visibility,'public');
});
