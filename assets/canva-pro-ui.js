/* DAWAT Canva Pro discovery — all source data is public and metadata-only.
   A collection marked includesPro contains a mix of Pro and Free templates.
   Never present its total as a verified count of Pro-only designs. */
(function(root){"use strict";
const safe=x=>String(x==null?'':x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const all=()=>root.DAWAT_CANVA_PRO_COLLECTIONS||[];
function page(app){
 const collections=all(),total=collections.reduce((s,x)=>s+x.publishedCount,0);
 app.innerHTML='<div class="canva-shell"><section class="canva-top"><div><div class="eyebrow">CANVA PRO · PUBLIC CREATOR COLLECTIONS</div><h1>مكتبة Canva Pro للمناسبات</h1><p>هذه مجموعات أصلية على Canva تحتوي تصاميم تحمل شارة Pro. تفتح كل مجموعة داخل Canva للاختيار والتعديل بحسابك، من دون نسخ تصاميم الآخرين أو استخدام مشاريعك الخاصة.</p><div class="actions"><a href="#/canva-path" class="btn btn-white">مسار كانفا وقاعدة GitHub</a><a href="#/canva-samples" class="btn btn-outline">مراجع قوالب إضافية</a></div></div><aside><strong>الهدف: 1,000 تصميم Pro</strong><p>'+collections.length+' مجموعة موثّقة من Canva</p><p><b>'+total.toLocaleString('ar-KW')+'</b> تصميم معلن ضمن هذه المجموعات (تشمل Pro ومجاني وقد توجد تصاميم مشتركة).</p><p>التصاميم الفردية المؤكدة Pro والمستوردة برابط مخصص: <b id="verified-pro-count">0</b>. لا نختلق العدد.</p></aside></section><div class="canva-filters" id="pro-categories"></div><div class="canva-searchbar"><input type="search" id="pro-search" placeholder="ابحث عن زفاف، تخرج، مولود، عيد، اسم المصمم..." aria-label="ابحث في مجموعات Canva Pro"><select id="pro-sort" aria-label="ترتيب المجموعات"><option value="count">الأكبر أولاً</option><option value="name">حسب اسم المجموعة</option></select><p id="pro-count" aria-live="polite"></p></div><div class="pro-collection-grid" id="pro-collections"></div><p class="canva-note">المجموعات تحوي قوالب Canva Pro وأخرى مجانية، ولا يمكن تأكيد أن كل العناصر Pro من العدد الإجمالي. تعرض المنصة بيانات وصفية وروابط رسمية فقط؛ جميع الرسومات والقوالب المرخّصة تبقى داخل Canva. حقوق Canva Pro لا تسمح بإعادة توزيعها كقوالب قابلة للتنزيل من منصة خارج Canva.</p></div>';
 let active='الكل'; const categories=['الكل',...new Set(collections.map(x=>x.category))];
 const filters=app.querySelector('#pro-categories'),grid=app.querySelector('#pro-collections'),query=app.querySelector('#pro-search'),sort=app.querySelector('#pro-sort'),status=app.querySelector('#pro-count');
 function paint(){
  const q=query.value.trim().toLocaleLowerCase();
  filters.innerHTML=categories.map(x=>'<button type="button" aria-pressed="'+(x===active)+'" data-category="'+safe(x)+'">'+safe(x)+'</button>').join('');
  const visible=collections.filter(x=>(active==='الكل'||x.category===active)&&(!q||(x.title+' '+x.creator+' '+x.category).toLocaleLowerCase().includes(q))).sort((a,b)=>sort.value==='count'?b.publishedCount-a.publishedCount:a.title.localeCompare(b.title));
  const subtotal=visible.reduce((s,x)=>s+x.publishedCount,0);
  status.textContent=visible.length+' مجموعات · '+subtotal.toLocaleString('ar-KW')+' تصميماً معلناً (Pro + مجاني)';
  grid.innerHTML=visible.length?visible.map(x=>'<a class="pro-collection-card" href="'+safe(x.url)+'" target="_blank" rel="noopener noreferrer"><div class="pro-collection-top"><span class="canva-brand">Canva · تضم Pro</span><span class="pro-collection-count">'+x.publishedCount+' تصميماً بالمجموعة</span></div><strong>'+safe(x.title)+'</strong><p>'+safe(x.creator)+'</p><div class="pro-collection-bottom"><span>'+safe(x.category)+'</span><b>افتح في Canva</b></div></a>').join(''):'<div class="canva-empty">لا توجد مجموعات مطابقة لهذا البحث.</div>';
  filters.querySelectorAll('button').forEach(b=>b.onclick=()=>{active=b.dataset.category;paint()});
 }
 query.addEventListener('input',paint);sort.addEventListener('change',paint);paint();
}
function pathPage(app){
 const cols=all(),total=cols.reduce((s,x)=>s+x.publishedCount,0);
 const entries=(root.DAWAT_CANVA_PUBLIC||[]);
 const pro=entries.filter(x=>x.linkType==='template'&&x.tier==='pro');
 app.innerHTML='<div class="canva-shell"><section class="canva-top"><div><div class="eyebrow">DAWAT · مسار كانفا</div><h1>مسار كانفا — قاعدة بيانات GitHub</h1><p>مسار مستقل للاستيراد والتحقق من الروابط والمراجعة والتحديث والنشر، من دون الوصول إلى تصاميم حسابك الخاصة أو استخراج الصور المرخصة.</p><div class="actions"><a class="btn btn-gold" href="#/templates">تصفح مجموعات Pro</a><a class="btn btn-white" target="_blank" rel="noopener noreferrer" href="https://github.com/Q8-ux/dawat-platform/tree/main/data/canva">قاعدة بيانات GitHub</a></div></div><aside><strong>'+pro.length+' / 1,000 Pro مؤكّد</strong><p>'+cols.length+' مجموعة منشورة موثقة تضم Pro.</p><p>'+total.toLocaleString('ar-KW')+' إجمالي قوالب مجموعات، غير محصور في Pro وغير محسوم التكرار.</p><p>'+entries.length+' سجلاً مرجعياً في قاعدة GitHub.</p></aside></section><div class="pro-path-cards"><article class="card"><strong>01 · مصادر Canva</strong><p>قوائم مجموعات عامة رسمية تحتوي Pro. لا دخول للمشاريع أو الملفات الخاصة.</p></article><article class="card"><strong>02 · طابور الاستيراد</strong><p>data/canva/import-queue.json مع حقول الاسم والمناسبة والرابط ومستوى الترخيص.</p></article><article class="card"><strong>03 · قاعدة البيانات</strong><p>data/canva/templates.json وdata/canva/pro-collections.json داخل مستودع GitHub.</p></article><article class="card"><strong>04 · التحقق والنشر</strong><p>ملفات JavaScript مبنية من البيانات، واختبارات GitHub Actions ضد التكرار والروابط المخالفة.</p></article></div><p class="canva-note">الوصول إلى 1,000 تصميم Pro فردي يتطلب روابط فريدة موثقة لكل قالب وشارة Pro مثبتة، لا مجرد تكرار رابط المجموعة. لا توجد حالياً ألف نسخة من ملفات Canva داخل مستودع GitHub، لأن الاشتراك وحده لا يجيز إعادة توزيع المحتوى داخل محرّر مستقل.</p></div>';
}
root.DAWAT_CANVA_PRO_UI=Object.freeze({page,pathPage});
})(typeof window!=="undefined"?window:globalThis);
