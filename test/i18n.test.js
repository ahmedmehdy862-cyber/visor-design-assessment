/* ============================================================
   i18n + localization tests.
   Part 1: pure module assertions (string tables, QL/QOpt/L/t,
           Arabic reasoning rubric with the new normaliser).
   Part 2: jsdom boot — SWITCH TO ARABIC toggle re-renders the
           whole flow in RTL Arabic without breaking the engine.
   ============================================================ */
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

import { setLang, lang, isAr, t, L, QL, QOpt } from '../js/i18n/index.js';
import { SKILLS, LEVELS, TRACKS } from '../js/data/skills.js';
import { CORE_QUESTIONS } from '../js/data/bank-core.js';
import { CASE_QUESTIONS } from '../js/data/bank-cases.js';
import { evaluateReasoning, isArabicText } from '../js/engine/reasoning.js';

const ALL = [...CORE_QUESTIONS, ...CASE_QUESTIONS];
const byId = Object.fromEntries(ALL.map(q => [q.id, q]));
const heated = byId['fu-05'];      /* reasoning-scored, Arabic rubric present */
const plainName = 'Hero CTAs 测试';  /* untouched by overlays */

let passed = 0;
let failed = 0;
function ok(cond, label) {
  if (cond) { passed++; console.log(`  ✓ ${label}`); }
  else { failed++; console.log(`  ✗ ${label}`); }
}

console.log('\nVISOR i18n module tests\n');

/* ---- default English ---- */
setLang('en');
ok(!isAr(), 'default language is English');
ok(t('hero.cta') === 'Start assessment', 't() resolves English chrome');
ok(t('q.counter', { n: 3, max: 36 }) === 'Question 3 of up to 36', 't() interpolates placeholders');
ok(QL(heated, 'prompt') === byId['fu-05'].prompt, 'QL() returns English prompt in English mode');
ok(QOpt(heated, 'b', 'title') === 'Layout B', 'QOpt() returns English title in English mode');
ok(L(SKILLS.find(s => s.id === 'typography'), 'name', 'skills') === 'Typography', 'L() returns English skill name');

/* ---- Arabic ---- */
setLang('ar');
ok(isAr() && lang() === 'ar', 'setLang("ar") switches state');
ok(t('hero.cta') === 'ابدأ التقييم', 't() resolves Arabic chrome');
ok(t('q.counter', { n: 3, max: 36 }) === 'السؤال 3 من 36 كحد أقصى', 't() interpolates Arabic placeholders');
ok(QL(heated, 'prompt') !== byId['fu-05'].prompt, 'QL() switches prompt to Arabic');
ok(QL(heated, 'prompt').length > 5, 'Arabic prompt is real text');
ok(QOpt(heated, 'b', 'title') === 'التركيب ب', 'QOpt() returns Arabic title');
ok(QL(heated, 'title') === 'دراسة الحالة 4 — تصميم الصفحات', 'QL() localizes case title');
ok(L(LEVELS.find(l => l.id === 'artDirector'), 'name', 'levels') === 'مدير فني', 'L() localizes level name');
ok(L(TRACKS.find(t2 => t2.id === 'social'), 'name', 'tracks') === 'مصمم سوشيال ميديا', 'L() localizes track name');
ok(t('meta.1.s').includes('مستويات'), 'meta text localized');

/* fallback when no Arabic overlay exists for a question */
const cn01 = byId['cn-01'];
const enPrompt = cn01.prompt;
ok(typeof enPrompt === 'string' && enPrompt.length > 10, 'control: English prompt exists');
ok(QL({ ...cn01, id: 'cn-zz' }, 'prompt') === enPrompt, 'QL() falls back to English for unknown ids');

/* ---- Arabic reasoning rubric ---- */
const arText = 'هذا التركيب يفتقر إلى نقطة بؤرية رئيسية؛ العين بلا تسلسل بصري واضح ولا مسار قراءة محدد، لذا الترتيب والأهمية مضطربان.';
ok(isArabicText(arText), 'isArabicText() detects Arabic');
const arRes = evaluateReasoning(arText, heated.reasoning);
ok(arRes.hits.length >= 2, `Arabic rubric hits both groups (${arRes.hits.length}/2)`);
ok(arRes.tooBrief === false, 'Arabic text is not punished as too brief');
ok(arRes.score >= 5, `Arabic reasoning scores meaningfully (${arRes.score.toFixed(1)}/${arRes.max})`);

const enText = 'This layout lacks a single focal point; the eye has no entry and no reading path, so hierarchy is flat.';
const enRes = evaluateReasoning(enText, heated.reasoning);
ok(enRes.hits.length >= 2, 'English rubric still hits both groups');
ok(!isArabicText(enText), 'isArabicText() stays false for Latin');

/* mixed/punctuation-laden Arabic still normalises cleanly */
const messy = '«التركيب، القوي» — نقطة الدخول غير واضحة!! مسار القراءة ضائع؟';
ok(isArabicText(messy), 'Arabic with punctuation detected');
ok(evaluateReasoning(messy, heated.reasoning).hits.length >= 2, 'Arabic normaliser survives mixed punctuation');

/* ---- jsdom boot: toggle re-renders the app in Arabic RTL ---- */
const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(dir, '..');
const html = readFileSync(path.join(root, 'index.html'), 'utf8')
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
global.Node = window.Node;
global.Event = window.Event;
global.CustomEvent = window.CustomEvent;
global.getComputedStyle = window.getComputedStyle.bind(window);
global.requestAnimationFrame = (cb) => setTimeout(cb, 0);
global.URL.createObjectURL = () => 'blob:stub';
global.URL.revokeObjectURL = () => {};

const $ = (sel) => window.document.querySelector(sel);
const $$ = (sel) => [...window.document.querySelectorAll(sel)];

console.log('\nVISOR i18n jsdom boot\n');

/* boot must start English regardless of module state from part 1 */
setLang('en');
await import(pathToFileURL(path.join(root, 'js', 'main.js')).href + `?i18n=${Date.now()}`);

ok($('#langBtn'), 'language toggle present in topbar');
ok($('#langBtn').textContent.includes('العربية'), 'toggle invites the Arabic switch');
ok($('.hero h1').textContent.includes('Measure'), 'boots in English by default');
ok(window.document.documentElement.lang === 'en', 'document lang=en by default');
ok(window.document.documentElement.dir === 'ltr', 'document dir=ltr by default');

/* click the toggle → whole landing re-renders in Arabic */
$('#langBtn').click();
ok(window.document.documentElement.lang === 'ar', 'document lang flips to ar');
ok(window.document.documentElement.dir === 'rtl', 'document dir flips to rtl');
ok($('.hero h1').textContent.includes('قيّم'), 'headline re-rendered in Arabic');
ok($('#startBtn').textContent.includes('ابدأ'), 'primary CTA re-rendered in Arabic');
ok($('#langBtn').textContent.includes('ENGLISH'), 'toggle now offers English');
ok($$('.level-chip').length === 7, 'levels still rendered after switch');
ok($$('.level-chip')[0].textContent.includes('مبتدئ'), 'level chips localized');
ok($('.caseframe'), 'visual case preview survives re-render');

/* toggle back and forth — must be lossless in both directions */
$('#langBtn').click();
ok(window.document.documentElement.lang === 'en' && $('.hero h1').textContent.includes('Measure'), 'toggle returns to English');
$('#langBtn').click();
ok(window.document.documentElement.lang === 'ar', 'toggle returns to Arabic for the run-through');

/* drive into setup (Arabic) */
$('#startBtn').click();
ok($('#picks'), 'setup screen reached');
ok($('#picks').querySelectorAll('.pick').length === 4, 'four experience options rendered');
ok($('.section h1').textContent.includes('نطاق خبرتك'), 'setup heading localized');
ok($('#picks .pick b').textContent.includes('جديد في التصميم'), 'experience option localized');

/* skip into the assessment — first question must paint in Arabic */
$('#skip').click();
ok($('#qhost'), 'assessment mounted');
const p = $('#qhost .q-prompt');
ok(p, 'question prompt rendered');
const hasArab = /[\u0600-\u06FF]/.test(p.textContent);
ok(hasArab, 'prompt is Arabic in Arabic mode');
const firstOpt = $('#qhost .option-title');
ok(firstOpt && /[\u0600-\u06FF]/.test(firstOpt.textContent), 'option titles localized');
ok($('#endBtn').textContent.includes('إنهاء'), 'assessment chrome localized');
ok(/[\u0600-\u06FF]/.test($('#qhost .q-purpose').textContent), 'q purpose chip localized');
ok($('#qCounter').textContent.includes('السؤال'), 'question counter localized');

/* selection still works in Arabic UI (keyboard-independent click path) */
const opts = $$('#qhost [data-opt]');
if (opts.length) {
  opts[0].click();
  const next = $('#nextBtn');
  ok(!next.disabled, 'selection enables the Arabic Continue button');
  next.click();
  const p2 = $('#qhost .q-prompt');
  ok(p2 && /[\u0600-\u06FF]/.test(p2.textContent), 'advances to next Arabic question');
}

/* back to English for subsequent tests in this process */
setLang('en');
window.document.documentElement.dir = 'ltr';
window.document.documentElement.lang = 'en';

console.log(`\ni18n tests: ${passed} passed, ${failed} failed\n`);
process.exit(failed ? 1 : 0);