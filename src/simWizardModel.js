export const simName=(first,last)=>[String(first||'').trim(),String(last||'').trim()].filter(Boolean).join(' ');

export function validateWizardStep(step,{gender,first,last}){
  if(step===0&&!['male','female'].includes(gender))return 'Выберите персонажа, чтобы продолжить.';
  if(step===1&&!String(first||'').trim())return 'Укажите имя сима.';
  if(step===1&&!String(last||'').trim())return 'Укажите фамилию сима.';
  return '';
}

export function buildSimFromWizard({gender,first,last,life,gen,role,photo,bio}){
  const issue=validateWizardStep(0,{gender,first,last})||validateWizardStep(1,{gender,first,last});
  if(issue)throw new Error(issue);
  const generation=Math.floor(Number(gen));
  return {
    name:simName(first,last),firstName:String(first).trim(),lastName:String(last).trim(),gender,
    life:life||'Молодой взрослый',gen:Number.isInteger(generation)&&generation>=1&&generation<=99?generation:1,
    role:String(role||'').trim(),photo:photo||'',bio:String(bio||'').trim(),traits:'',
    accent:gender==='female'?'#aa89ad':'#79a78b'
  };
}
