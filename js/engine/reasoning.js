/* ============================================================
   Reasoning evaluation.
   Free-text justifications are scored against a per-question
   rubric: required concept groups (synonyms), anti-patterns
   (cop-outs / contradictions). Result adjusts response quality
   modestly and is stored as its own evidence for diagnosis.
   ============================================================ */

function normalise(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[^a-z0-9'\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * @returns {{score:number, max:number, ratio:number, hits:string[], missed:number, antiHits:number, tooBrief:boolean}}
 */
export function evaluateReasoning(text, rubric) {
  const max = rubric?.max ?? 10;
  const norm = normalise(text);
  const words = norm.split(' ').filter(Boolean);
  const tooBrief = words.length > 0 && words.length < 12;

  const hits = [];
  let missed = 0;
  for (const group of rubric?.required || []) {
    const matched = group.some(syn => norm.includes(syn.toLowerCase()));
    if (matched) hits.push(group[0]);
    else missed += 1;
  }

  let antiHits = 0;
  for (const group of rubric?.anti || []) {
    if (group.some(syn => norm.includes(syn.toLowerCase()))) antiHits += 1;
  }

  const requiredCount = (rubric?.required || []).length;
  let score = requiredCount ? (hits.length / requiredCount) * max : max / 2;
  score -= antiHits * 3;
  if (tooBrief) score *= 0.55;
  if (!norm) score = 0;
  score = Math.max(0, Math.min(max, score));

  return {
    score,
    max,
    ratio: max ? score / max : 0,
    hits,
    missed,
    antiHits,
    tooBrief,
    wordCount: words.length,
  };
}

/** Blend reasoning into response quality: keeps answer quality primary. */
export function adjustQuality(baseQ, reasoningResult) {
  if (!reasoningResult) return baseQ;
  const { ratio, antiHits } = reasoningResult;
  const boost = 0.15 * (ratio - 0.5);
  const penalty = antiHits * 0.05;
  return Math.max(0, Math.min(1, baseQ - penalty + boost));
}
