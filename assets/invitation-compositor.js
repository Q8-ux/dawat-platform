(function(root){
'use strict';
const core=root.COMPOSITOR_EXPORT;
const labels=['الجهة الداعية','المناسبة','الأسماء والعنوان','نص الدعوة','التاريخ','الوقت','المكان','الختام'];
async function image(src){return new Promise((resolve,reject)=>{const img=new root.Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error('تعذر تحميل خلفية الدعوة.'));img.src=src})}
async function fontFiles(){
 const paths=['Amiri-Regular.ttf','Amiri-Bold.ttf','Amiri-OFL.txt'];
 return Promise.all(paths.map(async name=>{const response=await root.fetch(new URL('assets/fonts/'+name,root.document.baseURI));if(!response.ok)throw new Error('تعذر تضمين خط الدعوة؛ أعد المحاولة.');return {path:'Fonts/'+name,data:await response.arrayBuffer()}}));
}
async function create(item,formatDate){
 if(!core||!root.DAWAT_MOTION)throw new Error('تعذر تحميل أدوات تصدير الطبقات.');
 if(root.document.fonts){
  await Promise.all([root.document.fonts.load('700 94px Amiri'),root.document.fonts.load('400 47px Amiri')]);
  if(!root.document.fonts.check('700 94px Amiri')||!root.document.fonts.check('400 47px Amiri'))throw new Error('تعذر تحميل الخط العربي.');
 }
 const story=root.DAWAT_STORY_UI?.find(item.story),catalog=(root.DAWAT_CATALOG||[]).find(t=>t.id===item.theme);
 const dark=story?story.tone==='light':Boolean(catalog&&parseInt(catalog.bg.replace('#','').slice(0,2),16)<100);
 const colors={bg:catalog?.bg||'#f9f3e8',ink:story?(dark?'#fff2d7':'#382f2a'):(catalog?.fg||'#382f2a'),accent:story?(dark?'#e4c887':'#b18e57'):(catalog?.accent||'#b18e57'),panel:dark?'rgba(5,13,22,.73)':'rgba(255,253,246,.88)'};
 const bg=core.canvas(1080,1920),ctx=bg.getContext('2d');ctx.fillStyle=colors.bg;ctx.fillRect(0,0,1080,1920);
 if(story)ctx.drawImage(await image(story.src),0,0,1080,1920);
 else {ctx.strokeStyle=colors.accent;ctx.lineWidth=3;ctx.strokeRect(55,65,970,1790);ctx.strokeRect(75,85,930,1750)}
 const layout=root.DAWAT_MOTION.layoutText(ctx,item,formatDate),panel=core.canvas(1080,1920),pc=panel.getContext('2d'),panelHeight=Math.min(1490,layout.height+150);
 pc.fillStyle=colors.panel;pc.beginPath();pc.roundRect(115,(1920-panelHeight)/2,850,panelHeight,42);pc.fill();
 const frame=core.canvas(1080,1920),fc=frame.getContext('2d');fc.strokeStyle=colors.accent;fc.globalAlpha=.42;fc.lineWidth=2;fc.strokeRect(138,Math.max(116,(1920-panelHeight)/2-28),804,Math.min(1688,panelHeight+56));
 const layers=[{name:'الخلفية والزخارف',canvas:bg},{name:'لوحة وضوح النص',canvas:panel},{name:'الإطار',canvas:frame}];
 let y=layout.top;
 const raw=[item.host||'دعوة كريمة',item.kind||'مناسبة سعيدة',item.names||item.title||'دعوة خاصة',item.message||'تكتمل فرحتنا بوجودكم',formatDate(item.date),item.time||'',item.venue||'',item.closing||''];
 let index=0;
 raw.forEach((text,field)=>{
  if(!String(text).trim())return;
  const block=layout.blocks[index++],height=Math.ceil(block.lines.length*block.step+24),surface=core.canvas(820,height),tc=surface.getContext('2d');
  tc.font=block.font;tc.direction='rtl';tc.textAlign='center';tc.fillStyle=colors.ink;tc.textBaseline='alphabetic';
  block.lines.forEach((line,i)=>tc.fillText(line,410,12+i*block.step+block.step*.78));
  const size=Number(block.font.match(/(\d+)px/)[1]);
  layers.push({name:labels[field],canvas:surface,x:130,y:Math.floor(y-12),text:core.textMetadata(block.lines.join('\n'),block.weight>=700?'Amiri-Bold':'Amiri-Regular',size,colors.ink,'Center',block.step,[820,height])});
  y+=block.lines.length*block.step+block.gap;
 });
 const result=await core.project({name:'Dawat-Invitation',width:1080,height:1920,layers});
 result.entries.push({path:'Preview.png',data:await core.png(core.flatten(1080,1920,layers))});
 result.entries.push(...await fontFiles());
 result.entries.push({path:'اقرأني.txt',data:'دعوات — ملف تصميم قابل للتعديل\n\nفك ضغط الحزمة، وثبّت خطّي Amiri من مجلد Fonts، ثم افتح Dawat-Invitation.comp ببرنامج Compositor على جهاز Mac مدعوم.\nمتطلبات البرنامج الرسمية: macOS 26 أو أحدث ومعالج Apple Silicon.\n\nالخلفية والإطار ولوحة النص وحقول الدعوة طبقات منفصلة. النصوص تحمل بيانات تحرير أصلية، وصورة PNG لكل طبقة تحفظ شكل العربية عند الفتح. توجد معاينة مستقلة Preview.png.\nملف التصميم نسخة ثابتة من الدعوة؛ الحركة وروابط الموقع وواتساب تعمل في رابط الدعوة الأصلي.\nالمعالجة والتصدير محليان داخل المتصفح.\n\nالمحرر: https://github.com/robbietilton/Compositor\n'});
 return {blob:await core.zip(result.entries),manifest:result.manifest};
}
let busy=false;
async function download(item,formatDate,notify,button){
 if(busy)return;busy=true;const previous=button?.textContent;
 if(button){button.disabled=true;button.textContent='جارٍ تجهيز الطبقات…'}
 try{notify('جارٍ تجهيز التصميم بخطه وطبقاته…');const result=await create(item,formatDate);core.save(result.blob,'Dawat-Editable-Design.zip');notify('تم تنزيل التصميم بطبقاته القابلة للتعديل')}
 catch(error){notify(error.message||'تعذر تصدير الطبقات؛ أعد المحاولة.')}
 finally{busy=false;if(button){button.disabled=false;button.textContent=previous}}
}
root.DAWAT_COMPOSITOR=Object.freeze({create,download});
})(typeof window!=='undefined'?window:globalThis);
