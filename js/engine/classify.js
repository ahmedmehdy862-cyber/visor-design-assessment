/* ============================================================
   Classification: level, career track, Art Direction readiness,
   contradiction detection, overall confidence.

   Level gates are conjunctive and difficulty-banded — a high
   average alone cannot reach Senior/Lead/Art Director, and
   contradiction caps block promotion across mismatched
   evidence (e.g. strong fundamentals + weak direction).
   ============================================================ */
import { SKILLS, LEVELS, TRACKS, READINESS_PARTS, BANDS } from '../data/skills.js';
import { skillScore, skillConfidence, bandMastery, appliedMastery, reasoningSummary } from './scoring.js';

const R = Object.fromEntries(LEVELS.map(l => [l.id, l.rank]));
const NAME = Object.fromEntries(LEVELS.map(l => [l.id, l.name]));

function gateList(id, ctx) {
  const { sc, n, band, avg, applied, rs } = ctx;
  const RQ = rs?.highDifficulty ?? rs?.overall ?? null;
  switch (id) {
    case 'junior': return [
      ['Foundations applied', band('B1').mastery >= 60 && band('B1').n >= 2],
    ];
    case 'mid': return [
      ['B1 mastery', band('B1').mastery >= 68],
      ['Applied (B2) performance', band('B2').mastery >= 58],
      ['Applied craft (foundations+application)', applied(['fundamentals', 'typography', 'color']) >= 60],
      ['Applied concept', applied(['concept']) >= 60],
    ];
    case 'senior': return [
      ['B1 mastery', band('B1').mastery >= 70],
      ['Applied (B2) performance', band('B2').mastery >= 65],
      ['Analysis (B3) performance', band('B3').mastery >= 60],
      ['Core craft average', avg(['fundamentals', 'typography', 'color']) >= 55],
      ['Concept judgement', sc('concept') >= 55],
      ['Professional practice', sc('practice') >= 45],
      ['No core skill below floor', Math.min(sc('fundamentals'), sc('typography'), sc('color'), sc('concept')) >= 40],
    ];
    case 'lead': return [
      ['Senior analysis band (B3)', band('B3').mastery >= 68],
      ['Strategy band (B4)', band('B4').mastery >= 60],
      ['Leadership evidence', sc('leadership') >= 52 && n('leadership') >= 2],
      ['Art direction judgement', sc('artDirection') >= 55],
      ['Professional practice', sc('practice') >= 50],
      ['Campaign thinking', sc('campaign') >= 50],
    ];
    case 'adCandidate': return [
      ['Strategy band (B4)', band('B4').mastery >= 66],
      ['Direction band (B5)', band('B5').mastery >= 55 && band('B5').n >= 1],
      ['Concept strength', sc('concept') >= 68],
      ['Art direction strength', sc('artDirection') >= 68],
      ['Campaign thinking', sc('campaign') >= 62],
      ['Image direction', sc('image') >= 58],
      ['Reasoning under complexity', RQ !== null && RQ >= 0.45],
    ];
    case 'artDirector': return [
      ['Direction band (B5)', band('B5').mastery >= 62],
      ['Strategy band (B4)', band('B4').mastery >= 72],
      ['Concept strength', sc('concept') >= 74],
      ['Art direction strength', sc('artDirection') >= 74],
      ['Campaign systems', sc('campaign') >= 66],
      ['Leadership evidence', sc('leadership') >= 62 && n('leadership') >= 2],
      ['Professional practice', sc('practice') >= 56],
      ['Image direction', sc('image') >= 60],
      ['Reasoning under complexity', RQ !== null && RQ >= 0.5],
      ['No unresolved contradictions', ctx.contradictions.length === 0],
    ];
    default: return [];
  }
}

function capsFor(ctx) {
  const caps = [];
  const { sc, contradictions } = ctx;
  if (sc('concept') < 55) caps.push({ rank: R.senior, reason: 'Concept development is not yet consistent enough for strategic levels.' });
  if (sc('artDirection') < 58) caps.push({ rank: R.lead, reason: 'Art direction judgement has not yet reached lead-level evidence.' });
  if (sc('leadership') < 52) caps.push({ rank: R.adCandidate, reason: 'Leadership evidence is insufficient for Art Director classification.' });
  if (sc('fundamentals') < 45) caps.push({ rank: R.mid, reason: 'Craft fundamentals remain below independent-practice level.' });
  if (ctx.rs && ctx.rs.highDifficulty !== null && ctx.rs.highDifficulty < 0.4) {
    caps.push({ rank: R.adCandidate, reason: 'Reasoning on complex decisions is not yet sufficiently developed.' });
  }
  for (const c of contradictions) {
    if (c.hard) caps.push({ rank: R.senior, reason: c.message });
  }
  return caps;
}

const PAIRS = [
  ['fundamentals', 'artDirection'],
  ['fundamentals', 'campaign'],
  ['typography', 'concept'],
  ['concept', 'leadership'],
  ['artDirection', 'leadership'],
];

export function classify(state) {
  const skills = SKILLS.map(s => {
    const slot = state.skills[s.id];
    const n = slot?.evidence.length || 0;
    return {
      id: s.id, name: s.name, short: s.short,
      score: n ? skillScore(slot) : null,
      conf: n ? skillConfidence(slot) : 0,
      n,
      tier: slot?.tier ?? null,
    };
  });
  const map = Object.fromEntries(skills.map(s => [s.id, s]));

  const sc = (id) => map[id]?.score ?? 0;
  const n = (id) => map[id]?.n ?? 0;
  const band = (id) => {
    const b = bandMastery(state, id);
    return b;
  };
  const bandOk = {};
  for (const b of BANDS) bandOk[b.id] = band(b.id);
  const bandFn = (id) => ({ mastery: bandOk[id].mastery ?? 0, n: bandOk[id].n, conf: bandOk[id].conf });
  const avg = (ids) => ids.reduce((s, id) => s + sc(id), 0) / ids.length;
  const applied = (ids) => {
    const a = appliedMastery(state, ids);
    return a.n ? a.mastery : 0;
  };
  const rs = reasoningSummary(state);

  /* contradictions */
  const contradictions = [];
  for (const [a, b] of PAIRS) {
    const A = map[a], B = map[b];
    if (!A || !B || !A.score || !B.score) continue;
    const gap = Math.abs(A.score - B.score);
    if (gap >= 24 && A.conf >= 0.5 && B.conf >= 0.5) {
      const high = A.score > B.score ? A : B;
      const low = A.score > B.score ? B : A;
      contradictions.push({
        a: high.id, b: low.id, gap: Math.round(gap),
        hard: (high.id === 'fundamentals' && (low.id === 'artDirection' || low.id === 'campaign')),
        message: `${high.name} scores well above ${low.name} (gap ${Math.round(gap)}) — evidence suggests execution strength without matching ${low.name.toLowerCase()} ability.`,
      });
    }
  }

  const ctx = {
    sc, n, avg, applied, rs, contradictions,
    band: bandFn,
  };

  /* level gates, highest first */
  const order = ['artDirector', 'adCandidate', 'lead', 'senior', 'mid', 'junior'];
  let level = 'beginner';
  const gatesFor = {};
  for (const id of order) {
    const gates = gateList(id, ctx);
    gatesFor[id] = gates;
    if (gates.every(([, pass]) => pass)) { level = id; break; }
  }

  const caps = capsFor(ctx);
  let capHit = null;
  const levelRank = R[level];
  for (const c of caps) {
    if (c.rank < levelRank && (!capHit || c.rank > capHit.rank)) capHit = c;
  }
  let capReason = null;
  if (capHit) {
    capReason = capHit.reason;
    level = LEVELS.find(l => l.rank === capHit.rank)?.id || 'mid';
  }

  /* borderline: next level partially satisfied */
  let borderline = null;
  const fullOrder = LEVELS.map(l => l.id);
  const nextId = fullOrder[R[level] + 1];
  if (nextId && !capHit) {
    const gates = gatesFor[nextId] || gateList(nextId, ctx) || [];
    if (gates.length) {
      const pass = gates.filter(([, p]) => p).length;
      const ratio = pass / gates.length;
      if (ratio >= 0.6 && ratio < 1) {
        borderline = {
          with: NAME[nextId],
          ratio,
          pending: gates.filter(([, p]) => !p).map(([label]) => label),
        };
      }
    }
  }

  /* Art Direction readiness (independent of level) */
  const parts = READINESS_PARTS.map(p => {
    const vals = p.skills.map(s => ({ v: sc(s), c: map[s]?.conf ?? 0, n: n(s) }));
    const covered = vals.filter(v => v.n > 0);
    if (!covered.length) return { id: p.id, name: p.name, value: null, conf: 0, weight: p.weight };
    const meanAll = covered.reduce((s, v) => s + v.v, 0) / covered.length;
    const meanConf = covered.reduce((s, v) => s + v.c, 0) / covered.length;
    /* shrink toward sample mean when evidence is thin */
    const shrink = Math.min(1, meanConf * 1.4);
    const raw = covered.reduce((s, v) => s + v.v * v.c, 0) / covered.reduce((s, v) => s + v.c, 0);
    const value = raw * shrink + meanAll * (1 - shrink);
    return { id: p.id, name: p.name, value: Math.round(value), conf: meanConf, weight: p.weight };
  });
  const coveredParts = parts.filter(p => p.value !== null);
  const readiness = coveredParts.length
    ? Math.round(coveredParts.reduce((s, p) => s + p.value * p.weight, 0) /
        coveredParts.reduce((s, p) => s + p.weight, 0))
    : 0;

  /* tracks (level-independent) */
  const imputed = Object.fromEntries(skills.map(s => [s.id, s.score ?? avgScore(skills)]));
  let trackScores = TRACKS.map(t => ({
    id: t.id, name: t.name, blurb: t.blurb,
    score: Math.round(Object.entries(t.weights).reduce((s, [k, w]) => s + (imputed[k] || 0) * w, 0)),
  })).sort((a, b) => b.score - a.score);

  if (trackScores[0]?.id === 'artDirector' && readiness < 62) {
    const demoted = trackScores.shift();
    trackScores = trackScores.filter(t => t.id !== 'artDirector');
    if (trackScores.length) trackScores.push(demoted);
  }
  const primary = trackScores[0] || null;
  const secondary = trackScores[1] && trackScores[1].score >= primary.score - 5 ? trackScores[1] : null;

  /* overall confidence */
  const withEv = skills.filter(s => s.n > 0);
  const cov = withEv.reduce((s, x) => s + x.conf, 0) / SKILLS.length;
  const coverage = withEv.length / SKILLS.length;
  const bandCov = BANDS.filter(b => bandOk[b.id].n > 0).length / BANDS.length;
  let confidence = 0.55 * cov + 0.25 * coverage + 0.2 * bandCov;
  if (rs) confidence += 0.05;
  confidence = Math.max(0.2, Math.min(0.97, confidence));

  const levelInfo = LEVELS.find(l => l.id === level);
  const secondaryPotential = readiness >= 70
    ? { label: 'Art Direction', note: 'High Potential', tone: 'pos' }
    : readiness >= 55
      ? { label: 'Art Direction', note: 'Developing Potential', tone: 'warn' }
      : null;

  return {
    level: { id: level, name: levelInfo.name, rank: levelInfo.rank, borderline, capReason },
    skills,
    bands: Object.fromEntries(BANDS.map(b => [b.id, { ...bandOk[b.id], label: b.label }])),
    tracks: { primary, secondary, all: trackScores, potential: secondaryPotential },
    readiness: { total: readiness, parts },
    contradictions,
    reasoning: rs,
    confidence: Math.round(confidence * 100) / 100,
    gates: gatesFor,
    evidenceCount: state.responses.length,
  };
}

function avgScore(skills) {
  const v = skills.filter(s => s.score !== null).map(s => s.score);
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0;
}
