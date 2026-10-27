'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const source=fs.readFileSync('assets/invitation-utils.js','utf8');
const context={URL,TextEncoder};
vm.runInNewContext(source,context,{timeout:1000});
const utils=context.DAWAT_INVITATION_UTILS;

test('Arabic and Persian phone digits normalize before WhatsApp validation',()=>{
 assert.equal(utils.contactDigits('٥٥٥١٠٠٠١'),'55510001');
 assert.equal(utils.contactDigits('۵۵۵۱۰۰۰۲'),'55510002');
 assert.equal(utils.whatsappURL('٥٥٥١٠٠٠١'),'https://wa.me/96555510001');
 assert.equal(utils.whatsappURL('+۹۶۵ ۵۵۵۱ ۰۰۰۲'),'https://wa.me/96555510002');
});

test('map links accept only map-specific HTTPS destinations',()=>{
 for(const url of ['https://www.google.com/maps/place/Test','https://maps.google.com/?q=29,48','https://maps.app.goo.gl/example','https://maps.apple.com/?ll=29,48'])assert.ok(utils.safeMapURL(url),url);
 for(const url of ['http://www.google.com/maps','https://www.google.com/url?q=x','https://sites.google.com/view/x','https://goo.gl/example','https://evilgoogle.com/maps'])assert.equal(utils.safeMapURL(url),'',url);
});

test('map query extracts coordinates and rejects coordinates outside the globe',()=>{
 assert.equal(utils.mapQuery('https://www.google.com/maps/place/Test/@29.31,48.12,16z'),'29.31,48.12');
 assert.equal(utils.mapQuery('https://www.google.com/maps/place/Test/data=!3d29.31!4d48.12'),'29.31,48.12');
 assert.equal(utils.mapQuery('https://maps.google.com/?q=95,200'),'');
 assert.equal(utils.mapQuery('https://maps.app.goo.gl/example','قاعة المناسبة'),'قاعة المناسبة');
});

test('QR payload guard reports oversized invitation links before rendering',()=>{
 assert.equal(utils.qrPayloadFits('https://example.test/#/invite/abc',1800),true);
 assert.equal(utils.qrPayloadFits('x'.repeat(1801),1800),false);
});
