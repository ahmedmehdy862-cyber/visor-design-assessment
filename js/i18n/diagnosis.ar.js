/* ============================================================
   Arabic diagnosis builder — mirrors js/engine/diagnosis.js
   structure but emits Arabic prose. Display-only.
   ============================================================ */
import { AR } from './content.ar.js';
import { isAr } from './index.js';

function scoreBand(v) {
  if (v === null || v === undefined) return 'untested';
  if (v >= 85) return 'strong';
  if (v >= 70) return 'proficient';
  if (v >= 55) return 'competent';
  if (v >= 40) return 'developing';
  return 'early';
}

const bandKey = (id) => {
  const names = { fundamentals: 'الأسس', typography: 'الطباعة', color: 'الألوان', image: 'الصورة', concept: 'الفكرة', branding: 'الهوية', campaign: 'الحملات', artDirection: 'الإخراج', practice: 'الممارسة', leadership: 'القيادة' };
  return names[id] || id;
};

export function buildDiagnosisAr(classification) {
  const { level, skills, tracks, readiness, contradictions, bands, reasoning } = classification;
  const AL = AR.levelWords;
  const BANDS_LABEL = AR.bandLabels;

  const withScore = skills.filter(s => s.score !== null);
  const sorted = [...withScore].sort((a, b) => b.score - a.score);
  const weakest = [...withScore].sort((a, b) => a.score - b.score).slice(0, 3);
  const strongest = sorted.slice(0, 3);
  const untested = skills.filter(s => s.score === null);

  const topNames = strongest.map(s => bandKey(s.id)).join('، ');
  const primaryTrack = tracks.primary ? (AR.tracks[tracks.primary.id]?.name || tracks.primary.name) : 'مصمم بصري';
  const potential = tracks.potential;

  /* ---- 1: why this level ---- */
  const levelReasons = [];
  const b1 = bands.B1, b3 = bands.B3, b5 = bands.B5;
  if (b1.mastery !== null && b1.mastery >= 70) levelReasons.push(`أدلة الأسس لديك مطبقة بشكل ثابت (الأسس ${Math.round(b1.mastery)})`);
  if (b3.mastery !== null && b3.mastery >= 60) levelReasons.push(`تحلل المشكلات وتختار الحلول بقوة على مستوى التحليل (${Math.round(b3.mastery)})`);
  else if (b3.mastery !== null) levelReasons.push(`قرارات مستوى التحليل ما زالت غير ثابتة (${Math.round(b3.mastery)})`);
  if (b5.mastery !== null) levelReasons.push(`أدلة مستوى التوجيه تبلغ ${Math.round(b5.mastery)} عبر ${b5.n} بند متقدم`);
  else levelReasons.push('لم تُبلغ بنود مستوى التوجيه بثقة كافية');

  let p1 = `أنت تُظهر ${AL[level.id] || 'ملفًا مختلطًا'}. `;
  if (strongest.length) p1 += `أقوى أدلة لديك في ${topNames} (${strongest.map(s => `${bandKey(s.id)} ${Math.round(s.score)}`).join('، ')}). `;
  if (levelReasons.length) p1 += `داخليًا: ${levelReasons.join('؛ ')}.`;

  if (level.borderline) {
    const nextName = AR.levels[level.borderline.id] || level.borderline.with;
    p1 += ` هذا التقدير عند حد ${level.id === 'beginner' ? 'البداية' : 'الأدنى'}: التصنيف باسم ${nextName} محتجز بسبب ${level.borderline.pending.slice(0, 3).map(p => AR.gates[p] || p).join('، ').toLowerCase()}.`;
  }
  if (level.capReason) {
    p1 += ` ${level.capKey && AR.caps[level.capKey] ? AR.caps[level.capKey] : ''}`;
  }

  /* ---- 2: track + readiness ---- */
  let p2 = `مسارك الأساسي يُقيَّم بـ${primaryTrack} (${tracks.primary?.score ?? 0}/100)، ومستقل عن المستوى.`;
  if (tracks.secondary) p2 += ` ملاءمة ثانوية قريبة: ${AR.tracks[tracks.secondary.id]?.name || tracks.secondary.name} (${tracks.secondary.score}).`;
  p2 += ` جاهزية الإخراج الفني ${readiness.total}%`;
  if (potential) p2 += ` — ${potential.label === 'Art Direction' ? 'الإخراج الفني' : potential.label} ${potential.note === 'High Potential' ? 'إمكانات عالية' : 'إمكانات متنامية'}`;
  p2 += `. الجاهزية تُحتسب منفصلة عن المستوى، لذا قد تسبق تصنيفك أو تتأخر عنه.`;

  /* ---- 3: gaps ---- */
  const gapParts = weakest.map(s => `${bandKey(s.id)} (${Math.round(s.score)}, ${BANDS_LABEL[scoreBand(s.score)]})`);
  let p3 = `مجالات تطويرك: ${gapParts.join('، ')}.`;
  if (reasoning?.highDifficulty !== null && reasoning?.highDifficulty !== undefined) {
    p3 += reasoning.highDifficulty >= 0.55
      ? ` تبريرك الكتابي في البنود المتقدمة قوة داعمة (${Math.round(reasoning.highDifficulty * 100)}%) — واصل الدفاع عن القرارات صراحةً في المراجعات.`
      : ` تبريرك في البنود المتقدمة (${Math.round((reasoning.highDifficulty ?? 0) * 100)}%) يتأخر عن اختياراتك — الأدوار العليا تُقيَّم على الدفاع عن القرارات لا انتقاؤها فقط.`;
  }
  if (contradictions.length) {
    const c = contradictions[0];
    const txt = c.key && AR.contradictions[c.key] ? AR.contradictions[c.key] : c.message;
    p3 += ` ملاحظة: ${txt}`;
  }
  if (untested.length) {
    p3 += ` مجالات بلا أدلة كافية بعد: ${untested.map(s => bandKey(s.id)).join('، ')}.`;
  }

  /* ---- next step ---- */
  const nextStep = AR.nextSteps[level.id] || '';

  /* ---- roadmap ---- */
  const targetFloor = level.rank >= 4 ? 74 : level.rank >= 3 ? 72 : 70;
  const roadmap = weakest.map((s, i) => {
    const meta = AR.practice[s.id] || AR.practice.fundamentals;
    const target = Math.min(92, Math.max(targetFloor, Math.round(s.score + 16)));
    return {
      rank: i + 1,
      skill: bandKey(s.id),
      skillId: s.id,
      why: meta.why,
      current: `${Math.round(s.score)} · ${BANDS_LABEL[scoreBand(s.score)]}`,
      currentScore: Math.round(s.score),
      target: `${target} · ${BANDS_LABEL[scoreBand(target)]}`,
      targetScore: target,
      practice: meta.practice,
      challenge: meta.challenge,
    };
  });

  const strongestList = strongest.map(s => ({ name: bandKey(s.id), score: Math.round(s.score) }));
  const developmentList = weakest.map(s => ({ name: bandKey(s.id), score: Math.round(s.score) }));

  return {
    paragraphs: [p1, p2, p3],
    nextStep,
    roadmap,
    strongest: strongestList,
    development: developmentList,
    confidence: classification.confidence,
    confidenceLabel: confidenceLabelAr(classification.confidence),
    explanation: AR.explanations[level.id] || '',
  };
}

function confidenceLabelAr(c) {
  return c >= 0.85 ? 'عالية' : c >= 0.68 ? 'متينة' : 'استرشادية';
}

export const isArabicDiagnosis = isAr;