import React,{useState} from 'react';
import {Palette} from 'lucide-react';
import './tree-appearance.css';
export const DEFAULT_TREE_STYLE={familyColor:'#70a687',romanceColor:'#d88ea9',blendedColor:'#8898c8',socialColor:'#c4a875',lineWidth:3,cardRadius:25,showLabels:true,cardTint:'#ffffff'};
export function TreeAppearanceEditor({value,onChange}){
 const style={...DEFAULT_TREE_STYLE,...(value||{})};
 const update=(field,data)=>onChange({...style,[field]:data});
 return <section className="tree-appearance"><div className="studio-heading"><Palette/><div><h3>Визуальное оформление древа</h3><p>Настрой цвета линий, подписи и стиль карточек.</p></div></div>
 <div className="appearance-colors">{[['familyColor','Родственные связи'],['romanceColor','Любовь и партнёры'],['blendedColor','Другие семейные связи'],['socialColor','Друзья и знакомства']].map(([field,label])=><label key={field}><span>{label}</span><input type="color" value={style[field]} onChange={e=>update(field,e.target.value)}/></label>)}</div>
 <label className="appearance-range">Толщина линий <b>{style.lineWidth}px</b><input type="range" min="1" max="7" value={style.lineWidth} onChange={e=>update('lineWidth',Number(e.target.value))}/></label>
 <label className="appearance-range">Скругление карточек <b>{style.cardRadius}px</b><input type="range" min="4" max="34" value={style.cardRadius} onChange={e=>update('cardRadius',Number(e.target.value))}/></label>
 <label className="appearance-switch"><input type="checkbox" checked={style.showLabels!==false} onChange={e=>update('showLabels',e.target.checked)}/><span>Показывать значки отношений прямо на линиях</span></label>
 <button type="button" className="studio-add-btn" onClick={()=>onChange({...DEFAULT_TREE_STYLE})}>Вернуть оформление по умолчанию</button></section>;
}
