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
      { id: 'a', title: 'Concept A — “Heritage Luxury”', desc: 'Dates on veined marble with soft gold light and a serif wordmark.', q: .45 },
      { id: 'b', title: 'Concept B — “Strata”', desc: 'Dates arranged in stacked horizontal layers under a single raking light, numbered I–VI.', q: 1 },
      { id: 'c', title: 'Concept C — “Kitchen Moments”', desc: 'Natural-light kitchen scenes with hands preparing desserts.', q: .3 },
    ],
    correct: ['b'],
    purpose: 'Art Direction Candidate–level: constraint compliance + ownability + system extensibility.',
    reasoning: {
      required: [['constraint', 'studio', 'faces', 'brief'], ['system', 'extend', 'series', 'six', 'repeat', 'grammar'], ['own', 'distinct', 'differ', 'marble', 'cliché', 'cliche', 'ownable']],
      anti: [['all good', 'no difference', 'either a or b']],
      max: 14,
      ar: {
        required: [
          ['قيود', 'قيد', 'استوديو', 'وجوه', 'بشري', 'موجز', 'شروط', 'محددات'],
          ['نظام', 'يمتد', 'تمتد', 'ستة', 'ست أجزاء', 'سلسلة', 'يتكرر', 'تنفيذ', 'مفردات', 'قواعد'],
          ['خاص', 'مميز', 'مختلف', 'رخام', 'مبتذل', 'تقليدي', 'مكرر', 'شائع'],
        ],
        anti: [['كلها', 'جيدة', 'لا فرق', 'كلا', 'أيهما']],
      },
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
      { id: 'a', title: 'Align the logo and footer to the same left margin as the headline', desc: '', q: 1 },
      { id: 'b', title: 'Raise the contrast of the small grey metadata (#9A9A9A on near-white)', desc: '', q: 1 },
      { id: 'c', title: 'Rewrite the body line so a single word is not orphaned on its own line', desc: '', q: 1 },
      { id: 'd', title: 'Replace the display serif with a geometric sans', desc: '', q: .1 },
      { id: 'e', title: 'Add a secondary accent colour to the figure', desc: '', q: .15 },
      { id: 'f', title: 'Increase the CTA button size by 20%', desc: '', q: .45 },
    ],
    correct: ['a', 'b', 'c'],
    purpose: 'Senior-level pre-publish judgement: prioritise objective defects over taste preferences.',
    reasoning: {
      required: [['align', 'margin', 'grid', 'baseline'], ['contrast', 'legib', 'read', 'grey', 'gray', 'wcag']],
      anti: [['no changes', 'all fine', 'taste']],
      max: 8,
      ar: {
        required: [
          ['محاذاة', 'هامش', 'شبكة', 'خط أساس', 'تسوية', 'منتظم', 'مضبوط'],
          ['تباين', 'مقروء', 'قراءة', 'رمادي', 'وضوح', 'إضاءة', 'ألوان'],
        ],
        anti: [['لا تغيير', 'لا شيء', 'لا تعديل', 'تمام', 'ذوق', 'جيد']],
      },
    },
  },
];
