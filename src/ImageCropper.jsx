import React,{useEffect,useRef,useState} from 'react';
import {X,ZoomIn,ZoomOut,RotateCcw,Check} from 'lucide-react';
import './imageCropper.css';
export default function ImageCropper({src,onSave,onCancel,ratio=1}){
 const canvasRef=useRef(null),imgRef=useRef(null),drag=useRef(null);
 const [zoom,setZoom]=useState(1),[pos,setPos]=useState({x:0,y:0}),[frame,setFrame]=useState(ratio);
 useEffect(()=>{const im=new Image();im.onload=()=>{imgRef.current=im;draw()};im.src=src;},[src]);
 useEffect(()=>{const c=canvasRef.current;if(!c)return;c.width=720;c.height=Math.round(720/frame);draw()},[frame]);
 useEffect(()=>{draw()},[zoom,pos]);
 function draw(){const c=canvasRef.current,im=imgRef.current;if(!c||!im)return;const ctx=c.getContext('2d'),w=c.width,h=c.height;ctx.clearRect(0,0,w,h);const scale=Math.max(w/im.width,h/im.height)*zoom;const iw=im.width*scale,ih=im.height*scale;ctx.drawImage(im,(w-iw)/2+pos.x,(h-ih)/2+pos.y,iw,ih)}
 function reset(){setZoom(1);setPos({x:0,y:0})}
 function pointerDown(e){drag.current={x:e.clientX,y:e.clientY,px:pos.x,py:pos.y};e.currentTarget.setPointerCapture?.(e.pointerId)}
 function pointerMove(e){if(drag.current){const rect=e.currentTarget.getBoundingClientRect(),factor=canvasRef.current.width/rect.width;setPos({x:drag.current.px+(e.clientX-drag.current.x)*factor,y:drag.current.py+(e.clientY-drag.current.y)*factor})}}
 function pointerEnd(){drag.current=null}
 function save(){onSave(canvasRef.current.toDataURL('image/jpeg',.88))}
 return <div className="crop-backdrop" onMouseDown={e=>e.target===e.currentTarget&&onCancel()}><section className="crop-modal"><header><div><small>ПОДГОТОВКА ФОТО</small><h2>Настрой кадрирование</h2></div><button onClick={onCancel}><X/></button></header><p>Перемещай фотографию и настрой масштаб, чтобы выбрать нужный кадр.</p><div className="crop-preview"><canvas ref={canvasRef} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerEnd} onPointerCancel={pointerEnd}/></div><div className="crop-controls"><label>Формат кадра<select value={frame} onChange={e=>{setFrame(Number(e.target.value));reset()}}><option value="1">Квадрат</option><option value="0.75">Портрет 3:4</option><option value="1.333333">Горизонтальный 4:3</option><option value="1.777777">Широкий 16:9</option></select></label><label className="crop-zoom"><span>Масштаб</span><button onClick={()=>setZoom(z=>Math.max(.5,z-.1))}><ZoomOut size={16}/></button><input type="range" min=".5" max="3" step=".05" value={zoom} onChange={e=>setZoom(Number(e.target.value))}/><button onClick={()=>setZoom(z=>Math.min(3,z+.1))}><ZoomIn size={16}/></button></label></div><footer><button className="crop-reset" onClick={reset}><RotateCcw size={15}/> Сброс</button><button className="crop-save" onClick={save}><Check size={16}/> Использовать фото</button></footer></section></div>
}