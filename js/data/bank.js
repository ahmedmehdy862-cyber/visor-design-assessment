/* ============================================================
   Bank registry — merges question banks, validates schema,
   and exposes query helpers. Admin tools operate on this data
   (see admin.html). Adding a new bank = add file + register.
   ============================================================ */
import { CORE_QUESTIONS } from './bank-core.js';
import { CASE_QUESTIONS } from './bank-cases.js';
import { SKILL_MAP } from './skills.js';

export const BANK_SOURCES = [
  { id: 'core', label: 'Core question bank', questions: CORE_QUESTIONS },
  { id: 'cases', label: 'Visual case bank', questions: CASE_QUESTIONS },
];

let questions = [];

function clone(q) { return JSON.parse(JSON.stringify(q)); }

/* Admin panel persists an edited bank here; the live assessment reads it. */
export const BANK_STORE_KEY = 'visor.bank';

export function loadBank() {
  questions = BANK_SOURCES.flatMap(s => s.questions.map(clone));
  try {
    if (typeof localStorage !== 'undefined') {
      const saved = JSON.parse(localStorage.getItem(BANK_STORE_KEY) || 'null');
      if (Array.isArray(saved) && saved.length) questions = saved;
    }
  } catch { /* fall back to defaults */ }
  validate();
  return questions;
}

export function resetBank() {
  try { localStorage.removeItem(BANK_STORE_KEY); } catch { /* ignore */ }
  questions = BANK_SOURCES.flatMap(s => s.questions.map(clone));
  validate();
  return questions;
}

export function getQuestions() { return questions; }
export function getQuestion(id) { return questions.find(q => q.id === id); }

export function setQuestions(list, { persist = true } = {}) {
  questions = list;
  if (persist) {
    try { localStorage.setItem(BANK_STORE_KEY, JSON.stringify(questions)); } catch { /* ignore */ }
  }
  validate();
}

export function validate() {
  const errors = [];
  const seen = new Set();
  for (const q of questions) {
    if (seen.has(q.id)) errors.push(`Duplicate id: ${q.id}`);
    seen.add(q.id);
    if (!SKILL_MAP[q.skill]) errors.push(`${q.id}: unknown skill "${q.skill}"`);
    if (!(q.difficulty >= 1 && q.difficulty <= 7)) errors.push(`${q.id}: difficulty must be 1..7`);
    if (!Array.isArray(q.options) || q.options.length < 2) errors.push(`${q.id}: needs ≥2 options`);
    if (!Array.isArray(q.correct) || !q.correct.length) errors.push(`${q.id}: missing correct answer`);
    for (const c of q.correct || []) {
      if (!q.options?.some(o => o.id === c)) errors.push(`${q.id}: correct id "${c}" not in options`);
    }
    for (const o of q.options || []) {
      if (typeof o.q !== 'number' || o.q < 0 || o.q > 1) errors.push(`${q.id}/${o.id}: option q must be 0..1`);
    }
    if (q.type === 'multi' && q.correct.length < 2) errors.push(`${q.id}: multi-select needs ≥2 correct`);
    if (q.reasoning && !(q.reasoning.max > 0)) errors.push(`${q.id}: reasoning.max invalid`);
  }
  if (errors.length) console.warn('[bank] validation issues:\n' + errors.join('\n'));
  return errors;
}

export function activeQuestions() {
  return questions.filter(q => q.active !== false);
}

export function query({ skill, difficulty, ids, activeOnly = true } = {}) {
  let list = activeOnly ? activeQuestions() : questions;
  if (skill) list = list.filter(q => q.skill === skill);
  if (difficulty) list = list.filter(q => q.difficulty === difficulty);
  if (ids) list = list.filter(q => ids.includes(q.id));
  return list;
}

/* Progressively harder question after a strong answer; diagnostic
   repeat after a weak one. Pure helper used by the adaptive engine. */
export function nextTier(currentTier, quality, { up = .75, down = .45, min = 1, max = 7 } = {}) {
  if (quality >= up) return Math.min(max, currentTier + 1);
  if (quality < down) return Math.max(min, currentTier);
  return currentTier;
}
