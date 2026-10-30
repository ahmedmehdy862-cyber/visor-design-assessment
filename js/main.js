/* ============================================================
   VISOR — application entry.
   Flow: Landing → Experience → Assessment → (Optional practical)
         → Analysis → Results → Restart
   Renders are language-aware: every screen registers a paint
   function that re-runs when the user switches EN ⇄ AR.
   ============================================================ */
import { loadBank } from './data/bank.js';
import { mountAssessment } from './ui/assessment.js';
import { mountResults } from './ui/results.js';
import { renderVisual } from './ui/visuals.js';
import { LEVELS, SKILLS, TRACKS } from './data/skills.js';
import { loadAttempts, loadFeedback, saveFeedback } from './data/board.js';
import { loadRun, clearRun } from './data/run.js';
import { initLang, toggleLang, onLang, t, L, QL, QOpt, isAr } from './i18n/index.js';

initLang();
loadBank();

const app = document.getElementById('app');
const toast = document.getElementById('toast');

let paint = renderLanding;
document.title = t('doc.title');
onLang(() => { document.title = t('doc.title'); paint(); });

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('on');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove('on'), 2400);
}

function skillLabel(id, field) { return L(SKILLS.find(s => s.id === id), field, 'skills'); }

function topbar({ back } = {}) {
  return `
  <header class="topbar">
    <div class="wrap topbar-inner">
      <div class="brand">
        <span class="brand-mark"></span>
        <span>VISOR<small>${t('brand.sub')}</small></span>
      </div>
      <div class="topbar-actions">
        ${back ? `<button class="btn btn-ghost btn-sm" id="backBtn">${back}</button>` : ''}
        <button class="btn btn-lang btn-sm" id="langBtn" title="${t('nav.switchTitle')}">${t('nav.switch')}</button>
        <a class="btn btn-ghost btn-sm" href="admin.html">${t('nav.admin')}</a>
      </div>
    </div>
  </header>`;
}

function wireChrome() {
  const lb = document.getElementById('langBtn');
  if (lb) lb.onclick = () => toggleLang();
}

/* ---------------- GUESTBOOK / FEEDBACK (local-only) ---------------- */

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function gbDate(at) {
  try {
    return new Date(at).toLocaleDateString(isAr() ? 'ar' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return ''; }
}
function renderGuestbook() {
  const list = loadFeedback();
  if (!list.length) return `<p class="muted">${t('gb.empty')}</p>`;
  return list.map(e => `
    <div class="gb-entry">
      <div class="gb-meta"><b>${escapeHtml(e.name || '—')}</b><span>${gbDate(e.at)}</span></div>
      <div class="gb-text">${escapeHtml(e.text)}</div>
    </div>`).join('');
}
function postGuestbook() {
  const nameEl = document.getElementById('gbName');
  const textEl = document.getElementById('gbMsg');
  const name = nameEl.value.trim().slice(0, 40);
  const text = textEl.value.trim().slice(0, 280);
  if (!name) { showToast(t('gb.nameReq')); nameEl.focus(); return; }
  if (!text) return;
  saveFeedback({ name, text });
  nameEl.value = '';
  textEl.value = '';
  document.getElementById('gbList').innerHTML = renderGuestbook();
  showToast(t('gb.post'));
}

/* ---------------- PROGRESS BOARD (all attempts on this device) ---------------- */
function attemptRows() {
  const list = [...loadAttempts()].sort((a, b) =>
    (b.levelRank || 0) - (a.levelRank || 0) ||
    (b.readiness || 0) - (a.readiness || 0) ||
    (b.at || 0) - (a.at || 0));
  const rank = (i) => String(i + 1).padStart(2, '0');
  return list.map((r, i) => {
    const lvl = LEVELS.find(l => l.id === r.levelId);
    const trk = TRACKS.find(x => x.id === r.trackId);
    return `<div class="board-row">
      <span class="board-rank">${rank(i)}</span>
      <span class="board-name">${escapeHtml(r.name || (isAr() ? 'زائر' : 'Guest'))}<small>${gbDate(r.at)}</small></span>
      <span class="board-level">${lvl ? L(lvl, 'name', 'levels') : '—'}</span>
      <span class="board-track">${trk ? L(trk, 'name', 'tracks') : '—'}</span>
      <span class="board-score">${Math.round(r.readiness || 0)}%</span>
    </div>`;
  }).join('');
}
function renderBoard() {
  if (!loadAttempts().length) return `<p class="muted">${t('board.empty')}</p>`;
  return `<div class="board">${attemptRows()}</div>`;
}

/* ---------------- LANDING ---------------- */
function renderLanding() {
  paint = renderLanding;
  const saved = loadRun();
  const levels = LEVELS.map(l => `<span class="level-chip">${L(l, 'name', 'levels')}</span>`).join('');
  const skillCards = SKILLS.map((s, i) => `
    <div class="card">
      <span class="num">${String(i + 1).padStart(2, '0')} — ${skillLabel(s.id, 'short')}</span>
      <h3>${skillLabel(s.id, 'name')}</h3>
      <p>${skillLabel(s.id, 'desc')}</p>
    </div>`).join('');

  app.innerHTML = `
    ${topbar()}
    <section class="hero">
      <div class="hero-grid"></div>
      <div class="wrap">
        <div class="eyebrow">${t('hero.eyebrow')}</div>
        <h1>${t('hero.title.a')}<em>${t('hero.title.em')}</em>${t('hero.title.b')}</h1>
        <p class="lead">${t('hero.lead')}</p>
        <div class="hero-cta">
          <button class="btn btn-accent btn-lg" id="startBtn">${t('hero.cta')}</button>
          <span class="qhint">${t('hero.hint')}</span>
        </div>
        ${saved ? `
        <div class="run-resume">
          <span>${t('run.banner')}<br><small class="muted">${t('run.at', { n: saved.current.index })}</small></span>
          <span class="row gap-10">
            <button class="btn btn-accent btn-sm" id="resumeBtn">${t('run.resume')}</button>
            <button class="btn btn-ghost btn-sm" id="discardBtn">${t('run.discard')}</button>
          </span>
        </div>` : ''}
        <div class="metastrip">
          <div><b>${t('meta.1.b')}</b><span>${t('meta.1.s')}</span></div>
          <div><b>${t('meta.2.b')}</b><span>${t('meta.2.s')}</span></div>
          <div><b>${t('meta.3.b')}</b><span>${t('meta.3.s')}</span></div>
          <div><b>${t('meta.4.b')}</b><span>${t('meta.4.s')}</span></div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="wrap">
        <div class="section-head">
          <div class="eyebrow">${t('levels.eyebrow')}</div>
          <h2>${t('levels.h2')}</h2>
          <p>${t('levels.p')}</p>
        </div>
        <div class="levels-track">${levels}</div>
        <div class="grid-3 mt-40">
          <div class="card"><span class="num">01</span><h3>${t('f1.h3')}</h3><p>${t('f1.p')}</p></div>
          <div class="card"><span class="num">02</span><h3>${t('f2.h3')}</h3><p>${t('f2.p')}</p></div>
          <div class="card"><span class="num">03</span><h3>${t('f3.h3')}</h3><p>${t('f3.p')}</p></div>
        </div>
      </div>
    </section>

    <section class="section" style="background:var(--card);border-block:1px solid var(--line)">
      <div class="wrap">
        <div class="section-head">
          <div class="eyebrow">${t('cases.eyebrow')}</div>
          <h2>${t('cases.h2')}</h2>
          <p>${t('cases.p')}</p>
        </div>
        <div class="grid-3">
          <div class="caseframe" style="margin-top:0">${renderVisual('case1')}</div>
          <div class="caseframe" style="margin-top:0">${renderVisual('case4')}</div>
          <div class="caseframe" style="margin-top:0">${renderVisual('case5')}</div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="wrap">
        <div class="section-head">
          <div class="eyebrow">${t('areas.eyebrow')}</div>
          <h2>${t('areas.h2')}</h2>
        </div>
        <div class="grid-3">${skillCards}</div>
      </div>
    </section>

    <section class="section" style="background:var(--card);border-block:1px solid var(--line)">
      <div class="wrap-narrow">
        <div class="section-head">
          <div class="eyebrow">${t('gb.eyebrow')}</div>
          <h2>${t('gb.h2')}</h2>
          <p>${t('gb.p')}</p>
        </div>
        <div id="gbList" class="gb-list">${renderGuestbook()}</div>
        <form id="gbForm" class="gb-form">
          <input id="gbName" maxlength="40" autocomplete="off" placeholder="${t('gb.namePh')}" aria-label="${t('gb.namePh')}" />
          <textarea id="gbMsg" maxlength="280" rows="3" placeholder="${t('gb.msgPh')}" aria-label="${t('gb.msgPh')}"></textarea>
          <div class="row gap-10" style="justify-content:space-between;align-items:center">
            <span class="small muted">${t('gb.priv')}</span>
            <button class="btn btn-accent" id="gbPost" type="submit">${t('gb.post')}</button>
          </div>
        </form>
      </div>
    </section>

    <section class="section" style="background:var(--card);border-block:1px solid var(--line)">
      <div class="wrap-narrow">
        <div class="section-head">
          <div class="eyebrow">${t('board.eyebrow')}</div>
          <h2>${t('board.h2')}</h2>
          <p>${t('board.p')}</p>
        </div>
        <div id="boardHost">${renderBoard()}</div>
        <div class="row mt-24" style="justify-content:center">
          <button class="btn btn-accent" id="retakeBtn">${t('board.retake')}</button>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="wrap" style="text-align:center">
        <h2 style="font-size:clamp(28px,4vw,44px);letter-spacing:-.04em">${t('close.h2')}</h2>
        <p class="muted mt-16">${t('close.p')}</p>
        <button class="btn btn-accent btn-lg mt-24" id="startBtn2">${t('close.cta')}</button>
      </div>
    </section>

    <footer class="footer"><div class="wrap row">
      <span>${t('footer.1')}</span>
      <span>${t('footer.2')}</span>
    </div></footer>`;

  wireChrome();
  document.getElementById('startBtn').onclick = renderSetup;
  document.getElementById('startBtn2').onclick = renderSetup;
  document.getElementById('retakeBtn').onclick = renderSetup;
  if (saved) {
    document.getElementById('resumeBtn').onclick = () => startAssessment(saved.experience, saved.name || '', saved);
    document.getElementById('discardBtn').onclick = () => { clearRun(); renderLanding(); };
  }
  const gbForm = document.getElementById('gbForm');
  if (gbForm) gbForm.addEventListener('submit', (e) => { e.preventDefault(); postGuestbook(); });
}

/* ---------------- SETUP ---------------- */
const EXPERIENCES = [
  { id: 'beginner', title: 'New to design', desc: 'Studying or under 1 year of practice — I want a baseline.' },
  { id: 'some', title: '1–3 years', desc: 'Junior-ish. I work with guidance on established systems.' },
  { id: 'experienced', title: '4–7 years', desc: 'Mid/Senior range. I solve problems independently.' },
  { id: 'senior', title: '8+ years / leadership', desc: 'Lead, Art Director or equivalent responsibility.' },
];

function renderSetup() {
  paint = renderSetup;
  let choice = null;
  app.innerHTML = `
    ${topbar({ back: t('nav.back') })}
    <section class="section">
      <div class="wrap-narrow">
        <div class="eyebrow">${t('setup.eyebrow')}</div>
        <h1 style="font-size:clamp(30px,4.5vw,48px);letter-spacing:-.04em;margin-top:10px">${t('setup.h1')}</h1>
        <p class="muted mt-16">${t('setup.p')}</p>
        <div class="setup-field">
          <label class="eyebrow" for="candName">${t('setup.name')}</label>
          <input id="candName" maxlength="40" autocomplete="name" placeholder="${t('setup.namePh')}" />
          <span class="setup-err" id="nameErr" hidden>${t('setup.nameReq')}</span>
        </div>
        <div class="pick-list" id="picks">
          ${EXPERIENCES.map(e => `
            <button class="pick" data-id="${e.id}">
              <span><b>${t('exp.' + e.id + '.title')}</b><span>${t('exp.' + e.id + '.desc')}</span></span>
              <span class="tick"></span>
            </button>`).join('')}
        </div>
        <div class="row gap-10 mt-24" style="flex-wrap:wrap">
          <button class="btn btn-accent" id="go" disabled>${t('setup.go')}</button>
          <button class="btn btn-ghost" id="skip">${t('setup.skip')}</button>
        </div>
      </div>
    </section>`;

  wireChrome();
  document.getElementById('backBtn').onclick = renderLanding;
  const go = document.getElementById('go');
  const nameEl = document.getElementById('candName');
  const nameErr = document.getElementById('nameErr');
  const hasName = () => nameEl.value.trim().length > 0;
  const refresh = () => {
    if (hasName()) { nameEl.classList.remove('bad'); nameErr.hidden = true; }
    go.disabled = !(hasName() && choice);
  };
  nameEl.addEventListener('input', refresh);
  document.getElementById('picks').addEventListener('click', (e) => {
    const b = e.target.closest('.pick');
    if (!b) return;
    choice = b.dataset.id;
    document.querySelectorAll('.pick').forEach(p => p.classList.toggle('sel', p === b));
    refresh();
  });
  go.onclick = () => { if (hasName()) startAssessment(choice, nameEl.value.trim()); };
  document.getElementById('skip').onclick = () => {
    if (!hasName()) { nameEl.classList.add('bad'); nameErr.hidden = false; nameEl.focus(); return; }
    startAssessment(null, nameEl.value.trim());
  };
}

/* ---------------- ANALYSIS ---------------- */
function renderAnalyzing(finished, onComplete) {
  paint = () => {};
  const lines = [1, 2, 3, 4, 5, 6, 7].map(i => t('analysis.l' + i));
  app.innerHTML = `
    <div class="analyzing wrap">
      <div>
        <div class="eyebrow">${t('analysis.eyebrow')}</div>
        <h2 class="mt-8">${t('analysis.h2')}</h2>
        <p>${t('analysis.p', { n: finished.stats.responses, s: Object.values(finished.state.skills).filter(s => s.evidence.length).length })}</p>
        <div class="scanline"><i></i></div>
        <div class="scan-log" id="scanLog">${lines[0]}</div>
      </div>
    </div>`;
  let i = 0;
  const el = document.getElementById('scanLog');
  const tm = setInterval(() => {
    i++;
    if (i < lines.length) { el.textContent = lines[i]; }
    else { clearInterval(tm); onComplete(); }
  }, 330);
}

/* ---------------- PRACTICAL CHALLENGE (optional) ---------------- */
const PRACTICAL_Q = {
  id: 'practical-01', skill: 'fundamentals', difficulty: 4, type: 'multi',
  visual: 'case1',
  title: 'Practical Challenge — Poster Repair',
  brief: { label: 'Challenge', text: 'Improve this poster’s hierarchy. Select the three changes that would most improve it. This is optional and is scored like any other item.' },
  prompt: 'Which 3 changes would you make first?',
  options: [
    { id: 'a', title: 'Remove competing badges and the starburst', desc: 'Eliminate the secondary focal points fighting the headline.', q: 1 },
    { id: 'b', title: 'Establish one dominant headline and demote everything else', desc: 'Rebuild scale, weight and spacing around a single entry point.', q: 1 },
    { id: 'c', title: 'Cut the body copy to essentials and open up the spacing', desc: 'Fewer words, larger gaps, one clear reading order.', q: 1 },
    { id: 'd', title: 'Set the whole poster in one clean sans-serif', desc: 'Fix the typeface inconsistency.', q: .2 },
    { id: 'e', title: 'Swap the palette for a quieter two-colour scheme', desc: 'Reduce the colour noise.', q: .35 },
    { id: 'f', title: 'Add a unifying frame around the content', desc: 'Contain the chaos with a border.', q: .15 },
  ],
  correct: ['a', 'b', 'c'],
  purpose: 'Optional practical: hierarchy repair prioritisation.',
};

function createPracticalView(session, onFinish) {
  let selected = new Set();
  let previewUrl = null;
  let previewName = null;
  let order = null;

  function render() {
    paint = render;
    if (!order) {
      order = [...PRACTICAL_Q.options];
      for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
      }
    }
    app.innerHTML = `
      ${topbar({ back: t('nav.back') })}
      <section class="section">
        <div class="wrap-narrow">
          <div class="eyebrow">${t('prac.eyebrow')}</div>
          <h1 style="font-size:clamp(26px,3.6vw,38px);letter-spacing:-.035em;margin-top:10px">${t('prac.h1')}</h1>
          <p class="muted mt-16">${t('prac.p')}</p>
          <div class="caseframe">
            <div class="caseframe-head"><span class="t">${QL(PRACTICAL_Q, 'title')}</span><span class="eyebrow">${t('prac.select', { n: PRACTICAL_Q.correct.length })}</span></div>
            ${renderVisual('case1')}
          </div>
          <div class="options" id="opts">
            ${order.map((o, i) => `
              <button class="option ${selected.has(o.id) ? 'sel' : ''}" data-opt="${o.id}" type="button">
                <span class="option-key">${['a', 'b', 'c', 'd', 'e', 'f'][i]}</span>
                <span class="option-body"><span class="option-title">${QOpt(PRACTICAL_Q, o.id, 'title')}</span><span class="option-desc">${QOpt(PRACTICAL_Q, o.id, 'desc')}</span></span>
              </button>`).join('')}
          </div>
          <div class="qactions">
            <button class="btn btn-ghost" id="skipBtn">${t('prac.skip')}</button>
            <button class="btn btn-accent" id="submitBtn" disabled>${t('prac.submit')}</button>
          </div>
          <div class="practical mt-24">
            <h3>${t('prac.uploadH')}</h3>
            <p class="small muted mt-8">${t('prac.uploadP')}</p>
            <label class="uploadbox" for="fileUp" style="cursor:pointer">
              <input type="file" id="fileUp" accept="image/*" />
              <div id="upText">${previewName || t('prac.uploadBox')}</div>
            </label>
            <div id="preview" class="mt-16">${previewUrl ? `<img src="${previewUrl}" alt="upload" style="max-height:260px;border-radius:12px;border:1px solid var(--line)" />` : ''}</div>
          </div>
        </div>
      </section>`;

    wireChrome();
    document.getElementById('backBtn').onclick = renderLanding;
    const sync = () => {
      document.getElementById('submitBtn').disabled = selected.size !== PRACTICAL_Q.correct.length;
    };
    document.getElementById('opts').addEventListener('click', (e) => {
      const b = e.target.closest('[data-opt]');
      if (!b) return;
      const id = b.dataset.opt;
      if (selected.has(id)) selected.delete(id);
      else if (selected.size < 3) selected.add(id);
      else { selected.delete([...selected][0]); selected.add(id); }
      document.querySelectorAll('[data-opt]').forEach(x => x.classList.toggle('sel', selected.has(x.dataset.opt)));
      sync();
    });
    document.getElementById('skipBtn').onclick = () => {
      onFinish(null);
    };
    document.getElementById('submitBtn').onclick = () => {
      session.submit(PRACTICAL_Q, [...selected], null);
      onFinish(PRACTICAL_Q);
    };
    document.getElementById('fileUp').onchange = (e) => {
      const f = e.target.files[0];
      if (!f) return;
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      previewName = f.name;
      previewUrl = URL.createObjectURL(f);
      document.getElementById('upText').textContent = previewName;
      document.getElementById('preview').innerHTML =
        `<img src="${previewUrl}" alt="upload" style="max-height:260px;border-radius:12px;border:1px solid var(--line)" />`;
      showToast(t('prac.uploaded'));
    };
    sync();
  }
  return { render };
}

/* ---------------- FLOW CONTROL ---------------- */
function startAssessment(experience, name, resume = null) {
  paint = () => {};  /* assessment repaints itself via its own onLang */
  mountAssessment(app, {
    experience,
    name,
    resume,
    onFinish(session) {
      const view = createPracticalView(session, () => {
        const finished = session.finish();
        renderAnalyzing(finished, () => renderResults(finished, name));
      });
      view.render();
    },
  });
}

function renderResults(finished, name) {
  paint = () => {};  /* results repaints itself via its own onLang */
  mountResults(app, { finished, onRestart: renderLanding, name });
}

renderLanding();