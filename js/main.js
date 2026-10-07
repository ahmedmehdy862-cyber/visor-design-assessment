/* ============================================================
   VISOR — application entry.
   Flow: Landing → Experience → Assessment → (Optional practical)
        → Analysis → Results → Restart
   ============================================================ */
import { loadBank } from './data/bank.js';
import { mountAssessment } from './ui/assessment.js';
import { mountResults } from './ui/results.js';
import { renderVisual } from './ui/visuals.js';
import { LEVELS, SKILLS } from './data/skills.js';

loadBank();

const app = document.getElementById('app');
const toast = document.getElementById('toast');

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('on');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove('on'), 2400);
}

function topbar({ back } = {}) {
  return `
  <header class="topbar">
    <div class="wrap topbar-inner">
      <div class="brand">
        <span class="brand-mark"></span>
        <span>VISOR<small>Visual Competency Assessment</small></span>
      </div>
      <div class="topbar-actions">
        ${back ? `<button class="btn btn-ghost btn-sm" id="backBtn">${back}</button>` : ''}
        <a class="btn btn-ghost btn-sm" href="admin.html">Admin</a>
      </div>
    </div>
  </header>`;
}

/* ---------------- LANDING ---------------- */
function renderLanding() {
  const levels = LEVELS.map(l => `<span class="level-chip">${l.name}</span>`).join('');
  const skillCards = SKILLS.map((s, i) => `
    <div class="card">
      <span class="num">${String(i + 1).padStart(2, '0')} — ${s.short}</span>
      <h3>${s.name}</h3>
      <p>${s.desc}</p>
    </div>`).join('');

  app.innerHTML = `
    ${topbar()}
    <section class="hero">
      <div class="hero-grid"></div>
      <div class="wrap">
        <div class="eyebrow">Professional assessment · Not a quiz</div>
        <h1>Measure how a designer <em>thinks</em>, not what they can recite.</h1>
        <p class="lead">A multi-stage visual assessment that evaluates composition, typography, colour, concept, art direction, campaign thinking and leadership — then classifies your <strong>professional level</strong> and <strong>career track</strong> separately.</p>
        <div class="hero-cta">
          <button class="btn btn-accent btn-lg" id="startBtn">Start assessment</button>
          <span class="qhint">~24–36 adaptive items · 8 visual case studies · 12–18 min</span>
        </div>
        <div class="metastrip">
          <div><b>7</b><span>Levels assessed — Beginner to Art Director</span></div>
          <div><b>6</b><span>Career tracks, scored independently</span></div>
          <div><b>10</b><span>Competency skills with confidence scoring</span></div>
          <div><b>8</b><span>Realistic visual case studies</span></div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="wrap">
        <div class="section-head">
          <div class="eyebrow">Levels</div>
          <h2>The classification runs deeper than a score.</h2>
          <p>Level is derived from difficulty-banded evidence, weighted so advanced items matter more, with contradiction checks that block inflated classification. Career track is evaluated on a separate axis.</p>
        </div>
        <div class="levels-track">${levels}</div>
        <div class="grid-3 mt-40">
          <div class="card"><span class="num">01</span><h3>Level ≠ Track</h3><p>“Mid-Level Graphic Designer — Strong Art Direction Potential” is a normal, valid result. Both axes are scored separately.</p></div>
          <div class="card"><span class="num">02</span><h3>Adaptive difficulty</h3><p>Strong answers unlock harder items. Weak answers trigger diagnostics. The test stops once evidence is sufficient — you are not graded against a fixed ladder.</p></div>
          <div class="card"><span class="num">03</span><h3>Reasoning is scored</h3><p>At senior stages you explain your choices. We assess hierarchy awareness, audience, brief-connection and trade-offs — not just the selected option.</p></div>
        </div>
      </div>
    </section>

    <section class="section" style="background:var(--card);border-block:1px solid var(--line)">
      <div class="wrap">
        <div class="section-head">
          <div class="eyebrow">Visual case studies</div>
          <h2>Real design artefacts — good, bad and subtly flawed.</h2>
          <p>You will audit an overcrowded poster, diagnose typographic failures, choose a colour direction against a brief, rank compositions, catch a brand-system violation, direct a campaign, select an art-direction concept, and run a final pre-publish review.</p>
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
          <div class="eyebrow">Assessment areas</div>
          <h2>Ten competency skills, each scored 0–100.</h2>
        </div>
        <div class="grid-3">${skillCards}</div>
      </div>
    </section>

    <section class="section">
      <div class="wrap" style="text-align:center">
        <h2 style="font-size:clamp(28px,4vw,44px);letter-spacing:-.04em">Ready to find your level?</h2>
        <p class="muted mt-16">No account required. Results are stored on this device.</p>
        <button class="btn btn-accent btn-lg mt-24" id="startBtn2">Start assessment</button>
      </div>
    </section>

    <footer class="footer"><div class="wrap row">
      <span>VISOR — Professional Visual Competency Assessment</span>
      <span>A competency benchmark, not a certified examination.</span>
    </div></footer>`;

  document.getElementById('startBtn').onclick = renderSetup;
  document.getElementById('startBtn2').onclick = renderSetup;
}

/* ---------------- SETUP ---------------- */
const EXPERIENCES = [
  { id: 'beginner', title: 'New to design', desc: 'Studying or under 1 year of practice — I want a baseline.' },
  { id: 'some', title: '1–3 years', desc: 'Junior-ish. I work with guidance on established systems.' },
  { id: 'experienced', title: '4–7 years', desc: 'Mid/Senior range. I solve problems independently.' },
  { id: 'senior', title: '8+ years / leadership', desc: 'Lead, Art Director or equivalent responsibility.' },
];

function renderSetup() {
  let choice = null;
  app.innerHTML = `
    ${topbar({ back: '← Home' })}
    <section class="section">
      <div class="wrap-narrow">
        <div class="eyebrow">Step 1 of 3 · Optional</div>
        <h1 style="font-size:clamp(30px,4.5vw,48px);letter-spacing:-.04em;margin-top:10px">What is your experience range?</h1>
        <p class="muted mt-16">This only sets your starting difficulty. The assessment adapts immediately from your answers — a mis-selected range will correct itself within a few items, and it is never used in scoring.</p>
        <div class="pick-list" id="picks">
          ${EXPERIENCES.map(e => `
            <button class="pick" data-id="${e.id}">
              <span><b>${e.title}</b><span>${e.desc}</span></span>
              <span class="tick"></span>
            </button>`).join('')}
        </div>
        <div class="row gap-10 mt-24" style="flex-wrap:wrap">
          <button class="btn btn-accent" id="go" disabled>Begin assessment</button>
          <button class="btn btn-ghost" id="skip">Skip — start at baseline</button>
        </div>
      </div>
    </section>`;

  document.getElementById('backBtn').onclick = renderLanding;
  const go = document.getElementById('go');
  document.getElementById('picks').addEventListener('click', (e) => {
    const b = e.target.closest('.pick');
    if (!b) return;
    choice = b.dataset.id;
    document.querySelectorAll('.pick').forEach(p => p.classList.toggle('sel', p === b));
    go.disabled = false;
  });
  go.onclick = () => startAssessment(choice);
  document.getElementById('skip').onclick = () => startAssessment(null);
}

/* ---------------- ANALYSIS ---------------- */
function renderAnalyzing(finished, onComplete) {
  const lines = [
    'aggregating skill evidence…',
    'estimating confidence per competency…',
    'checking contradiction signals…',
    'applying difficulty-banded level rubric…',
    'scoring career-track fit…',
    'computing Art Direction readiness…',
    'generating diagnosis & roadmap…',
  ];
  app.innerHTML = `
    <div class="analyzing wrap">
      <div>
        <div class="eyebrow">Step 3 of 3</div>
        <h2 class="mt-8">Analysing your assessment</h2>
        <p>${finished.stats.responses} items · ${Object.values(finished.state.skills).filter(s => s.evidence.length).length} skills covered</p>
        <div class="scanline"><i></i></div>
        <div class="scan-log" id="scanLog">${lines[0]}</div>
      </div>
    </div>`;
  let i = 0;
  const el = document.getElementById('scanLog');
  const t = setInterval(() => {
    i++;
    if (i < lines.length) { el.textContent = lines[i]; }
    else { clearInterval(t); onComplete(); }
  }, 430);
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

function renderPractical(session, onFinish) {
  const selected = new Set();
  /* shuffle so the correct three are not simply the first three */
  const shown = [...PRACTICAL_Q.options];
  for (let i = shown.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shown[i], shown[j]] = [shown[j], shown[i]];
  }
  app.innerHTML = `
    ${topbar({ back: '← Home' })}
    <section class="section">
      <div class="wrap-narrow">
        <div class="eyebrow">Optional · Practical challenge</div>
        <h1 style="font-size:clamp(26px,3.6vw,38px);letter-spacing:-.035em;margin-top:10px">Improve this poster’s hierarchy</h1>
        <p class="muted mt-16">A practical, applied item — the kind of work you would actually do. Skip it if you prefer; it does not change which questions you have already seen.</p>
        <div class="caseframe">
          <div class="caseframe-head"><span class="t">${PRACTICAL_Q.title}</span><span class="eyebrow">Select ${PRACTICAL_Q.correct.length}</span></div>
          ${renderVisual('case1')}
        </div>
        <div class="options" id="opts">
          ${shown.map((o, i) => `
            <button class="option" data-opt="${o.id}" type="button">
              <span class="option-key">${['a','b','c','d','e','f'][i]}</span>
              <span class="option-body"><span class="option-title">${o.title}</span><span class="option-desc">${o.desc}</span></span>
            </button>`).join('')}
        </div>
        <div class="qactions">
          <button class="btn btn-ghost" id="skipBtn">Skip challenge</button>
          <button class="btn btn-accent" id="submitBtn" disabled>Submit &amp; finish</button>
        </div>
        <div class="practical mt-24">
          <h3>Or submit your own work</h3>
          <p class="small muted mt-8">Upload a design you have made. It is previewed locally only, never sent anywhere, and is <strong>not scored</strong> — it is kept with your result so you can compare your self-assessment against the outcome.</p>
          <label class="uploadbox" for="fileUp" style="cursor:pointer">
            <input type="file" id="fileUp" accept="image/*" />
            <div id="upText">Click to choose an image (stored on this device only)</div>
          </label>
          <div id="preview" class="mt-16"></div>
        </div>
      </div>
    </section>`;

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
  document.getElementById('skipBtn').onclick = () => onFinish(null);
  document.getElementById('submitBtn').onclick = () => {
    session.submit(PRACTICAL_Q, [...selected], null);
    onFinish(PRACTICAL_Q);
  };
  document.getElementById('fileUp').onchange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    document.getElementById('upText').textContent = f.name;
    const url = URL.createObjectURL(f);
    document.getElementById('preview').innerHTML =
      `<img src="${url}" alt="Your upload" style="max-height:260px;border-radius:12px;border:1px solid var(--line)" />`;
    showToast('Image stored on this device only');
  };
}

/* ---------------- FLOW CONTROL ---------------- */
function startAssessment(experience) {
  mountAssessment(app, {
    experience,
    onFinish(session) {
      renderPractical(session, () => {
        const finished = session.finish();
        renderAnalyzing(finished, () => renderResults(finished));
      });
    },
  });
}

function renderResults(finished) {
  mountResults(app, { finished, onRestart: renderLanding });
}

renderLanding();
