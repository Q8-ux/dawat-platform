'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const html = fs.readFileSync('index.html','utf8');
const css = fs.readFileSync('assets/neon-3d.css','utf8');
const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m=>m[1]).filter(Boolean);
const app = scripts[0]||'';

test('3D Neon CSS enabled after base design', () => {
  assert.match(html, /<link rel="stylesheet" href="assets\/neon-3d\.css\?v=1">/);
  assert.match(html, /3D NEON · DAWAT/);
  assert.match(css, /--neon-aqua/);
  assert.match(css, /--neon-purple/);
  assert.match(css, /@keyframes neon-float/);
  assert.match(css, /rotateY\(/);
  assert.match(css, /backdrop-filter/);
});
test('neon remains motion and print accessible', () => {
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /@media print/);
  assert.match(css, /\.invite-card\.catalog-card/);
  assert.match(css, /\.rsvp-choice/);
});
test('RSVP scripts remain valid and correctly escape values', () => {
  assert.equal(scripts.length,1);
  assert.doesNotThrow(()=>new vm.Script(app));
  const rsvp=app.slice(app.indexOf('function renderRSVP(o)'),app.indexOf('function copy(t)'));
  assert.match(rsvp,/function setupRSVP\(o\)/);
  assert.ok(rsvp.includes(String.raw`/^\d{4}-\d{2}-\d{2}$/`));
  assert.ok(rsvp.includes(String.raw`/\s+/g`));
  assert.ok(rsvp.includes("msg='رد على دعوة '"));
  assert.ok(rsvp.includes("encodeURIComponent(msg)"));
  assert.ok(!rsvp.includes("var w=window.open"));
  assert.ok(!rsvp.includes(String.raw`\\d`));
  assert.ok(!rsvp.includes(String.raw`\\s`));
});
