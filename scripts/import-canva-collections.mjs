#!/usr/bin/env node
/* مسار كانفا: validate curated public Pro-containing Canva collections.
   Metadata-only; never download/rehost Canva Pro template images. */
import fs from 'node:fs';
const source=JSON.parse(fs.readFileSync('data/canva/pro-collections.json','utf8'));
const check=process.argv.includes('--check');
const write=process.argv.includes('--write');
if(!check&&!write)throw Error('Choose --check or --write');
function assert(x,m){if(!x)throw Error(m)}
assert(source.schemaVersion===1&&source.collection==='DAWAT_CANVA_PRO_DISCOVERY','Invalid collection schema');
assert(source.targetProDesigns===1000,'Target must remain 1000 designs');
assert(Array.isArray(source.records)&&source.records.length>0&&source.records.length<=200,'Invalid collection list');
const ids=new Set(),urls=new Set();
let total=0;
for(const c of source.records){
 assert(typeof c.id==='string'&&/^collection-\d{3}$/.test(c.id),'Bad collection id');
 assert(!ids.has(c.id),'Duplicate collection ID');
 ids.add(c.id);
 const u=new URL(c.url);
 assert(u.protocol==='https:'&&u.hostname==='www.canva.com','Official Canva URLs only');
 assert(!u.search&&!u.hash&&!u.username&&!u.password,'URL tokens are forbidden');
 assert(/^\/p\/[a-zA-Z0-9_-]+\/collections\/[a-zA-Z0-9_-]+$/.test(u.pathname),'Only public creator collections');
 assert(!urls.has(c.url),'Duplicate Canva collection');
 urls.add(c.url);
 assert(typeof c.title==='string'&&c.title.length>3&&c.title.length<150,'Invalid title');
 assert(typeof c.creator==='string'&&c.creator.length>1&&c.creator.length<100,'Invalid creator');
 assert(['زفاف','خطوبة','تخرج','مولود','عيد ميلاد','تهنئة','أعياد'].includes(c.category),'Invalid category');
 assert(Number.isInteger(c.publishedCount)&&c.publishedCount>=1&&c.publishedCount<=10000,'Invalid published total');
 assert(c.includesPro===true&&c.itemScope==='mixed-pro-and-free','Do not claim all items are Pro');
 assert(c.recordType==='canva-public-creator-collection','Bad provenance');
 total+=c.publishedCount;
}
assert(total>1000,'Confirmed collection totals are below target; do not inflate');
const script='/* GENERATED from data/canva/pro-collections.json. Public metadata only; no Canva assets. */\n'+
 '(function(root){"use strict";const rows='+JSON.stringify(source.records)+';root.DAWAT_CANVA_PRO_COLLECTIONS=Object.freeze(rows.map(function(x){return Object.freeze(x)}));})(typeof window!=="undefined"?window:globalThis);\n';
const dest='assets/canva-pro-collections.js';
if(check){
 assert(fs.existsSync(dest),'Missing generated catalog');
 assert(fs.readFileSync(dest,'utf8')===script,'Generated catalog differs from source: run --write');
 console.log(source.records.length+' Canva collections verified; '+total+' published items incl. Free and Pro (not 1000 verified Pro designs).');
}else{
 fs.writeFileSync(dest,script,'utf8');
 console.log('Imported '+source.records.length+' public Canva collections.');
}
