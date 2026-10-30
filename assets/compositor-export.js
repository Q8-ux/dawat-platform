/* Compositor .comp writer. Project format: https://github.com/robbietilton/Compositor/blob/main/docs/project-format.md */
(function(root){
'use strict';
const encoder=new TextEncoder();
const crcTable=Array.from({length:256},(_,n)=>{for(let i=0;i<8;i++)n=(n&1)?0xedb88320^(n>>>1):n>>>1;return n>>>0});
function crc32(bytes){let crc=0xffffffff;for(const byte of bytes)crc=crcTable[(crc^byte)&255]^(crc>>>8);return (crc^0xffffffff)>>>0}
async function bytes(value){
 if(typeof value==='string')return encoder.encode(value);
 if(value instanceof Uint8Array)return value;
 if(value instanceof ArrayBuffer)return new Uint8Array(value);
 if(value&&typeof value.arrayBuffer==='function')return new Uint8Array(await value.arrayBuffer());
 throw new Error('Unsupported archive data');
}
function safePath(path){
 if(typeof path!=='string'||!path||path.length>512||path.startsWith('/')||path.includes('\\')||path.includes('\0')||path.split('/').some(p=>!p||p==='.'||p==='..'))throw new Error('Invalid archive path');
 return path;
}
// ZIP method 0 (stored) is supported by Finder without a dependency or network service.
async function zip(entries){
 if(!Array.isArray(entries)||entries.length<1||entries.length>1000)throw new Error('Invalid archive entry count');
 const seen=new Set(),local=[],central=[];let offset=0;
 for(const entry of entries){
  const path=safePath(entry.path);if(seen.has(path))throw new Error('Duplicate archive path');seen.add(path);
  const name=encoder.encode(path),data=await bytes(entry.data),crc=crc32(data);
  if(offset+data.length>256*1024*1024)throw new Error('Archive exceeds 256 MiB');
  const header=new Uint8Array(30),view=new DataView(header.buffer);
  view.setUint32(0,0x04034b50,true);view.setUint16(4,20,true);view.setUint16(6,0x800,true);
  view.setUint16(12,0x21,true);view.setUint32(14,crc,true);view.setUint32(18,data.length,true);view.setUint32(22,data.length,true);view.setUint16(26,name.length,true);
  local.push(header,name,data);
  const dir=new Uint8Array(46),dv=new DataView(dir.buffer);
  dv.setUint32(0,0x02014b50,true);dv.setUint16(4,20,true);dv.setUint16(6,20,true);dv.setUint16(8,0x800,true);dv.setUint16(14,0x21,true);
  dv.setUint32(16,crc,true);dv.setUint32(20,data.length,true);dv.setUint32(24,data.length,true);dv.setUint16(28,name.length,true);dv.setUint32(42,offset,true);
  central.push(dir,name);offset+=header.length+name.length+data.length;
 }
 const dirSize=central.reduce((size,piece)=>size+piece.length,0),end=new Uint8Array(22),ev=new DataView(end.buffer);
 ev.setUint32(0,0x06054b50,true);ev.setUint16(8,entries.length,true);ev.setUint16(10,entries.length,true);ev.setUint32(12,dirSize,true);ev.setUint32(16,offset,true);
 return new Blob([...local,...central,end],{type:'application/zip'});
}
function uuid(){
 if(root.crypto&&root.crypto.randomUUID)return root.crypto.randomUUID().toUpperCase();
 return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{const n=Math.floor(Math.random()*16);return (c==='x'?n:(n&3)|8).toString(16)}).toUpperCase();
}
function canvas(width,height){
 if(!Number.isInteger(width)||!Number.isInteger(height)||width<1||height<1||width>30000||height>30000)throw new Error('Invalid canvas dimensions');
 const result=root.document.createElement('canvas');result.width=width;result.height=height;
 if(!result.getContext('2d'))throw new Error('الرسم غير متاح في هذا المتصفح.');return result;
}
function png(surface){return new Promise((resolve,reject)=>surface.toBlob(blob=>blob?resolve(blob):reject(new Error('تعذر إنشاء طبقة الصورة.')),'image/png'))}
function rgb(hex){
 if(!/^#[0-9a-f]{6}$/i.test(hex))throw new Error('Invalid RGB color');
 return {red:parseInt(hex.slice(1,3),16)/255,green:parseInt(hex.slice(3,5),16)/255,blue:parseInt(hex.slice(5,7),16)/255};
}
function textMetadata(content,fontName,fontSize,color,alignment,leading,boxSize){
 if(!['Left','Center','Right'].includes(alignment)||!fontName||!Number.isFinite(fontSize)||fontSize<1||fontSize>2000)throw new Error('Invalid text style');
 return {content:String(content),fontName,fontSize,...rgb(color),alignment,tracking:0,leading:leading||0,boxSize};
}
async function project(options){
 const {width,height}=options;
 if(!Number.isInteger(width)||!Number.isInteger(height)||width<1||height<1||width>30000||height>30000||!options.layers?.length)throw new Error('Invalid project');
 const name=String(options.name||'Design').replace(/[^A-Za-z0-9_-]/g,'-').slice(0,80)||'Design';
 const base=name+'.comp',layers=[],entries=[];
 for(const layer of options.layers){
  const id=uuid(),w=layer.canvas.width,h=layer.canvas.height,x=layer.x??0,y=layer.y??0;
  if(![x,y,w,h].every(Number.isFinite)||w<1||h<1||x<0||y<0||x+w>width||y+h>height)throw new Error('Layer lies outside artboard: '+layer.name);
  const record={id,name:String(layer.name||'Layer'),isVisible:layer.visible!==false,isGroup:false,opacity:1,blendMode:'Normal',imageFile:id+'.png',transform:{origin:[x,y],size:[w,h],rotation:0,flipX:false,flipY:false,sampling:'High quality'}};
  if(layer.text)record.text=layer.text;
  layers.push(record);entries.push({path:base+'/images/'+id+'.png',data:await png(layer.canvas)});
 }
 const manifest={format:'com.compositor.project',version:11,colorSpace:'sRGB',resolution:options.resolution||72,documentID:uuid(),width,height,activeLayerID:layers[layers.length-1].id,layers};
 entries.push({path:base+'/manifest.json',data:JSON.stringify(manifest,null,2)});
 return {manifest,entries,name:base};
}
function flatten(width,height,layers){const out=canvas(width,height),ctx=out.getContext('2d');for(const layer of layers)if(layer.visible!==false)ctx.drawImage(layer.canvas,layer.x||0,layer.y||0);return out}
function save(blob,filename){const url=URL.createObjectURL(blob),link=root.document.createElement('a');link.href=url;link.download=filename;root.document.body.appendChild(link);link.click();link.remove();root.setTimeout(()=>URL.revokeObjectURL(url),30000)}
const api=Object.freeze({crc32,zip,uuid,canvas,png,rgb,textMetadata,project,flatten,save});
root.COMPOSITOR_EXPORT=api;
if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
