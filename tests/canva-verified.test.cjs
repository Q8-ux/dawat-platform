'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {spawnSync}=require('node:child_process');
const source=JSON.parse(fs.readFileSync('data/canva/verified-pro.json','utf8'));
const scope={};
vm.runInNewContext(fs.readFileSync('assets/canva-verified.js','utf8'),scope,{timeout:1000});
const list=Array.from(scope.DAWAT_CANVA_VERIFIED_PRO||[]);
const html=fs.readFileSync('index.html','utf8');
const app=fs.readFileSync('assets/app.js','utf8');
const ui=fs.readFileSync('assets/canva-pro-ui.js','utf8');
test('78 Pro-labeled template titles from official public collections, not 1000 fabricated assets',()=>{
 assert.equal(source.target,1000);
 assert.ok(list.length>=78 && list.length<=1000);
 assert.equal(list.length,source.records.length);
 assert.equal(new Set(list.map(x=>x.id)).size,list.length);
 assert.ok(new Set(list.map(x=>x.canvaCollectionUrl)).size>=10);
 for(const item of list){
  assert.match(item.canvaCollectionUrl,/^https:\/\/www\.canva\.com\/p\/[\w-]+\/collections\/[\w-]+$/);
  assert.equal(item.proLabel,'verified-in-public-canva-collection');
  assert.equal(item.linkType,'collection');
  assert.equal(item.licenseStatus,'link-only');
  assert.ok(!item.assetPath);
  assert.doesNotMatch(item.title,/نكاح|nikah|nikaah/i);
 }
});
test('historical verified references stay synchronized and invisible to public pages',()=>{
 const r=spawnSync(process.execPath,['scripts/import-canva-verified.mjs','--check'],{encoding:'utf8'});
 assert.equal(r.status,0,r.stderr+r.stdout);
 assert.doesNotMatch(html,/assets\/canva-verified\.js|assets\/canva-pro-ui\.js/);
 assert.match(app,/storyUI\.page\(app/);
 assert.doesNotThrow(()=>new vm.Script(ui));
});

