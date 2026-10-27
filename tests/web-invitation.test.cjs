'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const utilsSource=fs.readFileSync('assets/invitation-utils.js','utf8');
const source=fs.readFileSync('assets/web-invitation.js','utf8');
const context={URL,DAWAT_STORY_UI:{find:id=>id?{src:'assets/story-art/01-ivory-magnolia.svg'}:null}};
vm.runInNewContext(utilsSource,context,{timeout:1000});
vm.runInNewContext(source,context,{timeout:1000});
const web=context.DAWAT_WEB_INVITATION;
const html=fs.readFileSync('index.html','utf8');
const app=fs.readFileSync('assets/app.js','utf8');
const css=fs.readFileSync('assets/web-invitation.css','utf8');

test('interactive web invitation module renders only supplied generic data',()=>{
 assert.ok(web);
 const item={presentation:'web',kind:'زفاف',title:'دعوة خاصة',names:'اسم المناسبة',host:'دعوة كريمة',message:'نص قابل للتعديل',date:'',time:'',venue:'مكان المناسبة',story:'01-ivory-magnolia',closing:'يسعدنا حضوركم'};
 const page=web.render(item,()=> 'موعد المناسبة يحدد لاحقاً',{page:true,map:''});
 assert.match(page,/dawat-web-invite is-page/);
 for(const value of ['اسم المناسبة','دعوة كريمة','نص قابل للتعديل','مكان المناسبة','يسعدنا حضوركم'])assert.match(page,new RegExp(value));
 assert.doesNotMatch(page,/undefined|null/);
});

test('up to four contact cards generate separate safe WhatsApp links',()=>{
 const item={whatsapp:'٥٥٥١٠٠٠١',whatsapp2:'+۹۶۵ ۵۵۵۱ ۰۰۰۲',whatsapp3:'',whatsapp4:'55510003'};
 const contacts=Array.from(web.contacts(item));
 assert.equal(contacts.length,3);
 assert.deepEqual(contacts.map(x=>x.url),['https://wa.me/96555510001','https://wa.me/96555510002','https://wa.me/96555510003']);
 assert.equal(web.whatsappURL('not-a-number'),'');
 assert.equal(web.embeddedMap('https://evilgoogle.com/maps?q=1,2'),'');
 assert.match(web.embeddedMap('https://www.google.com/maps/search/?api=1&query=29,48'),/^https:\/\/www\.google\.com\/maps\?/);
 assert.match(web.embeddedMap('https://www.google.com/maps/place/Test/@29.3,48.1,16z'),/29\.3%2C48\.1/);
});

test('studio and guest routes integrate the web template',()=>{
 assert.doesNotThrow(()=>new vm.Script(source));
 assert.match(html,/assets\/web-invitation\.css/);
 assert.match(html,/assets\/web-invitation\.js/);
 assert.match(html,/assets\/invitation-utils\.js/);
 assert.match(app,/DAWAT_WEB_INVITATION/);
 assert.match(app,/presentation:'web'/);
 assert.match(app,/whatsapp2/);
 assert.match(app,/data-web-action=\\?"share/);
 assert.match(app,/id==='web-invitation'/);
 assert.match(css,/\.dawat-web-invite/);
 assert.match(css,/@media\(max-width:760px\)/);
 assert.match(css,/prefers-reduced-motion/);
});

test('web template remains isolated from any copied invitation project assets',()=>{
 const live=['index.html','assets/web-invitation.js','assets/web-invitation.css','assets/story-ui.js'].map(path=>fs.readFileSync(path,'utf8').toLowerCase()).join('\n');
 for(const token of ['hamad-'+'wedding','invitation-'+'original.jpg','venue-'+'background.jpg'])assert.ok(!live.includes(token),token);
});
