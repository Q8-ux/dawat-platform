'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('assets/motion.js','utf8');
const load=extra=>{const scope={DOMException,AbortController,Blob,...extra};vm.runInNewContext(source,scope);return {scope,motion:scope.DAWAT_MOTION}};
const {motion}=load();
const plain=value=>JSON.parse(JSON.stringify(value));
function context2d(){
 const calls=[];
 const ctx={calls,measureText:text=>({width:Array.from(text).length*15})};
 for(const name of ['save','restore','fillRect','drawImage','strokeRect','beginPath','roundRect','fill','translate','rotate','ellipse','moveTo','lineTo','closePath','fillText'])ctx[name]=(...args)=>calls.push([name,...args]);
 return ctx;
}
const invitation={names:'اسم المناسبة',host:'دعوة كريمة',kind:'زفاف',message:'يسرنا مشاركتكم فرحتنا وحضوركم الكريم',date:'2026-12-01',time:'19:30',venue:'قاعة المناسبة',motion:'sparkle',duration:8};
const date=()=> 'الثلاثاء ١ ديسمبر ٢٠٢٦';

test('motion settings validate links and preserve old static invitations',()=>{
 assert.deepEqual(plain(motion.normalize()),{motion:'none',duration:12});
 assert.deepEqual(plain(motion.normalize({motion:'sparkle',duration:'8'})),{motion:'sparkle',duration:8});
 assert.deepEqual(plain(motion.normalize({motion:'javascript:alert(1)',duration:100000})),{motion:'none',duration:12});
 for(const preset of ['breeze','sparkle','cinema','none'])for(const duration of [8,12,16])assert.deepEqual(plain(motion.normalize({motion:preset,duration})),{motion:preset,duration});
});

test('Arabic text wrapping retains every character, including long tokens and explicit lines',()=>{
 const ctx=context2d();
 const original='دعوة إلى مناسبة سعيدة\nاسمطويليحتاجإلىالتفافدونحذف';
 const lines=motion.wrapLines(ctx,original,140);
 assert.equal(lines.join('').replace(/\s/g,''),original.replace(/\s/g,''));
 assert.ok(lines.every(line=>ctx.measureText(line).width<=140));
 assert.ok(lines.length>3);
});

test('video layout includes all details inside the artboard and rejects unreadable overflow',()=>{
 const layout=motion.layoutText(context2d(),invitation,date);
 const all=layout.blocks.flatMap(block=>block.lines).join(' ');
 for(const value of [invitation.names,invitation.host,invitation.message,invitation.venue,invitation.time,date()])assert.ok(all.includes(value),value);
 assert.ok(layout.top>=300);
 assert.ok(layout.top+layout.height<1700);
 assert.throws(()=>motion.layoutText(context2d(),{...invitation,message:'معلومات طويلة جدًا '.repeat(400)},date),/نص الدعوة طويل/);
});

test('rendering a specific frame is deterministic and animation changes across frames',()=>{
 const render={item:invitation,settings:motion.normalize(invitation),image:null,layout:motion.layoutText(context2d(),invitation,date),palette:{bg:'#112233',ink:'#ffffff',accent:'#ddbb66',panel:'#223344'}};
 const frame=number=>{const ctx=context2d();motion.drawFrame(ctx,render,number);return ctx.calls};
 assert.deepEqual(frame(120),frame(120));
 assert.notDeepEqual(frame(0),frame(120));
 const particles=motion.particlesForFrame(9000,8,'sparkle');
 assert.ok(particles.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.alpha>=0&&p.alpha<=1));
 assert.equal(motion.particlesForFrame(50,8,'none').length,0);
});

test('codec selection prefers available MP4, falls back to WebM, and handles unsupported browsers',()=>{
 assert.equal(motion.videoFormat(),null);
 const mp4=load({MediaRecorder:{isTypeSupported:type=>type==='video/mp4'}}).motion.videoFormat();
 assert.equal(mp4.extension,'mp4');
 const webm=load({MediaRecorder:{isTypeSupported:type=>type==='video/webm;codecs=vp8'}}).motion.videoFormat();
 assert.equal(webm.extension,'webm');
 assert.equal(load({MediaRecorder:{isTypeSupported:()=>false}}).motion.videoFormat(),null);
});

function recordingEnvironment(options={}){
 const events=new Map();
 let stops=0,time=0,recorder=null;
 const track={stop(){stops++},requestFrame(){}};
 const canvas={width:0,height:0,getContext:()=>context2d(),captureStream:()=>({getTracks:()=>[track],getVideoTracks:()=>[track]})};
 class Recorder{
  static isTypeSupported(type){return type==='video/webm'}
  constructor(){if(options.failStart)throw new Error('encoder unavailable');recorder=this;this.state='inactive'}
  start(){this.state='recording';if(options.onStart)options.onStart();queueMicrotask(()=>{if(this.state==='recording'&&this.onstart)this.onstart()})}
  stop(){this.state='inactive';queueMicrotask(()=>{this.ondataavailable({data:new Blob(['frame data'])});this.onstop()})}
 }
 const document={createElement:()=>canvas,addEventListener:(name,fn)=>events.set(name,fn),removeEventListener:name=>events.delete(name),hidden:false};
 const env=load({MediaRecorder:Recorder,document,performance:{now:()=>time},setTimeout:(callback,ms)=>ms<40?setImmediate(()=>{time+=1000;callback()}):setTimeout(callback,ms),clearTimeout:id=>{clearTimeout(id);clearImmediate(id)}});
 return {...env,canvas,events,get stops(){return stops},get recorder(){return recorder}};
}
test('video export completes a real recording lifecycle and releases captured tracks',async()=>{
 const env=recordingEnvironment();const progress=[];
 const result=await env.motion.exportVideo(invitation,date,{onProgress:p=>progress.push(p)});
 assert.equal(result.width,1080);assert.equal(result.height,1920);assert.equal(result.duration,8);
 assert.equal(result.extension,'webm');assert.ok(result.blob.size>0);
 assert.equal(env.stops,1);assert.equal(env.events.size,0);assert.equal(env.recorder.state,'inactive');
 assert.ok(progress.every((p,i)=>i===0||p>=progress[i-1]));
});

test('cancel and encoder failure stop media tracks and do not return a partial video',async()=>{
 const controller=new AbortController();
 const env=recordingEnvironment({onStart:()=>controller.abort()});
 await assert.rejects(env.motion.exportVideo(invitation,date,{signal:controller.signal}),error=>error.name==='AbortError');
 assert.equal(env.stops,1);assert.equal(env.events.size,0);
 const broken=recordingEnvironment({failStart:true});
 await assert.rejects(broken.motion.exportVideo(invitation,date),/encoder unavailable/);
 assert.equal(broken.stops,1);
});

test('save, backup and shared links round-trip the chosen motion without changing legacy data',()=>{
 const storage=new Map();
 const scope={console,TextEncoder,TextDecoder,atob,btoa,URL,DOMException,Blob,document:{querySelector:()=>({})},location:{hash:'#/'},localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)}};
 scope.window=scope;
 for(const path of ['assets/catalog.js','assets/stories.js','assets/story-ui.js','assets/invitation-utils.js','assets/motion.js'])vm.runInNewContext(fs.readFileSync(path,'utf8'),scope);
 const app=fs.readFileSync('assets/app.js','utf8').replace("window.addEventListener('hashchange',route);route();","window.testInvitation={sanitizeInvitation,encode,decode,read,write};");
 vm.runInNewContext(app,scope);
 const api=scope.testInvitation;
 const original={...invitation,theme:scope.DAWAT_CATALOG[0].id,story:'03-black-and-gold'};
 const clean=api.sanitizeInvitation(original,'test-id');
 assert.equal(api.write([clean]),true);
 const saved=api.read()[0],shared=api.decode(api.encode(saved));
 for(const key of ['motion','duration','story','names','message','date','time','venue'])assert.equal(shared[key],original[key],key);
 assert.equal(saved.id,'test-id');
 assert.equal(api.sanitizeInvitation({names:'دعوة قديمة'},'legacy').motion,'none');
 assert.equal(api.sanitizeInvitation({...original,motion:'<script>',duration:-1},'bad').motion,'none');
});
