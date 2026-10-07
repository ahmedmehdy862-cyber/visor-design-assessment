/* ============================================================
   UI smoke test — boots index.html in jsdom and drives the
   whole flow: landing → setup → assessment → practical →
   analysis → results. Verifies the app actually renders and
   the engine wires through to a classified result.
   ============================================================ */
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(dir, '..');

const html = readFileSync(path.join(root, 'index.html'), 'utf8')
  .replace(/<script[^>]*><\/script>/g, '');

const dom = new JSDOM(html, {
  url: 'https://localhost/',
  pretendToBeVisual: true,
  runScripts: 'outside-only',
});

const { window } = dom;
global.window = window;
global.document = window.document;
global.localStorage = window.localStorage;
try { global.navigator = window.navigator; }
catch { Object.defineProperty(global, 'navigator', { value: window.navigator, configurable: true }); }
global.HTMLElement = window.HTMLElement;
global.Element = window.Element;
global.Node = window.Node;
global.CustomEvent = window.CustomEvent;
global.Event = window.Event;
global.getComputedStyle = window.getComputedStyle.bind(window);
global.requestAnimationFrame = (cb) => setTimeout(cb, 0);
global.URL.createObjectURL = () => 'blob:stub';
global.URL.revokeObjectURL = () => {};

let passed = 0;
let failed = 0;
function ok(cond, label) {
  if (cond) { passed++; console.log(`  ✓ ${label}`); }
  else { failed++; console.log(`  ✗ ${label}`); }
}
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const $ = (sel) => window.document.querySelector(sel);
const $$ = (sel) => [...window.document.querySelectorAll(sel)];

/* Click every option until the primary action button unlocks. */
function answerCurrent() {
  const opts = $$('#opts [data-opt]');
  if (!opts.length) return false;
  const target = $('#nextBtn') || $('#submitBtn');
  if (!target) return false;
  let guard = 0;
  while (target.disabled && guard < 8) {
    const btn = $$('#opts [data-opt]')[guard];
    if (!btn) break;
    btn.click();
    guard++;
  }
  if (target.disabled) return false;
  target.click();
  return true;
}

const mainUrl = pathToFileURL(path.join(root, 'js', 'main.js')).href + `?t=${Date.now()}`;

await import(mainUrl);

console.log('\nVISOR UI smoke test\n');

/* 1. Landing */
ok($('#startBtn'), 'landing renders with Start button');
ok($('.hero h1'), 'landing hero headline present');
ok($$('.card').length >= 10, `landing shows skill/feature cards (${$$('.card').length})`);
ok($$('.caseframe').length >= 3, `landing previews visual cases (${$$('.caseframe').length})`);
ok($$('.level-chip').length === 7, `landing lists all 7 levels (${$$('.level-chip').length})`);

/* 2. Setup */
$('#startBtn').click();
ok($$('.pick').length === 4, 'setup offers 4 experience ranges');
ok($('#go').disabled, 'Begin disabled until a range is picked');
$$('.pick')[2].click();
ok(!$('#go').disabled, 'Begin enabled after picking a range');
$('#go').click();

/* 3. Assessment */
ok($('.assess'), 'assessment shell mounted');
ok($('#pills').children.length === 10, `skill pills render (${$('#pills').children.length}/10)`);
ok($('#qCounter').textContent.includes('Question 1'), 'question counter starts at 1');
ok($$('#opts [data-opt]').length >= 3, `options render (${$$('#opts [data-opt]').length})`);
ok($('#qCounter').textContent.includes('of up to 36'), 'question counter shows the cap');
ok($('#endBtn'), 'early-end control present');
ok($('#endBtn').disabled, 'early-end locked until enough items are answered');
ok($('#fill').style.width, 'progress bar initialised');

/* keyboard interaction (defensive: the first item may be multi-select) */
const key = (k) => window.document.dispatchEvent(new window.KeyboardEvent('keydown', { key: k, bubbles: true }));
const selCount = () => $$('#opts [data-opt].sel').length;
const isMultiNow = () => ($('#nextBtn')?.textContent || '').includes('Confirm');
key('1');
ok(selCount() >= 1, 'digit key selects an option');
if (!isMultiNow()) {
  key('2');
  ok(selCount() === 1, 'single-select swaps rather than stacks');
  key('a');
  ok(selCount() === 1, 'letter key also selects');
  const n1 = $('#qCounter').textContent;
  key('Enter');
  await sleep(10);
  ok($('#qCounter').textContent !== n1, 'Enter advances to the next question');
  if (!isMultiNow()) {
    const n2 = $('#qCounter').textContent;
    key('2');
    key('ArrowRight');
    await sleep(10);
    ok($('#qCounter').textContent !== n2, 'ArrowRight advances to the next question');
  }
} else {
  let guard = 2;
  while ($('#nextBtn').disabled && guard <= 6) { key(String(guard)); guard++; }
  ok(!$('#nextBtn').disabled, `digit keys accumulate a multi-select (${selCount()} selected)`);
  const n = $('#qCounter').textContent;
  key('Enter');
  await sleep(10);
  ok($('#qCounter').textContent !== n, 'Enter advances after a multi-select');
}

let sawReasoning = false;
let sawVisual = false;
let sawMulti = false;
let steps = 0;
let inPractical = false;

for (let i = 0; i < 90; i++) {
  if ($('.analyzing') || $('.result-hero')) break;
  if ($('#skipBtn')) { inPractical = true; break; }

  if ($('.qpurpose, .q-purpose')) sawVisual = sawVisual || !!$('.caseframe');
  if ($('.reason-box')) sawReasoning = true;
  if ($('#nextBtn') && $('#nextBtn').textContent.includes('Confirm')) sawMulti = true;

  const before = $('#qCounter')?.textContent;
  const moved = answerCurrent();
  steps++;
  await sleep(4);
  const after = $('#qCounter')?.textContent;
  if (!moved) { await sleep(6); }
  if (before === after && $('.analyzing')) break;
}

ok(steps > 20, `assessment served ${steps} interactions`);
ok(sawVisual, 'at least one anchored visual case appeared');
ok(sawMulti, 'at least one multi-select question appeared');
ok(sawReasoning, 'at least one free-text reasoning question appeared');

/* 4. Practical challenge */
ok(inPractical, 'practical challenge screen reached after the assessment');
if (inPractical) {
  ok($('#skipBtn') && $('#submitBtn'), 'practical offers both skip and submit');
  ok($('.uploadbox'), 'practical offers optional local upload');
  const opts = $$('#opts [data-opt]');
  opts[0].click(); opts[1].click(); opts[2].click();
  ok(!$('#submitBtn').disabled, 'submit unlocks after selecting 3 changes');
  $('#submitBtn').click();
}

/* 5. Analysis */
await sleep(60);
ok($('.analyzing'), 'analysis screen shown');
ok($('#scanLog'), 'analysis reports progress');
for (let i = 0; i < 60 && !$('.result-hero'); i++) await sleep(100);

/* 6. Results */
ok($('.result-hero'), 'results hero rendered');
ok(/(Beginner|Junior|Mid-Level|Senior|Lead|Art Director)/.test($('.result-level')?.textContent || ''),
  `level classified: "${$('.result-level')?.textContent?.trim().slice(0, 40)}"`);
ok($('.result-track')?.textContent.includes('track'), 'career track rendered');
ok(/%$/.test($('.hero-stat.readiness b')?.textContent || ''), `readiness shown (${$('.hero-stat.readiness b')?.textContent})`);

ok($('.radar-card svg'), 'skill radar SVG rendered');
ok($$('.skillbar-row').length === 10, `all 10 skill bars rendered (${$$('.skillbar-row').length})`);
ok($$('.tab').length === 5, `5 result tabs (${$$('.tab').length})`);

/* tab switching */
for (const tab of $$('.tab')) {
  tab.click();
  const panel = $(`.tabpanel[data-panel="${tab.dataset.tab}"]`);
  ok(panel && !panel.hidden, `tab "${tab.textContent.trim()}" shows its panel`);
  ok($$('.tabpanel:not([hidden])').length === 1, 'exactly one panel visible');
}

/* readiness parts + roadmap */
$('.tab[data-tab="readiness"]').click();
ok($$('.rd-part').length >= 3, `readiness parts rendered (${$$('.rd-part').length})`);
$('.tab[data-tab="roadmap"]').click();
ok($$('.road-item').length === 3, `roadmap has 3 priorities (${$$('.road-item').length})`);
ok(/Practice/.test($('.road-item .practice')?.textContent || ''), 'roadmap items include practice guidance');
$('.tab[data-tab="evidence"]').click();
ok($$('.history-chip').length > 10, `response log rendered (${$$('.history-chip').length} chips)`);
ok($$('.listcard').length >= 2, 'evidence detail cards rendered');

/* restart */
$('#restart').click();
ok($('#startBtn'), 'restart returns to landing');

console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed ? 1 : 0);
