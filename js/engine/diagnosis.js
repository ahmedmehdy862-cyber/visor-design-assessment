/* ============================================================
   Diagnosis & development roadmap.
   Produces prose grounded in the actual scoring evidence —
   never a generic score dump.
   ============================================================ */
import { SKILL_MAP } from '../data/skills.js';

const PRACTICE = {
  fundamentals: {
    why: 'Every level above Mid is judged on whether your layouts hold hierarchy under pressure — clients feel this before they can name it.',
    practice: 'Take any five posters you admire. Rebuild each one as a wireframe of boxes only, then write one sentence on why the sizes and gaps are what they are.',
    challenge: 'Redesign the Case Study 1 poster with only three type sizes and one accent colour allowed.',
  },
  typography: {
    why: 'Typography is the most frequently audited craft in senior reviews; inconsistency here caps credibility at Mid-Level regardless of concept strength.',
    practice: 'Set the same 200-word text five ways (size, leading, measure, weight, contrast). Score each for reading comfort before showing anyone.',
    challenge: 'Build a bilingual (Arabic/Latin) type scale with documented roles and optical — not metric — matching rules.',
  },
  color: {
    why: 'Colour decisions are strategic, not decorative: trust, appetite, urgency and accessibility are all decided at the palette level.',
    practice: 'Re-colour three existing designs against a written brief. Justify every colour choice with a sentence tied to the audience.',
    challenge: 'Define a semantic palette for a dark-mode dashboard that passes contrast checks and survives single-colour print.',
  },
  image: {
    why: 'Directing photography — even stock selection — is the difference between layouts that look assembled and work that looks directed.',
    practice: 'Build an image charter (light, vantage, crop, temperature) for a brand you like, then audit 20 of their images against it.',
    challenge: 'Produce a six-image series brief with a single lighting rule and one crop logic, then justify it in five lines.',
  },
  concept: {
    why: 'Concept is the gate to Senior and beyond: levels above Mid are separated by turning briefs into ideas, not by execution polish.',
    practice: 'Take one brief per day. Write three ideas, kill the first (usually the cliché), and develop the third.',
    challenge: 'For the campaign briefs in this assessment, write a one-line platform idea that could carry twelve executions.',
  },
  branding: {
    why: 'Systems thinking is what clients retain you for: identities that survive real applications rather than guideline mockups.',
    practice: 'Audit a brand’s five worst real-world applications and write the rule that would have prevented each failure.',
    challenge: 'Draft a constants/variables matrix for a parent brand with three sub-brands.',
  },
  campaign: {
    why: 'Campaign thinking shows you can connect executions into one idea over time — the core of Art Direction readiness.',
    practice: 'Deconstruct a campaign you see in the wild: identify the organising idea, the format adaptations and where it leaks.',
    challenge: 'Write a 12-week campaign structure with three phases and asset rules per phase for one fixed budget.',
  },
  artDirection: {
    why: 'Art direction is how taste becomes repeatable: without it your good work stays personal instead of becoming a system a team can run.',
    practice: 'Take two strong images and one weak one; write the rule that separates them. Apply it to ten more images.',
    challenge: 'Direct a photoshoot concept for the Case 7 brief: write the shot list, lighting rule and what makes execution 06 belong to 01.',
  },
  practice: {
    why: 'Senior decisions are defended in the room: brief interpretation and trade-off communication determine whether your work survives contact with stakeholders.',
    practice: 'Before your next design review, write the objective, the constraint and your decision criterion in three lines. Present from that page.',
    challenge: 'Pitch one recommended route with an explicit cost/timeline trade-off and a costed alternative that keeps the idea.',
  },
  leadership: {
    why: 'Lead and Art Director classifications require evidence that you can raise other people’s output, not only your own.',
    practice: 'Run one critique this week using this format: name the problem → tie it to the objective → suggest a next move with a reason.',
    challenge: 'Write a one-page visual standard with do/don’t examples for a project you own, and install a recurring critique ritual.',
  },
};

const LEVEL_WORDS = {
  beginner: 'foundational awareness with inconsistent application',
  junior: 'reliable execution inside established systems, with guidance still needed on prioritisation',
  mid: 'independent, sound visual judgement on common design problems',
  senior: 'strategic visual decisions, defended reasoning and consistency across complex work',
  lead: 'the ability to evaluate others’ work and hold a visual standard across a team',
  adCandidate: 'strong concept, storytelling and campaign direction — with remaining gaps in leadership or strategic breadth',
  artDirector: 'full creative direction: concept, campaign systems, storytelling and direction of other creatives',
};

function scoreBand(v) {
  if (v === null || v === undefined) return 'untested';
  if (v >= 85) return 'strong';
  if (v >= 70) return 'proficient';
  if (v >= 55) return 'competent';
  if (v >= 40) return 'developing';
  return 'early';
}

const BAND_LABEL = {
  untested: 'Not yet tested', early: 'Early stage', developing: 'Developing',
  competent: 'Competent', proficient: 'Proficient', strong: 'Strong',
};

export function buildDiagnosis(classification) {
  const { level, skills, tracks, readiness, confidence, contradictions, bands, reasoning } = classification;
  const withScore = skills.filter(s => s.score !== null);
  const sorted = [...withScore].sort((a, b) => b.score - a.score);
  const strongest = sorted.slice(0, 3);
  const weakest = [...withScore].sort((a, b) => a.score - b.score).slice(0, 3);
  const untested = skills.filter(s => s.score === null);

  const topNames = strongest.map(s => s.short.toLowerCase()).join(', ');
  const primaryTrack = tracks.primary?.name || 'Visual Designer';
  const potential = tracks.potential;

  /* ---- paragraph 1: why this level ---- */
  const levelReasons = [];
  const b1 = bands.B1, b3 = bands.B3, b5 = bands.B5;
  if (b1.mastery !== null && b1.mastery >= 70) levelReasons.push(`your fundamentals evidence is consistently applied (foundations ${Math.round(b1.mastery)})`);
  if (b3.mastery !== null && b3.mastery >= 60) levelReasons.push(`you analyse problems and select solutions at analysis-level strength (${Math.round(b3.mastery)})`);
  else if (b3.mastery !== null) levelReasons.push(`analysis-level decisions are still inconsistent (${Math.round(b3.mastery)})`);
  if (b5.mastery !== null) levelReasons.push(`direction-level evidence sits at ${Math.round(b5.mastery)} across ${b5.n} advanced item${b5.n === 1 ? '' : 's'}`);
  else levelReasons.push('no direction-level items were reached with enough confidence');

  let p1 = `You demonstrate ${LEVEL_WORDS[level.id] || 'a mixed profile'}. `;
  if (strongest.length) p1 += `Your strongest evidence is in ${topNames} (${strongest.map(s => `${s.short} ${Math.round(s.score)}`).join(', ')}). `;
  if (levelReasons.length) p1 += `Internally, ${levelReasons.join('; ')}.`;

  if (level.borderline) {
    p1 += ` This estimate sits at the ${level.id === 'beginner' ? 'entry' : 'lower'} boundary: classification as ${level.borderline.with} is held back by ${level.borderline.pending.slice(0, 3).join(', ').toLowerCase()}.`;
  }
  if (level.capReason) p1 += ` ${level.capReason}`;

  /* ---- paragraph 2: track + readiness, evaluated separately ---- */
  let p2 = `Your primary track evaluates as ${primaryTrack} (${tracks.primary?.score ?? 0}/100), independent of level.`;
  if (tracks.secondary) p2 += ` Close secondary fit: ${tracks.secondary.name} (${tracks.secondary.score}).`;
  p2 += ` Art Direction Readiness is ${readiness.total}%`;
  if (potential) p2 += ` — ${potential.label} ${potential.note.toLowerCase()}`;
  p2 += `. Readiness is scored separately from level, so it may lead or trail your classification.`;

  /* ---- paragraph 3: gaps ---- */
  const gapParts = weakest.map(s => `${s.short.toLowerCase()} (${Math.round(s.score)}, ${scoreBand(s.score)})`);
  let p3 = `Your development areas are ${gapParts.join(', ')}.`;
  if (reasoning?.highDifficulty !== null && reasoning?.highDifficulty !== undefined) {
    p3 += reasoning.highDifficulty >= 0.55
      ? ` Your written reasoning on advanced items is a supporting strength (${Math.round(reasoning.highDifficulty * 100)}%) — keep defending decisions explicitly at review.`
      : ` Your reasoning on advanced items (${Math.round((reasoning.highDifficulty ?? 0) * 100)}%) trails your selections — senior roles are judged on defending choices, not only making them.`;
  }
  if (contradictions.length) {
    p3 += ` Note: ${contradictions[0].message}`;
  }
  if (untested.length) {
    p3 += ` Areas without enough evidence yet: ${untested.map(s => s.short.toLowerCase()).join(', ')}.`;
  }

  /* ---- next step ---- */
  const nextMap = {
    beginner: 'Work through the fundamentals deliberately: hierarchy, spacing and typography drills with self-scoring against references. Re-take this assessment after eight focused sessions.',
    junior: 'Push toward independent problem solving: take briefs apart before designing, and practise explaining one decision per project in the client’s language.',
    mid: 'Focus on concept development and consistency across formats. Defend every decision with a brief-linked reason; start auditing work against systems, not taste.',
    senior: 'Focus on creative direction, campaign systems and strategic presentation — plus giving critique that raises other designers’ output.',
    lead: 'Formalise your standards: build a visual system others can run, install critique rituals, and practise final creative decisions under delivery pressure.',
    adCandidate: 'Close the leadership and strategic gaps: direct a small team on a multi-execution brief and present a campaign platform end-to-end.',
    artDirector: 'Hold the line at scale: serialise your direction across long campaigns, develop other creatives explicitly, and tie every creative platform to a business objective.',
  };
  const nextStep = nextMap[level.id];

  /* ---- roadmap ---- */
  const targetFloor = level.rank >= 4 ? 74 : level.rank >= 3 ? 72 : 70;
  const roadmap = weakest.map((s, i) => {
    const meta = PRACTICE[s.id] || PRACTICE.fundamentals;
    const target = Math.min(92, Math.max(targetFloor, Math.round(s.score + 16)));
    return {
      rank: i + 1,
      skill: s.name,
      skillId: s.id,
      why: meta.why,
      current: `${Math.round(s.score)} · ${BAND_LABEL[scoreBand(s.score)]}`,
      currentScore: Math.round(s.score),
      target: `${target} · ${BAND_LABEL[scoreBand(target)]}`,
      targetScore: target,
      practice: meta.practice,
      challenge: meta.challenge,
    };
  });

  const strongestList = strongest.map(s => ({ name: s.short, score: Math.round(s.score) }));
  const developmentList = weakest.map(s => ({ name: s.short, score: Math.round(s.score) }));

  return {
    paragraphs: [p1, p2, p3],
    nextStep,
    roadmap,
    strongest: strongestList,
    development: developmentList,
    confidence,
    confidenceLabel: confidence >= 0.85 ? 'High' : confidence >= 0.68 ? 'Solid' : 'Indicative',
    explanation: levelExplanation(level.id, bands),
  };
}

function levelExplanation(id, bands) {
  const b = (x) => bands[x]?.mastery;
  switch (id) {
    case 'beginner': return 'Isolated principles are understood but not yet applied consistently across a layout.';
    case 'junior': return 'You can execute established systems with guidance: foundations are present, independent prioritisation is still forming.';
    case 'mid': return 'You independently solve common design problems and make sound visual decisions without supervision.';
    case 'senior': return 'You solve complex problems, defend decisions, maintain consistency and work strategically across formats.';
    case 'lead': return 'You evaluate other designers, establish standards and guide a design team toward a consistent result.';
    case 'adCandidate': return 'Strong concept, storytelling and campaign direction are evidenced; leadership and strategic breadth still show gaps.';
    case 'artDirector': return 'Concept, campaign systems, storytelling, strategic thinking and direction of other creatives are all evidenced.';
    default: return '';
  }
}

export { BAND_LABEL, scoreBand };
