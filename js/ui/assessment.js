/* ============================================================
   Assessment UI: one question at a time with progress,
   visual case framing, keyboard interaction, reasoning input.
   Never reveals correctness — feedback is deferred to results.
   Language switches repaint the current step without advancing,
   preserving the user's selections and draft reasoning.
   ============================================================ */
import { createSession, MAX_QUESTIONS, EARLY_END_MIN, MIN_QUESTIONS, progressFor } from '../engine/adaptive.js';
import { SKILLS, stageFor } from '../data/skills.js';
import { getQuestion } from '../data/bank.js';
import { saveRun, clearRun } from '../data/run.js';
import { renderVisual, renderOptionVisual } from './visuals.js';
import { t, L, QL, QOpt, Ls2, onLang, toggleLang } from '../i18n/index.js';

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

export function mountAssessment(app, { experience, onFinish, resume = null, name = '' }) {
  const startTier = { beginner: 1, some: 2, experienced: 3, senior: 4 }[experience] || 1;
  const session = createSession({ experience, startTier });
  let current = null;
  let shown = null;
  let selected = new Set();
  let reasonDraft = '';
  let locked = false;
  let offLang = null;
  let frame = null;          /* per-question snapshot for "go back" */
  let history = [];          /* stack of answered-question records */
  let restoreShown = false;  /* keep the exact order a restored question had */
  let persistT = null;       /* debounced localStorage write */

  app.innerHTML = `
    <div class="assess">
      <div class="progress-area">
        <div class="wrap">
          <div class="progress-top">
            <div class="stack gap-6">
              <span class="stage-label" id="stageLabel"></span>
              <span class="q-counter" id="qCounter" aria-live="polite"></span>
            </div>
            <div class="row gap-10">
              <button class="btn btn-lang btn-sm" id="qLangBtn" title="${t('nav.switchTitle')}">${t('nav.switch')}</button>
              <span class="q-counter" id="endHint"></span>
              <button class="btn btn-ghost btn-sm" id="backBtn" disabled>${t('q.back')}</button>
              <button class="btn btn-ghost btn-sm" id="endBtn" disabled>${t('q.end')}</button>
            </div>
          </div>
          <div class="progress-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="4" aria-label="${t('q.progressLabel')}"><div class="progress-fill" id="fill" style="width:2%"></div></div>
          <div class="skillpills" id="pills"></div>
        </div>
      </div>
      <div class="qwrap"><div class="wrap" id="qhost"></div></div>
    </div>`;

  const $ = (id) => document.getElementById(id);
  const host = $('qhost');

  /* ---- run persistence (localStorage) ------------------------------
     Written debounced on every selection/reason change and question
     boundary, so a refresh or closed tab resumes exactly here. */
  function persist() {
    if (!current) return;
    const reasonEl = $('reason');
    saveRun({
      v: 1,
      name,
      experience,
      current: { qid: current.question.id, index: current.index, anchor: current.anchor },
      shownIds: shown.map(o => o.id),
      selectedIds: [...selected],
      reasonDraft: reasonEl ? reasonEl.value : reasonDraft,
      snapshot: { state: frame ? frame.snapshot.state : session.state, used: frame ? [...frame.snapshot.used] : [] },
      history: history.map(h => ({
        qid: h.step.question.id,
        index: h.step.index,
        anchor: h.step.anchor,
        shownIds: h.shown.map(o => o.id),
        selectedIds: [...h.selected],
        reason: h.reason || '',
        snapshot: { state: h.snapshot.state, used: [...h.snapshot.used] },
      })),
    });
  }
  function persistSoon() {
    clearTimeout(persistT);
    persistT = setTimeout(persist, 250);
  }

  /* Rebuild a live step from a persisted qid; null if the bank no
     longer has it (question deactivated since the run was saved). */
  function stepFrom(saved, fallbackProgress) {
    const q = getQuestion(saved.qid);
    if (!q || q.active === false) return null;
    return {
      question: q,
      index: saved.index,
      anchor: !!saved.anchor,
      stage: stageFor(q.difficulty),
      progress: fallbackProgress ?? progressFor(saved.index),
      extended: saved.index > MIN_QUESTIONS,
    };
  }

  function restoreRun(run) {
    try {
      const step = stepFrom(run.current);
      if (!step) return false;
      const optById = new Map(step.question.options.map(o => [o.id, o]));
      const restoredShown = (run.shownIds || []).map(id => optById.get(id)).filter(Boolean);
      if (restoredShown.length !== step.question.options.length) return false;
      const restoredSelected = new Set((run.selectedIds || []).filter(id => optById.has(id)));
      /* rebuild history first — a broken entry invalidates back-nav */
      const restoredHistory = [];
      for (const h of run.history || []) {
        const hstep = stepFrom(h);
        if (!hstep) return false;
        const hopts = new Map(hstep.question.options.map(o => [o.id, o]));
        const hshown = (h.shownIds || []).map(id => hopts.get(id)).filter(Boolean);
        if (hshown.length !== hstep.question.options.length) return false;
        restoredHistory.push({
          snapshot: { state: h.snapshot.state, used: new Set(h.snapshot.used || []) },
          step: hstep,
          shown: hshown,
          selected: new Set((h.selectedIds || []).filter(id => hopts.has(id))),
          reason: h.reason || '',
        });
      }
      session.restore({ state: run.snapshot.state, used: new Set(run.snapshot.used || []) });
      current = step;
      shown = restoredShown;
      selected = restoredSelected;
      reasonDraft = run.reasonDraft || '';
      history = restoredHistory;
      locked = false;
      restoreShown = true;
      paint();
      restoreShown = false;
      return true;
    } catch { return false; }
  }

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
    const langBtn = $('qLangBtn');
    if (langBtn) { langBtn.textContent = t('nav.switch'); langBtn.title = t('nav.switchTitle'); }
    const fill = $('fill');
    fill.style.width = `${Math.round(step.progress * 100)}%`;
    fill.classList.toggle('accent', !!step.extended);
    const bar = fill.parentElement;
    if (bar) {
      bar.setAttribute('aria-valuenow', String(Math.round(step.progress * 100)));
      bar.setAttribute('aria-label', t('q.progressLabel'));
    }
    $('endBtn').disabled = !session.canEndEarly();
    $('backBtn').disabled = !history.length;
    $('endHint').textContent = session.canEndEarly()
      ? ''
      : t('q.unlock', { left: Math.max(0, EARLY_END_MIN - (step.index - 1)), of: EARLY_END_MIN });
    renderPills(q.skill);

    const visualHtml = q.visual ? renderVisual(q.visual) : '';
    const titleFn = (o) => QOpt(q, o.id, 'title');
    if (!restoreShown) shown = displayOptions(q, titleFn);
    frame = { snapshot: session.snapshot(), step: current, shown };

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
    const reasonEl = $('reason');
    if (reasonEl) reasonEl.addEventListener('input', persistSoon);
    syncSelection();
    persistSoon();
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
    persistSoon();
  }

  function submit() {
    if (locked || !current) return;
    const q = current.question;
    if (selected.size !== numRequired(q)) return;
    locked = true;
    const reasonEl = $('reason');
    const reason = reasonEl ? reasonEl.value : null;
    /* record the pre-submit world so its effect can be undone cleanly */
    if (frame && frame.step === current) {
      history.push({
        snapshot: frame.snapshot,
        step: frame.step,
        shown: frame.shown,
        selected: new Set(selected),
        reason,
      });
      history = history.slice(-100);  /* hard cap, just in case */
    }
    const { done } = session.submit(q, [...selected], reason);
    if (done) return finish();
    renderQuestion();
  }

  function back() {
    if (locked || !current || !history.length) return;
    const entry = history.pop();
    session.restore(entry.snapshot);
    current = entry.step;
    shown = entry.shown;
    selected = new Set(entry.selected);
    reasonDraft = entry.reason || '';
    locked = false;
    restoreShown = true;
    paint();
    restoreShown = false;
    persistSoon();
  }

  function finish() {
    document.removeEventListener('keydown', onKey);
    window.removeEventListener('beforeunload', onUnload);
    if (offLang) offLang();
    clearTimeout(persistT);
    clearRun();
    onFinish(session);
  }

  function onUnload() {
    clearTimeout(persistT);
    persist();
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
    /* index into the shuffled on-screen order — the badges are assigned
       from `shown`, so key letters must map to what the user sees */
    if (idx >= 0 && idx < shown.length) {
      e.preventDefault();
      toggleOption(shown[idx].id);
    } else if ((e.key === 'Enter' || e.key === 'ArrowRight') && !$('nextBtn')?.disabled) {
      e.preventDefault();
      submit();
    } else if (e.key === 'ArrowLeft' && !$('backBtn')?.disabled) {
      e.preventDefault();
      back();
    }
  }

  document.addEventListener('keydown', onKey);
  window.addEventListener('beforeunload', onUnload);
  $('endBtn').addEventListener('click', () => { if (session.canEndEarly()) finish(); });
  $('backBtn').addEventListener('click', back);
  $('qLangBtn').addEventListener('click', () => toggleLang());

  /* Switching language repaints in place — keep the question, selections,
     draft reasoning and the exact option order the user is looking at. */
  offLang = onLang(() => {
    restoreShown = true;
    paint();
    restoreShown = false;
  });

  if (!resume || !restoreRun(resume)) renderQuestion();

  return { session };
}