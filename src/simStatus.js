export const DEATH_CAUSES=[
  'Старость','Пожар','Утопление','Голод','Удар током','Перегрев','Замерзание',
  'Сильные эмоции','Перенапряжение','Растение-корова','Молния','Метеорит',
  'Отравление','Солнечный свет (вампир)','Кровать Мёрфи','Болезнь','Несчастный случай',
  'Сюжетная причина','Другое'
];
export function isDeceased(person){
  if(!person)return false;
  if(person.status==='deceased')return true;
  if(person.status==='alive')return false;
  return person.life==='Умерший';
}
export function statusLabel(person){return isDeceased(person)?'Умер':'Жив'}
