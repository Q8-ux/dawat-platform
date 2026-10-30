'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const core=require('../assets/compositor-export.js');
test('ZIP retains UTF-8 filenames and payloads with standard CRC32',async()=>{
 const blob=await core.zip([{path:'Design.comp/manifest.json',data:'{"format":"com.compositor.project"}'},{path:'اقرأني.txt',data:'خط عربي'}]);
 const b=Buffer.from(await blob.arrayBuffer());
 assert.equal(b.readUInt32LE(0),0x04034b50);
 assert.equal(b.readUInt16LE(6),0x800);
 assert.equal(b.readUInt32LE(b.length-22),0x06054b50);
 assert.equal(b.readUInt16LE(b.length-12),2);
 const firstLength=b.readUInt16LE(26),size=b.readUInt32LE(18),data=b.subarray(30+firstLength,30+firstLength+size);
 assert.equal(core.crc32(data),b.readUInt32LE(14));
 assert.equal(core.crc32(new TextEncoder().encode('123456789')),0xcbf43926);
 assert.ok(b.includes(Buffer.from('اقرأني.txt')));
});
test('export rejects unsafe archive paths and duplicates',async()=>{
 for(const path of ['../file','/file','a/../file','a\\file','a//file','a/./file','a\0file'])await assert.rejects(core.zip([{path,data:'x'}]),/Invalid archive path/);
 await assert.rejects(core.zip([{path:'x',data:'1'},{path:'x',data:'2'}]),/Duplicate/);
});
test('native text metadata preserves Arabic and validates colors and alignment',()=>{
 const style=core.textMetadata('أسماء المناسبة','Amiri-Bold',72,'#ffffff','Center',90,[820,240]);
 assert.equal(style.content,'أسماء المناسبة');assert.equal(style.fontName,'Amiri-Bold');assert.equal(style.red,1);assert.equal(style.alignment,'Center');
 assert.throws(()=>core.textMetadata('x','Amiri',72,'red','Center',90,[820,240]),/RGB/);
 assert.throws(()=>core.textMetadata('x','Amiri',72,'#ffffff','RTL',90,[820,240]),/text style/);
});
test('project assigns distinct layer IDs, keeps text editable, and rejects out-of-bounds layers',async()=>{
 const surface={width:100,height:80,toBlob:fn=>fn(new Blob(['png-layer']))};
 const text=core.textMetadata('دعوة','Amiri-Regular',30,'#000000','Right',36,[100,80]);
 const result=await core.project({name:'Dawat',width:1080,height:1920,layers:[{name:'Background',canvas:surface},{name:'Name',canvas:surface,x:200,y:400,text}]});
 assert.equal(result.manifest.version,11);assert.equal(result.manifest.colorSpace,'sRGB');
 const ids=result.manifest.layers.map(x=>x.id);assert.equal(new Set(ids).size,2);assert.equal(result.manifest.activeLayerID,ids[1]);
 assert.deepEqual(result.manifest.layers[1].transform.origin,[200,400]);assert.equal(result.manifest.layers[1].text.content,'دعوة');
 assert.ok(result.entries.every(e=>e.path.startsWith('Dawat.comp/')));
 await assert.rejects(core.project({width:50,height:50,layers:[{name:'Oversized',canvas:surface}]}),/outside artboard/);
});
