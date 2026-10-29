/* DAWAT motion studio: original local rendering; no remote services or assets. */
(function(root){
'use strict';
const presets=Object.freeze([
 Object.freeze({id:'none',name:'بطاقة ثابتة',detail:'جميع التفاصيل ظاهرة'}),
 Object.freeze({id:'breeze',name:'نسيم ناعم',detail:'ظهور هادئ ولمسات نباتية'}),
 Object.freeze({id:'sparkle',name:'بريق احتفالي',detail:'نجوم ذهبية ونص متدرّج'}),
 Object.freeze({id:'cinema',name:'افتتاحية سينمائية',detail:'إطار مضيء ودخول أنيق'})
]);
const durations=Object.freeze([8,12,16]);
let currentPlayer=null;
let exporting=false;
const clamp=(value,min,max)=>Math.min(max,Math.max(min,value));
const ease=value=>{const p=clamp(value,0,1);return 1-Math.pow(1-p,3)};
function normalize(item){
 item=item||{};
 return {motion:presets.some(p=>p.id===item.motion)?item.motion:'none',duration:durations.includes(Number(item.duration))?Number(item.duration):12};
}
function controls(item){
 const settings=normalize(item);
 return '<section class="motion-controls" aria-labelledby="motion-heading"><div class="motion-controls-heading"><div><span class="motion-kicker">حركة تليق بفرحتك</span><h3 id="motion-heading">دعوتك… تنبض بالحياة</h3></div><span class="motion-format">9:16</span></div><div class="motion-choices" role="group" aria-label="أسلوب حركة الدعوة">'+presets.map(p=>'<button type="button" data-motion-choice="'+p.id+'" aria-pressed="'+String(p.id===settings.motion)+'"><span class="motion-choice-icon motion-icon-'+p.id+'" aria-hidden="true">'+({none:'◇',breeze:'❧',sparkle:'✦',cinema:'▷'}[p.id])+'</span><strong>'+p.name+'</strong><small>'+p.detail+'</small></button>').join('')+'</div><div class="motion-toolbar"><label for="motion-duration">مدة الفيديو <select id="motion-duration" aria-label="مدة الفيديو">'+durations.map(d=>'<option value="'+d+'" '+(d===settings.duration?'selected':'')+'>'+d+' ثانية</option>').join('')+'</select></label><div><button class="btn btn-white btn-sm" type="button" data-motion-replay>إعادة العرض</button><button class="btn btn-white btn-sm" type="button" data-motion-pause aria-pressed="false">إيقاف الحركة</button></div></div><div class="motion-export-row"><button class="btn btn-gold" type="button" data-motion-export>تنزيل فيديو الدعوة <span aria-hidden="true">↓</span></button><p>فيديو عمودي بلا صوت · 1080 × 1920<br><span data-motion-format>MP4 أو WebM حسب دعم متصفحك</span></p></div><p class="motion-playback-note" data-motion-status role="status"></p></section>';
}
function destroy(){if(currentPlayer){currentPlayer.destroy();currentPlayer=null}}
function mount(container,item){
 destroy();
 const settings=normalize(item);
 const target=container&&container.querySelector('.web-hero, .invite-card');
 if(!target)return null;
 const media=typeof root.matchMedia==='function'?root.matchMedia('(prefers-reduced-motion: reduce)'):null;
 const animations=[];
 let layer=null;
 let paused=false;
 target.classList.add('motion-card');
 target.dataset.motion=settings.motion;
 function animate(element,keyframes,options){
  if(typeof element.animate==='function')animations.push(element.animate(keyframes,options));
 }
 function clear(){animations.splice(0).forEach(a=>a.cancel());if(layer){layer.remove();layer=null}}
 function build(){
  clear();paused=false;
  if(settings.motion==='none'||media&&media.matches)return;
  layer=root.document.createElement('span');layer.className='motion-particles';layer.setAttribute('aria-hidden','true');
  const count=settings.motion==='cinema'?8:14;
  for(let i=0;i<count;i++){
   const particle=root.document.createElement('i');
   particle.style.left=(7+(i*31)%87)+'%';particle.style.top=(8+(i*47)%85)+'%';
   particle.textContent=settings.motion==='breeze'?'❧':'✦';
   layer.appendChild(particle);
   animate(particle,[{opacity:0,transform:'translateY(12px) rotate(-12deg)'},{opacity:.5,offset:.25},{opacity:.25,offset:.75},{opacity:0,transform:'translateY(-50px) rotate(18deg)'}],{duration:settings.duration*1000,delay:0,easing:'ease-in-out',fill:'none'});
  }
  target.appendChild(layer);
  const content=target.querySelector('.story-content, .web-hero-copy')||target;
  Array.from(content.children).filter(el=>el!==layer).forEach((element,i)=>{
   const cinematic=settings.motion==='cinema';
   animate(element,[{opacity:0,transform:cinematic?'translateY(20px) scale(.96)':'translateY(13px)'},{opacity:1,transform:'translateY(0) scale(1)'}],{duration:cinematic?1350:1000,delay:180+Math.min(i,8)*180,easing:'cubic-bezier(.16,1,.3,1)',fill:'backwards'});
  });
 }
 const player={
  get paused(){return paused},
  get reduced(){return Boolean(media&&media.matches)},
  get enabled(){return settings.motion!=='none'},
  pause(){animations.forEach(a=>a.pause());paused=true},
  play(){animations.forEach(a=>a.play());paused=false},
  replay(){build()},
  destroy(){clear();if(media&&media.removeEventListener)media.removeEventListener('change',build);target.classList.remove('motion-card');delete target.dataset.motion}
 };
 if(media&&media.addEventListener)media.addEventListener('change',build);
 build();currentPlayer=player;return player;
}
function wrapLines(ctx,text,width){
 const result=[];
 String(text||'').split(/\r?\n/).forEach(paragraph=>{
  let line='';
  paragraph.split(/\s+/).filter(Boolean).forEach(word=>{
   const candidate=line?line+' '+word:word;
   if(ctx.measureText(candidate).width<=width){line=candidate;return}
   if(line){result.push(line);line=''}
   if(ctx.measureText(word).width<=width){line=word;return}
   // Break very long tokens by code point; no text is silently discarded.
   for(const char of Array.from(word)){
    if(line&&ctx.measureText(line+char).width>width){result.push(line);line=''}
    line+=char;
   }
  });
  if(line)result.push(line);
 });
 return result;
}
function layoutText(ctx,item,formatDate){
 const blocks=[
  {text:item.host||'دعوة كريمة',size:43,weight:700,gap:22},
  {text:item.kind||'مناسبة سعيدة',size:40,weight:400,gap:35},
  {text:item.names||item.title||'دعوة خاصة',size:94,weight:700,gap:42},
  {text:item.message||'تكتمل فرحتنا بوجودكم',size:47,weight:400,gap:40},
  {text:formatDate(item.date),size:43,weight:700,gap:8},
  {text:item.time||'',size:41,weight:400,gap:25},
  {text:item.venue||'',size:43,weight:400,gap:24},
  {text:item.closing||'',size:39,weight:400,gap:0}
 ].filter(block=>String(block.text).trim());
 for(let factor=1;factor>=.55;factor-=.05){
  const measured=blocks.map(block=>{
   const size=Math.round(block.size*factor),font=block.weight+' '+size+'px Amiri';ctx.font=font;
   const lines=wrapLines(ctx,block.text,760),step=size*1.55;
   return {...block,font,lines,step,gap:block.gap*factor,height:lines.length*step+block.gap*factor};
  });
  const height=measured.reduce((sum,block)=>sum+block.height,0);
  if(height<=1320)return {blocks:measured,height,top:(1920-height)/2};
 }
 throw new Error('نص الدعوة طويل للفيديو؛ اختصر الرسالة لتظهر جميع التفاصيل بوضوح.');
}
function particlesForFrame(frame,duration,style){
 if(style==='none')return [];
 const time=clamp(Number(frame)||0,0,duration*30)/30;
 const count=style==='cinema'?8:18;
 return Array.from({length:count},(_,i)=>{
  const phase=(time/duration+i*.173)%1;
  return {x:55+(i*173)%970+Math.sin(time*.5+i)*16,y:1900-phase*1870,alpha:Math.sin(phase*Math.PI)*.48,size:style==='breeze'?10+i%5:4+i%8,angle:time*.18+i};
 });
}
function drawFrame(ctx,render,frame){
 const {item,settings,image,layout,palette}=render;
 const time=clamp(Number(frame)||0,0,settings.duration*30)/30;
 ctx.save();ctx.globalAlpha=1;ctx.fillStyle=palette.bg;ctx.fillRect(0,0,1080,1920);
 if(image){const zoom=settings.motion==='none'?1:1+.016*Math.sin(time/settings.duration*Math.PI);ctx.drawImage(image,540-540*zoom,960-960*zoom,1080*zoom,1920*zoom)}
 else{ctx.strokeStyle=palette.accent;ctx.lineWidth=3;ctx.strokeRect(55,65,970,1790);ctx.strokeRect(75,85,930,1750)}
 const panelHeight=Math.min(1490,layout.height+150);
 ctx.fillStyle=palette.panel;ctx.beginPath();ctx.roundRect(115,(1920-panelHeight)/2,850,panelHeight,42);ctx.fill();
 ctx.strokeStyle=palette.accent;ctx.globalAlpha=.42;ctx.lineWidth=2;
 const border=settings.motion==='cinema'?ease(time/2):1;
 ctx.strokeRect(138,Math.max(116,(1920-panelHeight)/2-28),804*border,Math.min(1688,panelHeight+56));
 ctx.globalAlpha=1;
 for(const p of particlesForFrame(frame,settings.duration,settings.motion)){
  ctx.save();ctx.globalAlpha=p.alpha;ctx.translate(p.x,p.y);ctx.rotate(p.angle);ctx.fillStyle=palette.accent;
  if(settings.motion==='breeze'){ctx.beginPath();ctx.ellipse(0,0,p.size,p.size*.4,0,0,Math.PI*2);ctx.fill()}
  else{ctx.beginPath();ctx.moveTo(0,-p.size);ctx.lineTo(p.size*.3,-p.size*.3);ctx.lineTo(p.size,0);ctx.lineTo(p.size*.3,p.size*.3);ctx.lineTo(0,p.size);ctx.lineTo(-p.size*.3,p.size*.3);ctx.lineTo(-p.size,0);ctx.lineTo(-p.size*.3,-p.size*.3);ctx.closePath();ctx.fill()}
  ctx.restore();
 }
 let y=layout.top;
 ctx.textAlign='center';ctx.direction='rtl';ctx.textBaseline='alphabetic';ctx.fillStyle=palette.ink;
 layout.blocks.forEach((block,index)=>{
  const progress=settings.motion==='none'?1:ease((time-.15-index*.2)/1.15);
  ctx.save();ctx.globalAlpha=progress;ctx.translate(0,(1-progress)*(settings.motion==='cinema'?35:22));ctx.font=block.font;
  if(block.image){ctx.drawImage(block.image,130,y);y+=block.lines.length*block.step}
  else for(const line of block.lines){ctx.fillText(line,540,y+block.step*.78);y+=block.step}
  y+=block.gap;ctx.restore();
 });
 ctx.restore();
}
async function createRenderer(item,formatDate){
 const settings=normalize(item);
 if(root.document.fonts){await Promise.all([root.document.fonts.load('700 94px Amiri'),root.document.fonts.load('400 47px Amiri')]);await root.document.fonts.ready}
 const story=root.DAWAT_STORY_UI&&root.DAWAT_STORY_UI.find(item.story);
 const catalog=(root.DAWAT_CATALOG||[]).find(t=>t.id===item.theme);
 const light=story?story.tone==='light':Boolean(catalog&&parseInt(catalog.bg.replace('#','').slice(0,2),16)<100);
 const palette={bg:catalog?catalog.bg:'#f9f3e8',ink:story?(light?'#fff2d7':'#382f2a'):(catalog?catalog.fg:'#382f2a'),accent:story?(light?'#e4c887':'#b18e57'):(catalog?catalog.accent:'#b18e57'),panel:light?'rgba(5,13,22,.73)':'rgba(255,253,246,.88)'};
 let image=null;
 if(story){
  const art=await new Promise((resolve,reject)=>{const img=new root.Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error('تعذر تحميل خلفية الدعوة؛ أعد المحاولة.'));img.src=story.src});
  image=root.document.createElement('canvas');image.width=1080;image.height=1920;image.getContext('2d').drawImage(art,0,0,1080,1920);
 }
 const canvas=root.document.createElement('canvas');canvas.width=1080;canvas.height=1920;
 const ctx=canvas.getContext('2d');if(!ctx)throw new Error('الرسم غير متاح في هذا المتصفح.');
 const layout=layoutText(ctx,item,formatDate);
 // Cache Arabic shaping and SVG rasterization once, keeping frame rendering light on phones.
 layout.blocks.forEach(block=>{
  const layer=root.document.createElement('canvas');layer.width=820;layer.height=Math.ceil(block.lines.length*block.step+12);
  const text=layer.getContext('2d');text.fillStyle=palette.ink;text.font=block.font;text.direction='rtl';text.textAlign='center';text.textBaseline='alphabetic';
  block.lines.forEach((line,index)=>text.fillText(line,410,index*block.step+block.step*.78));block.image=layer;
 });
 const render={item,settings,image,layout,palette};
 return {canvas,draw:frame=>drawFrame(ctx,render,frame),duration:settings.duration};
}
function videoFormat(){
 if(!root.MediaRecorder||typeof root.MediaRecorder.isTypeSupported!=='function')return null;
 const candidates=[['video/mp4;codecs=avc1.42E01E','mp4'],['video/mp4','mp4'],['video/webm;codecs=vp9','webm'],['video/webm;codecs=vp8','webm'],['video/webm','webm']];
 const match=candidates.find(choice=>root.MediaRecorder.isTypeSupported(choice[0]));
 return match?{mime:match[0],extension:match[1]}:null;
}
function abortError(){return new DOMException('تم إلغاء التصدير','AbortError')}
async function exportVideo(item,formatDate,options){
 options=options||{};
 const format=videoFormat();if(!format)throw new Error('تنزيل الفيديو غير مدعوم هنا؛ افتح دعوات في Chrome أو Safari حديث، أو نزّل البطاقة PNG.');
 if(options.signal&&options.signal.aborted)throw abortError();
 const renderer=await createRenderer(item,formatDate);
 if(options.signal&&options.signal.aborted)throw abortError();
 if(typeof renderer.canvas.captureStream!=='function')throw new Error('تنزيل الفيديو غير مدعوم في هذا المتصفح.');
 if(options.onCanvas)options.onCanvas(renderer.canvas);
 renderer.draw(0);
 const stream=renderer.canvas.captureStream(0);
 const track=stream.getVideoTracks?stream.getVideoTracks()[0]:null;
 // Explicit capture avoids tying the recording to display refresh or offscreen rAF throttling.
 const manual=Boolean(track&&typeof track.requestFrame==='function');
 if(!manual){stream.getTracks().forEach(t=>t.stop());return exportRealtime(renderer,renderer.canvas.captureStream(30),format,options,null)}
 return exportRealtime(renderer,stream,format,options,track);
}
function exportRealtime(renderer,stream,format,options,track){
 return new Promise((resolve,reject)=>{
  let recorder=null,timer=0,tail=0,timeout=0,settled=false,started=null;
  const chunks=[];
  function cleanup(){root.clearTimeout(timer);root.clearTimeout(tail);root.clearTimeout(timeout);stream.getTracks().forEach(track=>track.stop());if(options.signal)options.signal.removeEventListener('abort',abort);root.document.removeEventListener('visibilitychange',visibility)}
  function fail(error){if(settled)return;settled=true;if(recorder&&recorder.state!=='inactive')recorder.stop();cleanup();reject(error)}
  function abort(){fail(abortError())}
  function visibility(){if(root.document.hidden)fail(new Error('توقف التصدير عند مغادرة الصفحة؛ أبقِ دعوات مفتوحًا حتى يكتمل الفيديو.'))}
  try{
   recorder=new root.MediaRecorder(stream,{mimeType:format.mime,videoBitsPerSecond:6000000});
   recorder.ondataavailable=event=>{if(event.data&&event.data.size)chunks.push(event.data)};
   recorder.onerror=()=>fail(new Error('تعذر تسجيل الفيديو على هذا الجهاز؛ جرّب متصفحًا حديثًا.'));
   recorder.onstop=()=>{
    if(settled)return;settled=true;cleanup();
    const blob=new root.Blob(chunks,{type:format.mime});
    if(!blob.size){reject(new Error('تعذر إنشاء ملف الفيديو.'));return}
    resolve({blob,extension:format.extension,mime:format.mime,width:1080,height:1920,duration:renderer.duration});
   };
   function tick(){
    if(settled)return;
    const now=root.performance.now();
    const elapsed=Math.min((now-started)/1000,renderer.duration);
    try{renderer.draw(Math.round(elapsed*30));if(track)track.requestFrame()}catch(error){fail(error);return}
    if(options.onProgress)options.onProgress(Math.min(.99,elapsed/renderer.duration));
    if(elapsed>=renderer.duration){tail=root.setTimeout(()=>{if(recorder.state!=='inactive')recorder.stop()},120);return}
    timer=root.setTimeout(tick,Math.max(0,1000/30-(root.performance.now()-now)));
   }
   if(options.signal)options.signal.addEventListener('abort',abort,{once:true});
   root.document.addEventListener('visibilitychange',visibility);
   recorder.onstart=()=>{if(settled)return;started=root.performance.now();tick()};
   recorder.start(400);
   if(settled)return;
   timeout=root.setTimeout(()=>fail(new Error('استغرق التصدير وقتًا طويلًا؛ أعد المحاولة مع مدة أقصر.')),(renderer.duration+20)*1000);
  }catch(error){fail(error)}
 });
}
async function download(item,formatDate,notify){
 if(exporting)return;
 exporting=true;
 const controller=new AbortController();
 const previous=root.document.activeElement;
 const dialog=root.document.createElement('dialog');dialog.className='motion-export-dialog';
 dialog.setAttribute('aria-labelledby','motion-export-title');
 dialog.innerHTML='<span class="motion-export-mark" aria-hidden="true">✦</span><h2 id="motion-export-title">نجهّز فيديو دعوتك</h2><p>أبقِ هذه الصفحة مفتوحة حتى يكتمل التنزيل.</p><progress max="100" value="0" aria-label="تقدم إنشاء الفيديو"></progress><output aria-live="polite">تجهيز الخط والخلفية…</output><button class="btn btn-white" type="button">إلغاء التصدير</button>';
 root.document.body.appendChild(dialog);
 const cancel=()=>controller.abort();
 dialog.addEventListener('cancel',event=>{event.preventDefault();cancel()});dialog.querySelector('button').onclick=cancel;
 root.addEventListener('hashchange',cancel,{once:true});
 if(dialog.showModal)dialog.showModal();else dialog.setAttribute('open','');
 try{
  const result=await exportVideo(item,formatDate,{signal:controller.signal,onCanvas:canvas=>{canvas.className='motion-render-preview';canvas.setAttribute('aria-hidden','true');dialog.querySelector('progress').before(canvas)},onProgress:progress=>{const percent=Math.round(progress*100);dialog.querySelector('progress').value=percent;dialog.querySelector('output').textContent='جارٍ إنشاء الفيديو · '+percent+'٪'}});
  const url=root.URL.createObjectURL(result.blob);const link=root.document.createElement('a');link.href=url;link.download='dawat-invitation.'+result.extension;root.document.body.appendChild(link);link.click();link.remove();root.setTimeout(()=>root.URL.revokeObjectURL(url),30000);
  notify('تم تنزيل فيديو الدعوة · '+result.extension.toUpperCase()+' · '+result.duration+' ثانية');
 }catch(error){notify(error.name==='AbortError'?'تم إلغاء تصدير الفيديو':error.message||'تعذر إنشاء الفيديو')}
 finally{exporting=false;root.removeEventListener('hashchange',cancel);dialog.remove();if(previous&&previous.isConnected)previous.focus()}
}
root.DAWAT_MOTION=Object.freeze({presets,durations,normalize,controls,mount,destroy,wrapLines,layoutText,particlesForFrame,drawFrame,createRenderer,videoFormat,exportVideo,download});
})(typeof window!=='undefined'?window:globalThis);
