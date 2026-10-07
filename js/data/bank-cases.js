/* ============================================================
   QUESTION BANK — visual case items (Part B).
   Separated from core to demonstrate modular, expandable
   banks (an admin can register additional bank files).
   ============================================================ */

export const CASE_QUESTIONS = [

  /* ---------- Case 7 — Art Direction ---------- */
  {
    id: 'ad-05', skill: 'artDirection', difficulty: 7, type: 'choice',
    visual: 'case7',
    title: 'Case Study 7 — Art Direction',
    brief: {
      label: 'Campaign brief',
      text: '“KHIDR” — premium date brand launching a new line in the EU. Audience: 30–50 food-culture enthusiasts and specialty retailers. Objective: launch awareness with a distinctive point of view. Constraints: studio photography only, no human faces, must extend to at least six executions. Competitive set is dominated by marble-and-gold luxury codes.',
    },
    prompt: 'Which concept should become the campaign’s art direction?',
    options: [
      { id: 'a', title: 'Concept A — “Heritage Luxury”', desc: 'Marble, gold light, serif wordmark: premium and safe, but occupies exactly the territory competitors already own — no ownable point of view.', q: .45 },
      { id: 'b', title: 'Concept B — “Strata”', desc: 'Dates staged as geological layers under a single hard raking light: meets every constraint, creates a distinctive and instantly recognisable visual grammar, and extends naturally to six numbered executions.', q: 1 },
      { id: 'c', title: 'Concept C — “Kitchen Moments”', desc: 'Natural-light kitchen scenes with hands: warm, but violates the studio-only constraint and reads as generic food-lifestyle.', q: .3 },
    ],
    correct: ['b'],
    purpose: 'Art Direction Candidate–level: constraint compliance + ownability + system extensibility.',
    reasoning: {
      required: [['constraint', 'studio', 'faces', 'brief'], ['system', 'extend', 'series', 'six', 'repeat', 'grammar'], ['own', 'distinct', 'differ', 'marble', 'cliché', 'cliche', 'ownable']],
      anti: [['all good', 'no difference', 'either a or b']],
      max: 14,
    },
  },

  /* ---------- Case 8 — Visual Review ---------- */
  {
    id: 'ad-06', skill: 'artDirection', difficulty: 5, type: 'multi',
    visual: 'case8',
    title: 'Case Study 8 — Final Review',
    brief: {
      label: 'Task',
      text: 'This poster publishes tomorrow morning. It is 95% finished. Select the three changes you would make before publishing.',
    },
    prompt: 'Which 3 changes would you make before publishing?',
    options: [
      { id: 'a', title: 'Align the logo and footer to the same left margin as the headline', desc: 'The logo and footer sit 9px inside the content margin — the grid breaks at top and bottom.', q: 1 },
      { id: 'b', title: 'Raise the contrast of the small grey metadata (#9A9A9A on near-white)', desc: 'Roughly 2.7:1 — date and venue fail basic legibility for a functional detail.', q: 1 },
      { id: 'c', title: 'Rewrite the body line so a single word is not orphaned on its own line', desc: '“…the craft of detail.” lands alone; the copy also repeats “craft of detail” — a production error.', q: 1 },
      { id: 'd', title: 'Replace the display serif with a geometric sans', desc: 'The typeface choice itself is the problem.', q: .1 },
      { id: 'e', title: 'Add a secondary accent colour to the figure', desc: 'The composition needs more energy.', q: .15 },
      { id: 'f', title: 'Increase the CTA button size by 20%', desc: 'The call to action should dominate.', q: .45 },
    ],
    correct: ['a', 'b', 'c'],
    purpose: 'Senior-level pre-publish judgement: prioritise objective defects over taste preferences.',
    reasoning: {
      required: [['align', 'margin', 'grid', 'baseline'], ['contrast', 'legib', 'read', 'grey', 'gray', 'wcag']],
      anti: [['no changes', 'all fine', 'taste']],
      max: 8,
    },
  },
];
