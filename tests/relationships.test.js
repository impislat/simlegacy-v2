import test from 'node:test';
import assert from 'node:assert/strict';
import {setRelation,removeRelation,getRelations,buildRelationshipEdges,relationLabel,INVERSE,RELATION_TYPES} from '../src/relationships.js';
const sims=(...names)=>names.map((name,i)=>({id:`s${i+1}`,name,parents:[],partner:'',relations:[],x:i*300,y:100,gender:i%2?'female':'male'}));
const find=(people,id)=>people.find(p=>p.id===id);
const rel=(people,id,to,type)=>getRelations(find(people,id),people).find(r=>r.to===to&&r.type===type);

test('every relationship has an inverse and is selectable',()=>{
  for(const type of RELATION_TYPES.flatMap(g=>g.items.map(x=>x[0])))assert.equal(typeof INVERSE[type],'string',type);
});
test('parent means the other sim is my parent; writes both sides',()=>{
  const p=setRelation(sims('Алексей','Ольга'),'s1','s2','parent');
  assert.deepEqual(find(p,'s1').parents,['s2']);
  assert.equal(rel(p,'s1','s2','parent').source,'explicit');
  assert.equal(rel(p,'s2','s1','child').source,'explicit');
  const edges=buildRelationshipEdges(p).filter(x=>x.type==='parent');
  assert.equal(edges.length,1);assert.equal(edges[0].a.id,'s2');assert.equal(edges[0].b.id,'s1');
});
test('selecting child correctly changes the other sim parent list',()=>{
  const p=setRelation(sims('Отец','Сын'),'s1','s2','child');
  assert.deepEqual(find(p,'s2').parents,['s1']);
});
test('full siblings are automatically inferred from two common parents',()=>{
  const p=sims('Отец','Мать','Сын','Дочь');p[2].parents=['s1','s2'];p[3].parents=['s1','s2'];
  assert.equal(rel(p,'s3','s4','sibling').source,'inferred');
  assert.equal(rel(p,'s4','s3','sibling').source,'inferred');
});
test('half siblings are inferred from one common parent',()=>{
  const p=sims('Мама','Мальчик','Девочка');p[1].parents=['s1'];p[2].parents=['s1'];
  assert.ok(rel(p,'s2','s3','halfSibling'));
});
test('grandparent and grandchild are automatically inferred',()=>{
  const p=sims('Бабушка','Мама','Дочь');p[1].parents=['s1'];p[2].parents=['s2'];
  assert.ok(rel(p,'s3','s1','grandparent'));
  assert.ok(rel(p,'s1','s3','grandchild'));
});
test('romance status changes without deleting children or friendships',()=>{
  let p=sims('Алексей','Мария','Ребёнок');p[2].parents=['s1','s2'];
  p=setRelation(p,'s1','s2','friend');
  p=setRelation(p,'s1','s2','spouse');
  assert.ok(rel(p,'s2','s1','spouse'));
  assert.equal(find(p,'s1').partner,'s2');
  p=setRelation(p,'s1','s2','exSpouse');
  assert.equal(find(p,'s1').partner,'');
  assert.equal(find(p,'s2').partner,'');
  assert.deepEqual(find(p,'s3').parents,['s1','s2']);
  assert.ok(rel(p,'s1','s2','friend'));
  assert.ok(rel(p,'s1','s2','exSpouse'));
  assert.equal(rel(p,'s1','s2','spouse'),undefined);
});
test('new relation of another category does not remove existing ties',()=>{
  let p=sims('А','Б');p=setRelation(p,'s1','s2','friend');p=setRelation(p,'s1','s2','partner');p=setRelation(p,'s1','s2','coParent');
  assert.ok(rel(p,'s1','s2','friend'));assert.ok(rel(p,'s1','s2','partner'));assert.ok(rel(p,'s1','s2','coParent'));
});
test('custom relation has independent reverse label',()=>{
  const p=setRelation(sims('А','Б'),'s1','s2','custom',{customLabel:'Мой наставник',reverseLabel:'Мой ученик',notes:'Знакомы с детства'});
  assert.equal(relationLabel('custom',find(p,'s2'),rel(p,'s1','s2','custom')),'Мой наставник');
  assert.equal(relationLabel('custom',find(p,'s1'),rel(p,'s2','s1','custom')),'Мой ученик');
  assert.equal(rel(p,'s1','s2','custom').notes,'Знакомы с детства');
});
test('selective delete leaves unrelated ties intact',()=>{
  let p=sims('А','Б');p=setRelation(p,'s1','s2','friend');p=setRelation(p,'s1','s2','spouse');p=removeRelation(p,'s1','s2','spouse');
  assert.ok(rel(p,'s1','s2','friend'));assert.equal(rel(p,'s1','s2','spouse'),undefined);
  assert.equal(find(p,'s2').partner,'');
});
test('changing relation updates the reverse and removes old type',()=>{
  let p=sims('А','Б');p=setRelation(p,'s1','s2','sibling');p=setRelation(p,'s1','s2','twin',{replaceType:'sibling'});
  assert.equal(rel(p,'s1','s2','sibling'),undefined);assert.ok(rel(p,'s1','s2','twin'));
  assert.ok(rel(p,'s2','s1','twin'));
});
test('a biological parent cannot be their own descendant',()=>{
  let p=sims('Бабушка','Мать','Дочь');p=setRelation(p,'s1','s2','child');p=setRelation(p,'s2','s3','child');
  assert.throws(()=>setRelation(p,'s1','s3','parent'),/цикл/);
});
test('third biological parent is rejected but adoptive parents are allowed',()=>{
  let p=sims('Ребёнок','Отец','Мать','Приёмная мама');p=setRelation(p,'s1','s2','parent');p=setRelation(p,'s1','s3','parent');
  assert.throws(()=>setRelation(p,'s1','s4','parent'),/два биологических/);
  p=setRelation(p,'s1','s4','adoptiveParent');assert.ok(rel(p,'s1','s4','adoptiveParent'));
});
test('legacy-only data is readable and removable',()=>{
  let p=sims('Отец','Дочь');p[0].partner='s2';p[1].partner='s1';p[1].parents=['s1'];
  assert.ok(rel(p,'s1','s2','child'));assert.ok(rel(p,'s2','s1','parent'));
  p=removeRelation(p,'s2','s1','parent');assert.deepEqual(find(p,'s2').parents,[]);
});
test('display labels match gender of the related sim',()=>{
  const p=sims('Иван','Мария');assert.equal(relationLabel('spouse',p[0]),'Муж');assert.equal(relationLabel('spouse',p[1]),'Жена');
  assert.equal(relationLabel('child',p[1]),'Дочь');
});
test('reciprocal partner edges render only once',()=>{
  let p=sims('А','Б');p=setRelation(p,'s1','s2','spouse');
  assert.equal(buildRelationshipEdges(p).filter(e=>e.type==='spouse').length,1);
});
test('cousins inferred from shared grandparents',()=>{
  const p=sims('Grandparent','Child A','Child B','Grandchild A','Grandchild B');p[1].parents=['s1'];p[2].parents=['s1'];p[3].parents=['s2'];p[4].parents=['s3'];
  assert.ok(rel(p,'s4','s5','cousin'));
});
