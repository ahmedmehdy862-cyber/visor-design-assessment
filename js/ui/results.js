/* ============================================================
   Results dashboard: level + track hero, skill radar, readiness
   ring, diagnosis prose, development roadmap, history.
   Fully localized — re-renders in place on EN ⇄ AR switch
   while preserving the active tab.
   ============================================================ */
import { SKILLS, LEVELS } from '../data/skills.js';
import { classify } from '../engine/classify.js';
import { buildDiagnosis } from '../engine/diagnosis.js';
import { buildDiagnosisAr } from '../i18n/diagnosis.ar.js';
import { t, L, Lb, onLang, isAr } from '../i18n/index.js';
import { AR } from '../i18n/content.ar.js';

const READINESS_AR = AR.readiness;

function nameOf(entity, table) {
  if (!entity) return '';
  if (table && isAr()) {
    const o = AR[table][entity.id];
    if (o && o.name) return o.name;
  }
  return entity.name;
}

function skillName(s) { return L(s, 'name', 'skills'); }
function skillShort(s) { return L(s, 'short', 'skills'); }

function potentialText(p) {
  if (!p) return '';
  const label = p.label === 'Art Direction' ? (isAr() ? 'الإخراج الفني' : p.label) : p.label;
  const note = isAr()
    ? (p.note === 'High Potential' ? 'إمكانات عالية' : p.note === 'Developing Potential' ? 'إمكانات متنامية' : p.note)
    : p.note;
  return { label, note };
}

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
    return `<text x="${x}" y="${y}" text-anchor="${anchor}" dominant-baseline="middle" font-family="IBM Plex Mono, monospace" font-size="9.5" fill="#55555f" letter-spacing="0.5">${skillShort(s)}</text>`;
  }).join('');
  return `<svg viewBox="0 0 ${size} ${size}" role="img" aria-label="Skill radar chart">
    ${rings}${axes}
    <polygon points="${poly}" fill="rgba(255,77,36,.18)" stroke="#ff4d24" stroke-width="2" stroke-linejoin="round"/>
    ${dots}${labels}
  </svg>`;
}

function ringSvg(value) {
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
    const label = v === null ? '—' : Math.round(v);
    const n = s.n ? ` · ${s.n}` : '';
    return `<div class="skillbar-row">
      <div class="skillbar-head"><b>${skillName(s)}</b><span>${label}${n}</span></div>
      <div class="skillbar"><i class="${v === null ? '' : barClass(v)}" style="width:${v === null ? 0 : Math.round(v)}%"></i></div>
    </div>`;
  }).join('');
}

export function mountResults(app, { finished, onRestart }) {
  const { state, stats, confidences } = finished;
  const cls = classify(state);
  let activeTab = 'profile';
  let offLang = null;

  const diag = () => (isAr() ? buildDiagnosisAr(cls) : buildDiagnosis(cls));
  saveHistory(cls, diag());

  function render() {
    const d = diag();
    const level = cls.level;
    const track = cls.tracks.primary;
    const secondary = cls.tracks.secondary;
    const potential = potentialText(cls.tracks.potential);
    const coverCount = Object.values(state.skills).filter(s => s.evidence.length).length;
    const borderlineName = level.borderline
      ? (isAr() ? (AR.levels[(LEVELS.find(l => l.name === level.borderline.with) || {}).id] || level.borderline.with) : level.borderline.with)
      : null;
    const capText = level.capKey && isAr() ? (AR.caps[level.capKey] || level.capReason) : level.capReason;
    const confLabel = d.confidenceLabel;

    const hero = `
    <section class="result-hero">
      <div class="wrap">
        <div class="eyebrow">${t('res.eyebrow')}</div>
        <div class="result-level">${nameOf(level, 'levels')}${level.borderline ? `<span class="borderline-tag">${t('res.borderline')}</span>` : ''}</div>
        <div class="result-track">${t('res.trackPrimary', { n: `<b>${nameOf(track, 'tracks') || (isAr() ? 'مصمم بصري' : 'Visual Designer')}</b>` })}${secondary ? t('res.trackSecondary', { n: nameOf(secondary, 'tracks') }) : ''}${potential ? t('res.trackPotential', { l: potential.label, n: potential.note }) : ''}</div>
        <div class="hero-stats">
          <div class="hero-stat readiness"><b>${cls.readiness.total}%</b><span>${t('res.readiness')}</span></div>
          <div class="hero-stat"><b>${Math.round(cls.confidence * 100)}%</b><span>${t('res.confidence', { l: confLabel })}</span></div>
          <div class="hero-stat"><b>${stats.responses}</b><span>${t('res.items')}</span></div>
          <div class="hero-stat"><b>${coverCount}/10</b><span>${t('res.covered')}</span></div>
        </div>
        ${level.borderline ? `<div class="badge-row"><span class="badge">${t('res.eyebrow')} · ${level.name.replace(' Designer', '')} / ${borderlineName.replace(' Designer', '')} ${t('res.borderline')}</span></div>` : ''}
        ${capText ? `<div class="badge-row"><span class="badge neg">${capText}</span></div>` : ''}
      </div>
    </section>`;

    const tabs = `
    <div class="wrap">
      <div class="tabs" id="tabs">
        <button class="tab${activeTab === 'profile' ? ' on' : ''}" data-tab="profile">${t('tab.profile')}</button>
        <button class="tab${activeTab === 'readiness' ? ' on' : ''}" data-tab="readiness">${t('tab.readiness')}</button>
        <button class="tab${activeTab === 'diagnosis' ? ' on' : ''}" data-tab="diagnosis">${t('tab.diagnosis')}</button>
        <button class="tab${activeTab === 'roadmap' ? ' on' : ''}" data-tab="roadmap">${t('tab.roadmap')}</button>
        <button class="tab${activeTab === 'evidence' ? ' on' : ''}" data-tab="evidence">${t('tab.evidence')}</button>
      </div>`;

    const profile = `
    <section class="tabpanel" data-panel="profile"${activeTab === 'profile' ? '' : ' hidden'}>
      <div class="mt-24 radar-wrap">
        <div class="radar-card">${radarSvg(cls.skills)}
          <div class="case-note">${t('prof.radarNote')}</div>
        </div>
        <div class="stack gap-16">
          <div class="split">
            <div class="listcard">
              <h3>${t('prof.strong')}</h3>
              <ul>${d.strongest.map(s => `<li><b>${s.name}</b><span class="val good">${s.score}</span></li>`).join('')}</ul>
            </div>
            <div class="listcard">
              <h3>${t('prof.dev')}</h3>
              <ul>${d.development.map(s => `<li><b>${s.name}</b><span class="val bad">${s.score}</span></li>`).join('')}</ul>
            </div>
          </div>
          <div class="skillbars">${skillBars(cls.skills)}</div>
        </div>
      </div>
    </section>`;

    const readiness = `
    <section class="tabpanel" data-panel="readiness"${activeTab === 'readiness' ? '' : ' hidden'}>
      <div class="mt-24 listcard">
        <h3>${t('ready.h3')}</h3>
        <div class="ring-wrap mt-16">
          <div class="ring">${ringSvg(cls.readiness.total)}<div class="val"><div><b>${cls.readiness.total}%</b><span>${t('ready.total')}</span></div></div></div>
          <div class="readiness-parts">
            ${cls.readiness.parts.map(p => {
    const nm = isAr() && READINESS_AR[p.id] ? READINESS_AR[p.id] : p.name;
    return `
              <div class="rd-part">
                <span>${nm}</span>
                <div class="skillbar"><i class="${p.value === null ? '' : barClass(p.value)}" style="width:${p.value || 0}%"></i></div>
                <span class="v">${p.value ?? '—'}</span>
              </div>`;
  }).join('')}
          </div>
        </div>
        <p class="small muted mt-16" style="max-width:74ch">${t('ready.note')}</p>
        ${potential ? `<div class="badge-row"><span class="badge pos">${potential.label} — ${potential.note}</span></div>` : ''}
      </div>
      ${cls.contradictions.length ? `
      <div class="listcard mt-16">
        <h3>${t('ready.contradictions')}</h3>
        <ul>${cls.contradictions.map(c => {
    const msg = c.key && isAr() ? (AR.contradictions[c.key] || c.message) : c.message;
    return `<li style="display:block"><b>${msg}</b><span class="small muted" style="display:block;margin-top:4px">${t('ready.contradictionNote')}</span></li>`;
  }).join('')}</ul>
      </div>` : ''}
    </section>`;

    const diagnosis = `
    <section class="tabpanel" data-panel="diagnosis"${activeTab === 'diagnosis' ? '' : ' hidden'}>
      <div class="mt-24 diagnosis">
        <div class="eyebrow">${t('diag.why')}</div>
        <div class="mt-16">${d.paragraphs.map(p => `<p>${p}</p>`).join('')}</div>
        <div class="next"><b>${t('diag.next')}</b>${d.nextStep}</div>
      </div>
      <div class="listcard mt-16">
        <h3>${t('diag.rubricH')}</h3>
        <p class="small muted mt-8">${d.explanation}</p>
        <div class="badge-row">
          <span class="badge">${t('diag.confidence', { n: Math.round(cls.confidence * 100), l: confLabel })}</span>
          <span class="badge">${t('diag.coverage', { n: stats.responses, s: coverCount })}</span>
          ${cls.reasoning ? `<span class="badge">${t('diag.reasoning', { n: Math.round(cls.reasoning.overall * 100) })}</span>` : ''}
        </div>
      </div>
      <div class="listcard mt-16">
        <h3>${t('diag.disclaimerH')}</h3>
        <p class="small muted mt-8">${t('diag.disclaimer')}</p>
      </div>
    </section>`;

    const roadmap = `
    <section class="tabpanel" data-panel="roadmap"${activeTab === 'roadmap' ? '' : ' hidden'}>
      <div class="stack gap-16 mt-24">
        ${d.roadmap.map(item => `
          <article class="road-item">
            <div class="rn">0${item.rank}</div>
            <div>
              <h3>${item.skill}</h3>
              <div class="road-meta">
                <span class="cur">${t('road.cur', { v: item.current })}</span>
                <span class="tgt">${t('road.tgt', { v: item.target })}</span>
              </div>
              <p>${item.why}</p>
              <div class="practice">
                <div><b>${t('road.practice')}</b><span>${item.practice}</span></div>
                <div><b>${t('road.challenge')}</b><span>${item.challenge}</span></div>
              </div>
            </div>
          </article>`).join('')}
      </div>
    </section>`;

    const skillById = Object.fromEntries(SKILLS.map(s => [s.id, s]));
    const evidence = `
    <section class="tabpanel" data-panel="evidence"${activeTab === 'evidence' ? '' : ' hidden'}>
      <div class="mt-24 split">
        <div class="listcard">
          <h3>${t('ev.bands')}</h3>
          <ul>${Object.entries(cls.bands).map(([k, b]) => `
            <li><b>${Lb(k)} <span class="muted" style="font-weight:400">${k}</span></b>
            <span class="val ${b.mastery === null ? '' : b.mastery >= 70 ? 'good' : b.mastery >= 50 ? 'warn' : 'bad'}">${b.mastery === null ? t('ev.untested') : Math.round(b.mastery) + ' · n=' + b.n}</span></li>`).join('')}
          </ul>
        </div>
        <div class="listcard">
          <h3>${t('ev.conf')}</h3>
          <ul>${confidences.map(c => `<li><b>${skillShort(skillById[c.id])}</b><span class="val ${c.conf >= 0.6 ? 'good' : c.conf >= 0.4 ? 'warn' : 'bad'}">${Math.round(c.conf * 100)}% · ${c.n}${c.n === 1 ? '' : 's'}</span></li>`).join('')}</ul>
        </div>
      </div>
      <div class="listcard mt-16">
        <h3>${t('ev.log')}</h3>
        <div class="history-row">
          ${state.responses.map(r => `<span class="history-chip" title="${skillShort(skillById[r.skill])} · d${r.difficulty}">d${r.difficulty} · ${Math.round(r.q * 100)}</span>`).join('')}
        </div>
        <p class="small muted mt-8">${t('ev.logNote')}</p>
      </div>
    </section>`;

    app.innerHTML = hero + tabs + profile + readiness + diagnosis + roadmap + evidence + `
      <div class="row gap-10 mt-40" style="flex-wrap:wrap">
        <button class="btn" id="restart">${t('btn.restart')}</button>
        <button class="btn btn-ghost" id="printBtn">${t('btn.print')}</button>
        <a class="btn btn-ghost" href="admin.html">${t('nav.admin')}</a>
      </div>
    </div>
    <footer class="footer"><div class="wrap row">
      <span>${t('footer.1')}</span>
      <span>${t('footer.local', { d: new Date().toLocaleString() })}</span>
    </div></footer>`;

    const tabWrap = document.getElementById('tabs');
    tabWrap.addEventListener('click', (e) => {
      const btn = e.target.closest('.tab');
      if (!btn) return;
      activeTab = btn.dataset.tab;
      tabWrap.querySelectorAll('.tab').forEach(t => t.classList.toggle('on', t === btn));
      document.querySelectorAll('.tabpanel').forEach(p => { p.hidden = p.dataset.panel !== btn.dataset.tab; });
    });

    document.getElementById('restart').addEventListener('click', () => {
      if (offLang) offLang();
      onRestart();
    });
    document.getElementById('printBtn').addEventListener('click', () => window.print());
  }

  offLang = onLang(render);
  render();

  return { classification: cls };
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