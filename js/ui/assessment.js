/* ============================================================
   Assessment UI: one question at a time with progress,
   visual case framing, keyboard interaction, reasoning input.
   Never reveals correctness — feedback is deferred to results.
   ============================================================ */
import { createSession, MAX_QUESTIONS, EARLY_END_MIN } from '../engine/adaptive.js';
import { SKILLS } from '../data/skills.js';
import { renderVisual, renderOptionVisual } from './visuals.js';

const KEYS = ['a', 'b', 'c', 'd', 'e', 'f'];

/* Titles that already name themselves ("Layout A", "Concept B") must keep
   their canonical order so the positional key never contradicts the title.
   Every other question is shuffled per render so answer position carries
   no signal — otherwise "always pick the first option" beats the test. */
const SELF_LETTERED = /\b(?:layout|direction|concept|option|version|variant|route|execution)\s+[a-d]\b/i;

export function displayOptions(q) {
  if (SELF_LETTERED.test(q.options.map(o => o.title || '').join(' '))) return q.options;
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
  let selected = new Set();
  let locked = false;

  app.innerHTML = `
    <div class="assess">
      <div class="progress-area">
        <div class="wrap">
          <div class="progress-top">
            <div class="stack gap-6">
              <span class="stage-label" id="stageLabel">Stage 1 · Foundations</span>
              <span class="q-counter" id="qCounter">Question 1</span>
            </div>
            <div class="row gap-10">
              <span class="q-counter" id="endHint"></span>
              <button class="btn btn-ghost btn-sm" id="endBtn" disabled>End &amp; see results</button>
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

  function renderPills(activeSkill) {
    $('pills').innerHTML = SKILLS.map(s => {
      const n = session.state.skills[s.id]?.evidence.length || 0;
      const cls = s.id === activeSkill ? 'active' : (n ? 'done' : '');
      return `<span class="skillpill ${cls}">${s.short}</span>`;
    }).join('');
  }

  function renderQuestion() {
    const step = session.next();
    if (!step) return finish();
    current = step;
    selected = new Set();
    locked = false;

    $('stageLabel').textContent = step.stage.label;
    $('qCounter').textContent = `Question ${step.index} of up to ${MAX_QUESTIONS}`;
    $('fill').style.width = `${Math.round(step.progress * 100)}%`;
    $('endBtn').disabled = !session.canEndEarly();
    $('endHint').textContent = session.canEndEarly() ? '' : `${step.index - 1}/${EARLY_END_MIN} answered to unlock early end`;
    renderPills(step.question.skill);

    const q = step.question;
    const isMulti = q.type === 'multi';
    const visualHtml = q.visual ? renderVisual(q.visual) : '';
    const shown = displayOptions(q);

    const optionsHtml = shown.map((o, i) => {
      const mini = o.v ? `<div class="option-mini">${renderOptionVisual(o.v)}</div>` : '';
      if (mini) {
        return `
        <button class="option opt-card" data-opt="${o.id}" type="button">
          <span class="opt-card-head">
            <span class="option-key">${KEYS[i]}</span>
            <span class="option-title">${o.title}</span>
          </span>
          ${o.desc ? `<span class="option-desc">${o.desc}</span>` : ''}
          ${mini}
        </button>`;
      }
      return `
        <button class="option" data-opt="${o.id}" type="button">
          <span class="option-key">${KEYS[i]}</span>
          <span class="option-body">
            <span class="option-title">${o.title}</span>
            ${o.desc ? `<span class="option-desc">${o.desc}</span>` : ''}
          </span>
        </button>`;
    }).join('');

    host.innerHTML = `
      <div class="q-purpose">${step.anchor ? 'Visual case study' : 'Assessment item'} · ${SKILLS.find(s => s.id === q.skill).short}</div>
      ${q.title && !visualHtml ? `<div class="q-kicker">${q.title}</div>` : ''}
      <h1 class="q-prompt">${q.prompt}</h1>
      ${q.brief ? `<div class="q-brief"><b>${q.brief.label}</b>${q.brief.text}</div>` : ''}
      ${visualHtml ? `<div class="caseframe">
          <div class="caseframe-head"><span class="t">${q.title || 'Visual case'}</span><span class="eyebrow">Examine closely</span></div>
          ${visualHtml}
          <div class="case-note">Visual case — evaluate what you see, not what is written</div>
        </div>` : ''}
      <div class="options ${visualHtml ? 'opt-visual' : (q.options.length === 4 ? 'grid-2x2' : '')}" id="opts">
        ${optionsHtml}
      </div>
      ${isMulti ? `<div class="qhint mt-16">Select ${q.correct.length} — press the same key again to deselect.</div>` : ''}
      ${q.reasoning ? `
        <div class="reason-box">
          <label for="reason">Explain your choice</label>
          <div class="hint">Optional but recommended at this stage. Describe <em>why</em> — hierarchy, audience, brief, trade-offs. Reasoning quality is assessed alongside your selection.</div>
          <textarea class="reason" id="reason" placeholder="I chose this because…"></textarea>
        </div>` : ''}
      <div class="qactions">
        <span class="qhint">${q.reasoning ? 'Your reasoning is evaluated — be specific.' : 'Choose the strongest answer.'} keys <span class="kbd">A</span>–<span class="kbd">${KEYS[Math.min(q.options.length, 6) - 1].toUpperCase()}</span> (or <span class="kbd">1</span>–<span class="kbd">${Math.min(q.options.length, 6)}</span>) to select · <span class="kbd">Enter</span> / <span class="kbd">→</span> to continue</span>
        <button class="btn btn-accent" id="nextBtn" disabled>${isMulti ? 'Confirm selection' : 'Continue'}</button>
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

  function toggleOption(id) {
    if (locked) return;
    const isMulti = current.question.type === 'multi';
    if (isMulti) {
      if (selected.has(id)) selected.delete(id);
      else if (selected.size < current.question.correct.length) selected.add(id);
      else {
        // replace oldest
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
    const isMulti = current.question.type === 'multi';
    host.querySelectorAll('[data-opt]').forEach(btn => {
      btn.classList.toggle('sel', selected.has(btn.dataset.opt));
      btn.classList.toggle('multi', isMulti);
    });
    const ok = isMulti ? selected.size === current.question.correct.length : selected.size === 1;
    const btn = $('nextBtn');
    if (btn) btn.disabled = !ok;
  }

  function submit() {
    if (locked) return;
    const isMulti = current.question.type === 'multi';
    if (isMulti ? selected.size !== current.question.correct.length : selected.size !== 1) return;
    locked = true;
    const reasonEl = $('reason');
    const { done } = session.submit(current.question, [...selected], reasonEl ? reasonEl.value : null);
    if (done) return finish();
    renderQuestion();
  }

  function finish() {
    document.removeEventListener('keydown', onKey);
    onFinish(session);
  }

  function onKey(e) {
    if (!current || locked) return;
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'textarea' || tag === 'input') {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); if (!$('nextBtn').disabled) submit(); }
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

  renderQuestion();

  return { session };
}
