/* ============================================================
   Fairness tests — the assessment must not be gameable by
   "always pick the first option". Answer position is shuffled
   at render time for every question whose options do not name
   themselves, so positional bias carries no signal.
   ============================================================ */
import { strict as assert } from 'node:assert';
import { loadBank, getQuestions } from '../js/data/bank.js';
import { displayOptions } from '../js/ui/assessment.js';
import { createSession } from '../js/engine/adaptive.js';
import { classify } from '../js/engine/classify.js';
import { LEVELS } from '../js/data/skills.js';

loadBank();

let passed = 0;
const ok = (c, label) => { assert.ok(c, label); passed++; console.log(`  ✓ ${label}`); };

console.log('\nFairness / anti-gaming tests\n');

/* --- 1. raw bank position bias (documented, then neutralised) --- */
const raw = getQuestions();
const rawFirstCorrect = raw.filter(q => q.correct.includes(q.options[0].id)).length;
console.log(`  · raw bank: first option correct in ${rawFirstCorrect}/${raw.length} items`);

/* --- 2. shuffling redistributes the correct answer --- */
const sample = raw.find(q => !q.options.some(o => /\b(?:layout|direction|concept)\s+[a-d]\b/i.test(o.title || '')));
ok(sample, 'found a non-self-lettered sample question');

const trials = 600;
const posCount = {};
for (let i = 0; i < trials; i++) {
  const shown = displayOptions(sample);
  const idx = shown.findIndex(o => sample.correct.includes(o.id));
  posCount[idx] = (posCount[idx] || 0) + 1;
}
const positions = Object.keys(posCount).map(Number);
ok(positions.length === sample.options.length,
  `correct answer reaches every position (${positions.length}/${sample.options.length})`);
const minShare = Math.min(...Object.values(posCount)) / trials;
ok(minShare > 0.08, `no position is nearly guaranteed (min share ${(minShare * 100).toFixed(1)}%)`);
const firstShare = (posCount[0] || 0) / trials;
ok(Math.abs(firstShare - 1 / sample.options.length) < 0.12,
  `first position is not favoured (${(firstShare * 100).toFixed(1)}% vs expected ${(100 / sample.options.length).toFixed(1)}%)`);

/* --- 3. self-lettered options keep their canonical order --- */
const lettered = raw.find(q => /\b(?:layout|direction|concept)\s+[a-d]\b/i.test(q.options.map(o => o.title || '').join(' ')));
ok(lettered, 'found a self-lettered question');
const canon = lettered.options.map(o => o.id).join(',');
let orderHeld = true;
for (let i = 0; i < 40; i++) {
  if (displayOptions(lettered).map(o => o.id).join(',') !== canon) { orderHeld = false; break; }
}
ok(orderHeld, 'self-lettered options are never reordered (title letters stay truthful)');

/* --- 4. every question is shuffled at least sometimes --- */
const neverShuffled = raw.filter(q => {
  for (let i = 0; i < 30; i++) {
    const a = displayOptions(q).map(o => o.id).join(',');
    const b = displayOptions(q).map(o => o.id).join(',');
    if (a !== b) return false;
  }
  return true;
});
const exempt = raw.filter(q => /\b(?:layout|direction|concept|option|version|variant|route|execution)\s+[a-d]\b/i
  .test(q.options.map(o => o.title || '').join(' ')));
ok(neverShuffled.length === exempt.length,
  `only the ${exempt.length} self-lettered questions stay fixed (${neverShuffled.length} fixed)`);

/* --- 5. click-first strategy cannot buy a high level --- */
function clickFirstPersona() {
  const session = createSession({ experience: 'experienced', startTier: 3 });
  for (let i = 0; i < 40; i++) {
    const step = session.next();
    if (!step) break;
    const shown = displayOptions(step.question);
    const ids = step.question.type === 'multi'
      ? shown.slice(0, step.question.correct.length).map(o => o.id)
      : [shown[0].id];
    const { done } = session.submit(step.question, ids, null);
    if (done) break;
  }
  return classify(session.finish().state);
}

const runs = 60;
const counts = {};
let rankSum = 0;
for (let i = 0; i < runs; i++) {
  const c = clickFirstPersona();
  counts[c.level.name] = (counts[c.level.name] || 0) + 1;
  rankSum += c.level.rank;
}
const avgRank = rankSum / runs;
const topTier = (counts['Lead Designer'] || 0) + (counts['Art Director'] || 0) + (counts['Art Director Candidate'] || 0);
console.log('  · click-first results:', JSON.stringify(counts));
ok(avgRank < 3.5, `click-first average level rank ${avgRank.toFixed(2)} stays below 3.5 (Lead)`);
ok(topTier / runs < 0.15, `click-first reaches Lead+ in only ${Math.round(100 * topTier / runs)}% of runs (<15%)`);

/* --- 6. expert still classified correctly through the shuffled UI path --- */
function expertText(q) {
  if (!q.reasoning) return null;
  const words = q.reasoning.required.flatMap(g => g.slice(0, 2));
  return `My choice connects the hierarchy to the audience and the brief: ${words.join(' ')}. ` +
    'It also sets a system that can extend across formats, so the reasoning holds under constraints.';
}

function expertPersona() {
  const session = createSession({ experience: 'expert', startTier: 3 });
  for (let i = 0; i < 60; i++) {
    const step = session.next();
    if (!step) break;
    const { done } = session.submit(step.question, [...step.question.correct], expertText(step.question));
    if (done) break;
  }
  return classify(session.finish().state);
}
const expert = expertPersona();
ok(expert.level.rank >= 5, `expert still reaches ${expert.level.name} (rank ${expert.level.rank})`);
ok(expert.readiness.total >= 70, `expert readiness ${expert.readiness.total}% stays high`);
ok(expert.confidence >= 0.6, `expert confidence ${expert.confidence} stays high`);

console.log(`\n${passed} fairness tests passed\n`);
