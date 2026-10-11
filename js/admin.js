/* ============================================================
   Question-bank admin panel.
   Browse, filter, edit, add, deactivate, import/export.
   Edits persist to localStorage and are read by the live
   assessment via bank.loadBank().
   Language-aware chrome (EN ⇄ AR) via the shared i18n layer.
   ============================================================ */
import {
  loadBank, getQuestions, setQuestions, resetBank, validate, BANK_STORE_KEY,
} from './data/bank.js';
import { SKILLS, STAGES } from './data/skills.js';
import { isAuthed, login, logout } from './data/auth.js';
import { renderVisual, renderOptionVisual, OPTION_VISUALS, VISUALS } from './ui/visuals.js';
import { initLang, toggleLang, onLang, t, L, Ls2 } from './i18n/index.js';

const root = document.getElementById('admin');
const toastEl = document.getElementById('toast');
const toast = (m) => {
  toastEl.textContent = m;
  toastEl.classList.add('on');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toastEl.classList.remove('on'), 2200);
};

const VISUAL_KEYS = Object.keys(VISUALS);
const OPT_VISUALS = Object.keys(OPTION_VISUALS);

let questions = [];
let errors = [];
let filters = { text: '', skill: '', difficulty: '', type: '', status: '' };
let selectedId = null;
let draft = null;          // deep clone being edited
let dirty = false;

function clone(o) { return JSON.parse(JSON.stringify(o)); }
function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function skillName(id, field = 'name') { return L(SKILLS.find(s => s.id === id), field, 'skills'); }

function reload() {
  questions = loadBank();
  errors = validate();
}

/* ---------------- auth gate ---------------- */
function renderLogin() {
  root.innerHTML = `
    <div class="login-wrap">
      <form class="login-card" id="loginForm" autocomplete="off">
        <div class="brand"><span class="brand-mark"></span>
          <span>VISOR<small>${t('adm.sub')}</small></span></div>
        <h1 class="login-h">${t('adm.login.h')}</h1>
        <p class="small muted">${t('adm.login.p')}</p>
        <label class="login-field">${t('adm.login.user')}
          <input id="lgUser" autocomplete="username" placeholder="${t('adm.login.userPh')}" />
        </label>
        <label class="login-field">${t('adm.login.pass')}
          <input id="lgPass" type="password" autocomplete="current-password" placeholder="${t('adm.login.passPh')}" />
        </label>
        <div class="login-err" id="lgErr"></div>
        <div class="row gap-10" style="justify-content:space-between;align-items:center">
          <button class="btn btn-accent" type="submit">${t('adm.login.submit')}</button>
          <a class="btn btn-ghost btn-sm" href="index.html">${t('adm.back')}</a>
        </div>
      </form>
    </div>`;
  const form = document.getElementById('loginForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const u = document.getElementById('lgUser').value.trim();
    const p = document.getElementById('lgPass').value;
    if (login(u, p)) { enter(); return; }
    const err = document.getElementById('lgErr');
    err.textContent = t('adm.login.err');
    document.getElementById('lgPass').value = '';
    document.getElementById('lgPass').focus();
  });
  const user = document.getElementById('lgUser');
  if (user) user.focus();
}

/* ---------------- shell ---------------- */
function renderShell() {
  root.innerHTML = `
    <header class="topbar">
      <div class="wrap topbar-inner">
        <div class="brand"><span class="brand-mark"></span>
          <span>VISOR<small>${t('adm.sub')}</small></span></div>
        <div class="topbar-actions">
          <span class="save-state" id="saveState">${dirty ? t('adm.unsaved') : t('adm.saved')}</span>
          <button class="btn btn-lang btn-sm" id="langBtn" title="${t('nav.switchTitle')}">${t('nav.switch')}</button>
          <button class="btn btn-ghost btn-sm" id="logoutBtn">${t('adm.logout')}</button>
          <a class="btn btn-ghost btn-sm" href="index.html">${t('adm.back')}</a>
        </div>
      </div>
    </header>
    <div class="wrap admin-body" id="adminBody"></div>`;
  const lb = document.getElementById('langBtn');
  if (lb) lb.onclick = () => toggleLang();
  const out = document.getElementById('logoutBtn');
  if (out) out.onclick = () => { logout(); enter(); };
}

function setDirty(v) {
  dirty = v;
  const el = document.getElementById('saveState');
  if (el) el.textContent = v ? t('adm.unsaved') : t('adm.saved');
}

/* ---------------- stats + filters ---------------- */
function statsHtml() {
  const active = questions.filter(q => q.active !== false).length;
  const withReasoning = questions.filter(q => q.reasoning).length;
  const withVisual = questions.filter(q => q.visual).length;
  const byDifficulty = [1, 2, 3, 4, 5, 6, 7].map(d => ({
    d, n: questions.filter(q => q.difficulty === d).length,
  }));
  const bySkill = SKILLS.map(s => ({ s, n: questions.filter(q => q.skill === s.id).length }));

  return `
    <div class="admin-stats">
      <div><b>${questions.length}</b><span>${t('adm.stat.total')}</span></div>
      <div><b>${active}</b><span>${t('adm.stat.active')}</span></div>
      <div><b>${questions.length - active}</b><span>${t('adm.stat.deact')}</span></div>
      <div><b>${withVisual}</b><span>${t('adm.stat.visual')}</span></div>
      <div><b>${withReasoning}</b><span>${t('adm.stat.reason')}</span></div>
      <div class="${errors.length ? 'bad' : ''}"><b>${errors.length}</b><span>${t('adm.stat.issues')}</span></div>
    </div>
    ${errors.length ? `<div class="admin-errors"><b>${t('adm.valid.head')}</b><ul>${errors.map(e => `<li>${esc(e)}</li>`).join('')}</ul></div>` : ''}
    <div class="admin-coverage">
      <div><span>${t('adm.cov.skill')}</span><div class="cov">${bySkill.map(({ s, n }) =>
        `<i style="flex:${Math.max(n, .4)}" title="${esc(L(s, 'name', 'skills'))}: ${n}"><u>${n}</u></i>`).join('')}</div></div>
      <div><span>${t('adm.cov.diff')}</span><div class="cov">${byDifficulty.map(({ d, n }) =>
        `<i style="flex:${Math.max(n, .4)}" title="${t('adm.diff', { d })}: ${n}"><u>${n}</u></i>`).join('')}</div></div>
    </div>`;
}

function filtered() {
  const txt = filters.text.trim().toLowerCase();
  return questions.filter(q => {
    if (filters.skill && q.skill !== filters.skill) return false;
    if (filters.difficulty && String(q.difficulty) !== filters.difficulty) return false;
    if (filters.type && (q.type || 'choice') !== filters.type) return false;
    if (filters.status === 'active' && q.active === false) return false;
    if (filters.status === 'inactive' && q.active !== false) return false;
    if (txt && !(`${q.id} ${q.prompt} ${q.title || ''}`.toLowerCase().includes(txt))) return false;
    return true;
  });
}

function filtersHtml() {
  return `
    <div class="admin-filters">
      <input id="fText" placeholder="${t('adm.f.search')}" value="${esc(filters.text)}" />
      <select id="fSkill"><option value="">${t('adm.all.skills')}</option>
        ${SKILLS.map(s => `<option value="${s.id}" ${filters.skill === s.id ? 'selected' : ''}>${esc(L(s, 'name', 'skills'))}</option>`).join('')}
      </select>
      <select id="fDiff"><option value="">${t('adm.all.diff')}</option>
        ${[1, 2, 3, 4, 5, 6, 7].map(d => `<option value="${d}" ${filters.difficulty === String(d) ? 'selected' : ''}>${t('adm.diff', { d })}</option>`).join('')}
      </select>
      <select id="fType"><option value="">${t('adm.all.types')}</option>
        <option value="choice" ${filters.type === 'choice' ? 'selected' : ''}>${t('adm.type.single')}</option>
        <option value="multi" ${filters.type === 'multi' ? 'selected' : ''}>${t('adm.type.multi')}</option>
      </select>
      <select id="fStatus"><option value="">${t('adm.any.status')}</option>
        <option value="active" ${filters.status === 'active' ? 'selected' : ''}>${t('adm.status.active')}</option>
        <option value="inactive" ${filters.status === 'inactive' ? 'selected' : ''}>${t('adm.status.inactive')}</option>
      </select>
      <span class="spacer"></span>
      <button class="btn btn-sm" id="addBtn">${t('adm.add')}</button>
      <button class="btn btn-sm" id="exportBtn">${t('adm.export')}</button>
      <button class="btn btn-sm" id="importBtn">${t('adm.import')}</button>
      <button class="btn btn-sm btn-ghost" id="resetBtn">${t('adm.reset')}</button>
      <input type="file" id="importFile" accept="application/json" hidden />
    </div>`;
}

function listHtml() {
  const list = filtered();
  if (!list.length) return `<div class="admin-empty">${t('adm.empty')}</div>`;
  return `<div class="admin-list">${list.map(q => {
    const on = q.active !== false;
    return `
    <button class="admin-row ${selectedId === q.id ? 'sel' : ''}" data-id="${esc(q.id)}">
      <span class="rid">${esc(q.id)}</span>
      <span class="rskill" data-skill="${q.skill}">${esc(skillName(q.skill, 'short'))}</span>
      <span class="rdiff">d${q.difficulty}</span>
      <span class="rtype ${q.type === 'multi' ? 'multi' : 'single'}">${q.type === 'multi' ? t('adm.tag.multi') : t('adm.tag.single')}</span>
      ${q.visual ? `<span class="flag">${t('adm.flag.visual')}</span>` : ''}
      ${q.reasoning ? `<span class="flag">${t('adm.flag.text')}</span>` : ''}
      <span class="rstatus ${on ? 'on' : 'off'}">${on ? '●' : '○'}</span>
      <span class="rprompt">${esc(q.prompt)}</span>
    </button>`;
  }).join('')}</div>`;
}

/* ---------------- editor ---------------- */
function editorHtml() {
  if (!draft) {
    return `<aside class="admin-editor"><div class="editor-blank">
      <b>${t('adm.editor.blankH')}</b>
      <p>${t('adm.editor.blankP')}</p>
    </div></aside>`;
  }
  const q = draft;
  const stages = STAGES || [];
  const stage = stages.find(s => q.difficulty >= s.min && q.difficulty <= s.max);

  return `
  <aside class="admin-editor">
    <div class="editor-head">
      <div><b>${esc(q.id)}</b><span>${stage ? esc(Ls2(stage.id, stage.label)) : ''}</span></div>
      <div class="row gap-8">
        <button class="btn btn-sm" id="dupBtn">${t('adm.dup')}</button>
        <button class="btn btn-sm btn-danger" id="delBtn">${t('adm.del')}</button>
      </div>
    </div>

    <div class="form-grid">
      <label>${t('adm.f.id')}<input data-f="id" value="${esc(q.id)}" /></label>
      <label>${t('adm.f.skill')}<select data-f="skill">
        ${SKILLS.map(s => `<option value="${s.id}" ${q.skill === s.id ? 'selected' : ''}>${esc(L(s, 'name', 'skills'))}</option>`).join('')}
      </select></label>
      <label>${t('adm.f.diff')}<input data-f="difficulty" type="number" min="1" max="7" value="${q.difficulty}" /></label>
      <label>${t('adm.f.type')}<select data-f="type">
        <option value="choice" ${q.type !== 'multi' ? 'selected' : ''}>${t('adm.type.single')}</option>
        <option value="multi" ${q.type === 'multi' ? 'selected' : ''}>${t('adm.type.multi')}</option>
      </select></label>
      <label>${t('adm.f.visual')}<select data-f="visual">
        <option value="">${t('adm.none')}</option>
        ${VISUAL_KEYS.map(k => `<option value="${k}" ${q.visual === k ? 'selected' : ''}>${k}</option>`).join('')}
      </select></label>
      <label>${t('adm.f.status')}<select data-f="active">
        <option value="true" ${q.active !== false ? 'selected' : ''}>${t('adm.f.active')}</option>
        <option value="false" ${q.active === false ? 'selected' : ''}>${t('adm.f.inactive')}</option>
      </select></label>
      <label class="span2">${t('adm.f.title')}<input data-f="title" value="${esc(q.title || '')}" placeholder="${t('adm.f.titlePh')}" /></label>
      <label class="span2">${t('adm.f.prompt')}<textarea data-f="prompt" rows="3">${esc(q.prompt)}</textarea></label>
      <label>${t('adm.f.briefLabel')}<input data-f="brief.label" value="${esc(q.brief?.label || '')}" placeholder="${t('adm.f.briefLabelPh')}" /></label>
      <label class="span2">${t('adm.f.briefText')}<textarea data-f="brief.text" rows="3">${esc(q.brief?.text || '')}</textarea></label>
    </div>

    <div class="editor-section">
      <div class="editor-section-head"><b>${t('adm.opt.head')}</b><span>${t('adm.opt.note')}</span></div>
      <div id="optList">
        ${q.options.map((o, i) => `
          <div class="opt-edit" data-i="${i}">
            <div class="opt-edit-top">
              <span class="option-key">${String.fromCharCode(65 + i)}</span>
              <input data-of="title" value="${esc(o.title)}" placeholder="${t('adm.opt.titlePh')}" />
              <label class="mini">${t('adm.opt.weight')}<input data-of="q" type="number" min="0" max="1" step="0.05" value="${o.q}" /></label>
              <label class="mini check"><input data-of="correct" type="${q.type === 'multi' ? 'checkbox' : 'radio'}" name="correctOpt" ${q.correct.includes(o.id) ? 'checked' : ''} /> ${t('adm.opt.correct')}</label>
              <button class="icon-btn" data-act="up" title="${t('adm.opt.up')}">↑</button>
              <button class="icon-btn" data-act="down" title="${t('adm.opt.down')}">↓</button>
              <button class="icon-btn" data-act="del" title="${t('adm.opt.del')}">×</button>
            </div>
            <input data-of="desc" value="${esc(o.desc || '')}" placeholder="${t('adm.opt.descPh')}" />
            <div class="opt-edit-bottom">
              <label class="mini">${t('adm.opt.mini')}<select data-of="v">
                <option value="">${t('adm.none')}</option>
                ${OPT_VISUALS.map(k => `<option value="${k}" ${o.v === k ? 'selected' : ''}>${k}</option>`).join('')}
              </select></label>
              ${o.v ? `<span class="mini-preview">${renderOptionVisual(o.v)}</span>` : ''}
              <span class="oid">${t('adm.opt.id')} ${esc(o.id)}</span>
            </div>
          </div>`).join('')}
      </div>
      <button class="btn btn-sm mt-8" id="addOpt">${t('adm.opt.add')}</button>
    </div>

    <div class="editor-section">
      <div class="editor-section-head"><b>${t('adm.reason.head')}</b><span>${t('adm.reason.note')}</span></div>
      <label class="checkline"><input type="checkbox" id="reasonOn" ${q.reasoning ? 'checked' : ''} /> ${t('adm.reason.on')}</label>
      ${q.reasoning ? `
        <label class="mt-8">${t('adm.reason.max')}<input type="number" data-r="max" min="1" max="30" value="${q.reasoning.max || 10}" /></label>
        <label class="mt-8">${t('adm.reason.req')}
          <textarea data-r="required" rows="4" placeholder="${t('adm.reason.reqPh')}">${esc((q.reasoning.required || []).map(g => g.join(', ')).join('\n'))}</textarea>
        </label>
        <div class="hint">${t('adm.reason.reqHint')}</div>
        <label class="mt-8">${t('adm.reason.anti')}
          <textarea data-r="anti" rows="3" placeholder="${t('adm.reason.antiPh')}">${esc((q.reasoning.anti || []).map(g => g.join(', ')).join('\n'))}</textarea>
        </label>` : `<div class="hint mt-8">${t('adm.reason.off')}</div>`}
    </div>

    <div class="editor-section">
      <div class="editor-section-head"><b>${t('adm.purpose.head')}</b><span>${t('adm.purpose.note')}</span></div>
      <textarea data-f="purpose" rows="2">${esc(q.purpose || '')}</textarea>
    </div>

    ${q.visual ? `
    <div class="editor-section">
      <div class="editor-section-head"><b>${t('adm.preview.head')}</b></div>
      <div class="caseframe" style="margin-top:0">${renderVisual(q.visual)}</div>
    </div>` : ''}

    <div class="editor-actions">
      <button class="btn btn-accent" id="saveBtn">${t('adm.save')}</button>
      <button class="btn btn-ghost" id="cancelBtn">${t('adm.discard')}</button>
      <span class="hint" id="saveMsg"></span>
    </div>
  </aside>`;
}

/* ---------------- layout ---------------- */
function render() {
  document.getElementById('adminBody').innerHTML = `
    ${statsHtml()}
    ${filtersHtml()}
    <div class="admin-split">
      ${listHtml()}
      ${editorHtml()}
    </div>`;
  bind();
}

function bind() {
  const $ = (id) => document.getElementById(id);

  const on = (id, ev, fn) => { const el = $(id); if (el) el.addEventListener(ev, fn); };
  on('fText', 'input', e => { filters.text = e.target.value; renderListOnly(); });
  on('fSkill', 'change', e => { filters.skill = e.target.value; renderListOnly(); });
  on('fDiff', 'change', e => { filters.difficulty = e.target.value; renderListOnly(); });
  on('fType', 'change', e => { filters.type = e.target.value; renderListOnly(); });
  on('fStatus', 'change', e => { filters.status = e.target.value; renderListOnly(); });

  on('addBtn', 'click', addQuestion);
  on('exportBtn', 'click', exportJson);
  on('importBtn', 'click', () => $('importFile').click());
  on('importFile', 'change', importJson);
  on('resetBtn', 'click', () => {
    if (!confirm(t('adm.confirmReset'))) return;
    questions = resetBank();
    setDirty(false);
    draft = null; selectedId = null;
    render();
    toast(t('adm.resetDone'));
  });

  document.querySelectorAll('.admin-row').forEach(row => {
    row.addEventListener('click', () => select(row.dataset.id));
  });

  if (!draft) return;

  document.querySelectorAll('[data-f]').forEach(el => {
    el.addEventListener('input', () => setField(el.dataset.f, el.value));
    el.addEventListener('change', () => setField(el.dataset.f, el.value));
  });

  document.querySelectorAll('.opt-edit').forEach(box => {
    const i = +box.dataset.i;
    box.querySelectorAll('[data-of]').forEach(el => {
      const ev = el.type === 'checkbox' || el.tagName === 'SELECT' ? 'change' : 'input';
      el.addEventListener(ev, () => setOption(i, el.dataset.of, el.value, el));
    });
    box.querySelectorAll('[data-act]').forEach(btn => {
      btn.addEventListener('click', () => optionAction(i, btn.dataset.act));
    });
  });

  on('addOpt', 'click', () => {
    const id = `o${draft.options.length + 1}`;
    draft.options.push({ id, title: 'New option', desc: '', q: 0 });
    if (draft.type !== 'multi') draft.correct = [id];
    else draft.correct.push(id);
    setDirty(true);
    render();
  });

  on('reasonOn', 'change', e => {
    draft.reasoning = e.target.checked
      ? { max: 10, required: [['hierarchy']], anti: [] }
      : undefined;
    setDirty(true);
    render();
  });

  document.querySelectorAll('[data-r]').forEach(el => {
    el.addEventListener('change', () => setReasoning(el.dataset.r, el.value));
  });

  on('dupBtn', 'click', duplicate);
  on('delBtn', 'click', remove);
  on('saveBtn', 'click', save);
  on('cancelBtn', 'click', () => {
    const src = questions.find(q => q.id === selectedId);
    draft = src ? clone(src) : null;
    setDirty(false);
    render();
  });
}

function renderListOnly() {
  const split = document.querySelector('.admin-split');
  if (!split) return render();
  split.firstElementChild.outerHTML = listHtml();
  document.querySelectorAll('.admin-row').forEach(row => {
    row.addEventListener('click', () => select(row.dataset.id));
  });
}

/* ---------------- editing ---------------- */
function select(id) {
  if (dirty && !confirm(t('adm.confirmDiscard'))) return;
  const q = questions.find(x => x.id === id);
  if (!q) return;
  selectedId = id;
  draft = clone(q);
  setDirty(false);
  render();
  const ed = document.querySelector('.admin-editor');
  if (ed) ed.scrollTop = 0;
}

function setField(path, value) {
  if (!draft) return;
  if (path === 'difficulty') value = Math.max(1, Math.min(7, +value || 1));
  if (path === 'id') value = value.trim();
  if (path.startsWith('brief.')) {
    draft.brief = draft.brief || { label: '', text: '' };
    draft.brief[path.split('.')[1]] = value;
  } else if (path === 'active') {
    draft.active = value === 'true';
  } else {
    draft[path] = value;
  }
  setDirty(true);
}

function setOption(i, field, value, el) {
  const o = draft.options[i];
  if (field === 'q') value = Math.max(0, Math.min(1, parseFloat(value) || 0));
  if (field === 'correct') {
    if (draft.type === 'multi') {
      if (el.checked) { if (!draft.correct.includes(o.id)) draft.correct.push(o.id); }
      else draft.correct = draft.correct.filter(c => c !== o.id);
    } else {
      draft.correct = [o.id];
    }
    setDirty(true);
    render();
    return;
  }
  o[field] = value === '' && field === 'v' ? undefined : value;
  setDirty(true);
}

function optionAction(i, act) {
  const opts = draft.options;
  if (act === 'del') {
    if (opts.length <= 2) return toast(t('adm.needTwo'));
    const [removed] = opts.splice(i, 1);
    draft.correct = draft.correct.filter(c => c !== removed.id);
    if (!draft.correct.length) draft.correct = [opts[0].id];
  } else if (act === 'up' && i > 0) {
    [opts[i - 1], opts[i]] = [opts[i], opts[i - 1]];
  } else if (act === 'down' && i < opts.length - 1) {
    [opts[i + 1], opts[i]] = [opts[i], opts[i + 1]];
  }
  setDirty(true);
  render();
}

function setReasoning(field, value) {
  draft.reasoning = draft.reasoning || { max: 10, required: [], anti: [] };
  if (field === 'max') draft.reasoning.max = +value || 10;
  else {
    const groups = value.split('\n').map(l => l.trim()).filter(Boolean)
      .map(l => l.split(',').map(s => s.trim()).filter(Boolean)).filter(g => g.length);
    draft.reasoning[field] = groups.length ? groups : undefined;
    if (!draft.reasoning.required?.length && !draft.reasoning.anti?.length) delete draft.reasoning[field];
    if (!draft.reasoning.required && !draft.reasoning.anti) draft.reasoning = undefined;
  }
  setDirty(true);
}

function validateDraft() {
  const q = draft;
  const problems = [];
  if (!/^[a-z0-9-]+$/i.test(q.id || '')) problems.push(t('adm.v.id'));
  if (questions.some(x => x.id === q.id && x !== questions.find(y => y.id === selectedId)))
    problems.push(t('adm.v.dupId'));
  if (!q.prompt?.trim()) problems.push(t('adm.v.prompt'));
  if (q.options.length < 2) problems.push(t('adm.v.two'));
  if (!q.correct.length) problems.push(t('adm.v.correct'));
  if (q.type !== 'multi' && q.correct.length !== 1) problems.push(t('adm.v.single'));
  for (const o of q.options) {
    if (!(o.q >= 0 && o.q <= 1)) problems.push(t('adm.v.weight', { title: o.title }));
    if (!o.title?.trim()) problems.push(t('adm.v.optTitle'));
  }
  return problems;
}

function save() {
  const problems = validateDraft();
  if (problems.length) {
    document.getElementById('saveMsg').textContent = problems[0];
    toast(problems[0]);
    return;
  }
  const idx = questions.findIndex(q => q.id === selectedId);
  const newId = draft.id !== selectedId;
  if (idx >= 0) questions[idx] = clone(draft);
  selectedId = draft.id;
  setQuestions(clone(questions));
  setDirty(false);
  if (newId) selectedId = draft.id;
  render();
  toast(t('adm.savedToast'));
}

function addQuestion() {
  if (dirty && !confirm(t('adm.confirmDiscard2'))) return;
  let n = questions.length + 1;
  let id = `new-${n}`;
  while (questions.some(q => q.id === id)) { n++; id = `new-${n}`; }
  const q = {
    id,
    skill: 'fundamentals',
    difficulty: 3,
    type: 'choice',
    prompt: 'New question prompt',
    options: [
      { id: 'a', title: 'Option A', desc: '', q: 1 },
      { id: 'b', title: 'Option B', desc: '', q: 0 },
      { id: 'c', title: 'Option C', desc: '', q: 0 },
    ],
    correct: ['a'],
    purpose: '',
    active: false,
  };
  questions.push(q);
  setQuestions(clone(questions));
  filters = { text: '', skill: '', difficulty: '', type: '', status: '' };
  selectedId = id;
  draft = clone(q);
  render();
  toast(t('adm.draftCreated'));
}

function duplicate() {
  if (!draft) return;
  let n = 1;
  let id = `${draft.id}-copy`;
  while (questions.some(q => q.id === id)) { n++; id = `${draft.id}-copy${n}`; }
  const copy = clone(draft);
  copy.id = id;
  copy.active = false;
  questions.push(copy);
  setQuestions(clone(questions));
  selectedId = id;
  draft = clone(copy);
  render();
  toast(t('adm.dupDone'));
}

function remove() {
  if (!draft || !confirm(t('adm.confirmDelete', { id: draft.id }))) return;
  questions = questions.filter(q => q.id !== selectedId);
  setQuestions(clone(questions));
  draft = null; selectedId = null;
  setDirty(false);
  render();
  toast(t('adm.deleted'));
}

/* ---------------- import / export ---------------- */
function exportJson() {
  const blob = new Blob([JSON.stringify(questions, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'visor-question-bank.json';
  a.click();
  URL.revokeObjectURL(a.href);
  toast(t('adm.exported'));
}

function importJson(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!Array.isArray(data) || !data.length) throw new Error('Expected a non-empty array');
      questions = data;
      setQuestions(clone(questions));
      draft = null; selectedId = null;
      render();
      toast(t('adm.imported', { n: data.length }));
    } catch (err) {
      toast(t('adm.importFail', { msg: err.message }));
    }
  };
  reader.readAsText(file);
  e.target.value = '';
}

/* ---------------- boot ---------------- */
function enter() {
  if (!isAuthed()) { renderLogin(); return; }
  renderShell();
  render();
}

initLang();
document.title = t('adm.title');
onLang(() => { document.title = t('adm.title'); enter(); });
reload();
enter();
