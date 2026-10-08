/* ============================================================
   i18n runtime — language state, lookup helpers, RTL toggle.
   Engine keeps English + ids; this layer is display-only.
   ============================================================ */
import { UI } from './ui.js';
import { AR } from './content.ar.js';
import { QUESTIONS_AR } from './questions.ar.js';

/* question content: QL(question, 'title') */
const arQuestions = QUESTIONS_AR;

const STORE = 'visor.lang';
let current = 'en';
const listeners = new Set();

const STORE_OK = (() => { try { return typeof localStorage !== 'undefined'; } catch { return false; } })();

export function lang() { return current; }
export function isAr() { return current === 'ar'; }

export function initLang() {
  if (!STORE_OK) return current;
  try {
    const saved = localStorage.getItem(STORE);
    if (saved === 'ar' || saved === 'en') current = saved;
  } catch { /* ignore */ }
  applyDir();
  return current;
}

export function setLang(l) {
  if ((l !== 'en' && l !== 'ar') || l === current) return current;
  current = l;
  if (STORE_OK) { try { localStorage.setItem(STORE, l); } catch { /* ignore */ } }
  applyDir();
  listeners.forEach((fn) => { try { fn(l); } catch { /* ignore */ } });
  return current;
}

export function toggleLang() { return setLang(current === 'ar' ? 'en' : 'ar'); }

function applyDir() {
  if (typeof document === 'undefined' || !document.documentElement) return;
  document.documentElement.lang = current;
  document.documentElement.dir = current === 'ar' ? 'rtl' : 'ltr';
}

export function onLang(fn) { listeners.add(fn); return () => listeners.delete(fn); }

/* ---- UI chrome: t('q.counter', {n:1,max:36}) ---- */
export function t(key, args) {
  const table = UI[current] || UI.en;
  let s = table[key];
  if (s == null) s = UI.en[key];
  if (s == null) return key;
  return args ? fill(s, args) : s;
}

function fill(s, args) {
  return s.replace(/\{(\w+)\}/g, (m, k) => (args[k] != null ? String(args[k]) : m));
}

/* ---- domain entity fields: L(skills.fundamentals, 'name') ---- */
export function L(entity, field = 'name', table = guessTable(entity)) {
  if (entity == null) return '';
  if (typeof entity === 'string') {
    const dom = (AR[table] || {})[entity];
    if (isAr() && dom != null) {
      if (typeof dom === 'string') return dom;
      if (dom[field] != null) return dom[field];
    }
    return entity;
  }
  if (isAr()) {
    const dom = (AR[table] || {})[entity.id];
    if (dom != null) {
      if (typeof dom === 'string') return dom;
      if (dom[field] != null) return dom[field];
    }
    if (entity.ar && entity.ar[field] != null) return entity.ar[field];
  }
  const v = entity[field];
  return v == null ? '' : v;
}

function guessTable(entity) {
  if (!entity || typeof entity !== 'object') return '';
  if (entity.desc != null && entity.short != null) return 'skills';
  if (entity.blurb != null) return 'tracks';
  if (entity.label != null && /^[AB][1-5]$/.test(entity.id || '')) return 'bands';
  if (entity.eyebrow != null) return 'stages';
  return '';
}

/* explicit-table variants */
export function Ls(id, field) { const d = AR.skills[id]; return isAr() && d ? (d[field] ?? id) : id; }
export function Lb(key) { const d = AR.bands[key]; return isAr() && d ? d : key; }
export function Ls2(key, fallback) { const d = AR.stages[key]; return isAr() && d ? d : (fallback ?? key); }

/* diagnosis strings: DL('explanations', levelId) / DL('practice', skillId, 'why') */
export function DL(table, id, field) {
  const branch = AR[table] && AR[table][id];
  if (!branch) return '';
  if (field) return branch[field] ?? '';
  return branch;
}

/* classification fragments (keys live on classify output) */
export function capReason(key) { return isAr() && AR.caps[key] ? AR.caps[key] : key; }
export function contradictionText(key) { return isAr() && AR.contradictions[key] ? AR.contradictions[key] : key; }

/* question content: QL(question, 'title') */
export function QL(q, field) {
  if (!q) return '';
  if (isAr() && arQuestions) {
    const o = arQuestions[q.id];
    if (o) {
      if (field === 'options' || field == null) return o.options || null;
      if (o[field] != null) return o[field];
    }
  }
  return q[field];
}

export function QOpt(q, optId, field) {
  if (!q || !q.options) return '';
  const en = q.options.find((o) => o.id === optId);
  if (!en) return '';
  if (isAr() && arQuestions && arQuestions[q.id] && arQuestions[q.id].options) {
    const ar = arQuestions[q.id].options.find((o) => o.id === optId);
    if (ar && ar[field] != null) return ar[field];
  }
  return en[field];
}

export { AR, UI };
