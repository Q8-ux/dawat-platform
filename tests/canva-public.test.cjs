'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {spawnSync}=require('node:child_process');
const db=JSON.parse(fs.readFileSync('data/canva/templates.json','utf8'));
const input=JSON.parse(fs.readFileSync('data/canva/import-queue.json','utf8'));
const context={};
vm.runInNewContext(fs.readFileSync('assets/canva-public.js','utf8'),context,{timeout:1000});
const cards=Array.from(context.DAWAT_CANVA_PUBLIC||[]);
const html=fs.readFileSync('index.html','utf8');
const css=fs.readFileSync('assets/canva-public.css','utf8');

test('GitHub Canva DB contains imported public records and matches browser catalog',()=>{
 assert.equal(db.schemaVersion,1);
 assert.equal(db.collection,'DAWAT_CANVA');
 assert.ok(db.records.length>=20);
 assert.equal(cards.length,db.records.length);
 assert.equal(new Set(cards.map(x=>x.id)).size,cards.length);
 assert.equal(new Set(cards.map(x=>x.category)).size,6);
 assert.equal(input.items.length,20);
 for(let i=0;i<cards.length;i++){
  const item=cards[i],source=db.records[i];
  assert.equal(item.id,source.id);
  assert.equal(item.name,source.name);
  assert.ok(item.canvaTitle.length>8);
  assert.match(item.url,/^https:\/\/www\.canva\.com\/[a-zA-Z0-9_/-]+\/$/);
  assert.ok(['category','template'].includes(item.linkType));
  if(item.sourceType==='public-reference'){
   assert.equal(item.licenseStatus,'link-only');
   assert.equal(item.assetPath,undefined);
  }else{
   assert.equal(item.licenseStatus,'approved-for-rehosting');
   assert.match(item.assetPath,/^assets\/canva-approved\//);
  }
 }
});
test('import script reports synced DB and browser files',()=>{
 const result=spawnSync(process.execPath,['scripts/import-canva.mjs','--check'],{encoding:'utf8'});
 assert.equal(result.status,0,result.stderr+result.stdout);
});
test('third-party metadata stays archived; public website displays hosted art only',()=>{
 assert.doesNotMatch(html,/assets\/canva-public\.js|function canvaPage\(|www\.canva\.com/);
 assert.doesNotMatch(html,/canva-pro-ui\.js|canva-public\.css|canva-pro\.css/);
 const route=html.slice(html.indexOf('function route(){'),html.indexOf('\nwindow.addEventListener',html.indexOf('function route(){')));
 assert.match(route,/storyUI\.page\(app/);
 assert.doesNotMatch(route,/canvaPage\(/);
 assert.match(html,/assets\/story-ui\.js/);
});

test('Canva DB does not republish public third-party template media',()=>{
 const publicItems=db.records.filter(x=>x.sourceType==='public-reference');
 assert.ok(publicItems.length>=20);
 for(const r of publicItems){
  assert.ok(!r.assetPath,'Public reference must not have assetPath');
  assert.ok(!r.thumbnail,'No public template thumbnail cache');
  assert.equal(r.licenseStatus,'link-only');
 }
});
