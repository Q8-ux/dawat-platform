'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const html = fs.readFileSync('index.html','utf8');
const css = fs.readFileSync('assets/neon-3d.css','utf8');
const app = fs.readFileSync('assets/app.js','utf8');

test('3D Neon CSS enabled after base design', () => {
  assert.match(html, /<link rel="stylesheet" href="assets\/neon-3d\.css\?v=1">/);
  assert.match(html, /3D NEON · DAWAT/);
  assert.match(css, /--neon-aqua/);
  assert.match(css, /--neon-purple/);
  assert.match(css, /@keyframes neon-float/);
  assert.match(css, /rotateY\(/);
  assert.match(css, /backdrop-filter/);
});
test('has a selectable neon invitation group among 100 presets', () => {
  const source = fs.readFileSync('assets/catalog.js', 'utf8');
  const ctx = {}; vm.runInNewContext(source,ctx);
  const neon = Array.from(ctx.DAWAT_CATALOG).filter(x=>x.palette==='night');
  assert.equal(neon.length,5);
  assert.match(neon[0].label,/نيون/);
  assert.match(app,/data-palette/);
  assert.match(css,/data-palette="night"/);
  assert.match(app,/theme:'night'/);
});
test('neon remains motion and print accessible', () => {
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /@media print/);
  assert.match(css, /\.invite-card\.catalog-card/);
});
test('application script remains valid after removing attendance and calendar flows', () => {
  assert.doesNotThrow(()=>new vm.Script(app));
  const publicSource=[html,app,css,fs.readFileSync('assets/web-invitation.css','utf8')].join('\n').toLowerCase();
  for(const removed of ['renderrsvp','setuprsvp','makeics','guestics','rsvp','إضافة للتقويم','تأكيد الحضور'])assert.ok(!publicSource.includes(removed),removed);
});
