/* Shared validation helpers for DAWAT invitations. */
(function(root){
'use strict';
function normalizeDigits(value){
 return String(value==null?'':value).replace(/[٠-٩۰-۹]/g,function(char){
  var code=char.charCodeAt(0);return String(code>=0x06f0?code-0x06f0:code-0x0660);
 });
}
function contactDigits(value){
 var digits=normalizeDigits(value).replace(/\D/g,'');
 return digits.length===8||(digits.length>=10&&digits.length<=15)?digits:'';
}
function whatsappURL(value){
 var digits=contactDigits(value);if(digits.length===8)digits='965'+digits;
 return digits?'https://wa.me/'+digits:'';
}
function safeMapURL(value){
 try{
  var url=new URL(String(value||'').trim());if(url.protocol!=='https:')return '';
  var host=url.hostname.toLowerCase(),path=url.pathname.toLowerCase();
  if(host==='maps.google.com'||host==='maps.google.com.kw')return url.href;
  if((host==='google.com'||host==='www.google.com'||host==='google.com.kw'||host==='www.google.com.kw')&&(path==='/maps'||path.startsWith('/maps/')))return url.href;
  if(host==='maps.app.goo.gl'||host==='maps.apple.com')return url.href;
  return '';
 }catch(error){return ''}
}
function validCoordinates(lat,lng){
 var a=Number(lat),b=Number(lng);return Number.isFinite(a)&&Number.isFinite(b)&&Math.abs(a)<=90&&Math.abs(b)<=180?[a,b]:null;
}
function mapQuery(value,fallback){
 var safe=safeMapURL(value);if(!safe)return '';
 try{
  var url=new URL(safe),query=url.searchParams.get('query')||url.searchParams.get('q')||url.searchParams.get('ll')||'';
  var match=url.href.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/i)||url.href.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/i);
  if(match){var coords=validCoordinates(match[1],match[2]);if(coords)return coords.join(',')}
  var queryCoords=String(query).match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/);
  if(queryCoords){var checked=validCoordinates(queryCoords[1],queryCoords[2]);if(checked)return checked.join(',');query=''}
  if(!query){
   var place=url.pathname.match(/\/place\/([^/@]+)/i);if(place)query=decodeURIComponent(place[1]).replace(/\+/g,' ');
  }
  return String(query||fallback||'').trim().slice(0,300);
 }catch(error){return ''}
}
function embeddedMapURL(value,fallback){
 var query=mapQuery(value,fallback);return query?'https://maps.google.com/maps?q='+encodeURIComponent(query)+'&z=16&output=embed&hl=ar':'';
}
function qrPayloadFits(value,maxBytes){
 var limit=Number(maxBytes)||1800,text=String(value||'');
 try{return new TextEncoder().encode(text).length<=limit}catch(error){return unescape(encodeURIComponent(text)).length<=limit}
}
root.DAWAT_INVITATION_UTILS=Object.freeze({normalizeDigits:normalizeDigits,contactDigits:contactDigits,whatsappURL:whatsappURL,safeMapURL:safeMapURL,validCoordinates:validCoordinates,mapQuery:mapQuery,embeddedMapURL:embeddedMapURL,qrPayloadFits:qrPayloadFits});
})(typeof window!=='undefined'?window:globalThis);
