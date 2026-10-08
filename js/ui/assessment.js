/* ============================================================
   Assessment UI: one question at a time with progress,
   visual case framing, keyboard interaction, reasoning input.
   Never reveals correctness — feedback is deferred to results.
   Language switches repaint the current step without advancing,
   preserving the user's selections and draft reasoning.
   ============================================================ */
import { createSession, MAX_QUESTIONS, EARLY_END_MIN } from '../engine/adaptive.js';
import { SKILLS } from '../data/skills.js';
import { renderVisual, renderOptionVisual } from './visuals.js';
import { t, L, QL, QOpt, Ls2, onLang } from '../i18n/index.js';

const KEYS = ['a', 'b', 'c', 'd', 'e', 'f'];

/* Titles that already name themselves ("Layout A", "Concept B", «التركيب أ»)
   must keep their canonical order so the positional key never contradicts the
   title. Every other question is shuffled per render so answer position carries
   no signal — otherwise "always pick the first option" beats the test. */
const SELF_LETTERED_EN = /\b(?:layout|direction|concept|option|version|variant|route|execution)\s+[a-d]\b/i;
const SELF_LETTERED_AR = /(?:الاتجاه|التركيب|المفهوم|الخيار|النسخة)\s+[\u0623\u0628\u062C\u062F]/i;

function isSelfLettered(q, titleFn) {
  const titles = q.options.map(o => (titleFn ? titleFn(o) : (o.title || ''))).join(' ');
  return SELF_LETTERED_EN.test(titles) || SELF_LETTERED_AR.test(titles);
}

export function displayOptions(q, titleFn) {
  if (isSelfLettered(q, titleFn)) return q.options;
  const arr = [...q.options];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function mountAssessment(app, { experience, onFinish }) {
  const startTier = { beginner: 1, some: 2, experienced: 3, senior: 4 }[experience] || 1;
  const session = createSession({ experience, startTier });
  let current = null;
  let shown = null;
  let selected = new Set();
  let reasonDraft = '';
  let locked = false;
  let offLang = null;

  app.innerHTML = `
    <div class="assess">
      <div class="progress-area">
        <div class="wrap">
          <div class="progress-top">
            <div class="stack gap-6">
              <span class="stage-label" id="stageLabel"></span>
              <span class="q-counter" id="qCounter"></span>
            </div>
            <div class="row gap-10">
              <span class="q-counter" id="endHint"></span>
              <button class="btn btn-ghost btn-sm" id="endBtn" disabled>${t('q.end')}</button>
            </div>
          </div>
          <div class="progress-bar"><div class="progress-fill" id="fill" style="width:2%"></div></div>
          <div class="skillpills" id="pills"></div>
        </div>
      </div>
      <div class="qwrap"><div class="wrap" id="qhost"></div></div>
    </div>`;

  const $ = (id) => document.getElementById(id);
  const host = $('qhost');

  function skillName(id) { return L(SKILLS.find(s => s.id === id), 'short', 'skills'); }

  function renderPills(activeSkill) {
    $('pills').innerHTML = SKILLS.map(s => {
      const n = session.state.skills[s.id]?.evidence.length || 0;
      const cls = s.id === activeSkill ? 'active' : (n ? 'done' : '');
      return `<span class="skillpill ${cls}">${skillName(s.id)}</span>`;
    }).join('');
  }

  function paint() {
    if (!current) return;
    locked = false;
    const q = current.question;
    const step = current;
    const isMulti = q.type === 'multi';

    /* preserve any draft reasoning before the host is rebuilt */
    const oldReason = host.querySelector('#reason');
    if (oldReason) reasonDraft = oldReason.value;
    selected = selected || new Set();

    $('stageLabel').textContent = Ls2(step.stage.id, step.stage.label);
    $('qCounter').textContent = t('q.counter', { n: step.index, max: MAX_QUESTIONS });
    $('fill').style.width = `${Math.round(step.progress * 100)}%`;
    $('endBtn').disabled = !session.canEndEarly();
    $('endHint').textContent = session.canEndEarly()
      ? ''
      : t('q.unlock', { n: Math.max(0, step.index - 1), of: EARLY_END_MIN });
    renderPills(q.skill);

    const visualHtml = q.visual ? renderVisual(q.visual) : '';
    const titleFn = (o) => QOpt(q, o.id, 'title');
    shown = displayOptions(q, titleFn);

    const optionsHtml = shown.map((o, i) => {
      const mini = o.v ? `<div class="option-mini">${renderOptionVisual(o.v)}</div>` : '';
      const ot = QOpt(q, o.id, 'title');
      const od = QOpt(q, o.id, 'desc');
      if (mini) {
        return `
        <button class="option opt-card" data-opt="${o.id}" type="button">
          <span class="opt-card-head">
            <span class="option-key">${KEYS[i]}</span>
            <span class="option-title">${ot}</span>
          </span>
          ${od ? `<span class="option-desc">${od}</span>` : ''}
          ${mini}
        </button>`;
      }
      return `
        <button class="option" data-opt="${o.id}" type="button">
          <span class="option-key">${KEYS[i]}</span>
          <span class="option-body">
            <span class="option-title">${ot}</span>
            ${od ? `<span class="option-desc">${od}</span>` : ''}
          </span>
        </button>`;
    }).join('');

    const topKey = KEYS[Math.min(q.options.length, 6) - 1].toUpperCase();

    host.innerHTML = `
      <div class="q-purpose">${step.anchor ? t('q.caseStudy') : t('q.item')} · ${skillName(q.skill)}</div>
      ${QL(q, 'title') && !visualHtml ? `<div class="q-kicker">${QL(q, 'title')}</div>` : ''}
      <h1 class="q-prompt">${QL(q, 'prompt')}</h1>
      ${q.brief ? `<div class="q-brief"><b>${QL(q, 'brief').label}</b>${QL(q, 'brief').text}</div>` : ''}
      ${visualHtml ? `<div class="caseframe">
          <div class="caseframe-head"><span class="t">${QL(q, 'title') || (step.anchor ? t('q.caseStudy') : '')}</span><span class="eyebrow">${t('q.examine')}</span></div>
          ${visualHtml}
          <div class="case-note">${t('q.caseNote')}</div>
        </div>` : ''}
      <div class="options ${visualHtml ? 'opt-visual' : (q.options.length === 4 ? 'grid-2x2' : '')}" id="opts">
        ${optionsHtml}
      </div>
      ${isMulti ? `<div class="qhint mt-16">${t('q.select', { n: q.correct.length })}</div>` : ''}
      ${q.reasoning ? `
        <div class="reason-box">
          <label for="reason">${t('q.reasonLabel')}</label>
          <div class="hint">${t('q.reasonHint')}</div>
          <textarea class="reason" id="reason" placeholder="${t('q.reasonPh')}">${reasonDraft ? escapeHtml(reasonDraft) : ''}</textarea>
        </div>` : ''}
      <div class="qactions">
        <span class="qhint">${q.reasoning ? t('q.reasonEval') : t('q.choose')} ${t('q.keys', { a: 'A', b: topKey, c: '1', d: String(Math.min(q.options.length, 6)) })}</span>
        <button class="btn btn-accent" id="nextBtn" disabled>${isMulti ? t('q.confirm') : t('q.continue')}</button>
      </div>`;

    host.parentElement.style.animation = 'none';
    void host.parentElement.offsetHeight;
    host.parentElement.style.animation = '';

    host.querySelectorAll('[data-opt]').forEach(btn => {
      btn.addEventListener('click', () => toggleOption(btn.dataset.opt));
    });
    $('nextBtn').addEventListener('click', submit);
    syncSelection();
  }

  function renderQuestion() {
    const step = session.next();
    if (!step) return finish();
    current = step;
    selected = new Set();
    reasonDraft = '';
    locked = false;
    paint();
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function numRequired(q) {
    return q.type === 'multi' ? q.correct.length : 1;
  }

  function toggleOption(id) {
    if (locked || !current) return;
    const q = current.question;
    const need = numRequired(q);
    if (q.type === 'multi') {
      if (selected.has(id)) selected.delete(id);
      else if (selected.size < need) selected.add(id);
      else {
        const first = selected.values().next().value;
        selected.delete(first);
        selected.add(id);
      }
    } else {
      selected.clear();
      selected.add(id);
    }
    syncSelection();
  }

  function syncSelection() {
    if (!current) return;
    const q = current.question;
    const isMulti = q.type === 'multi';
    host.querySelectorAll('[data-opt]').forEach(btn => {
      btn.classList.toggle('sel', selected.has(btn.dataset.opt));
      btn.classList.toggle('multi', isMulti);
    });
    const btn = $('nextBtn');
    if (btn) btn.disabled = selected.size !== numRequired(q);
  }

  function submit() {
    if (locked || !current) return;
    const q = current.question;
    if (selected.size !== numRequired(q)) return;
    locked = true;
    const reasonEl = $('reason');
    const reason = reasonEl ? reasonEl.value : null;
    const { done } = session.submit(q, [...selected], reason);
    if (done) return finish();
    renderQuestion();
  }

  function finish() {
    document.removeEventListener('keydown', onKey);
    if (offLang) offLang();
    onFinish(session);
  }

  function onKey(e) {
    if (!current || locked) return;
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'textarea' || tag === 'input') {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); const b = $('nextBtn'); if (b && !b.disabled) submit(); }
      return;
    }
    const key = e.key.toLowerCase();
    let idx = KEYS.indexOf(key);
    if (idx < 0 && /^[1-9]$/.test(key)) idx = Number(key) - 1;
    if (idx >= 0 && idx < current.question.options.length) {
      e.preventDefault();
      toggleOption(current.question.options[idx].id);
    } else if ((e.key === 'Enter' || e.key === 'ArrowRight') && !$('nextBtn')?.disabled) {
      e.preventDefault();
      submit();
    }
  }

  document.addEventListener('keydown', onKey);
  $('endBtn').addEventListener('click', () => { if (session.canEndEarly()) finish(); });

  offLang = onLang(paint);

  renderQuestion();

  return { session };
}