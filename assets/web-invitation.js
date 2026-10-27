/* DAWAT interactive web invitation template. Generic data only. */
(function(root){
'use strict';
const escape=value=>String(value==null?'':value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const attribute=escape;
const utils=root.DAWAT_INVITATION_UTILS;
function whatsappURL(value){
 return utils?utils.whatsappURL(value):'';
}
function contacts(item){
 const seen=new Set();return ['whatsapp','whatsapp2','whatsapp3','whatsapp4'].map(key=>String(item&&item[key]||'').trim()).map(value=>({label:utils?utils.contactDigits(value):'',url:whatsappURL(value)})).filter(contact=>contact.url&&!seen.has(contact.url)&&seen.add(contact.url));
}
function embeddedMap(url,fallback){return utils?utils.embeddedMapURL(url,fallback):''}
function story(item){return root.DAWAT_STORY_UI&&root.DAWAT_STORY_UI.find(item&&item.story)||null}
function render(item,formatDate,options){
 item=item||{};options=options||{};
 const design=story(item);const art=design?design.src:'assets/story-art/01-ivory-magnolia.svg';
 const map=String(options.map||'');const embed=embeddedMap(map,item.venue);const list=contacts(item);
 const title=item.names||item.title||'اسم المناسبة';
 const host=item.host||'دعوة كريمة';
 const message=item.message||'اكتب كلمات دعوتك هنا';
 const venue=item.venue||'يُحدد مكان المناسبة لاحقًا';
 const closing=item.closing||'يسعدنا حضوركم ومشاركتكم فرحتنا';
 const date=typeof formatDate==='function'?formatDate(item.date):String(item.date||'');
 const page=options.page===true;
 const contactMarkup=list.length?'<section class="web-contact-section" aria-label="أرقام التواصل"><div class="web-contact-grid">'+list.map(contact=>'<a href="'+attribute(contact.url)+'" target="_blank" rel="noopener noreferrer" aria-label="فتح واتساب الرقم '+attribute(contact.label)+'"><bdi dir="ltr">'+escape(contact.label)+'</bdi></a>').join('')+'</div></section>':'';
 const locationMarkup=(item.venue||map)?'<section class="web-event-card web-location-card"><div class="web-map">'+(embed?'<iframe title="موقع المناسبة على الخريطة" src="'+attribute(embed)+'" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>':'<div class="web-map-placeholder" aria-hidden="true"><span>⌖</span><small>افتح رابط الموقع لعرض الخريطة</small></div>')+'</div><div class="web-location-copy"><span>مكان المناسبة</span><h3>'+escape(venue)+'</h3>'+(map?'<a href="'+attribute(map)+'" target="_blank" rel="noopener noreferrer">الموقع على الخريطة</a>':'')+'</div></section>':'';
 const actions=page?'<div class="web-action-dock" aria-label="أدوات الدعوة">'+(map?'<a href="'+attribute(map)+'" target="_blank" rel="noopener noreferrer">الموقع</a>':'')+'<button type="button" data-web-action="share">مشاركة</button><button type="button" data-web-action="qr">رمز QR</button><button type="button" data-web-action="download">تنزيل البطاقة</button></div>':'';
 return '<article class="dawat-web-invite '+(page?'is-page':'is-preview')+'" data-web-theme="light" style="--web-art:url(&quot;'+attribute(art)+'&quot;)"><header class="web-invite-header"><div><strong>دَعَوات</strong><small>دعوة خاصة</small></div>'+(page?'<button type="button" class="web-theme-button" data-web-action="theme" aria-label="تبديل مظهر الدعوة" aria-pressed="false">◐</button>':'')+'</header><section class="web-hero"><div class="web-hero-art" role="img" aria-label="خلفية زخرفية للدعوة"></div><div class="web-hero-copy"><span class="web-kicker">'+escape(item.kind||'مناسبة سعيدة')+'</span><p>'+escape(host)+'</p><h1>'+escape(title)+'</h1><p class="web-message">'+escape(message)+'</p><div class="web-date-line"><time'+(item.date?' datetime="'+attribute(item.date)+'"':'')+'>'+escape(date)+'</time>'+(item.time?'<bdi dir="ltr">'+escape(item.time)+'</bdi>':'')+'</div></div></section><section class="web-details"><article class="web-event-card web-date-card"><span>موعد المناسبة</span><h2>'+escape(date)+'</h2>'+(item.time?'<bdi dir="ltr">'+escape(item.time)+'</bdi>':'<small>يُحدد الوقت لاحقًا</small>')+'</article>'+locationMarkup+'</section>'+contactMarkup+'<section class="web-closing"><span aria-hidden="true">✦</span><p>'+escape(closing)+'</p></section>'+actions+'<div class="web-qr-target" data-web-qr-target></div></article>';
}
root.DAWAT_WEB_INVITATION=Object.freeze({render,contacts,whatsappURL,embeddedMap});
})(typeof window!=='undefined'?window:globalThis);
