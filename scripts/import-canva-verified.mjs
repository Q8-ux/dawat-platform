#!/usr/bin/env node
/* Metadata-only Canva Pro importer; official public creator-collection titles only. */
import fs from 'node:fs';
const source=JSON.parse(fs.readFileSync('data/canva/verified-pro.json','utf8'));
const check=process.argv.includes('--check'),write=process.argv.includes('--write');
if(!check&&!write)throw Error('Use --check or --write');
const assert=(ok,m)=>{if(!ok)throw Error(m)};
assert(source.schemaVersion===1 && source.collection==='DAWAT_VERIFIED_PRO_REFERENCES' && source.target===1000,'Bad source header');
assert(Array.isArray(source.records)&&source.records.length<=1000,'Invalid count (max 1000)');
const ids=new Set(),identities=new Set();
for(const r of source.records){
 assert(/^pro-\d{4}$/.test(r.id) && !ids.has(r.id),'Duplicate/invalid ID');
 ids.add(r.id);
 assert(typeof r.title==='string'&&r.title.length>4&&r.title.length<250,'Invalid title');
 assert(!/نكاح|nikah|nikaah/i.test(r.title),'Unwanted phrase in catalog');
 assert(['زفاف','خطوبة','تخرج','مولود','عيد ميلاد','تهنئة'].includes(r.category),'Unsupported category');
 const u=new URL(r.canvaCollectionUrl);
 assert(u.hostname==='www.canva.com'&&u.protocol==='https:'&&!u.search&&!u.hash&&!u.username&&!u.password,'Official Canva HTTPS URLs only');
 assert(/^\/p\/[a-zA-Z0-9_-]+\/collections\/[a-zA-Z0-9_-]+$/.test(u.pathname),'Only official public Canva creator collection');
 assert(r.proLabel==='verified-in-public-canva-collection'&&r.linkType==='collection'&&r.licenseStatus==='link-only'&&r.sourceType==='public-metadata','Cannot rehost template assets');
 assert(!r.imageURL&&!r.assetPath&&!r.data,'No restricted Canva media');
 const ident=r.canvaCollectionUrl+'|'+r.title.toLocaleLowerCase();
 assert(!identities.has(ident),'Duplicate Canva Pro title within collection');
 identities.add(ident);
}
const artifact='/* GENERATED from data/canva/verified-pro.json. Public metadata only; no Canva template files. */\n'+
'(function(root){"use strict";const rows='+JSON.stringify(source.records)+';root.DAWAT_CANVA_VERIFIED_PRO=Object.freeze(rows.map(function(x){return Object.freeze(x)}));})(typeof window!=="undefined"?window:globalThis);\n';
const dest='assets/canva-verified.js';
if(check){
 assert(fs.readFileSync(dest,'utf8')===artifact,'Outdated generated catalog');
 console.log('Verified Pro catalog: '+ids.size+'/1000 source metadata entries.');
}else{fs.writeFileSync(dest,artifact);console.log('Published '+ids.size+' verified Pro references');}
