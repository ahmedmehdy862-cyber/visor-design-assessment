/* Engine simulation tests — run with: node test/engine.test.js */
import assert from 'node:assert';
import { loadBank, getQuestion } from '../js/data/bank.js';
import { createSession } from '../js/engine/adaptive.js';
import { classify } from '../js/engine/classify.js';
import { buildDiagnosis } from '../js/engine/diagnosis.js';

loadBank();

function bestText(question) {
  if (!question.reasoning) return null;
  const words = question.reasoning.required.flatMap(g => g.slice(0, 2));
  return `My choice connects the hierarchy to the audience and the brief: ${words.join(' ')}. ` +
    'It also sets a system that can extend across formats, so the reasoning holds under constraints.';
}
function badText() {
  return 'I just think it looks nicer and feels more balanced to me, no real reason, it is subjective.';
}

function optionIds(question, mode) {
  const sortedDesc = [...question.options].sort((a, b) => b.q - a.q);
  const sortedAsc = [...question.options].sort((a, b) => a.q - b.q);
  const best = () => [sortedDesc[0].id];
  const worst = () => [sortedAsc[0].id];
  const nearMiss = () => [(sortedAsc.find(o => o.q >= 0.3) || sortedAsc[0]).id];

  if (question.type === 'multi') {
    if (mode === 'expert' || mode === 'senior' || mode === 'lead') return [...question.correct];
    if (mode === 'weak') return sortedAsc.filter(o => !question.correct.includes(o.id)).slice(0, 3).map(o => o.id);
    const half = question.correct.slice(0, Math.ceil(question.correct.length / 2));
    return [...half, sortedAsc.find(o => !question.correct.includes(o.id)).id];
  }

  if (mode === 'expert') return best();
  if (mode === 'weak') return worst();
  if (mode === 'senior') return question.difficulty <= 4 ? best() : (question.difficulty === 5 ? nearMiss() : worst());
  if (mode === 'lead') return question.difficulty <= 5 ? best() : (question.difficulty === 6 ? nearMiss() : worst());
  if (mode === 'mid') return question.difficulty <= 3 ? best() : worst();

  // craft-strong / direction-weak: direction answers are plausible but clichéd
  const directionSkills = ['concept', 'campaign', 'artDirection', 'leadership'];
  if (!directionSkills.includes(question.skill)) return best();
  return nearMiss();
}

function run(mode, textFn) {
  const startTier = { expert: 3, senior: 3, lead: 4, mid: 1, split: 2 }[mode] || 1;
  const session = createSession({ experience: mode, startTier });
  let guard = 0;
  while (guard++ < 60) {
    const step = session.next();
    if (!step) break;
    const ids = optionIds(step.question, mode);
    session.submit(step.question, ids, textFn ? textFn(step.question) : null);
  }
  const { state } = session.finish();
  return classify(state);
}

/* a strong senior/lead writer: hits rubric concepts without being perfect */
function decentText(question) {
  if (!question.reasoning) return null;
  const words = question.reasoning.required.slice(0, 2).flatMap(g => g.slice(0, 2));
  return `The choice follows the hierarchy and audience of the brief: ${words.join(' ')} — and it holds as a system.`;
}

const results = {};

/* 1 — expert across the board */
{
  const c = run('expert', bestText);
  results.expert = c;
  assert.ok(c.level.rank >= 5, `expert should reach AD candidate+, got ${c.level.id}`);
  assert.ok(c.readiness.total >= 70, `expert readiness high, got ${c.readiness.total}`);
  assert.ok(c.confidence >= 0.6, `expert confidence, got ${c.confidence}`);
  console.log(`✓ expert → ${c.level.name} (borderline: ${c.level.borderline?.with || 'none'}), readiness ${c.readiness.total}, conf ${c.confidence}`);
}

/* 2 — consistently weak */
{
  const c = run('weak', badText);
  results.weak = c;
  assert.ok(c.level.rank <= 1, `weak should stay ≤ junior, got ${c.level.id}`);
  console.log(`✓ weak → ${c.level.name}, readiness ${c.readiness.total}, conf ${c.confidence}`);
}

/* 3 — strong basics, collapses at higher difficulty = Mid-Level */
{
  const c = run('mid', null);
  results.mid = c;
  assert.strictEqual(c.level.rank, 2, `mid persona should land Mid-Level, got ${c.level.id}`);
  assert.ok(c.level.rank < 3, 'mid persona must not pass as senior without analysis evidence');
  console.log(`✓ mid → ${c.level.name}${c.level.borderline ? ` / ${c.level.borderline.with} borderline` : ''}, conf ${c.confidence}`);
}

/* 4 — craft-strong, direction-weak must NOT be classified Art Director */
{
  const c = run('split', bestText);
  results.split = c;
  assert.ok(c.level.rank <= 3, `split persona must not exceed senior, got ${c.level.id}`);
  assert.ok(c.level.id !== 'artDirector' && c.level.id !== 'adCandidate',
    `split persona must not reach AD tiers, got ${c.level.id}`);
  assert.ok(c.tracks.primary.id !== 'artDirector', 'split persona must not take the Art Director track');
  const concept = c.skills.find(s => s.id === 'concept').score;
  const leadership = c.skills.find(s => s.id === 'leadership').score;
  assert.ok(concept < 62, `weak concept must register, got ${concept}`);
  assert.ok(leadership < 62, `weak leadership must register, got ${leadership}`);
  assert.ok(c.readiness.total < results.expert.readiness.total - 12,
    `readiness must reflect direction weakness (${c.readiness.total} vs expert ${results.expert.readiness.total})`);
  console.log(`✓ split-craft → ${c.level.name}${c.level.borderline ? ` (borderline ${c.level.borderline.with})` : ''}, concept ${concept.toFixed(0)}, readiness ${c.readiness.total}`);
}

/* 5 — senior: solid through analysis, weaker at strategy/direction */
{
  const c = run('senior', decentText);
  results.senior = c;
  assert.ok(c.level.rank >= 3 && c.level.rank <= 4,
    `senior persona should land Senior/Lead, got ${c.level.id}`);
  assert.ok(c.readiness.total >= 55 && c.readiness.total <= 90, `senior readiness plausible, got ${c.readiness.total}`);
  console.log(`✓ senior → ${c.level.name}${c.level.borderline ? ` (borderline ${c.level.borderline.with})` : ''}, readiness ${c.readiness.total}, conf ${c.confidence}`);
}

/* 6 — lead: strong through strategy, near-miss at direction */
{
  const c = run('lead', decentText);
  results.lead = c;
  assert.ok(c.level.rank >= 4, `lead persona should reach Lead+, got ${c.level.id}`);
  console.log(`✓ lead → ${c.level.name}, readiness ${c.readiness.total}, conf ${c.confidence}`);
}

/* 7 — scoring internals */
{
  const c = results.expert;
  for (const s of c.skills) {
    assert.ok(s.n > 0, `every skill needs evidence for full run: ${s.id}`);
    assert.ok(s.score >= 0 && s.score <= 100, 'score range');
  }
  for (const p of c.readiness.parts) {
    assert.ok(p.value === null || (p.value >= 0 && p.value <= 100), 'readiness part range');
  }
  const diag = buildDiagnosis(c);
  assert.ok(diag.paragraphs.join(' ').length > 200, 'diagnosis must be substantial');
  assert.strictEqual(diag.roadmap.length, 3, 'roadmap has 3 items');
  console.log('✓ scoring internals + diagnosis OK');
}

/* 6 — evidence discipline: no level above mid without multi-skill evidence */
{
  const c = results.mid;
  const evidenced = c.skills.filter(s => s.n >= 2).length;
  assert.ok(evidenced >= 7, `mid run should cover most skills twice+, got ${evidenced}`);
  console.log(`✓ evidence coverage: ${evidenced}/10 skills with ≥2 items`);
}

console.log('\nAll engine tests passed.');
