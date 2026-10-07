/* ============================================================
   Scoring engine.

   Per response:
     x = difficulty − penalty·(1 − q)      latent evidence in difficulty units
     w = (0.7 + 0.15·difficulty) · caseBoost
   Per skill:
     â  = exponential soft-max of x evidence        (ability estimate)
     score = logistic(â)                          (0–100)
     confidence = evidence volume × stability      (0–1)
   Bands (B1..B5) hold mastery for level classification.
   ============================================================ */
import { BANDS } from '../data/skills.js';
import { evaluateReasoning, adjustQuality } from './reasoning.js';

/* difficulty-unit penalty grows with difficulty: failing a hard item must
   pull the ability estimate down, not merely being routed to it */
const PENALTY = (d) => 1.8 + 0.5 * (d - 1);
const K = 1.25;
const A0 = 3.2;
const CASE_BOOST = 1.25;

export const bandOf = (d) => BANDS.find(b => d >= b.min && d <= b.max)?.id || 'B1';

export function createState({ experience = null, startTier = 1 } = {}) {
  return {
    experience,
    startTier,
    skills: {},
    responses: [],
    startedAt: Date.now(),
  };
}

function skillSlot(state, id) {
  if (!state.skills[id]) state.skills[id] = { tier: state.startTier, evidence: [], weakStreak: 0 };
  return state.skills[id];
}

export function baseQuality(question, selectedIds) {
  if (question.type === 'multi') {
    const correct = new Set(question.correct);
    const sel = new Set(selectedIds);
    let tp = 0, fp = 0;
    for (const id of sel) correct.has(id) ? tp++ : fp++;
    const k = question.correct.length;
    return Math.max(0, Math.min(1, (tp - 0.9 * fp) / k));
  }
  const opt = question.options.find(o => o.id === selectedIds[0]);
  return opt ? opt.q : 0;
}

/**
 * Record one answered question. Returns the full evaluation
 * (quality, reasoning, band, tier movement) for UI feedback.
 */
export function recordResponse(state, question, selectedIds, reasoningText = null) {
  const raw = baseQuality(question, selectedIds);

  let reasoning = null;
  if (question.reasoning && (reasoningText || '').trim().length) {
    reasoning = evaluateReasoning(reasoningText, question.reasoning);
  } else if (question.reasoning) {
    reasoning = evaluateReasoning('', question.reasoning); // unanswered → 0
  }
  const q = adjustQuality(raw, reasoning);

  const d = question.difficulty;
  const x = d - PENALTY(d) * (1 - q);
  const w = (0.7 + 0.15 * d) * (question.visual ? CASE_BOOST : 1);

  const slot = skillSlot(state, question.skill);
  slot.evidence.push({
    qid: question.id,
    d, q, x, w,
    band: bandOf(d),
    case: !!question.visual,
    raw,
    reasoning: reasoning ? reasoning.ratio : null,
    at: Date.now(),
  });

  /* adaptive tier movement: rise after sustained strength, drop quickly on
     clear failure so ability gets pinned down at the right difficulty */
  slot.strongStreak = slot.strongStreak || 0;
  if (q >= 0.75) {
    slot.weakStreak = 0;
    slot.strongStreak += 1;
    if (slot.strongStreak >= 2 && slot.tier < 7) { slot.tier += 1; slot.strongStreak = 0; }
  } else if (q < 0.45) {
    slot.strongStreak = 0;
    slot.weakStreak = (slot.weakStreak || 0) + 1;
    if (slot.tier > 1 && (q < 0.3 || slot.weakStreak >= 2)) { slot.tier -= 1; slot.weakStreak = 0; }
  } else {
    slot.strongStreak = 0;
    slot.weakStreak = 0;
  }

  state.responses.push({
    qid: question.id, skill: question.skill, difficulty: d,
    selected: [...selectedIds], q, raw,
    reasoning: reasoning ? { score: reasoning.score, max: reasoning.max, ratio: reasoning.ratio, hits: reasoning.hits, wordCount: reasoning.wordCount } : null,
    at: Date.now(),
  });

  return { quality: q, raw, reasoning, band: bandOf(d), tier: slot.tier };
}

/* Ability estimate uses an exponential soft-max over response evidence:
   the highest demonstrated difficulty dominates, while failures on harder
   items still exert downward pressure. Plain means would punish candidates
   for simply being routed to harder questions. */
const BETA = 2.0;

function abilityOf(slot) {
  const ev = slot.evidence;
  if (!ev.length) return null;
  let num = 0, den = 0;
  for (const e of ev) {
    const ww = e.w * Math.exp(BETA * e.x);
    num += ww * e.x;
    den += ww;
  }
  return num / den;
}

export function skillScore(slot) {
  const a = abilityOf(slot);
  if (a === null) return null;
  return 100 / (1 + Math.exp(-K * (a - A0)));
}

export function skillConfidence(slot) {
  const ev = slot.evidence;
  const n = ev.length;
  if (!n) return 0;
  const W = ev.reduce((s, e) => s + e.w, 0);
  const mean = ev.reduce((s, e) => s + e.w * e.x, 0) / W;
  const varr = ev.reduce((s, e) => s + e.w * (e.x - mean) ** 2, 0) / W;
  const se = Math.sqrt(varr) / Math.sqrt(n);
  const volume = 1 - Math.exp(-n / 2.5);
  const stability = 1 - Math.min(1, se / 1.7);
  return Math.max(0, Math.min(1, volume * stability));
}

export function bandMastery(state, bandId) {
  const ev = [];
  for (const slot of Object.values(state.skills)) {
    for (const e of slot.evidence) if (e.band === bandId) ev.push(e);
  }
  if (!ev.length) return { mastery: null, n: 0, conf: 0 };
  const W = ev.reduce((s, e) => s + e.w, 0);
  const mastery = 100 * ev.reduce((s, e) => s + e.w * e.q, 0) / W;
  return { mastery, n: ev.length, conf: 1 - Math.exp(-ev.length / 3) };
}

/** Applied competence (B1 Foundations + B2 Application) for one skill.
    This is the right gate for Mid-Level: independent execution of common
    problems, not mastery of strategic/direction difficulty. */
export function appliedMastery(state, skillIds) {
  let W = 0, weighted = 0, n = 0;
  for (const id of skillIds) {
    const slot = state.skills[id];
    if (!slot) continue;
    for (const e of slot.evidence) {
      if (e.band === 'B1' || e.band === 'B2') {
        W += e.w; weighted += e.w * e.q; n += 1;
      }
    }
  }
  if (!n) return { mastery: 0, n: 0 };
  return { mastery: 100 * weighted / W, n };
}

export function reasoningSummary(state) {
  const rs = state.responses.filter(r => r.reasoning);
  if (!rs.length) return null;
  const high = rs.filter(r => r.difficulty >= 5);
  const avg = a => a.reduce((s, r) => s + r.reasoning.ratio, 0) / a.length;
  return {
    count: rs.length,
    overall: avg(rs),
    highDifficulty: high.length ? avg(high) : null,
  };
}

export function sessionStats(state) {
  const skills = Object.keys(state.skills).length;
  const evidence = state.responses.length;
  return { skills, evidence, responses: state.responses.length };
}
