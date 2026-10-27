/* DAWAT 9:16 story gallery — self-contained, no external assets. */
(function(root){"use strict";
const escape = value => String(value==null?"":value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const all = () => root.DAWAT_STORIES || [];
const find = id => all().find(x=>x.id===id) || null;
function page(app,onSelect) {
 app.innerHTML='<div class="container"><section class="stories-intro"><div><div class="eyebrow">STORY INVITATIONS · 9:16</div><h1>بطاقات الأفراح والمناسبات</h1><p>20 بطاقة مصوّرة موجودة داخل الموقع بمقاس 1080 × 1920. شاهد تصميم كل بطاقة هنا، اختره، وأدخل الاسم والتاريخ ثم حمّل النتيجة.</p><div class="actions"><a class="btn btn-gold" href="#/studio">إنشاء دعوة</a><a class="btn btn-white" href="#/dashboard">دعواتي المحفوظة</a></div></div><div class="story-hero-preview"><img loading="lazy" src="assets/story-art/02-botanical-garden.svg" alt="زخرفة نباتية"><img loading="lazy" src="assets/story-art/03-black-and-gold.svg" alt="زخرفة ذهبية"><img loading="lazy" src="assets/story-art/07-blush-cherry-blossom.svg" alt="زخرفة وردية"></div></section><div id="story-categories" class="story-filter" aria-label="تصنيف المناسبة"></div><p id="story-count" class="catalog-count"></p><div class="stories-grid" id="story-gallery"></div><p class="story-notice">البطاقات المعروضة هي الملفات المصوّرة المحفوظة فعلياً في مكتبة الموقع، ويمكن تخصيصها وتصديرها دون الانتقال إلى أي موقع آخر. وهي رسومات SVG أصلية، وليست ملفات قوالب Pro التابعة لطرف ثالث.</p></div>';
 const priority={'زفاف':0,'عقد قران':1,'خطوبة':2,'مولود':3,'تخرج':4,'عيد ميلاد':5,'تهنئة':6};
 const ordered=all().slice().sort((a,b)=>(priority[a.kind]??9)-(priority[b.kind]??9));
 const kinds=['الكل',...new Set(ordered.map(x=>x.kind))];let current='الكل';
 const cat=app.querySelector('#story-categories'),grid=app.querySelector('#story-gallery'),count=app.querySelector('#story-count');
 function paint(){
  cat.innerHTML=kinds.map(k=>'<button type="button" data-kind="'+escape(k)+'" aria-pressed="'+String(k===current)+'">'+escape(k)+'</button>').join('');
  const visible=ordered.filter(x=>current==='الكل'||x.kind===current);
  count.textContent='عرض '+visible.length+' من '+ordered.length+' بطاقة · الصور داخل الموقع';
  grid.innerHTML=visible.map(x=>'<button type="button" class="story-tile" data-story="'+x.id+'"><img src="'+x.src+'" alt="'+escape(x.name)+'، خلفية خالية من النص" width="1080" height="1920" loading="lazy"><strong>'+escape(x.name)+'</strong><small>'+escape(x.kind)+' · 9:16</small><span class="choose-label">استخدم التصميم</span></button>').join('');
  cat.querySelectorAll('button').forEach(b=>b.onclick=()=>{current=b.dataset.kind;paint()});
  grid.querySelectorAll('button').forEach(b=>b.onclick=()=>onSelect(b.dataset.story));
 }
 paint();
}
function invite(item,formatDate) {
 const t=find(item.story);if(!t)return '';
 const line = (item.message||'تكتمل فرحتنا بوجودكم');
 return '<article class="invite-card story-invitation" style="background-image:url(&quot;'+t.src+'&quot;)" data-tone="'+t.tone+'" id="visual-card"><div class="story-content"><p class="over">'+escape(item.host||'دعوة كريمة')+'</p><div class="divider"></div><p class="over">'+escape(item.kind||t.kind)+'</p><h2>'+escape(item.names||item.title||t.name)+'</h2><div class="divider"></div><p class="message">'+escape(line)+'</p><div class="details">'+escape(formatDate(item.date))+(item.time?'<div>'+escape(item.time)+'</div>':'')+'</div><p class="host">'+escape(item.venue||'')+'</p></div></article>';
}
function lines(ctx,word,width) {
 const result=[];let line='';
 String(word||'').split(/\s+/).forEach(w=>{const next=line?line+' '+w:w;if(line&&ctx.measureText(next).width>width){result.push(line);line=w}else line=next});
 if(line)result.push(line);
 return result;
}
function exportPNG(item,formatDate,notify){
 const t=find(item.story);if(!t)return Promise.reject(new Error('Template not found'));
 const image=new Image();image.decoding='async';
 return new Promise((resolve,reject)=>{
  image.onload=()=>{
    try{
      const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1920;
      const c=canvas.getContext('2d');c.drawImage(image,0,0,1080,1920);
      const ink=t.tone==='light'?'#fff4e1':'#3c3431';const back=t.tone==='light'?'rgba(5,13,22,.50)':'rgba(255,253,246,.71)';
      c.fillStyle=back;c.beginPath();c.roundRect(135,500,810,920,44);c.fill();
      c.fillStyle=ink;c.textAlign='center';c.direction='rtl';
      const draw=(str,y,font,maxWidth,step,maxLines)=>{c.font=font;let l=lines(c,str,maxWidth).slice(0,maxLines||6);l.forEach((v,i)=>c.fillText(v,540,y+i*step));return y+l.length*step;};
      let y=655;
      y=draw(item.host||'دعوة كريمة',y,'bold 41px Amiri',700,58,2)+38;
      y=draw(item.kind||t.kind,y,'bold 42px Amiri',700,58,2)+45;
      y=draw(item.names||item.title||t.name,y,'bold 91px Amiri',740,110,3)+50;
      y=draw(item.message||'تكتمل فرحتنا بوجودكم',y,'43px Amiri',720,62,4)+38;
      y=draw(formatDate(item.date),Math.min(y,1235),'bold 40px Amiri',710,56,2);
      if(item.time)y=draw(item.time,y+4,'37px Amiri',700,45,1);
      draw(item.venue||'',y+15,'38px Amiri',710,48,2);
      canvas.toBlob(blob=>{
        if(!blob){reject(new Error('PNG export failed'));return}
        const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='dawat-story-'+t.id+'.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),3000);notify('تم تنزيل ستوري 1080 × 1920');resolve();
      },'image/png');
    }catch(e){reject(e)}
  };
  image.onerror=()=>reject(new Error('Failed to read story asset'));
  image.src=t.src;
 });
}
root.DAWAT_STORY_UI={page,find,invite,exportPNG};
})(typeof window!=="undefined"?window:globalThis);
