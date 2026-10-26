'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const catalogSource = fs.readFileSync('assets/catalog.js', 'utf8');
const sandbox = {};
vm.runInNewContext(catalogSource, sandbox, { timeout: 1000 });
const templates = sandbox.DAWAT_CATALOG;
const html = fs.readFileSync('index.html', 'utf8');
const inlineScripts = [...html.matchAll(/<script(?:\\s[^>]*)?>([\\s\\S]*?)<\\/script>/g)].map(x => x[1]).filter(Boolean);

test('100 real, distinct templates exist', () => {
  assert.equal(templates.length, 100);
  assert.equal(new Set(templates.map(t => t.id)).size, 100);
  assert.equal(new Set(templates.map(t => t.label)).size, 100);
});
test('eight occasion types, twenty palettes and five layouts', () => {
  assert.equal(new Set(templates.map(t => t.kind)).size, 8);
  assert.equal(new Set(templates.map(t => t.palette)).size, 20);
  assert.equal(new Set(templates.map(t => t.layout)).size, 5);
  for (const t of templates) {
    for (const key of ['id','label','kind','title','host','message','motif','bg','fg','accent']) {
      assert.ok(t[key], `missing ${key} in ${t.id}`);
    }
    assert.match(t.bg, /^#[a-fA-F0-9]{6}$/);
    assert.match(t.fg, /^#[a-fA-F0-9]{6}$/);
  }
});
test('HTML inline script parses and refers to real template catalog', () => {
  assert.equal(inlineScripts.length, 1);
  assert.doesNotThrow(() => new vm.Script(inlineScripts[0], {filename:'index-inline.js'}));
  assert.match(html, /assets\/catalog\.js/);
  assert.match(html, /catalog-category/);
  assert.match(html, /function templatesPage\(\)/);
});
test('all live routes and useful modules have UI', () => {
  for (const word of ['function studio()', 'function pathsPage()', 'function dashboard()', 'function exportPNG(o)', 'function makeICS(o)', 'export-backup','import-backup','data-duplicate','copy-suggest']) assert.ok(html.includes(word), word);
});
test('independent site has no dependencies on other owned projects', () => {
  for (const banned of ['sabeq','lovable.app','chatgpt.site','q8-ux.github.io/saad/']) assert.ok(!html.toLowerCase().includes(banned), banned);
});
