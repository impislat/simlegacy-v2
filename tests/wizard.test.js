import test from 'node:test';
import assert from 'node:assert/strict';
import {simName,validateWizardStep,buildSimFromWizard} from '../src/simWizardModel.js';
const base={gender:'female',first:' Луна ',last:' Мун ',life:'Подросток',gen:'3',role:'Наследница',photo:'data:image/jpeg;base64,xyz',bio:'История'};
test('display name is normalized from separately entered name and surname',()=>{
  assert.equal(simName(' Луна ',' Мун '),'Луна Мун');
  assert.equal(simName('Сим',''),'Сим');
});
test('wizard asks for a selected character and complete name',()=>{
  assert.match(validateWizardStep(0,{gender:''}),/Выберите/);
  assert.match(validateWizardStep(1,{first:' ',last:'Мун'}),/имя/);
  assert.match(validateWizardStep(1,{first:'Луна',last:' '}),/фамилию/);
  assert.equal(validateWizardStep(1,base),'');
});
test('saved sim has correct gender, age, lineage, photo, and full name',()=>{
  const p=buildSimFromWizard(base);
  assert.equal(p.name,'Луна Мун');assert.equal(p.firstName,'Луна');assert.equal(p.lastName,'Мун');
  assert.equal(p.life,'Подросток');assert.equal(p.gender,'female');assert.equal(p.gen,3);
  assert.equal(p.photo,base.photo);assert.equal(p.role,'Наследница');assert.equal(p.bio,base.bio);
});
test('invalid generation normalizes to first generation and does not throw away portrait',()=>{
  const p=buildSimFromWizard({...base,gender:'male',gen:'-20',photo:'https://example.test/photo.jpg'});
  assert.equal(p.gen,1);assert.equal(p.gender,'male');assert.equal(p.photo,'https://example.test/photo.jpg');
});
test('submitting an incomplete wizard cannot create an unnamed character',()=>{
  assert.throws(()=>buildSimFromWizard({...base,first:''}),/имя/);
  assert.throws(()=>buildSimFromWizard({...base,gender:''}),/Выберите/);
});
