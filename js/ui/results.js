/* ============================================================
   Results dashboard: level + track hero, skill radar, readiness
   ring, diagnosis prose, development roadmap, history.
   ============================================================ */
import { SKILLS } from '../data/skills.js';
import { classify } from '../engine/classify.js';
import { buildDiagnosis } from '../engine/diagnosis.js';

function radarSvg(skills) {
  const size = 340, cx = size / 2, cy = size / 2, r = 118;
  const n = skills.length;
  const pt = (i, val) => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    const rr = (val / 100) * r;
    return [cx + rr * Math.cos(a), cy + rr * Math.sin(a)];
  };
  const rings = [25, 50, 75, 100].map(v => {
    const pts = skills.map((_, i) => pt(i, v).join(',')).join(' ');
    return `<polygon points="${pts}" fill="none" stroke="#dedbd2" stroke-width="${v === 100 ? 1.5 : 1}"/>`;
  }).join('');
  const axes = skills.map((_, i) => {
    const [x, y] = pt(i, 100);
    return `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="#e7e3d9" stroke-width="1"/>`;
  }).join('');
  const dataPts = skills.map((s, i) => pt(i, s.score ?? 0));
  const poly = dataPts.map(p => p.join(',')).join(' ');
  const dots = dataPts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.5" fill="#ff4d24" stroke="#fff" stroke-width="1.5"/>`).join('');
  const labels = skills.map((s, i) => {
    const [x, y] = pt(i, 128);
    const anchor = Math.abs(x - cx) < 8 ? 'middle' : (x > cx ? 'start' : 'end');
    return `<text x="${x}" y="${y}" text-anchor="${anchor}" dominant-baseline="middle" font-family="IBM Plex Mono, monospace" font-size="9.5" fill="#55555f" letter-spacing="0.5">${s.short.toUpperCase()}</text>`;
  }).join('');
  return `<svg viewBox="0 0 ${size} ${size}" role="img" aria-label="Skill radar chart">
    ${rings}${axes}
    <polygon points="${poly}" fill="rgba(255,77,36,.18)" stroke="#ff4d24" stroke-width="2" stroke-linejoin="round"/>
    ${dots}${labels}
  </svg>`;
}

function ringSvg(value, label) {
  const r = 66, c = 2 * Math.PI * r, off = c * (1 - value / 100);
  return `<svg width="168" height="168" viewBox="0 0 168 168" aria-hidden="true">
    <circle cx="84" cy="84" r="${r}" fill="none" stroke="#ebe8e0" stroke-width="14"/>
    <circle cx="84" cy="84" r="${r}" fill="none" stroke="#ff4d24" stroke-width="14"
      stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${off}"/>
  </svg>`;
}

const barClass = (v) => (v >= 70 ? 'high' : v >= 50 ? 'mid' : 'low');

function skillBars(skills) {
  return skills.map(s => {
    const v = s.score;
    return `<div class="skillbar-row">
      <div class="skillbar-head"><b>${s.name}</b><span>${v === null ? '—' : Math.round(v)}${s.n ? ` · ${s.n} item${s.n > 1 ? 's' : ''}` : ''}</span></div>
      <div class="skillbar"><i class="${v === null ? '' : barClass(v)}" style="width:${v === null ? 0 : Math.round(v)}%"></i></div>
    </div>`;
  }).join('');
}

export function mountResults(app, { finished, onRestart }) {
  const { state, stats, confidences } = finished;
  const cls = classify(state);
  const diag = buildDiagnosis(cls);

  saveHistory(cls, diag);

  const level = cls.level;
  const track = cls.tracks.primary;
  const secondary = cls.tracks.secondary;
  const potential = cls.tracks.potential;

  const hero = `
    <section class="result-hero">
      <div class="wrap">
        <div class="eyebrow">Professional Visual Competency Assessment</div>
        <div class="result-level">${level.name}${level.borderline ? '<span style="font-size:.4em;vertical-align:middle;margin-left:14px;opacity:.7;font-weight:600">borderline ↑</span>' : ''}</div>
        <div class="result-track">Primary track — <b>${track?.name || 'Visual Designer'}</b>${secondary ? ` · Secondary fit — ${secondary.name}` : ''}${potential ? ` · ${potential.label} — ${potential.note}` : ''}</div>
        <div class="hero-stats">
          <div class="hero-stat readiness"><b>${cls.readiness.total}%</b><span>Art Direction Readiness</span></div>
          <div class="hero-stat"><b>${Math.round(cls.confidence * 100)}%</b><span>${diag.confidenceLabel} confidence</span></div>
          <div class="hero-stat"><b>${stats.responses}</b><span>Items evaluated</span></div>
          <div class="hero-stat"><b>${Object.values(state.skills).filter(s => s.evidence.length).length}/10</b><span>Skills covered</span></div>
        </div>
        ${level.borderline ? `<div class="badge-row"><span class="badge">Estimated: ${level.name.replace(' Designer', '')} / ${level.borderline.with.replace(' Designer', '')} Borderline</span></div>` : ''}
        ${level.capReason ? `<div class="badge-row"><span class="badge neg">${level.capReason}</span></div>` : ''}
      </div>
    </section>`;

  const tabs = `
    <div class="wrap">
      <div class="tabs" id="tabs">
        <button class="tab on" data-tab="profile">Skill profile</button>
        <button class="tab" data-tab="readiness">Art Direction readiness</button>
        <button class="tab" data-tab="diagnosis">Professional diagnosis</button>
        <button class="tab" data-tab="roadmap">Development roadmap</button>
        <button class="tab" data-tab="evidence">Assessment detail</button>
      </div>`;

  const profile = `
    <section class="tabpanel" data-panel="profile">
      <div class="mt-24 radar-wrap">
        <div class="radar-card">${radarSvg(cls.skills)}
          <div class="case-note">10-axis visual competency profile · 0–100</div>
        </div>
        <div class="stack gap-16">
          <div class="split">
            <div class="listcard">
              <h3>Strongest skills</h3>
              <ul>${diag.strongest.map(s => `<li><b>${s.name}</b><span class="val good">${s.score}</span></li>`).join('')}</ul>
            </div>
            <div class="listcard">
              <h3>Development areas</h3>
              <ul>${diag.development.map(s => `<li><b>${s.name}</b><span class="val bad">${s.score}</span></li>`).join('')}</ul>
            </div>
          </div>
          <div class="skillbars">${skillBars(cls.skills)}</div>
        </div>
      </div>
    </section>`;

  const readiness = `
    <section class="tabpanel" data-panel="readiness" hidden>
      <div class="mt-24 listcard">
        <h3>Art Direction Readiness — scored independently of level</h3>
        <div class="ring-wrap mt-16">
          <div class="ring">${ringSvg(cls.readiness.total)}<div class="val"><div><b>${cls.readiness.total}%</b><span>Readiness</span></div></div></div>
          <div class="readiness-parts">
            ${cls.readiness.parts.map(p => `
              <div class="rd-part">
                <span>${p.name}</span>
                <div class="skillbar"><i class="${p.value === null ? '' : barClass(p.value)}" style="width:${p.value || 0}%"></i></div>
                <span class="v">${p.value ?? '—'}</span>
              </div>`).join('')}
          </div>
        </div>
        <p class="small muted mt-16" style="max-width:74ch">Readiness can lead or trail your designer level. A Junior Designer may show high Art Direction potential; a Senior Designer may show low readiness. The two are deliberately never merged.</p>
        ${potential ? `<div class="badge-row"><span class="badge pos">${potential.label} — ${potential.note}</span></div>` : ''}
      </div>
      ${cls.contradictions.length ? `
      <div class="listcard mt-16">
        <h3>Contradiction signals</h3>
        <ul>${cls.contradictions.map(c => `<li style="display:block"><b>${c.message}</b><span class="small muted" style="display:block;margin-top:4px">Contradictions lower confidence and cap classification where evidence conflicts.</span></li>`).join('')}</ul>
      </div>` : ''}
    </section>`;

  const diagnosis = `
    <section class="tabpanel" data-panel="diagnosis" hidden>
      <div class="mt-24 diagnosis">
        <div class="eyebrow">Why you received this level</div>
        <div class="mt-16">${diag.paragraphs.map(p => `<p>${p}</p>`).join('')}</div>
        <div class="next"><b>Next step</b>${diag.nextStep}</div>
      </div>
      <div class="listcard mt-16">
        <h3>Level rubric applied</h3>
        <p class="small muted mt-8">${diag.explanation}</p>
        <div class="badge-row">
          <span class="badge">Confidence: ${Math.round(cls.confidence * 100)}% (${diag.confidenceLabel})</span>
          <span class="badge">${stats.responses} items across ${Object.values(state.skills).filter(s => s.evidence.length).length} skills</span>
          ${cls.reasoning ? `<span class="badge">Reasoning quality: ${Math.round(cls.reasoning.overall * 100)}%</span>` : ''}
        </div>
      </div>
      <div class="listcard mt-16">
        <h3>Disclaimer</h3>
        <p class="small muted mt-8">This is a professional competency assessment based on demonstrated visual judgement, not a certified examination, psychological test or IQ measure. Levels are estimates with stated confidence; treat them as a directional benchmark for development.</p>
      </div>
    </section>`;

  const roadmap = `
    <section class="tabpanel" data-panel="roadmap" hidden>
      <div class="stack gap-16 mt-24">
        ${diag.roadmap.map(item => `
          <article class="road-item">
            <div class="rn">0${item.rank}</div>
            <div>
              <h3>${item.skill}</h3>
              <div class="road-meta">
                <span class="cur">Current ${item.current}</span>
                <span class="tgt">Target ${item.target}</span>
              </div>
              <p>${item.why}</p>
              <div class="practice">
                <div><b>Practice</b><span>${item.practice}</span></div>
                <div><b>Challenge</b><span>${item.challenge}</span></div>
              </div>
            </div>
          </article>`).join('')}
      </div>
    </section>`;

  const evidence = `
    <section class="tabpanel" data-panel="evidence" hidden>
      <div class="mt-24 split">
        <div class="listcard">
          <h3>Difficulty band mastery</h3>
          <ul>${Object.entries(cls.bands).map(([k, b]) => `
            <li><b>${b.label} <span class="muted" style="font-weight:400">${k}</span></b>
            <span class="val ${b.mastery === null ? '' : b.mastery >= 70 ? 'good' : b.mastery >= 50 ? 'warn' : 'bad'}">${b.mastery === null ? 'no evidence' : Math.round(b.mastery) + ' · n=' + b.n}</span></li>`).join('')}
          </ul>
        </div>
        <div class="listcard">
          <h3>Confidence per skill</h3>
          <ul>${confidences.map(c => `<li><b>${SKILLS.find(s => s.id === c.id).short}</b><span class="val ${c.conf >= 0.6 ? 'good' : c.conf >= 0.4 ? 'warn' : 'bad'}">${Math.round(c.conf * 100)}% · ${c.n} item${c.n === 1 ? '' : 's'}</span></li>`).join('')}</ul>
        </div>
      </div>
      <div class="listcard mt-16">
        <h3>Response log</h3>
        <div class="history-row">
          ${state.responses.map(r => `<span class="history-chip" title="${r.skill} · difficulty ${r.difficulty}">d${r.difficulty} · ${Math.round(r.q * 100)}</span>`).join('')}
        </div>
        <p class="small muted mt-8">Each chip: difficulty and assessed quality (0–100) of the response, including reasoning where provided. Correct answers are not shown — review the case studies themselves to revisit them.</p>
      </div>
    </section>`;

  app.innerHTML = hero + tabs + profile + readiness + diagnosis + roadmap + evidence + `
      <div class="row gap-10 mt-40" style="flex-wrap:wrap">
        <button class="btn" id="restart">Restart assessment</button>
        <button class="btn btn-ghost" id="printBtn">Print / save as PDF</button>
        <a class="btn btn-ghost" href="admin.html">Admin panel</a>
      </div>
    </div>
    <footer class="footer"><div class="wrap row">
      <span>VISOR — Professional Visual Competency Assessment</span>
      <span>Results stored locally · ${new Date().toLocaleString()}</span>
    </div></footer>`;

  // tab switching
  const tabWrap = document.getElementById('tabs');
  tabWrap.addEventListener('click', (e) => {
    const btn = e.target.closest('.tab');
    if (!btn) return;
    tabWrap.querySelectorAll('.tab').forEach(t => t.classList.toggle('on', t === btn));
    document.querySelectorAll('.tabpanel').forEach(p => { p.hidden = p.dataset.panel !== btn.dataset.tab; });
  });

  document.getElementById('restart').addEventListener('click', onRestart);
  document.getElementById('printBtn').addEventListener('click', () => window.print());

  return { classification: cls, diagnosis: diag };
}

function saveHistory(cls, diag) {
  try {
    const key = 'visor.history';
    const prev = JSON.parse(localStorage.getItem(key) || '[]');
    prev.push({
      at: new Date().toISOString(),
      level: cls.level.name,
      track: cls.tracks.primary?.name,
      readiness: cls.readiness.total,
      confidence: cls.confidence,
      scores: Object.fromEntries(cls.skills.map(s => [s.id, s.score === null ? null : Math.round(s.score)])),
    });
    localStorage.setItem(key, JSON.stringify(prev.slice(-20)));
  } catch { /* storage unavailable */ }
}
