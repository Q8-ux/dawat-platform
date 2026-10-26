#!/usr/bin/env node
/* مسار كانفا — GitHub-versioned database importer.
 * Explicit public Canva references and rights-cleared image exports only.
 * No Canva account access, public-page scraping or unauthorized downloads.
 */
import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const input=path.join(root,'data/canva/import-queue.json');
const dbPath=path.join(root,'data/canva/templates.json');
const output=path.join(root,'assets/canva-public.js');
const check=process.argv.includes('--check');
const write=process.argv.includes('--write');
if(!check&&!write){console.error('Use --check or --write');process.exit(2)}
function read(file){return JSON.parse(fs.readFileSync(file,'utf8'))}
function assert(ok,msg){if(!ok)throw Error(msg)}
function txt(v,key,max=400){
 assert(typeof v==='string'&&v.trim()&&v.length<=max,'Invalid '+key);
 assert(!/[\u0000-\u001f\u007f]/.test(v),'Control chars in '+key);
 return v.trim();
}
function canvaURL(value){
 const u=new URL(txt(value,'URL',1000));
 assert(u.protocol==='https:'&&(u.hostname==='www.canva.com'||u.hostname==='canva.com'),'Canva HTTPS only');
 assert(!u.username&&!u.password&&!u.search&&!u.hash,'Credentials and URL tokens are not allowed');
 assert(!/\/(?:projects|folders|brand|settings|team|login|oauth|api)\b/i.test(u.pathname),'Private Canva URLs forbidden');
 assert(/^\/[a-zA-Z0-9_\/-]+\/$/.test(u.pathname),'Invalid Canva URL path');
 return 'https://www.canva.com'+u.pathname;
}
const queue=read(input);
assert(queue&&queue.schemaVersion===1&&Array.isArray(queue.items),'Invalid queue');
assert(queue.items.length<=5000,'Queue too large');
const old=fs.existsSync(dbPath)?read(dbPath):{schemaVersion:1,records:[]};
assert(old.schemaVersion===1&&Array.isArray(old.records),'Invalid database');
const byId=new Map(),byIdentity=new Map();
for(const r of old.records){
 assert(r&&typeof r.id==='string'&&!byId.has(r.id),'Bad existing record ID');
 byId.set(r.id,r);byIdentity.set(r.url+'|'+r.canvaTitle.toLocaleLowerCase(),r.id);
}
const seen=new Set();
const categories=new Set(['زفاف','خطوبة','تخرج','مولود','عيد ميلاد','تهنئة']);
for(const raw of queue.items){
 assert(raw&&typeof raw==='object'&&!Array.isArray(raw),'Bad record');
 const id=txt(raw.id,'ID',80);
 assert(/^canva-[a-z0-9-]+$/.test(id)&&!seen.has(id),'Invalid/duplicate ID: '+id);
 seen.add(id);
 const category=txt(raw.category,'category',50);assert(categories.has(category),'Unknown category: '+category);
 const name=txt(raw.name,'name',180);
 const canvaTitle=txt(raw.canvaTitle,'Canva title',350);
 const url=canvaURL(raw.url);
 assert(raw.sourceType==='public-reference'||raw.sourceType==='authorized-export','Invalid source type');
 const linkType=raw.linkType==='template'?'template':'category';
 if(linkType==='template')assert(/\/(?:design|templates)\//i.test(url),'A template link is required');
 let assetPath=null;
 if(raw.sourceType==='public-reference'){
   assert(!raw.assetPath&&!raw.thumbnail&&!raw.downloadUrl,'Never cache third-party Canva artwork from public links');
   assert(raw.licenseStatus==='link-only','Public records must be link-only');
 }else{
   assert(raw.rightsConfirmed===true&&raw.licenseStatus==='approved-for-rehosting','Separate redistribution rights are required');
   assetPath=txt(raw.assetPath,'authorized export path',260);
   assert(/^assets\/canva-approved\/[a-zA-Z0-9_/-]+\.(?:png|jpe?g|webp)$/.test(assetPath),'Only vetted local raster images permitted');
   const file=path.resolve(root,assetPath);
   assert(file.startsWith(path.resolve(root,'assets/canva-approved')+path.sep),'Unsafe image path');
   assert(fs.existsSync(file),'Approved image missing: '+assetPath);
   assert(fs.statSync(file).size<=8*1024*1024,'Approved image exceeds 8MB');
 }
 const identity=url+'|'+canvaTitle.toLocaleLowerCase();
 assert(!byIdentity.has(identity)||byIdentity.get(identity)===id,'Duplicate URL+title record');
 const record={id,category,name,canvaTitle,url,sourceType:raw.sourceType,linkType,licenseStatus:raw.licenseStatus};
 if(assetPath)record.assetPath=assetPath;
 byIdentity.set(identity,id);byId.set(id,record);
}
const records=[...byId.values()].sort((a,b)=>a.id.localeCompare(b.id,'en',{numeric:true}));
assert(records.length<=10000,'Too many records');
const db={schemaVersion:1,collection:'DAWAT_CANVA',description:'GitHub-versioned Canva reference database; private projects are excluded. Binary assets require separate verified rehosting rights.',records};
const script='/* GENERATED via scripts/import-canva.mjs. Source: data/canva/templates.json. */\n'+
 '(function(root){"use strict";\nconst rows='+JSON.stringify(records)+';\n'+
 'root.DAWAT_CANVA_PUBLIC=Object.freeze(rows.map(function(r){return Object.freeze(r)}));\n'+
 '})(typeof window!=="undefined"?window:globalThis);\n';
const expected=JSON.stringify(db,null,2)+'\n';
if(check){
 assert(fs.existsSync(dbPath),'Missing database');
 assert(fs.readFileSync(dbPath,'utf8')===expected,'Database is stale: use --write');
 assert(fs.readFileSync(output,'utf8')===script,'Browser cache is stale: use --write');
 console.log('Canva DB verified: '+records.length+' records');
}else{
 fs.mkdirSync(path.dirname(dbPath),{recursive:true});
 fs.writeFileSync(dbPath,expected);
 fs.writeFileSync(output,script);
 console.log('Canva records imported: '+queue.items.length+'; stored: '+records.length);
}
