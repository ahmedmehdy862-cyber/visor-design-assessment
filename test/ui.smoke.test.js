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

let { window } = dom;
function bindGlobals() {
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
}
bindGlobals();

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
ok($('#candName'), 'setup asks for a candidate name');
ok($$('.pick').length === 4, 'setup offers 4 experience ranges');
ok($('#go').disabled, 'Begin disabled until a range is picked');
$$('.pick')[2].click();
ok($('#go').disabled, 'Begin stays disabled without a name');
$('#candName').value = 'Smoke Tester';
$('#candName').dispatchEvent(new window.Event('input', { bubbles: true }));
ok(!$('#go').disabled, 'Begin enabled after a range and a name');
$('#go').click();

/* 3. Assessment */
ok($('.assess'), 'assessment shell mounted');
ok($('#pills').children.length === 10, `skill pills render (${$('#pills').children.length}/10)`);
ok($('#qCounter').textContent.includes('Question 1'), 'question counter starts at 1');
ok($$('#opts [data-opt]').length >= 3, `options render (${$$('#opts [data-opt]').length})`);
ok($('#qCounter').textContent.includes('of up to 36'), 'question counter shows the cap');
ok($('#endBtn'), 'early-end control present');
ok($('#endBtn').disabled, 'early-end locked until enough items are answered');
ok($('#backBtn') && $('#backBtn').disabled, 'back control present and locked on the first question');
ok($('#fill').style.width, 'progress bar initialised');
ok(/unlocks at \d+ answers/i.test($('#endHint').textContent), `early-end hint is a clear countdown ("${$('#endHint').textContent.trim()}")`);

/* ARIA: progressbar + live counter */
const progbar = $('.progress-bar');
ok(progbar && progbar.getAttribute('role') === 'progressbar', 'progress bar exposes role=progressbar');
ok(progbar && progbar.getAttribute('aria-valuenow') !== null, 'progress bar carries aria-valuenow');
ok($('#qCounter').getAttribute('aria-live') === 'polite', 'question counter is aria-live=polite');

/* persistence: a saved run appears once the first question is shown */
await sleep(300);
let savedRun = null;
try { savedRun = JSON.parse(window.localStorage.getItem('visor.run.v1') || 'null'); } catch { savedRun = null; }
ok(savedRun && savedRun.v === 1, 'in-progress run is persisted to localStorage');
ok(savedRun && savedRun.current && typeof savedRun.current.qid === 'string', 'persisted run records the current question id');
ok(savedRun && savedRun.name === 'Smoke Tester', 'persisted run records the candidate name');

/* in-assessment language toggle: switch in place, keep the question */
ok($('#qLangBtn'), 'in-assessment language toggle present');
const langCounter = $('#qCounter').textContent;
const langOptCount = $$('#opts [data-opt]').length;
$('#qLangBtn').click();
await sleep(10);
ok(/[\u0600-\u06FF]/.test($('#qCounter').textContent), 'assessment switches to Arabic in place');
ok(/[\u0600-\u06FF]/.test($('#stageLabel').textContent), 'stage label localises to Arabic in place');
ok($$('#opts [data-opt]').length === langOptCount, 'same options render after switching language');
$('#qLangBtn').click();
await sleep(10);
ok($('#qCounter').textContent === langCounter, 'assessment switches back to English without advancing');
ok($('#qLangBtn').textContent.trim().length > 0, 'toggle label refreshes after switching');

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
  const badgeA = $$('#opts [data-opt]').find(b =>
    (b.querySelector('.option-key')?.textContent || '').trim().toLowerCase() === 'a');
  ok(badgeA && badgeA.classList.contains('sel'),
    'letter key selects the option displaying the matching badge (shuffled order)');
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

    /* go back one step and verify full restoration */
    const n3 = $('#qCounter').textContent;
    ok(!$('#backBtn').disabled, 'back unlocks once a previous question exists');
    key('ArrowLeft');
    await sleep(10);
    ok($('#qCounter').textContent === n2, 'ArrowLeft steps back to the previous question');
    ok($$('#opts [data-opt].sel').length >= 1, 'previous selection is restored after going back');
    key('ArrowRight');
    await sleep(10);
    ok($('#qCounter').textContent === n3, 're-submitting the restored answer advances again');
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
let midRun = null;

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
  /* capture a mid-run snapshot (with a selection pending) for the resume test */
  if (steps === 6) {
    await sleep(300);
    const opt = $$('#opts [data-opt]')[0];
    if (opt && !opt.classList.contains('sel')) opt.click();
    await sleep(300);
    try { midRun = JSON.parse(window.localStorage.getItem('visor.run.v1') || 'null'); } catch { midRun = null; }
  }
  if (before === after && $('.analyzing')) break;
}

ok(steps > 20, `assessment served ${steps} interactions`);
ok(sawVisual, 'at least one anchored visual case appeared');
ok(sawMulti, 'at least one multi-select question appeared');
ok(sawReasoning, 'at least one free-text reasoning question appeared');
ok(midRun && midRun.current && midRun.current.index >= 2, `persisted run advances with the assessment (index ${midRun?.current?.index})`);
ok(midRun && Array.isArray(midRun.history) && midRun.history.length >= 1, 'persisted run keeps answered-question history');
ok(midRun && Array.isArray(midRun.selectedIds), 'persisted run records the pending selection');

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
ok(($('#resultName')?.textContent || '').includes('Smoke Tester'), 'results show the candidate name');
ok(/(Beginner|Junior|Mid-Level|Senior|Lead|Art Director)/.test($('.result-level')?.textContent || ''),
  `level classified: "${$('.result-level')?.textContent?.trim().slice(0, 40)}"`);
ok($('.result-track')?.textContent.includes('track'), 'career track rendered');
ok(/%$/.test($('.hero-stat.readiness b')?.textContent || ''), `readiness shown (${$('.hero-stat.readiness b')?.textContent})`);

ok($('.radar-card svg'), 'skill radar SVG rendered');
ok($('.radar-card svg[role="img"]')?.getAttribute('aria-label')?.length > 0, 'radar SVG exposes a text alternative');
ok($$('.skillbar-row').length === 10, `all 10 skill bars rendered (${$$('.skillbar-row').length})`);
ok($$('.tab').length === 5, `5 result tabs (${$$('.tab').length})`);

/* ARIA: tablist pattern */
ok($('#tabs')?.getAttribute('role') === 'tablist', 'tab container exposes role=tablist');
ok($$('.tab[role="tab"]').length === 5, 'every tab exposes role=tab');
ok($$('.tab[aria-selected="true"]').length === 1, 'exactly one tab is aria-selected');
ok($$('.tabpanel[role="tabpanel"]').length === 5, 'every panel exposes role=tabpanel');
ok($('.tab[aria-selected="true"]')?.getAttribute('aria-controls') === 'panel-profile',
  'selected tab points at its panel via aria-controls');

/* tab switching */
for (const tab of $$('.tab')) {
  tab.click();
  const panel = $(`.tabpanel[data-panel="${tab.dataset.tab}"]`);
  ok(panel && !panel.hidden, `tab "${tab.textContent.trim()}" shows its panel`);
  ok($$('.tabpanel:not([hidden])').length === 1, 'exactly one panel visible');
  ok($$('.tab[aria-selected="true"]').length === 1 && tab.getAttribute('aria-selected') === 'true',
    `tab "${tab.textContent.trim()}" is the aria-selected one after clicking`);
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

/* keyboard: ArrowLeft/ArrowRight move between tabs */
$('.tab[data-tab="profile"]').focus();
$('#tabs').dispatchEvent(new window.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
ok($('.tab[aria-selected="true"]')?.dataset.tab === 'readiness', 'ArrowRight moves to the next tab');
$('#tabs').dispatchEvent(new window.KeyboardEvent('keydown', { key: 'End', bubbles: true }));
ok($('.tab[aria-selected="true"]')?.dataset.tab === 'evidence', 'End jumps to the last tab');

/* finishing clears the persisted run */
ok(window.localStorage.getItem('visor.run.v1') === null, 'persisted run is cleared once the run finishes');

/* feedback form on results — name is mandatory */
ok($('#fbForm') && $('#fbName') && $('#fbMsg'), 'results offer a feedback form');
$('#fbMsg').value = 'Rendered feedback note.';
$('#fbName').value = '';
$('#fbForm').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
ok(($('#fbOut').textContent || '').length > 0 && $('#fbMsg').value !== '', 'feedback blocked without a name');
$('#fbName').value = 'Smoke Tester';
$('#fbForm').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
ok($('#fbMsg').value === '', 'feedback posts once a name is present');

/* language switch is available on the results screen too */
ok($('#resLangBtn'), 'results offer a language switch');
const resLangBefore = $('#resultName')?.textContent || '';
$('#resLangBtn').click();
await sleep(20);
ok($('.result-hero') && window.document.documentElement.lang === 'ar', 'results re-render in Arabic');
ok(/[\u0600-\u06FF]/.test($('.result-level')?.textContent || ''), 'results level localises to Arabic');
$('#resLangBtn').click();
await sleep(20);
ok(window.document.documentElement.lang === 'en', 'results switch back to English');
ok(($('#resultName')?.textContent || '') === resLangBefore, 'results keep the same candidate after a language round-trip');

/* restart */
$('#restart').click();
ok($('#startBtn'), 'restart returns to landing');
/* progress board aggregates the completed attempt */
ok($$('.board-row').length >= 1, `progress board lists attempts (${$$('.board-row').length})`);
ok(($$('.board-row')[0].textContent || '').includes('Smoke Tester'), 'board shows the candidate name');
ok($('#retakeBtn'), 'board offers a retake action');

/* guestbook */
ok($('#gbForm') && $('#gbName') && $('#gbMsg'), 'guestbook form present on landing');
$('#gbName').value = 'Smoke Tester';
$('#gbMsg').value = 'Back-nav note — يارب تنجح.';
$('#gbPost').click();
await sleep(10);
ok($$('.gb-entry').length >= 1, 'guestbook entry rendered after posting');
ok(($$('.gb-entry')[0].textContent || '').includes('Smoke Tester'), 'newest entry is the one just posted');
ok(($$('.gb-entry')[0].textContent || '').includes('يارب'), 'entry text is escaped and displayed');
const gbN = $$('.gb-entry').length;
$('#langBtn').click();
await sleep(10);
ok($$('.gb-entry').length === gbN, 'guestbook survives a language re-render');

/* 7. Session resume — simulate a browser refresh with a saved run.
   Rebind globals to a fresh JSDOM, seed the captured mid-run
   snapshot, re-import main.js and drive the resume banner. */
if (midRun) {
  const dom2 = new JSDOM(html, {
    url: 'https://localhost/',
    pretendToBeVisual: true,
    runScripts: 'outside-only',
  });
  window = dom2.window;
  bindGlobals();
  window.localStorage.setItem('visor.lang', 'en');
  window.localStorage.setItem('visor.run.v1', JSON.stringify(midRun));
  await import(pathToFileURL(path.join(root, 'js', 'main.js')).href + `?t=${Date.now()}`);

  ok($('#resumeBtn') && $('#discardBtn'), 'landing offers resume/discard for the saved run');
  ok(($('.run-resume')?.textContent || '').includes(String(midRun.current.index)),
    `resume banner shows the saved question number (${midRun.current.index})`);
  ok($('#resumeBtn').textContent.trim().length > 0, 'resume button is labelled');

  $('#resumeBtn').click();
  await sleep(10);
  ok($('.assess'), 'resume re-mounts the assessment');
  ok(($('#qCounter')?.textContent || '').includes(`Question ${midRun.current.index}`),
    `resume lands on the saved question (${midRun.current.index})`);
  const restoredSel = (midRun.selectedIds || [])[0];
  if (restoredSel) {
    const btn = $(`[data-opt="${restoredSel}"]`);
    ok(btn && btn.classList.contains('sel'), 'resume restores the pending selection');
  }
  ok($('#backBtn') && !$('#backBtn').disabled, 'resume restores back-navigation history');
  ok($('#fill').getAttribute('style')?.includes('width'), 'progress bar reflects the restored progress');

  /* discard path: seed again, click discard, banner and run are gone */
  const dom3 = new JSDOM(html, {
    url: 'https://localhost/',
    pretendToBeVisual: true,
    runScripts: 'outside-only',
  });
  window = dom3.window;
  bindGlobals();
  window.localStorage.setItem('visor.lang', 'en');
  window.localStorage.setItem('visor.run.v1', JSON.stringify(midRun));
  await import(pathToFileURL(path.join(root, 'js', 'main.js')).href + `?t=${Date.now()}`);
  ok($('#discardBtn'), 'landing offers discard for the saved run');
  $('#discardBtn').click();
  await sleep(10);
  ok(!$('.run-resume') && !$('#resumeBtn'), 'discard removes the resume banner');
  ok(window.localStorage.getItem('visor.run.v1') === null, 'discard clears the persisted run');
  ok($('#startBtn'), 'landing is fully usable after discarding');
}

console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed ? 1 : 0);
