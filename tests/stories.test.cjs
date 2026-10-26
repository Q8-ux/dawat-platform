'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const context = {};
vm.runInNewContext(fs.readFileSync('assets/stories.js','utf8'),context,{timeout:1000});
const stories = Array.from(context.DAWAT_STORIES || []);
const html = fs.readFileSync('index.html','utf8');
const css = fs.readFileSync('assets/stories.css','utf8');
const ui = fs.readFileSync('assets/story-ui.js','utf8');

test('20 distinct story assets declared and exist',()=>{
 assert.equal(stories.length,20);
 assert.equal(new Set(stories.map(x=>x.id)).size,20);
 stories.forEach(item=>{
  assert.match(item.id,/^\d\d-[a-z-]+$/);
  assert.equal(item.width,1080);
  assert.equal(item.height,1920);
  assert.equal(item.format,'image/svg+xml');
  assert.equal(item.photo,'assets/story-photos/'+item.id+'.png');
  assert.ok(fs.existsSync(item.src),item.src);
  const raw=fs.readFileSync(item.src,'utf8');
  assert.match(raw,/<svg[\s\S]*width="1080" height="1920"/);
  assert.match(raw,/<\/svg>/);
  assert.doesNotMatch(raw,/<script|<foreignObject|javascript:/i);
 });
});
test('gallery, editor and sharing use the same story IDs',()=>{
 assert.doesNotThrow(()=>new vm.Script(ui));
 assert.match(html,/assets\/stories\.js/);
 assert.match(html,/assets\/story-ui\.js/);
 assert.match(html,/assets\/stories\.css/);
 assert.match(html,/href="#\/stories"/);
 assert.match(html,/storyUI\.page\(app/);
 assert.match(html,/storyUI\.invite\(item,formatDate\)/);
 assert.match(html,/storyUI\.exportPNG\(o,formatDate,notify\)/);
 assert.match(html,/story:storyUI&&storyUI\.find\(o\.story\)/);
 assert.match(css,/\.story-invitation/);
 assert.match(ui,/canvas\.width=1080;canvas\.height=1920/);
 assert.doesNotMatch(ui,/img\.dataset\.fallback|image\.src=t\.photo|background-image:url\(&quot;'\+t\.photo/);
 assert.match(ui,/image\.src=t\.src/);
});
test('no embedded foreign projects or credentials in story assets',()=>{
 for(const path of ['assets/stories.js','assets/story-ui.js','assets/stories.css']){
   const body=fs.readFileSync(path,'utf8').toLowerCase();
   for(const bad of ['sabeq','lovable.app','chatgpt.site','service_role','sk-proj-']) assert.ok(!body.includes(bad),path+':'+bad);
 }
});

test('story cards keep correct 9:16 proportions across viewport sizes',()=>{
 assert.match(css,/STORY CARD SIZE FIX v2/);
 assert.match(css,/aspect-ratio:9\s*\/\s*16/);
 assert.match(css,/object-fit:contain/);
 assert.match(css,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
 assert.match(css,/\.preview-area \.invite-card\.story-invitation/);
 assert.match(css,/max-height:94%/);
 assert.match(html,/assets\/stories\.css\?v=2/);
});
