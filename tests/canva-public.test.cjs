'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const context={};
vm.runInNewContext(fs.readFileSync('assets/canva-public.js','utf8'),context,{timeout:1000});
const cards=Array.from(context.DAWAT_CANVA_PUBLIC||[]);
const html=fs.readFileSync('index.html','utf8');
const css=fs.readFileSync('assets/canva-public.css','utf8');

test('public Canva-only gallery has 20 unique references from official Canva URLs',()=>{
 assert.equal(cards.length,20);
 assert.equal(new Set(cards.map(x=>x.id)).size,20);
 for(const x of cards){
  assert.ok(x.name.length>2);
  assert.ok(x.canvaTitle.length>10);
  assert.match(x.url,/^https:\/\/www\.canva\.com\/(?:[\w-]+\/)*[\w-]+\/$/);
 }
 assert.equal(new Set(cards.map(x=>x.category)).size,6);
});
test('homepage, templates and stories use Canva-only gallery',()=>{
 assert.match(html,/function canvaPage\(\)/);
 assert.match(html,/assets\/canva-public\.js/);
 assert.match(html,/assets\/canva-public\.css/);
 assert.match(html,/canvaPage\(\)\}/);
 const route=html.slice(html.indexOf('function route(){'),html.indexOf('\nwindow.addEventListener',html.indexOf('function route(){')));
 assert.doesNotMatch(route,/\btemplatesPage\(/);
 assert.doesNotMatch(route,/\bstoryUI\.page\(/);
 assert.doesNotMatch(route,/\bshowHome\(/);
 assert.match(route,/canvaPage\(\)/);
 assert.match(html,/target="_blank" rel="noopener noreferrer"/);
 assert.match(css,/\.canva-item/);
});
test('directory does not reuse Canva visual content, account projects or paid image assets',()=>{
 const code=fs.readFileSync('assets/canva-public.js','utf8');
 assert.doesNotMatch(code,/\/design\/|data:image\/|https:\/\/[^\s"']+\.png/i);
 assert.doesNotMatch(code,/user.designs|private designs|user's Canva account/i);
});
