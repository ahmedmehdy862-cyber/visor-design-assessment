/* ============================================================
   Admin panel smoke test — boots admin.html in jsdom and
   exercises browse, filter, edit, save, reset, import/export.
   ============================================================ */
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(dir, '..');

const html = readFileSync(path.join(root, 'admin.html'), 'utf8')
  .replace(/<script[^>]*><\/script>/g, '');

const dom = new JSDOM(html, { url: 'https://localhost/', pretendToBeVisual: true, runScripts: 'outside-only' });
const { window } = dom;
global.window = window;
global.document = window.document;
global.localStorage = window.localStorage;
try { global.navigator = window.navigator; }
catch { Object.defineProperty(global, 'navigator', { value: window.navigator, configurable: true }); }
global.HTMLElement = window.HTMLElement;
global.Element = window.Element;
global.getComputedStyle = window.getComputedStyle.bind(window);
global.requestAnimationFrame = (cb) => setTimeout(cb, 0);
global.confirm = () => true;
window.confirm = () => true;

let passed = 0, failed = 0;
const ok = (c, label) => { if (c) { passed++; console.log(`  ✓ ${label}`); } else { failed++; console.log(`  ✗ ${label}`); } };
const $ = (s) => window.document.querySelector(s);
const $$ = (s) => [...window.document.querySelectorAll(s)];

await import(pathToFileURL(path.join(root, 'js', 'admin.js')).href + `?t=${Date.now()}`);

console.log('\nVISOR admin panel smoke test\n');

/* structure */
ok($('#adminBody'), 'admin body mounted');
ok($$('.admin-stats > div').length === 6, `stats strip renders (${$$('.admin-stats > div').length} tiles)`);
ok($$('.admin-row').length > 40, `question list renders (${$$('.admin-row').length} rows)`);
ok($('.editor-blank'), 'editor shows an empty-state before selection');
ok($$('.admin-filters select').length === 4, 'four filter controls present');
ok($('#addBtn') && $('#exportBtn') && $('#importBtn') && $('#resetBtn'), 'toolbar actions present');

/* filters */
$('#fSkill').value = 'typography';
$('#fSkill').dispatchEvent(new window.Event('change', { bubbles: true }));
const typRows = $$('.admin-row').length;
ok(typRows > 0 && typRows < 40, `skill filter narrows to ${typRows} typography items`);
ok($$('.admin-row .rskill').every(el => el.dataset.skill === 'typography'), 'filtered rows are all typography');

$('#fDiff').value = '7';
$('#fDiff').dispatchEvent(new window.Event('change', { bubbles: true }));
ok($$('.admin-row').length <= typRows, 'difficulty filter composes with skill filter');

$('#fText').value = '';
$('#fSkill').value = ''; $('#fSkill').dispatchEvent(new window.Event('change', { bubbles: true }));
$('#fDiff').value = ''; $('#fDiff').dispatchEvent(new window.Event('change', { bubbles: true }));
$('#fText').dispatchEvent(new window.Event('input', { bubbles: true }));

/* select + edit */
$('.admin-row').click();
ok($('.admin-editor .editor-head'), 'editor opens for the selected question');
ok($$('.opt-edit').length >= 2, `options listed for editing (${$$('.opt-edit').length})`);
ok($('[data-f="prompt"]'), 'prompt field rendered');
ok($('#saveBtn') && $('#cancelBtn'), 'save / discard actions present');

const promptField = $('[data-f="prompt"]');
const original = promptField.value;
promptField.value = original + ' (edited)';
promptField.dispatchEvent(new window.Event('input', { bubbles: true }));
ok($('#saveState').textContent.includes('Unsaved'), 'dirty state shown while editing');
$('#saveBtn').click();
ok($('#saveState').textContent.includes('saved'), 'save clears the dirty flag');
ok(JSON.parse(window.localStorage.getItem('visor.bank')), 'edited bank persisted to localStorage');
ok(JSON.parse(window.localStorage.getItem('visor.bank')).some(q => q.prompt.includes('(edited)')),
  'the edit is present in the persisted bank');

/* validation blocks a bad save */
$('[data-f="prompt"]').value = '';
$('[data-f="prompt"]').dispatchEvent(new window.Event('input', { bubbles: true }));
$('#saveBtn').click();
ok($('#saveMsg').textContent.length > 0, `invalid edit rejected: "${$('#saveMsg').textContent}"`);
ok($('#saveState').textContent.includes('Unsaved'), 'still dirty after a rejected save');
$('#cancelBtn').click();
ok($('#saveState').textContent.includes('saved'), 'discard restores a clean state');

/* deactivate toggles */
const statusSel = $('[data-f="active"]');
statusSel.value = 'false';
statusSel.dispatchEvent(new window.Event('change', { bubbles: true }));
$('#saveBtn').click();
ok(JSON.parse(window.localStorage.getItem('visor.bank')).some(q => q.active === false),
  'deactivating an item persists');
$('#fStatus').value = 'inactive';
$('#fStatus').dispatchEvent(new window.Event('change', { bubbles: true }));
ok($$('.admin-row').length >= 1, `status filter shows deactivated items (${$$('.admin-row').length})`);

/* add / delete */
$('#fStatus').value = ''; $('#fStatus').dispatchEvent(new window.Event('change', { bubbles: true }));
const before = $$('.admin-row').length;
$('#addBtn').click();
ok($$('.admin-row').length === before + 1, 'new question added to the list');
ok($('.admin-row.sel'), 'new question auto-selected for editing');
$('#delBtn').click();
ok($$('.admin-row').length === before, 'question deleted');

/* reset */
$('#resetBtn').click();
ok(!window.localStorage.getItem('visor.bank'), 'reset clears the stored override');
ok(!$('.admin-errors'), 'validation clean after reset');

console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed ? 1 : 0);
