(function(){
'use strict';
var catalog=window.DAWAT_CATALOG||[];
var storyUI=window.DAWAT_STORY_UI;
var webUI=window.DAWAT_WEB_INVITATION;
var inviteUtils=window.DAWAT_INVITATION_UTILS;
var motionUI=window.DAWAT_MOTION;
var motionPlayer=null;
function motionSettings(o){return motionUI?motionUI.normalize(o):{motion:'none',duration:12}}
var catalogById=Object.fromEntries(catalog.map(function(x){return [x.id,x]}));
var themes=catalog.map(function(x){return [x.id,x.label]});
function preset(id){return catalogById[id]||catalog[0]}
function cardStyle(t){return '--card-bg:'+t.bg+';--card-ink:'+t.fg+';--card-accent:'+t.accent+';'}
function choose(id){var t=preset(id);state.story='';state.theme=t.id;state.kind=t.kind;state.title=t.title;state.host=t.host;state.message=t.message;
if(location.hash==='#/studio')studio();else location.hash='#/studio'}

var kinds=['زفاف','عقد قران','خطوبة','تخرج','مولود','استقبال','عيد ميلاد','مناسبة خاصة'];
var key='dawat-studio-v1';var editing=null;var state={presentation:'card',kind:'زفاف',title:'دعوة خاصة',names:'',host:'',message:'',date:'',time:'',venue:'',maps:'',whatsapp:'',whatsapp2:'',whatsapp3:'',whatsapp4:'',closing:'',theme:'night',story:'01-ivory-magnolia',motion:'breeze',duration:12};
var app=document.querySelector('#app');var toast=document.querySelector('#toast');
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function attr(s){return esc(s)}
function notify(msg){toast.textContent=msg;toast.classList.add('show');clearTimeout(notify.t);notify.t=setTimeout(function(){toast.classList.remove('show')},2900)}
function unique(){return 'd'+Date.now().toString(36)+Math.random().toString(36).slice(2,7)}
function safeURL(url){return inviteUtils?inviteUtils.safeMapURL(url):''}
function contactValue(value){return inviteUtils?inviteUtils.contactDigits(value):''}
function whatsapp(num){return inviteUtils?inviteUtils.whatsappURL(num):''}
function sanitizeInvitation(o,id){
 o=o&&typeof o==='object'?o:{};
 return {id:String(id||o.id||unique()).slice(0,80),motion:motionSettings(o).motion,duration:motionSettings(o).duration,presentation:o.presentation==='web'?'web':'card',kind:String(o.kind||'مناسبة خاصة').slice(0,75),title:String(o.title||'').slice(0,200),names:String(o.names||'').slice(0,200),host:String(o.host||'').slice(0,250),message:String(o.message||'').slice(0,3000),date:String(o.date||'').slice(0,20),time:String(o.time||'').slice(0,10),venue:String(o.venue||'').slice(0,250),maps:safeURL(o.maps||''),whatsapp:contactValue(o.whatsapp),whatsapp2:contactValue(o.whatsapp2),whatsapp3:contactValue(o.whatsapp3),whatsapp4:contactValue(o.whatsapp4),closing:String(o.closing||'').slice(0,250),theme:catalogById[o.theme]?o.theme:(catalog[0]?catalog[0].id:'night'),story:storyUI&&storyUI.find(o.story)?o.story:'',updated:String(o.updated||new Date().toISOString()).slice(0,40)};
}
function read(){try{var v=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(v)?v.filter(function(x){return x&&typeof x==='object'}).slice(0,250).map(function(x){return sanitizeInvitation(x,x.id)}):[]}catch(e){return []}}
function write(v){try{var clean=(Array.isArray(v)?v:[]).slice(0,250).map(function(x){return sanitizeInvitation(x,x.id)});localStorage.setItem(key,JSON.stringify(clean));return true}catch(e){notify('تعذر الحفظ في هذا المتصفح');return false}}
function formatDate(d){if(!d)return 'موعد المناسبة يحدد لاحقاً';try{return new Intl.DateTimeFormat('ar-KW',{weekday:'long',day:'numeric',month:'long',year:'numeric',timeZone:'Asia/Kuwait'}).format(new Date(d+'T12:00:00+03:00'))}catch(e){return d}}
function invite(item){if(item.presentation==='web'&&webUI)return webUI.render(item,formatDate,{map:safeURL(item.maps||''),page:false});if(storyUI && storyUI.find(item.story))return storyUI.invite(item,formatDate);var t=preset(item.theme);
return '<article class="invite-card catalog-card" data-palette="'+t.palette+'" data-layout="'+t.layout+'" style="'+cardStyle(t)+'" id="visual-card"><p class="over">'+esc(t.motif)+' '+esc(item.host||'دعوة كريمة')+'</p><div class="divider"></div><p class="over">'+esc(item.kind||'مناسبة سعيدة')+'</p><h2>'+esc(item.names||item.title||'دعوتنا لكم')+'</h2><div class="divider"></div><p class="message">'+esc(item.message||'يسرنا حضوركم ومشاركتكم فرحتنا')+'</p><div class="details">'+esc(formatDate(item.date))+(item.time?'<div>'+esc(item.time)+'</div>':'')+'</div><p class="host">'+esc(item.venue||'')+'</p></article>'
}
function showHome(){app.innerHTML='<div class="container"><section class="hero"><div class="hero-copy"><div class="eyebrow">DAWAT · NEON 3D INVITATION STUDIO</div><h1>كل مناسبة تستحق<br>دعوة لا تُنسى</h1><p>صمّم دعوتك العربية في دقائق، اختر من قوالب احتفالية أنيقة، ثم شارك رابطاً أو نزّل بطاقة جاهزة للواتساب والطباعة.</p><div class="actions"><a class="btn btn-gold" href="#/studio">ابدأ تصميم دعوتك ✧</a><a href="#/templates" class="btn btn-outline">استعرض القوالب</a><a href="#/stories" class="btn btn-outline">20 ستوري جديدة</a></div></div><div class="hero-art"><div class="hero-card"><div class="fl">✦</div><span class="script">دعوة زفاف</span><small>ليلة تملؤها الفرحة</small><div style="font:25px Amiri;margin:18px 0">✧</div><small>أهلاً وسهلاً بكم</small></div></div></section><section class="t-section"><div class="eyebrow">تجربة بسيطة وفاخرة</div><h2>من الفكرة إلى الدعوة</h2><p>اختيار التصميم وإدخال المعلومات ومشاركة النتيجة من أي جهاز.</p><div class="cards"><div class="card"><div class="feature">❖</div><strong>100 نموذج متنوع</strong><p>100 نموذج مستقل المعاينة، موزّع على ثماني مناسبات وعشرين لوناً وخمسة أساليب فنية.</p></div><div class="card"><div class="feature">✎</div><strong>تحرير مباشر</strong><p>أسماء وتاريخ ومكان ورسالة الدعوة مع معاينة فورية.</p></div><div class="card"><div class="feature">▧</div><strong>صور ومشاركة</strong><p>تنزيل البطاقة PNG أو مشاركة رابط للضيف عبر التطبيقات.</p></div><div class="card"><div class="feature">◇</div><strong>بدون تسجيل</strong><p>احفظ مسوداتك في متصفحك. لا تُرسل بياناتك إلى خادم المنصة.</p></div></div></section><section class="t-section"><div class="eyebrow">هويتك ومناسبتك</div><h2>قوالب تناسب كل فرحة</h2><div class="templates" id="home-templates"></div></section></div>';tiles(document.querySelector('#home-templates'),catalog.slice(0,6))}
function tiles(el,list){
el.innerHTML=(list||catalog).map(function(t){return '<button class="template" type="button" data-theme="'+t.id+'"><div class="mini-card catalog-card" data-palette="'+t.palette+'" data-layout="'+t.layout+'" style="'+cardStyle(t)+'"><b>'+esc(t.motif)+'<br>'+esc(t.title)+'</b><small>'+esc(t.kind)+'</small></div><label>'+esc(t.label)+'</label><span class="template-tag">'+esc(t.kind)+'</span></button>'}).join('');
el.querySelectorAll('[data-theme]').forEach(function(b){b.addEventListener('click',function(){choose(b.dataset.theme)})});
}
function templatesPage(){
app.innerHTML='<div class="container"><div class="eyebrow">100 DESIGNS</div><h1 style="font:700 42px Amiri;margin:8px 0">مكتبة 100 نموذج</h1><p class="subtitle">اختر نوع المناسبة وابحث بين مئة نموذج قابل للتخصيص والمعاينة.</p><div class="catalog-filters"><input id="catalog-search" type="search" placeholder="ابحث باسم التصميم أو المناسبة" aria-label="بحث القوالب"><select id="catalog-category" aria-label="تصفية المناسبة"><option value="">كل المناسبات</option>'+kinds.map(function(k){return '<option>'+esc(k)+'</option>'}).join('')+'</select></div><div class="catalog-count" id="catalog-count"></div><div class="templates" id="all-templates"></div><button id="catalog-more" class="btn btn-white">عرض المزيد</button></div>';
var limit=24;
function render(){
 var q=document.getElementById('catalog-search').value.trim().toLowerCase(),cat=document.getElementById('catalog-category').value;
 var filtered=catalog.filter(function(t){return (!cat||t.kind===cat)&&(!q||[t.label,t.kind,t.title].join(' ').toLowerCase().includes(q))});
 tiles(document.getElementById('all-templates'),filtered.slice(0,limit));
 document.getElementById('catalog-count').textContent='عرض '+Math.min(limit,filtered.length)+' من '+filtered.length+' نموذج';
 document.getElementById('catalog-more').classList.toggle('hidden',filtered.length<=limit);
}
['catalog-search','catalog-category'].forEach(function(id){document.getElementById(id).addEventListener('input',function(){limit=24;render()})});
document.getElementById('catalog-more').onclick=function(){limit+=24;render()};render();
}

function input(name,label,type,options){var val=state[name]||'';if(type==='select')return '<div class="field"><label for="'+name+'">'+label+'</label><select id="'+name+'" data-field="'+name+'">'+options.map(function(option){var value=typeof option==='object'?option.value:option;var text=typeof option==='object'?option.label:option;return '<option value="'+attr(value)+'" '+(val===value?'selected':'')+'>'+esc(text)+'</option>'}).join('')+'</select></div>';if(type==='textarea')return '<div class="field"><label for="'+name+'">'+label+'</label><textarea id="'+name+'" data-field="'+name+'">'+esc(val)+'</textarea></div>';return '<div class="field"><label for="'+name+'">'+label+'</label><input id="'+name+'" type="'+type+'" data-field="'+name+'" value="'+attr(val)+'"></div>'}
function refreshPreview(){
 var target=app.querySelector('#live-card');if(!target)return;
 if(motionUI)motionUI.destroy();target.innerHTML=invite(state);
 motionPlayer=motionUI?motionUI.mount(target,state):null;
 app.querySelectorAll('[data-motion-choice]').forEach(function(button){button.setAttribute('aria-pressed',String(button.dataset.motionChoice===motionSettings(state).motion))});
 var pause=app.querySelector('[data-motion-pause]'),replay=app.querySelector('[data-motion-replay]'),note=app.querySelector('[data-motion-status]');
 if(pause){pause.disabled=!motionPlayer||!motionPlayer.enabled||motionPlayer.reduced;pause.textContent='إيقاف الحركة';pause.setAttribute('aria-pressed','false')}
 if(replay)replay.disabled=!motionPlayer||!motionPlayer.enabled||motionPlayer.reduced;
 if(note)note.textContent=motionPlayer&&motionPlayer.reduced?'تقليل الحركة مفعّل في جهازك؛ تظهر الدعوة ثابتة، ويمكنك تنزيل الفيديو عند رغبتك.':motionSettings(state).motion==='none'?'جميع التفاصيل ظاهرة؛ اختر أسلوبًا لإضافة الحركة.':'اختيار الحركة والمدة يُحفظ مع الدعوة ورابط مشاركتها.';
}
function setupMotionControls(){
 if(!motionUI)return;
 app.querySelectorAll('[data-motion-choice]').forEach(function(button){button.onclick=function(){state.motion=button.dataset.motionChoice;refreshPreview()}});
 var duration=app.querySelector('#motion-duration');if(duration)duration.onchange=function(){state.duration=motionSettings({duration:duration.value}).duration;refreshPreview()};
 var replay=app.querySelector('[data-motion-replay]');if(replay)replay.onclick=function(){refreshPreview()};
 var pause=app.querySelector('[data-motion-pause]');if(pause)pause.onclick=function(){if(!motionPlayer)return;if(motionPlayer.paused){motionPlayer.play();pause.textContent='إيقاف الحركة';pause.setAttribute('aria-pressed','false')}else{motionPlayer.pause();pause.textContent='استئناف الحركة';pause.setAttribute('aria-pressed','true')}};
 var video=app.querySelector('[data-motion-export]');if(video)video.onclick=function(){motionUI.download(sanitizeInvitation(state),formatDate,notify)};
 var format=motionUI.videoFormat(),hint=app.querySelector('[data-motion-format]');
 if(hint)hint.textContent=format?'سيُنزّل بصيغة '+format.extension.toUpperCase():'افتح في متصفح حديث يدعم تنزيل الفيديو';
 refreshPreview();
}
function setupGuestMotion(item,fromPrint){
 if(!motionUI)return;
 if(fromPrint){motionUI.destroy();return}
 motionPlayer=motionUI.mount(app,item);
 var holder=app.querySelector('.web-guest-container, .guest-view');if(!holder)return;
 var tools=document.createElement('div');tools.className='motion-guest-tools';
 tools.innerHTML=(motionPlayer&&motionPlayer.enabled&&!motionPlayer.reduced?'<button class="btn btn-white" type="button" data-motion-guest-replay>إعادة عرض الحركة</button>':'')+'<button class="btn btn-white" type="button" data-motion-guest-export>تنزيل فيديو</button>';
 holder.appendChild(tools);
 var replay=tools.querySelector('[data-motion-guest-replay]');if(replay)replay.onclick=function(){if(motionPlayer)motionPlayer.replay()};
 tools.querySelector('[data-motion-guest-export]').onclick=function(){motionUI.download(sanitizeInvitation(item),formatDate,notify)};
}
function studio(){app.innerHTML='<div class="container"><div class="eyebrow">STUDIO · DAWAT</div><h1 style="font:700 37px Amiri;margin:5px 0">استوديو الدعوات</h1><p class="subtitle">عدّل تفاصيل مناسبتك، والمعاينة تتغير فوراً. تحفظ المسودات داخل المتصفح الحالي فقط.</p><div class="workspace"><section class="panel"><h3>تفاصيل المناسبة</h3><div class="fields">'+input('presentation','شكل الدعوة','select',[{value:'card',label:'بطاقة رقمية 9:16'},{value:'web',label:'دعوة ويب تفاعلية'}])+input('kind','نوع المناسبة','select',kinds)+input('title','اسم الدعوة','text')+input('names','اسم العروسين / صاحب المناسبة','text')+input('host','نص الجهة الداعية','text')+input('message','كلمات الدعوة','textarea')+'<div class="two">'+input('date','تاريخ المناسبة','date')+input('time','الوقت (اختياري)','time')+'</div>'+input('venue','المكان','text')+input('maps','رابط موقع Google / Apple Maps','url')+input('whatsapp','رقم التواصل الأول / واتساب','tel')+'<div id="web-fields" class="'+(state.presentation==='web'?'':'hidden')+'">'+input('whatsapp2','رقم التواصل الثاني (اختياري)','tel')+input('whatsapp3','رقم التواصل الثالث (اختياري)','tel')+input('whatsapp4','رقم التواصل الرابع (اختياري)','tel')+input('closing','عبارة ختام الدعوة','text')+'<p class="tiny">يمكن إدخال الرقم الكويتي من 8 أرقام أو كتابة الرقم مع رمز الدولة.</p></div></div><div class="actions"><button class="btn btn-dark" id="save" type="button">حفظ الدعوة</button><button class="btn btn-white" id="new" type="button">مسح الحقول</button></div></section><section class="preview-area"><div class="preview-top"><b>معاينة دعوتك</b><span class="note">التصميم يتغير مباشرة</span></div><div id="live-card">'+invite(state)+'</div>'+(motionUI?motionUI.controls(state):'')+'<div class="studio-tools"><button class="btn btn-dark btn-sm" id="png">تنزيل PNG</button><button class="btn btn-white btn-sm" id="print">حفظ PDF</button><button class="btn btn-white btn-sm" id="layers" type="button">تنزيل الطبقات</button><button class="btn btn-white btn-sm" id="share">رابط مشاركة</button></div><span class="tiny">تنزيل الطبقات يجهّز ملفًا للتعديل في Compositor على Mac. روابط المشاركة عامة لمن يحصل عليها.</span></section><section class="panel third"><h3>مظهر البطاقة</h3><div class="actions"><a href="#/templates" class="btn btn-white btn-sm">خلفيات ستوري 9:16</a></div><div class="templates" id="studio-templates" style="grid-template-columns:repeat(2,1fr);gap:9px"></div><div class="actions"><a class="btn btn-white btn-sm" href="#/templates">عرض بطاقات المناسبات</a></div><h4 style="margin:18px 0 6px">مسار صياغة النصوص</h4><p class="tiny">صياغات محلية جاهزة؛ لا تتصل بخدمة ذكاء اصطناعي خارجية.</p><button type="button" class="btn btn-white" id="copy-suggest">اقترح نص الدعوة</button><div class="notice" style="margin-top:15px">تُحفظ الدعوات في جهازك. لا تضع معلومات حساسة في روابط المشاركة.</div></section></div></div>';
document.querySelectorAll('[data-field]').forEach(function(el){el.addEventListener('input',function(){state[el.dataset.field]=el.value;if(el.dataset.field==='presentation'){studio();return}refreshPreview()})});

var target=document.querySelector('#studio-templates');
var choices=(window.DAWAT_STORIES||[]).slice().sort(function(a,b){var rank={'زفاف':0,'عقد قران':1,'خطوبة':2,'مولود':3,'تخرج':4,'عيد ميلاد':5,'تهنئة':6};return (rank[a.kind]??9)-(rank[b.kind]??9)});
target.innerHTML=choices.map(function(t){return '<button type="button" class="template studio-story-template '+(state.story===t.id?'selected':'')+'" data-story="'+attr(t.id)+'" aria-label="اختيار بطاقة '+attr(t.name)+'"><img src="'+attr(t.src)+'" alt="" width="1080" height="1920" loading="lazy"><label>'+esc(t.name)+'</label></button>'}).join('');
target.querySelectorAll('[data-story]').forEach(function(b){b.onclick=function(){state.story=b.dataset.story;target.querySelectorAll('[data-story]').forEach(function(el){el.classList.toggle('selected',el===b)});refreshPreview()}});
document.getElementById('copy-suggest').onclick=function(){
var samples=[(window.DAWAT_COPY[state.kind]||window.DAWAT_COPY['مناسبة خاصة'])[2],'بكل الحب والفرح ندعوكم لتشاركونا أجمل الأوقات، فحضوركم يزيد مناسبتنا بهجة.','يشرفنا حضوركم ومشاركتكم يومنا السعيد، فوجودكم يعني لنا الكثير.','يسعدنا أن نجتمع بكم في هذه المناسبة الغالية على قلوبنا.'];
var index=samples.indexOf(state.message);state.message=samples[(index+1)%samples.length];document.getElementById('message').value=state.message;refreshPreview();notify('تم اقتراح صياغة قابلة للتعديل');
};

document.querySelector('#save').onclick=save;
document.querySelector('#new').onclick=function(){if(confirm('هل تريد إنشاء دعوة جديدة؟')){editing=null;state={presentation:'card',kind:'زفاف',title:'دعوة خاصة',names:'',host:'',message:'',date:'',time:'',venue:'',maps:'',whatsapp:'',whatsapp2:'',whatsapp3:'',whatsapp4:'',closing:'',theme:'night',story:'01-ivory-magnolia',motion:'breeze',duration:12};studio()}};
document.querySelector('#png').onclick=function(){exportPNG(state)};
document.querySelector('#layers').onclick=function(){if(window.DAWAT_COMPOSITOR)window.DAWAT_COMPOSITOR.download(sanitizeInvitation(state),formatDate,notify,this);else notify('تعذر تحميل أدوات تصدير الطبقات')};
document.querySelector('#print').onclick=function(){showGuest(state,true);setTimeout(function(){window.print()},300)};
document.querySelector('#share').onclick=function(){share(state)};
setupMotionControls();
}
function save(){if(!String(state.names||'').trim()){notify('أدخل اسم صاحب المناسبة');return}var all=read();var item=sanitizeInvitation(Object.assign({},state,{updated:new Date().toISOString()}),editing||unique());var ix=all.findIndex(function(x){return x.id===item.id});if(ix>=0)all[ix]=item;else all.unshift(item);if(write(all)){editing=item.id;state=Object.assign({},item);notify('تم حفظ الدعوة في هذا المتصفح ✓')}}
function dashboard(){var all=read();app.innerHTML='<div class="container"><div class="eyebrow">MY INVITATIONS</div><h1 style="font:700 40px Amiri;margin:5px 0">دعواتي</h1><p class="subtitle">دعوات محفوظة محلياً على هذا الجهاز. لا تنتقل تلقائياً إلى جهاز آخر.</p><div class="actions"><a class="btn btn-gold" href="#/studio">+ دعوة جديدة</a><button class="btn btn-white" type="button" id="export-backup">تصدير نسخة احتياطية</button><label class="btn btn-white" for="import-backup" style="cursor:pointer">استيراد نسخة</label><input id="import-backup" type="file" accept="application/json,.json" class="hidden" aria-label="استيراد دعوات من ملف"></div>'+(all.length?'<div class="dashboard-list">'+all.map(function(x){return '<article class="saved-card"><span class="pill">'+esc(x.kind)+'</span><b>'+esc(x.names||x.title)+'</b><small>'+esc(formatDate(x.date))+'</small><div class="saved-actions"><button class="btn btn-dark btn-sm" data-edit="'+attr(x.id)+'">تعديل</button><button class="btn btn-white btn-sm" data-view="'+attr(x.id)+'">عرض</button><button class="btn btn-white btn-sm" data-share="'+attr(x.id)+'">مشاركة</button><button class="btn btn-white btn-sm" data-duplicate="'+attr(x.id)+'">نسخ الدعوة</button><button class="btn btn-danger btn-sm" data-remove="'+attr(x.id)+'">حذف</button></div></article>'}).join('')+'</div>':'<div class="empty"><div style="font-size:44px">✧</div>لم تحفظ أي دعوة بعد. ابدأ بإنشاء دعوتك الأولى.</div>')+'</div>';
app.querySelector('#export-backup').onclick=function(){
 var archive={app:'DAWAT',version:1,exportedAt:new Date().toISOString(),invitations:read()};
 var url=URL.createObjectURL(new Blob([JSON.stringify(archive,null,2)],{type:'application/json;charset=utf-8'}));
 var a=document.createElement('a');a.href=url;a.download='dawat-backup.json';a.click();
 setTimeout(function(){URL.revokeObjectURL(url)},3000);notify('تم تنزيل نسخة الدعوات');
};
app.querySelector('#import-backup').addEventListener('change',function(ev){
 var file=ev.target.files&&ev.target.files[0];if(!file)return;
 if(file.size>1024*1024){notify('الحد الأقصى للملف 1 ميغابايت');return}
 file.text().then(function(txt){
  var data=JSON.parse(txt);
  if(data.app!=='DAWAT'||!Array.isArray(data.invitations)||data.invitations.length>250)throw Error('bad-format');
  var entries=data.invitations.filter(function(o){return o&&typeof o==='object'&&catalogById[o.theme]&&typeof o.names==='string'&&typeof o.message==='string'&&o.message.length<=3000}).map(function(o){
   return sanitizeInvitation(Object.assign({},o,{updated:new Date().toISOString()}),unique());
  });
  if(!entries.length){notify('لا توجد دعوات صالحة للاستيراد');return}
  if(!confirm('استيراد '+entries.length+' دعوة وإضافتها إلى المحفوظات؟'))return;
  if(write(entries.concat(read())))dashboard();
 }).catch(function(){notify('ملف النسخة الاحتياطية غير صالح')});
});
app.querySelectorAll('[data-duplicate]').forEach(function(b){b.onclick=function(){
 var item=read().find(function(x){return x.id===b.dataset.duplicate});if(!item)return;
 var copyItem=sanitizeInvitation(Object.assign({},item,{title:(item.title||'دعوة')+' - نسخة',updated:new Date().toISOString()}),unique());
 var list=read();list.unshift(copyItem);if(write(list))dashboard();
}});
app.querySelectorAll('[data-edit]').forEach(function(b){b.onclick=function(){var o=read().find(function(x){return x.id===b.dataset.edit});if(o){editing=o.id;state=sanitizeInvitation(o,o.id);location.hash='#/studio'}}});
app.querySelectorAll('[data-view]').forEach(function(b){b.onclick=function(){var o=read().find(function(x){return x.id===b.dataset.view});if(o)showGuest(o)}});
app.querySelectorAll('[data-share]').forEach(function(b){b.onclick=function(){var o=read().find(function(x){return x.id===b.dataset.share});if(o)share(o)}});
app.querySelectorAll('[data-remove]').forEach(function(b){b.onclick=function(){if(confirm('حذف الدعوة المحفوظة من هذا المتصفح؟')){write(read().filter(function(x){return x.id!==b.dataset.remove}));dashboard()}}});
}
function encode(o){var data={motion:motionSettings(o).motion,duration:motionSettings(o).duration,presentation:o.presentation==='web'?'web':'card',kind:String(o.kind||'').slice(0,75),title:String(o.title||'').slice(0,200),names:String(o.names||'').slice(0,200),host:String(o.host||'').slice(0,250),message:String(o.message||'').slice(0,3000),date:String(o.date||'').slice(0,20),time:String(o.time||'').slice(0,10),venue:String(o.venue||'').slice(0,250),maps:safeURL(o.maps||''),whatsapp:contactValue(o.whatsapp),whatsapp2:contactValue(o.whatsapp2),whatsapp3:contactValue(o.whatsapp3),whatsapp4:contactValue(o.whatsapp4),closing:String(o.closing||'').slice(0,250),theme:catalogById[o.theme]?o.theme:(catalog[0]?catalog[0].id:'night'),story:storyUI&&storyUI.find(o.story)?o.story:''};return btoa(Array.from(new TextEncoder().encode(JSON.stringify(data)),function(b){return String.fromCharCode(b)}).join('')).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
function decode(s){try{if(s.length>10000)return null;var b=atob(s.replace(/-/g,'+').replace(/_/g,'/'));var a=new Uint8Array(Array.from(b,function(c){return c.charCodeAt(0)}));var v=JSON.parse(new TextDecoder().decode(a));if(!v||typeof v!=='object')return null;return v}catch(e){return null}}
function link(o){return location.origin+location.pathname+'#/invite/'+encode(o)}
function renderQR(target,o){
 if(!target)return;
 var value=link(o);target.innerHTML='';
 if(typeof QRCode==='undefined'){notify('مكتبة QR غير متاحة حالياً');return}
 if(inviteUtils&&!inviteUtils.qrPayloadFits(value,1800)){notify('رابط الدعوة أطول من سعة رمز QR؛ اختصر نص الدعوة أو استخدم المشاركة');return}
 try{new QRCode(target,{text:value,width:180,height:180,colorDark:'#1d2d32',colorLight:'#ffffff',correctLevel:QRCode.CorrectLevel.M});target.scrollIntoView({behavior:'smooth',block:'center'})}catch(error){target.innerHTML='';notify('تعذر إنشاء رمز QR؛ اختصر نص الدعوة أو استخدم المشاركة')}
}
function showGuest(o,fromPrint){
var map=safeURL(o.maps||''),wa=whatsapp(o.whatsapp||'');
if(o.presentation==='web'&&webUI){
 app.innerHTML='<div class="container web-guest-container">'+webUI.render(o,formatDate,{map:map,page:true})+'</div>';
 var webCard=app.querySelector('.dawat-web-invite');var shareButton=app.querySelector('[data-web-action="share"]');var qrButton=app.querySelector('[data-web-action="qr"]');var downloadButton=app.querySelector('[data-web-action="download"]');var themeButton=app.querySelector('[data-web-action="theme"]');
 if(shareButton)shareButton.onclick=function(){share(o)};
 if(downloadButton)downloadButton.onclick=function(){exportPNG(o)};
 if(qrButton)qrButton.onclick=function(){renderQR(app.querySelector('[data-web-qr-target]'),o)};
 if(themeButton)themeButton.onclick=function(){var dark=webCard.dataset.webTheme!=='dark';webCard.dataset.webTheme=dark?'dark':'light';this.setAttribute('aria-pressed',String(dark))};
 if(fromPrint){var dock=app.querySelector('.web-action-dock');if(dock)dock.style.display='none'}
 setupGuestMotion(o,fromPrint);
 return;
}
app.innerHTML='<div class="container guest-view"><div class="eyebrow" style="text-align:center">DAWAT · INVITATION</div><div style="margin:20px 0">'+invite(o)+'</div><div class="guest-actions">'+(map?'<a class="btn btn-dark" href="'+attr(map)+'" target="_blank" rel="noopener">📍 الموقع على الخريطة</a>':'')+(wa?'<a class="btn btn-white" href="'+attr(wa)+'" target="_blank" rel="noopener">واتساب المنظّم</a>':'')+'<button class="btn btn-white" id="copy">نسخ الرابط</button><button class="btn btn-white" id="guestpng">تنزيل البطاقة</button><button class="btn btn-white" id="guestqr">QR</button></div><div id="qrholder"></div><p class="tiny" style="text-align:center">مشاركة الرابط متاحة لكل من يحصل عليه؛ فلا تضع معلومات لا تريد مشاركتها.</p></div>';
app.querySelector('#copy').onclick=function(){copy(link(o))};
app.querySelector('#guestpng').onclick=function(){exportPNG(o)};
app.querySelector('#guestqr').onclick=function(){renderQR(app.querySelector('#qrholder'),o)};
if(fromPrint)app.querySelector('.guest-actions').style.display='none';
setupGuestMotion(o,fromPrint);
}

function copy(t){if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(t).then(function(){notify('تم نسخ الرابط')}).catch(function(){openLink(t)})}else openLink(t)}
function openLink(t){var b=document.createElement('div');b.className='dialog';b.innerHTML='<div class="dialog-box"><h3>رابط الدعوة</h3><p class="tiny">انسخ الرابط لإرساله. يتضمن نصوص الدعوة، فلا تشارك معلومات خاصة.</p><textarea readonly></textarea><div class="dialog-actions"><button class="btn btn-dark">إغلاق</button></div></div>';document.body.appendChild(b);b.querySelector('textarea').value=t;b.querySelector('textarea').focus();b.querySelector('textarea').select();b.querySelector('button').onclick=function(){b.remove()}}
function share(o){var t=link(o);if(navigator.share){navigator.share({title:'دعوة '+(o.names||o.title),url:t}).catch(function(){copy(t)})}else copy(t)}
function roundedRect(c,x,y,w,h,r){c.beginPath();c.roundRect(x,y,w,h,r);c.closePath()}
function wrapText(c,s,max){var words=String(s||'').split(/\s+/),lines=[],line='';for(var w of words){var next=line?line+' '+w:w;if(c.measureText(next).width>max&&line){lines.push(line);line=w}else line=next}if(line)lines.push(line);return lines}
function drawCenter(c,txt,y,max,font,color,gap){c.fillStyle=color;c.font=font;c.textAlign='center';c.direction='rtl';var ls=wrapText(c,txt,max),step=gap||60;ls.forEach(function(line,i){c.fillText(line,540,y+i*step)});return y+ls.length*step}
function exportPNG(o){if(storyUI&&storyUI.find(o.story)){storyUI.exportPNG(o,formatDate,notify).catch(function(){notify('تعذر تنزيل الستوري')});return}var canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1620;var c=canvas.getContext('2d');var palettes={royal:['#f5e9d4','#836b42'],pearl:['#f5eeeb','#8b6e68'],night:['#1b2839','#dfc99f'],rose:['#f6e5e9','#9c626e'],emerald:['#1a4f45','#f5e0ab'],sand:['#ecddc5','#855e3b'],lavender:['#ede6f5','#766580'],terracotta:['#8d4335','#fff2da'],blue:['#dfedf5','#496b85'],charcoal:['#20232c','#e5c9a3'],mint:['#e9f3e7','#59766b'],modern:['#faf8f3','#25333c']};var selected=preset(o.theme);var p=[selected.bg,selected.fg];c.fillStyle=p[0];c.fillRect(0,0,1080,1620);c.lineWidth=4;c.strokeStyle=p[1];c.globalAlpha=.45;c.strokeRect(72,72,936,1476);c.strokeRect(90,90,900,1440);if(selected.layout==='geometric')c.strokeRect(105,105,870,1410);if(selected.layout==='arch'){c.beginPath();c.moveTo(140,1450);c.lineTo(140,340);c.quadraticCurveTo(140,135,540,135);c.quadraticCurveTo(940,135,940,340);c.lineTo(940,1450);c.stroke()}if(selected.layout==='floral'){c.font='70px Amiri';c.textAlign='center';c.fillText('❀',180,270);c.fillText('❀',900,1430)}c.globalAlpha=1;c.fillStyle=p[1];c.textAlign='center';c.font='60px Amiri';c.fillText('✦',540,230);var y=drawCenter(c,o.host||'دعوة كريمة',370,800,'52px Amiri',p[1],65);y=drawCenter(c,o.kind||'مناسبة سعيدة',y+70,800,'48px Amiri',p[1],60);y=drawCenter(c,o.names||o.title||'دعوة',y+95,820,'bold 108px Amiri',p[1],120);y=drawCenter(c,o.message||'',y+90,850,'49px Amiri',p[1],70);y=drawCenter(c,formatDate(o.date),Math.max(y+100,1170),850,'bold 52px Amiri',p[1],65);if(o.time)y=drawCenter(c,o.time,y+20,850,'48px Amiri',p[1],60);drawCenter(c,o.venue||'',Math.max(y+40,1390),800,'48px Amiri',p[1],60);c.font='40px Amiri';c.fillText('✦',540,1510);try{canvas.toBlob(function(blob){if(!blob){notify('تعذر إنشاء الصورة');return}var url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='dawat-invitation.png';a.click();setTimeout(function(){URL.revokeObjectURL(url)},2000)},'image/png')}catch(e){notify('تعذر تصدير الصورة')}}
function pathsPage(){
var works=[
['100 نموذج وأرشيف التصاميم','نشط','مكتبة قابلة للبحث والتصفية بحسب المناسبة واللون والأسلوب'],
['مسار التصميم والتخصيص','نشط','معاينة مباشرة وتغيير ألوان التكوين والزخارف'],
['مسار نصوص الدعوات','نشط','اقتراحات محلية تناسب نوع المناسبة بلا إرسال بيانات إلى خادم'],
['مسار الصور والتصدير','نشط','تنزيل PNG وطباعة البطاقة كـPDF'],
['مسار الفوتوشوب المفتوح','نشط','تنزيل مشروع Compositor بخط أميري وطبقات مستقلة للخلفية والإطار والنصوص؛ يفتح على جهاز Mac مدعوم'],
['مسار المشاركة وQR','نشط','رابط دعوة، واتساب اختياري، رمز QR عند توافر المكتبة'],
['مسار الموقع','نشط','رابط خريطة محدد وآمن يظهر داخل دعوة الويب وعند فتح الدعوة'],
['مسار الأرشفة والنسخ الاحتياطي','نشط','حفظ محلي، استيراد وتصدير JSON، ونسخ الدعوات'],
['مسار الجوال والتعريب','نشط','واجهة RTL وتجربة متجاوبة للهواتف'],
['مسار الخصوصية','نشط','لا تتبع زوار ولا إرسال رسائل آلية، مع التنبيه إلى علنية الرابط'],
['مسار الحسابات والأدوار','قيد التخطيط','يتطلب مصادقة حقيقية وتفويض وصول'],
['مسار الدفع والاشتراكات','قيد التخطيط','يحتاج مزود دفع وعقوداً ومراجعة أمنية'],
['مسار الواتساب المؤتمت','قيد التخطيط','يحتاج موافقات الضيوف وواجهة واتساب رسمية'],
['مسار الموشن جرافيك والفيديو','نشط','ثلاثة أساليب حركة، معاينة قابلة للإيقاف وتنزيل فيديو عمودي محليًا حسب دعم المتصفح'],
['مسار الصوت والوسائط المرفوعة','قيد التخطيط','رفع ومعالجة ملفات وإضافة التعليق الصوتي'],
['مسار التحليلات والتسويق','قيد التخطيط','يحتاج بيانات حقيقية وموافقة المستخدمين'],
['مسار اختبارات الجودة والنشر','نشط','اختبارات فهرس التصاميم وسلامة JavaScript والنشر الآلي']
];
app.innerHTML='<div class="container"><div class="eyebrow">DAWAT · WORKFLOWS</div><h1 style="font:700 40px Amiri">مسارات منصة دعوات</h1><p class="subtitle">المسارات النشطة تعمل دون نظام حسابات مركزي. المسارات المخطط لها لا ندّعي أنها متصلة أو مفعلة.</p><div class="cards">'+works.map(function(w){return '<div class="card"><strong>'+esc(w[0])+'</strong><span class="pill" style="margin-top:9px;'+(w[1]!=='نشط'?'background:#fff1dd;color:#99652d':'')+'">'+esc(w[1])+'</span><p>'+esc(w[2])+'</p></div>'}).join('')+'</div></div>';
}
function route(){
 if(motionUI)motionUI.destroy();motionPlayer=null;
 var h=location.hash||'#/';
 if(h.startsWith('#/invite/')){var o=decode(h.slice(9));if(o)showGuest(o);else app.innerHTML='<div class="container"><div class="empty">رابط الدعوة غير صالح.</div></div>';return}
 if(h==='#/dashboard'){dashboard();return}
 if(h==='#/studio'||h==='#/motion'){studio();return}
 if(h==='#/paths'){pathsPage();return}
 if(storyUI){
  storyUI.page(app,function(id){
   editing=null;
   if(id==='web-invitation'||id==='motion-invitation'){
    state={presentation:'web',kind:'زفاف',title:'دعوة خاصة',names:'',host:'',message:'',date:'',time:'',venue:'',maps:'',whatsapp:'',whatsapp2:'',whatsapp3:'',whatsapp4:'',closing:'',theme:'champagne',story:'01-ivory-magnolia',motion:'breeze',duration:12};
    if(id==='motion-invitation'){state.presentation='card';state.story='03-black-and-gold';state.motion='sparkle'}
    location.hash=id==='motion-invitation'?'#/motion':'#/studio';return;
   }
   var t=storyUI.find(id);if(!t)return;
   state={presentation:'card',kind:t.kind,title:t.name,names:'',host:'تتشرف العائلة بدعوتكم',message:'يسرّنا مشاركتكم فرحتنا وحضوركم الكريم',date:'',time:'',venue:'',maps:'',whatsapp:'',whatsapp2:'',whatsapp3:'',whatsapp4:'',closing:'',theme:'night',story:t.id,motion:'breeze',duration:12};
   location.hash='#/studio';
  });
  if(motionUI)motionPlayer=motionUI.mount(app,{motion:'sparkle',duration:12});
 }else app.innerHTML='<div class="container"><div class="empty">تعذر تحميل مكتبة التصميم.</div></div>';
}
window.addEventListener('hashchange',route);route();
})();

