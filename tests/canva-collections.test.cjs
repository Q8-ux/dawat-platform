'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {spawnSync}=require('node:child_process');
const file=JSON.parse(fs.readFileSync('data/canva/pro-collections.json','utf8'));
const box={};
vm.runInNewContext(fs.readFileSync('assets/canva-pro-collections.js','utf8'),box,{timeout:1000});
const items=Array.from(box.DAWAT_CANVA_PRO_COLLECTIONS||[]);
const ui=fs.readFileSync('assets/canva-pro-ui.js','utf8');
const html=fs.readFileSync('index.html','utf8');
const css=fs.readFileSync('assets/canva-pro.css','utf8');
test('Canva Pro discovery aggregates over 1000 public collection items without falsely claiming Pro total',()=>{
 assert.equal(file.targetProDesigns,1000);
 assert.ok(file.records.length>=29);
 assert.equal(items.length,file.records.length);
 const reported=items.reduce((n,x)=>n+x.publishedCount,0);
 assert.ok(reported>=1062);
 assert.ok(items.every(x=>x.includesPro===true&&x.itemScope==='mixed-pro-and-free'));
 assert.equal(new Set(items.map(x=>x.url)).size,items.length);
 for(const x of items){
   assert.match(x.url,/^https:\/\/www\.canva\.com\/p\/[a-zA-Z0-9_-]+\/collections\/[a-zA-Z0-9_-]+$/);
   assert.ok(!x.assetPath,'Do not cache Canva Pro templates');
 }
});
test('GitHub Canva source produces exact generated browser artifact',()=>{
 const result=spawnSync(process.execPath,['scripts/import-canva-collections.mjs','--check'],{encoding:'utf8'});
 assert.equal(result.status,0,result.stderr+result.stdout);
});
test('archived third-party source remains safe but is not shipped to the website UI',()=>{
 assert.doesNotThrow(()=>new vm.Script(ui));
 assert.doesNotMatch(html,/assets\/canva-pro-collections\.js|assets\/canva-pro-ui\.js|assets\/canva-pro\.css/);
 assert.doesNotMatch(html,/#\/canva-path/);
 assert.match(html,/storyUI\.page\(app/);
 assert.match(css,/\.pro-collection-grid/);
});

test('Arabic Gulf weddings have top-level priority in Canva Pro gallery',()=>{
 const sources=JSON.parse(fs.readFileSync('data/canva/pro-collections.json','utf8'));
 const x=sources.records.filter(t=>t.priority===0);
 assert.ok(x.length>=4);
 assert.ok(x.every(t=>t.category==='زفاف'));
 const verified=JSON.parse(fs.readFileSync('data/canva/verified-pro.json','utf8'));
 assert.ok(verified.records.filter(t=>t.marketFocus==='arabic-gulf').length>=40);
 const ui=fs.readFileSync('assets/canva-pro-ui.js','utf8');
 assert.match(ui,/الأفراح العربية والخليجية أولاً/);
 assert.match(ui,/sort\.value==='gulf'/);
 const html=fs.readFileSync('index.html','utf8');
 assert.doesNotMatch(html,/\<small\>بحضوركم تكتمل فرحتنا/);
});
