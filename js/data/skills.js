/* ============================================================
   Domain model: skills, levels, tracks, weights.
   Pure data — no UI, no scoring logic.
   ============================================================ */

export const SKILLS = [
  { id: 'fundamentals',  name: 'Design Fundamentals',   short: 'Fundamentals', desc: 'Composition, balance, alignment, spacing, grid, proportion, hierarchy, scale.' },
  { id: 'typography',    name: 'Typography',            short: 'Typography',   desc: 'Selection, pairing, hierarchy, weight, tracking, leading, readability, Arabic/Latin awareness.' },
  { id: 'color',         name: 'Color',                 short: 'Color',        desc: 'Theory, contrast, palette selection, color hierarchy, strategic use of color.' },
  { id: 'image',         name: 'Image & Visual Direction', short: 'Image Direction', desc: 'Image selection, cropping, composition, lighting, photography direction, consistency.' },
  { id: 'concept',       name: 'Concept & Creative Thinking', short: 'Concept', desc: 'Concept generation, problem solving, originality, avoiding cliché, conceptual consistency.' },
  { id: 'branding',      name: 'Branding',              short: 'Branding',     desc: 'Identity systems, consistency, application, logo usage, visual systems, adaptation.' },
  { id: 'campaign',      name: 'Social & Campaign',     short: 'Campaign',     desc: 'Attention, platform adaptation, campaign consistency, content hierarchy, multi-format systems.' },
  { id: 'artDirection',  name: 'Art Direction',         short: 'Art Direction', desc: 'Visual storytelling, mood, concept direction, campaign direction, connecting executions into a system.' },
  { id: 'practice',      name: 'Professional Practice', short: 'Practice',     desc: 'Brief interpretation, client communication, feedback, explaining decisions, constraints.' },
  { id: 'leadership',    name: 'Leadership',            short: 'Leadership',   desc: 'Feedback quality, directing designers, delegation, quality control, final creative decisions.' },
];

export const SKILL_MAP = Object.fromEntries(SKILLS.map(s => [s.id, s]));

export const LEVELS = [
  { id: 'beginner',  name: 'Beginner',              rank: 0 },
  { id: 'junior',    name: 'Junior Designer',       rank: 1 },
  { id: 'mid',       name: 'Mid-Level Designer',    rank: 2 },
  { id: 'senior',    name: 'Senior Designer',       rank: 3 },
  { id: 'lead',      name: 'Lead Designer',         rank: 4 },
  { id: 'adCandidate', name: 'Art Director Candidate', rank: 5 },
  { id: 'artDirector', name: 'Art Director',        rank: 6 },
];

/* Difficulty bands → mastery evidence used by the classifier.
   d1-2 foundational · d3 applied · d4 analysis · d5-6 strategic · d7 direction */
export const BANDS = [
  { id: 'B1', min: 1, max: 2, label: 'Foundations' },
  { id: 'B2', min: 3, max: 3, label: 'Application' },
  { id: 'B3', min: 4, max: 4, label: 'Analysis' },
  { id: 'B4', min: 5, max: 6, label: 'Strategy' },
  { id: 'B5', min: 7, max: 7, label: 'Direction' },
];

/* Career tracks: independent of level. Weights across skills. */
export const TRACKS = [
  { id: 'graphic', name: 'Graphic Designer', blurb: 'Editorial, print, poster and identity execution.',
    weights: { fundamentals: .18, typography: .16, color: .12, image: .08, concept: .12, branding: .13, campaign: .07, artDirection: .05, practice: .06, leadership: .03 } },
  { id: 'social', name: 'Social Media Designer', blurb: 'Platform-native content systems and campaign adaptation.',
    weights: { fundamentals: .12, typography: .14, color: .12, image: .13, concept: .10, branding: .09, campaign: .21, artDirection: .04, practice: .04, leadership: .01 } },
  { id: 'brand', name: 'Brand Designer', blurb: 'Identity systems, guidelines and brand application.',
    weights: { fundamentals: .135, typography: .135, color: .115, image: .058, concept: .135, branding: .23, campaign: .058, artDirection: .038, practice: .058, leadership: .038 } },
  { id: 'visual', name: 'Visual Designer', blurb: 'Cross-format visual execution with strong craft fundamentals.',
    weights: { fundamentals: .17, typography: .16, color: .15, image: .15, concept: .13, branding: .08, campaign: .07, artDirection: .05, practice: .03, leadership: .01 } },
  { id: 'creative', name: 'Creative Designer', blurb: 'Concept-led work across campaigns and visual storytelling.',
    weights: { fundamentals: .10, typography: .10, color: .10, image: .13, concept: .20, branding: .06, campaign: .14, artDirection: .13, practice: .03, leadership: .01 } },
  { id: 'artDirector', name: 'Art Director', blurb: 'Direction of campaigns, systems and other creatives.',
    weights: { fundamentals: .055, typography: .045, color: .045, image: .1, concept: .164, branding: .064, campaign: .136, artDirection: .2, practice: .055, leadership: .136 } },
];

/* Art Direction Readiness — computed separately from level. */
export const READINESS_PARTS = [
  { id: 'concept',        name: 'Concept',           weight: .18, skills: ['concept'] },
  { id: 'judgment',       name: 'Visual Judgment',   weight: .16, skills: ['fundamentals', 'typography', 'color'] },
  { id: 'storytelling',   name: 'Storytelling',      weight: .14, skills: ['image', 'artDirection'] },
  { id: 'campaign',       name: 'Campaign Thinking', weight: .14, skills: ['campaign'] },
  { id: 'creativeDir',    name: 'Creative Direction', weight: .16, skills: ['artDirection'] },
  { id: 'communication',  name: 'Communication',     weight: .12, skills: ['practice'] },
  { id: 'leadership',     name: 'Leadership',        weight: .10, skills: ['leadership'] },
];

/* Stage labels shown to the user (never reveals scoring logic).
   `id` keys into the Arabic overlay (AR.stages). */
export const STAGES = [
  { id: 'S1', min: 1, max: 2, label: 'Stage 1 · Foundations' },
  { id: 'S2', min: 3, max: 3, label: 'Stage 2 · Application' },
  { id: 'S3', min: 4, max: 4, label: 'Stage 3 · Analysis' },
  { id: 'S4', min: 5, max: 6, label: 'Stage 4 · Strategy' },
  { id: 'S5', min: 7, max: 7, label: 'Stage 5 · Direction' },
];

export function stageFor(difficulty) {
  return STAGES.find(s => difficulty >= s.min && difficulty <= s.max) || STAGES[0];
}
