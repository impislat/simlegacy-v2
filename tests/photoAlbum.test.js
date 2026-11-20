import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizePhotos,appendPhoto,changeCaption,removePhoto} from '../src/photoAlbum.js';
import {isDeceased,statusLabel,DEATH_CAUSES} from '../src/simStatus.js';

test('legacy albums and untouched data remain supported',()=>{
 assert.deepEqual(normalizePhotos(null),[]);
 assert.equal(normalizePhotos(['one.jpg'])[0].src,'one.jpg');
 assert.equal(normalizePhotos([{url:'two.jpg'}])[0].src,'two.jpg');
});
test('adding, captioning and deleting photo never mutates the original',()=>{
 const old=[{id:'1',src:'one.jpg',caption:''}];
 const next=appendPhoto(old,{id:'2',src:'two.jpg',caption:''},8);
 assert.equal(next.length,2);assert.equal(old.length,1);
 const captioned=changeCaption(next,'2','Наше семейное фото');
 assert.equal(captioned[1].caption,'Наше семейное фото');assert.equal(next[1].caption,'');
 assert.deepEqual(removePhoto(captioned,'1').map(p=>p.id),['2']);
});
test('album limit is enforced',()=>{
 assert.throws(()=>appendPhoto([{id:'1',src:'a'}],{id:'2',src:'b'},1),/лимит/i);
});
test('alive status is independent from life stage',()=>{
 assert.equal(isDeceased({status:'deceased',life:'Молодой взрослый'}),true);
 assert.equal(isDeceased({status:'alive',life:'Умерший'}),false);
 assert.equal(isDeceased({life:'Умерший'}),true);
 assert.equal(isDeceased({life:'Подросток'}),false);
 assert.equal(statusLabel({status:'deceased'}),'Умер');
 assert.ok(DEATH_CAUSES.includes('Старость'));
});
