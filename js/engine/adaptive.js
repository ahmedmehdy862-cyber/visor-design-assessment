/* ============================================================
   Adaptive session controller.

   - Routes the next question by evidence gaps (lowest-confidence
     skills first), at a difficulty tier driven by performance.
   - Guarantees all eight visual case studies appear as anchored
     case moments in rising difficulty order.
   - Stops once evidence is sufficient (confidence thresholds)
     or the ceiling is reached. Never reveals scoring logic.
   ============================================================ */
import { activeQuestions, getQuestion } from '../data/bank.js';
import { SKILLS, TRACKS, READINESS_PARTS, stageFor } from '../data/skills.js';
import { createState, recordResponse, skillConfidence, sessionStats } from './scoring.js';

export const MIN_QUESTIONS = 24;
export const MAX_QUESTIONS = 36;
export const EARLY_END_MIN = 15;
export const CONF_TARGET = 0.58;
export const CONF_MEAN_TARGET = 0.68;

/* Anchor schedule: visual cases in rising difficulty. */
export const ANCHORS = [
  { after: 3,  qid: 'fu-03' }, // Case 1 — overcrowded poster (d3)
  { after: 6,  qid: 'fu-05' }, // Case 4 — composition (d4)
  { after: 9,  qid: 'ty-04' }, // Case 2 — typography (d4)
  { after: 12, qid: 'co-03' }, // Case 3 — colour direction (d4)
  { after: 15, qid: 'br-03' }, // Case 5 — brand audit (d5)
  { after: 18, qid: 'ad-06' }, // Case 8 — visual review (d5)
  { after: 21, qid: 'ca-03' }, // Case 6 — campaign direction (d6)
  { after: 24, qid: 'ad-05' }, // Case 7 — art direction (d7)
];

const IMPORTANCE = (() => {
  const acc = {};
  for (const t of TRACKS) for (const [k, w] of Object.entries(t.weights)) acc[k] = (acc[k] || 0) + w / TRACKS.length;
  for (const p of READINESS_PARTS) for (const s of p.skills) acc[s] = (acc[s] || 0) + p.weight * 0.6;
  const max = Math.max(...Object.values(acc));
  for (const k of Object.keys(acc)) acc[k] /= max;
  return acc;
})();

export function createSession({ experience = null, startTier = 1 } = {}) {
  const state = createState({ experience, startTier });
  const used = new Set();

  function confidence(skillId) {
    const slot = state.skills[skillId];
    return slot ? skillConfidence(slot) : 0;
  }

  function anchorDue(index) {
    const a = ANCHORS.find(x => x.after === index);
    if (!a || used.has(a.qid)) return null;
    const q = getQuestion(a.qid);
    if (!q || q.active === false) return null;
    return q;
  }

  function pickAdaptive() {
    const anchorIds = new Set(ANCHORS.map(a => a.qid));
    const pool = activeQuestions().filter(q => !used.has(q.id) && !anchorIds.has(q.id));
    if (!pool.length) {
      /* anchors already consumed or deactivated — fall back to everything */
      const fallback = activeQuestions().filter(q => !used.has(q.id));
      if (!fallback.length) return null;
      return fallback.sort((a, b) => a.difficulty - b.difficulty)[0];
    }

    const open = SKILLS.filter(s => !state.skills[s.id] || state.skills[s.id].evidence.length === 0);
    let skillId;
    if (open.length) {
      /* breadth first: every skill gets evidence before deepening */
      skillId = open.sort((a, b) => (IMPORTANCE[b.id] || 0) - (IMPORTANCE[a.id] || 0))[0].id;
    } else {
      /* deepen the least-evidenced / least-confident skill first;
         importance only breaks ties so no skill is starved */
      skillId = SKILLS
        .map(s => {
          const c = confidence(s.id);
          const ev = state.skills[s.id]?.evidence.length || 0;
          return { id: s.id, need: (1 - c) * (ev < 3 ? 1.6 : 1) + (IMPORTANCE[s.id] || .5) * 0.05 };
        })
        .sort((a, b) => b.need - a.need)[0].id;
    }

    const tier = state.skills[skillId]?.tier ?? startTier;
    const forSkill = pool.filter(q => q.skill === skillId);
    const list = forSkill.length ? forSkill : pool;
    /* difficulty tier governs progression; anchors supply the hard moments */
    list.sort((a, b) => Math.abs(a.difficulty - tier) - Math.abs(b.difficulty - tier));
    return list[0];
  }

  function confidences() {
    return SKILLS.map(s => ({ id: s.id, conf: confidence(s.id), n: state.skills[s.id]?.evidence.length || 0 }));
  }

  function isComplete() {
    const n = state.responses.length;
    if (n >= MAX_QUESTIONS) return true;
    if (n < MIN_QUESTIONS) return false;
    const cs = confidences();
    const allCovered = cs.every(c => c.n > 0);
    const allMet = cs.every(c => c.conf >= CONF_TARGET);
    const mean = cs.reduce((s, c) => s + c.conf, 0) / cs.length;
    return allCovered && (allMet || mean >= CONF_MEAN_TARGET);
  }

  function next() {
    if (isComplete()) return null;
    const index = state.responses.length + 1;
    const anchor = anchorDue(index);
    const question = anchor || pickAdaptive();
    if (!question) return null;
    used.add(question.id);
    return {
      question,
      index,
      anchor: !!anchor,
      stage: stageFor(question.difficulty),
      // progress shown without revealing logic; anchors are the visible structure
      progress: Math.min(0.97, index / (MAX_QUESTIONS - 2)),
    };
  }

  function submit(question, selectedIds, reasoningText) {
    const result = recordResponse(state, question, selectedIds, reasoningText);
    return { result, done: isComplete() };
  }

  function finish() {
    return {
      state,
      stats: sessionStats(state),
      confidences: confidences(),
    };
  }

  function canEndEarly() {
    return state.responses.length >= EARLY_END_MIN;
  }

  return { next, submit, finish, canEndEarly, isComplete, state };
}
