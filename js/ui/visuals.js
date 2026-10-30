/* ============================================================
   Visual case renderers.
   Each case is a purpose-built artifact (HTML string) — good,
   intentionally bad, or subtly flawed. Cases are data-driven:
   question bank references them by id.
   Artifact copy is language-aware: renderers switch to Arabic
   when the app is in Arabic mode.
   ============================================================ */
import { isAr } from '../i18n/index.js';

const A = (en, ar) => (isAr() ? ar : en);

/* ---------- Case 1: overcrowded poster ---------- */
function overcrowdedPoster() {
  return `
  <div class="poster bad-poster" role="img" aria-label="${A('Music festival poster', 'ملصق مهرجان موسيقي')}">
    <div class="bp-dots"></div>
    <div class="bp-circle"></div>
    <div class="bp-star">${A('BEST<br>MUSIC<br>2026', 'الأفضل<br>في الموسيقى<br>2026')}</div>
    <div class="bp-badge">${A('FREE<br>ENTRY<br>!!!', 'دخول<br>مجاني<br>!!!')}</div>
    <div class="bp-mast">${A('RIVERSIDE PRESENTS · EST. 2009 · Nº 7', 'يقدم نادي ريفرسايد · تأسس 2009 · العدد 7')}</div>
    <div class="bp-artist">${A('WAVEY<br>SUKI &amp; THE TREES<br>KID MERCURY', 'موجة<br>سوكي والأشجار<br>كيد ميركوري')}</div>
    <div class="bp-price">${A('$40<span>DAY PASS</span>', '$40<span>تذكرة اليوم</span>')}</div>
    <div class="bp-title">${A('CITY <i>SOUND</i><br>FEST<u>مهرجان المدينة الصوتي</u>', 'مهرجان <i>المدينة</i><br>الصوتي<u>CITY SOUND FEST</u>')}</div>
    <div class="bp-dates">${A('AUG 14–16 <span>◆</span> RIVERSIDE PARK <span>◆</span> 40+ ACTS', '١٤–١٦ أغسطس <span>◆</span> حديقة ريفرسايد <span>◆</span> أكثر من 40 فقرة')}</div>
    <div class="bp-line"></div>
    <div class="bp-tip">${A('GATE A · DOORS 16:00', 'البوابة أ · الفتح 16:00')}</div>
    <div class="bp-info">
      ${A(
        `Three days of live music, food trucks, art installations and night markets featuring
      over forty local and international artists across four stages. <b>Buy tickets now at
      citysoundfest.com</b> — group discounts available, kids under 12 free, VIP lounges,
      meet &amp; greet passes, parking zones A–D and shuttle routes from downtown every 15 minutes.`,
        `ثلاثة أيام من الموسيقى الحية وعربات الطعام والمنشآت الفنية والأسواق الليلية، تضم أكثر من
      أربعين فنانًا محليًا ودوليًا على أربع مسارح. <b>اشترِ تذكرتك الآن من citysoundfest.com</b> —
      خصومات مجموعات، دخول مجاني دون 12 سنة، صالات VIP، ومواقف في المناطق أ–د وحافلات من وسط
      المدينة كل 15 دقيقة.`,
      )}
      <div class="bp-row"><span>${A('DAILY 4PM–2AM', 'يوميًا 4ع–2ص')}</span><span>@CITYSOUND</span><span>+1 555 0199</span></div>
    </div>
    <div class="bp-corner">${A('Sponsored by: Radio One · Volt · Mango FM · City Talk', 'برعاية: راديو وان · فولت · مانجو إف إم · سيتي توك')}</div>
  </div>`;
}

/* ---------- Case 2: typography poster ---------- */
function typoPoster() {
  return `
  <div class="typo-poster" role="img" aria-label="${A('Lecture poster', 'ملصق محاضرة')}">
    <div class="tp-kicker">${A('Faculty of Design Presents', 'كلية التصميم تقدم')}</div>
    <div class="tp-head">${A('The Future<br>of <em>Narrative</em><br>Form', 'مستقبل<br><em>السرد</em><br>البصري')}</div>
    <div class="tp-rule"></div>
    <div class="tp-body"><b class="tp-drop">${A('T', 'ت')}</b>${A(
      'his public lecture examines how contemporary typographic systems negotiate meaning across fragmented media environments, arguing that the compositional logic of the page continues to inform <b>screen-based reading practices</b> even as temporal and spatial assumptions about text are continually revised by new interfaces and interaction paradigms.',
      'حلل هذه المحاضرة العامة كيف تتفاوض الأنظمة الطباعية المعاصرة حول المعنى عبر بيئات إعلامية مجزأة، مؤكدة أن المنطق التركيبي للصفحة ما يزال يؤثر في ممارسات القراءة الشاشية حتى مع مراجعة الافتراضات الزمنية والمكانية للنص باستمرار بوساطة الواجهات ونماذج التفاعل الجديدة.',
    )}</div>
    <div class="tp-body">${A(
      'Attendees will encounter a survey of experimental editorial projects, variable type specimens, and archival case studies drawn from regional and international publishing traditions, followed by an open discussion moderated by the faculty committee with participation from invited practitioners and advanced graduate researchers working across print, web, and installation formats.',
      'سيقابل الحضور استعراضًا لمشاريع تحريرية تجريبية ونماذج خطوط متغيرة ودراسات حالة أرشيفية <b>منسّقة</b> من تقاليد نشر إقليمية ودولية، تليها مناقشة مفتوحة يديرها أعضاء اللجنة بمشاركة ممارسين مدعوين وباحثين مرشحين في الدراسات العليا يعملون عبر الطباعة والويب وصيغ العرض التركيبي.',
    )}</div>
    <div class="tp-caps">${A('Open to all students and faculty · No registration required · Refreshments served in the west atrium immediately following the closing remarks of the session', 'مفتوح لجميع الطلاب وأعضاء هيئة التدريس · لا حاجة للتسجيل · تُقدَّم التقديمات في البهو الغربي فور ختام الجلسة')}</div>
    <div class="tp-meta">
      <div>
        <div class="tp-when">${A('19:00 THU', '19:00 الخميس')}</div>
        <div class="tp-venue">${A('Hall C', 'القاعة ج')}</div>
      </div>
      <div class="tp-note">${A('Building 4, Level 2 — enter from the north courtyard. Limited seating; doors close promptly at seven.', 'المبنى 4، الطابق 2 — الدخول من الفناء الشمالي. مقاعد محدودة؛ تُغلق الأبواب عند السابعة تمامًا.')}</div>
    </div>
  </div>`;
}

/* ---------- Case 3: color directions ---------- */
function colorDirections() {
  const dir = (cls, tag, kicker, name, sub, pill) => `
    <div class="color-dir ${cls}">
      <span class="cd-tag">${A('DIR', 'اتجاه')} ${tag}</span>
      <div class="cd-blob"></div><div class="cd-blob2"></div>
      <div class="cd-inner">
        <div class="cd-kicker">${kicker}</div>
        <div class="cd-name">${name}</div>
        <div class="cd-sub">${sub}</div>
        <div class="cd-pill">${pill}</div>
      </div>
      <div class="cd-pack"><div class="cd-face"><span class="cd-mark">S</span></div><div class="cd-cap"></div></div>
      <div class="cd-sw"><i></i><i></i><i></i><i></i></div>
    </div>`;
  const kicker = A('ORGANIC · AGES 4–8', 'عضوي · أعمار 4–8');
  const sub = A('Soft-baked fruit snacks with nothing to hide.', 'وجبة فواكه مخبوزة طريّة بلا إخفاء.');
  const pill = A('CERTIFIED ORGANIC', 'عضوي معتمد');
  return `
  <div class="case-stage" role="img" aria-label="${A('Three packaging color directions for a fruit snack brand', 'ثلاثة اتجاهات لونية للتغليف لعلامة وجبة فواكه')}">
    <div class="case-col">${dir('dir-a', 'A', kicker, 'Sprout<br>Bites', sub, pill)}
      <div class="case-tag" style="margin-top:8px">${A('Direction A', 'الاتجاه أ')}</div></div>
    <div class="case-col">${dir('dir-b', 'B', kicker, 'Sprout<br>Bites', sub, pill)}
      <div class="case-tag" style="margin-top:8px">${A('Direction B', 'الاتجاه ب')}</div></div>
    <div class="case-col">${dir('dir-c', 'C', kicker, 'Sprout<br>Bites', sub, pill)}
      <div class="case-tag" style="margin-top:8px">${A('Direction C', 'الاتجاه ج')}</div></div>
  </div>`;
}

/* ---------- Case 4: composition layouts ---------- */
const LAYOUT_MINIS = {
  layA: '<div class="layout-mini lay-a"><i class="t1 k"></i><i class="t2"></i><i class="t3"></i><i class="m1 g"></i><i class="t4"></i><i class="t5"></i><i class="t6"></i></div>',
  layB: '<div class="layout-mini lay-b"><i class="t1 k"></i><i class="t2"></i><i class="m1 a"></i><i class="t3"></i><i class="t4"></i><i class="g1"></i><i class="t5 k"></i><i class="t6"></i><i class="t7"></i><i class="t8 k"></i></div>',
  layC: '<div class="layout-mini lay-c"><i class="m1 g"></i><i class="t1 k"></i><i class="t2"></i><i class="m2 g"></i><i class="t3 k"></i><i class="t4"></i><i class="m3 g"></i><i class="t5 k"></i><i class="t6"></i></div>',
  layD: '<div class="layout-mini lay-d"><i class="m1 a"></i><i class="t1 k"></i><i class="t2"></i><i class="t3"></i><i class="t4"></i><i class="t5"></i><i class="t6 k"></i></div>',
};

/* ---------- Case 5: brand identity system ---------- */
function brandSystem() {
  return `
  <div class="brand-system" role="img" aria-label="${A('Nord Kaffee brand identity system — logo, colours, type', 'نظام هوية نورد كافيه — الشعار والألوان والخطوط')}">
    <div class="bs-title">${A('Identity System — Nord Kaffee', 'نظام الهوية — نورد كافيه')}</div>
    <div class="bs-grid">
      <div class="bs-logo">NORD<i>·</i>KAFFEE</div>
      <div class="bs-sw"><span></span><span></span><span></span><span></span></div>
      <div class="bs-type">Archivo 800 / IBM Plex Mono 500</div>
      <div class="bs-note">${A('Logo: navy or rust only · clearspace = cap-height', 'الشعار: كحلي أو صدئ فقط · المساحة الآمنة = ارتفاع الحرف')}</div>
    </div>
    <div class="bs-bar">
      <div class="bs-lockup"><div class="bs-logo">NORD<i>·</i>KAFFEE</div><span>${A('HARBOUR ROASTERY · EST 2009', 'محمصة الميناء · تأسست 2009')}</span></div>
      <div class="bs-scale"><i class="k1"></i><i class="k2"></i><i class="k3"></i></div>
      <div class="bs-mg">N<s>N</s></div>
    </div>
  </div>`;
}

function brandApplications() {
  return `
  <div class="apps-grid" role="img" aria-label="${A('Nord Kaffee brand applied to card, poster, social, packaging and envelope', 'تطبيقات هوية نورد كافيه على بطاقة وملصق وسوشيال وتغليف وظرف')}">
    <div class="app-tile">
      <div class="app-card"><div class="bc"><div class="bs-logo">NORD<i>·</i>KAFFEE</div></div></div>
      <div class="app-label">${A('A · Business card', 'أ · بطاقة العمل')}</div>
    </div>
    <div class="app-tile">
      <div class="app-poster">
        <div class="ap-logo">NORD<i>·</i>KAFFEE</div>
        <div class="ap-head">${A('Single<br>Origin<br>Autumn', 'منتج<br>واحد<br>خريف')}</div>
        <div class="ap-body">${A('Washed Yirgacheffe, roasted weekly in small batches at our harbour roastery.', 'اليِرغاشيف المغسولة، محمّصة أسبوعيًا بدفعات صغيرة في محمصتنا بالميناء.')}</div>
        <div class="ap-rule"></div>
        <div class="ap-arch"></div>
        <div class="ap-foot">NORDKAFFEE.CO</div>
      </div>
      <div class="app-label">${A('B · In-store poster', 'ب · الملصق داخل المتجر')}</div>
    </div>
    <div class="app-tile">
      <div class="app-social">
        <div class="as-logo">NORD<i>·</i>KAFFEE</div>
        <div class="as-head">Brew<br>Notes<br>No. 12</div>
        <div class="as-sub">${A('FILTER GUIDE →', 'دليل الفلتر ←')}</div>
      </div>
      <div class="app-label">${A('C · Social post', 'ج · منشور السوشيال')}</div>
    </div>
    <div class="app-tile">
      <div class="app-pack">
        <div class="pk">
          <div class="pk-lid"></div>
          <div class="bs-logo">NORD<i>·</i>KAFFEE</div>
          <div class="pk-line">250 G · WHOLE BEAN</div>
          <div class="pk-band"></div>
        </div>
      </div>
      <div class="app-label">${A('D · Packaging', 'د · التغليف')}</div>
    </div>
    <div class="app-tile">
      <div class="app-env">
        <div class="ae-flap"></div>
        <div class="ae-face">
          <div class="ae-mg">N</div>
          <div class="ae-addr"><i></i><i></i><i></i></div>
        </div>
      </div>
      <div class="app-label">${A('E · Envelope', 'هـ · الظرف')}</div>
    </div>
  </div>`;
}

/* ---------- Case 6: campaign directions ---------- */
function campaignDirections() {
  const card = (id, cls, name, desc) => `
    <div class="case-col wide" style="max-width:300px">
      <div class="dir-card">
        <div class="dir-art ${cls}">
          ${id === 'A' ? `<div class="warn">${A('⚠ Platform Data', '⚠ بيانات المنصة')}</div><div class="stat">73%<span>${A('of incidents involve phone distraction on platforms', 'من الحوادث سببها تشتيت الهاتف على المنصات')}</span></div><div class="a6-phone"><div class="a6-g"></div><div class="a6-g"></div><b>!</b></div>` : ''}
          ${id === 'B' ? `<div class="sign stn">${A('LINE 3 · PLATFORM 1', 'الخط 3 · المنصة 1')} →</div><div class="sign">${A('Your stop<br>is not<br>where you<br>look.', 'محطتك<br>ليست<br>حيث<br>تنظر.')}</div><div class="sign alt">${A('Heads up,<br>heads up.', 'انتبه،<br>انتبه.')}</div><div class="sign mut">${A('Stand behind the yellow line →', 'قف خلف الخط الأصفر ←')}</div><div class="arrow">→</div>` : ''}
          ${id === 'C' ? `<div class="lamp"></div><div class="ppl"><i></i><i></i><i></i></div><div class="cap">${A('Ride together. Arrive smiling.', 'اركبوا معًا. تصلون مبتسمين.')}</div>` : ''}
        </div>
        <div class="dir-meta">
          <div class="dm-name">${A('Direction', 'الاتجاه')} ${id}</div>
          <div class="dm-desc">${name}</div>
          <div class="dm-desc">${desc}</div>
        </div>
      </div>
      <div class="case-tag" style="margin-top:8px">${id}</div>
    </div>`;
  return `<div class="case-stage" role="img" aria-label="${A('Three metro safety campaign directions', 'ثلاثة اتجاهات لحملة سلامة المترو')}">
    ${card('A', 'dir-a6', A('“The Numbers” — data-led warning creative.', '«الأرقام» — إبداع تحذيري مبني على البيانات.'), A('Large incident statistics over dark platform photography, red alarm palette.', 'إحصاءات حوادث كبيرة فوق صور منصة داكنة مع لوحة إنذار حمراء.'))}
    ${card('B', 'dir-b6', A('“Read the Room” — signage-derived typographic system.', '«اقرأ المكان» — نظام هجائي مستلهم من اللافتات.'), A('Modular message blocks built like metro wayfinding signage; high contrast.', 'كتل رسائل معيارية مبنية على منطق لافتات المترو؛ تباين عالٍ.'))}
    ${card('C', 'dir-c6', A('“Good Journeys” — lifestyle community creative.', '«رحلات سعيدة» — إبداع لايف ستايل مجتمعي.'), A('Warm, glossy commuter moments with a friendly tagline.', 'لحظات ركاب دافئة لامعة مع شعار ودّي.'))}
  </div>`;
}

/* ---------- Case 7: art direction concepts ---------- */
function artDirectionConcepts() {
  const card = (id, cls, name, desc) => `
    <div class="case-col wide" style="max-width:300px">
      <div class="dir-card">
        <div class="dir-art ${cls}">
          ${id === 'A' ? `<div class="gold">${A('Maison Khidr', 'بيت خضر')}</div><div class="marble"><div class="dates"><i></i><i></i><i></i></div></div><div class="seal"><b>K</b></div>` : ''}
          ${id === 'B' ? `<div class="strata"><i></i><i></i><i></i><i></i></div><div class="beam"></div><div class="series">${A('Terroir Series · I–VI', 'سلسلة التراسل · I–VI')}</div><div class="idx">01/06</div>` : ''}
          ${id === 'C' ? `<div class="win"></div><div class="bowl"></div><div class="hand"></div><div class="tag">${A('Chef-approved, daily.', 'يوافق عليه الطهاة، يوميًا.')}</div>` : ''}
        </div>
        <div class="dir-meta">
          <div class="dm-name">${A('Concept', 'المفهوم')} ${id}</div>
          <div class="dm-desc">${name}</div>
          <div class="dm-desc">${desc}</div>
        </div>
      </div>
      <div class="case-tag" style="margin-top:8px">${id}</div>
    </div>`;
  return `<div class="case-stage" role="img" aria-label="${A('Three art direction concepts for a dates brand', 'ثلاثة مفاهيم إخراج فني لعلامة تمر')}">
    ${card('A', 'dir-a7', A('“Heritage Luxury”.', '«الفخامة التراثية».'), A('Dates on veined marble, soft gold light, serif wordmark.', 'تمر على رخام بالأوردة وإضاءة ذهبية ناعمة وشعار سيريف.'))}
    ${card('B', 'dir-b7', A('“Strata”.', '«الطبقات».'), A('Dates arranged as stacked horizontal layers under one raking light, numbered I–VI.', 'تمر مصفوفة كطبقات أفقية متراصة تحت ضوء جانبي واحد، مرقمة من الأول إلى السادس.'))}
    ${card('C', 'dir-c7', A('“Kitchen Moments”.', '«لحظات المطبخ».'), A('Natural-light kitchen scenes with hands preparing desserts.', 'مشاهد مطبخ بإضاءة طبيعية بأيدٍ تحضّر الحلويات.'))}
  </div>`;
}

/* ---------- Case 8: near-finished poster ---------- */
function reviewPoster() {
  return `
  <div class="review-poster" role="img" aria-label="${A('Event poster awaiting final review', 'ملصق حدث بانتظار المراجعة النهائية')}">
    <div class="rp-logo">${A('TYPE<i>&amp;</i>TASTE', 'نوع<i>&amp;</i>ذوق')}</div>
    <div class="rp-serial">Nº 014</div>
    <div class="rp-cross"></div>
    <div class="rp-cross cr2"></div>
    <div class="rp-figure"></div>
    <div class="rp-kicker">${A('Design Meetup · Vol. 14', 'لقاء التصميم · العدد 14')}</div>
    <div class="rp-head">${A('Design that<br>sells, and<br>still <em>means</em><br>something', 'تصميم يبيع<br>وما يزال<br><em>يعني</em><br>شيئًا')}</div>
    <div class="rp-body">${A('An evening on the craft of detail — three talks on pricing, portfolio and the quiet discipline of the craft of detail.', 'أمسية عن حِرفة التفاصيل — ثلاث محاضرات عن التسعير والمعرض والانضباط الهادئ لحِرفة التفاصيل.')}</div>
    <div class="rp-rule"></div>
    <div class="rp-foot">
      <div class="rp-cta">${A('Reserve a seat', 'احجز مقعدك')}</div>
      <div class="rp-meta">${A('THU 12 NOV · 19:00<br>LOFT STUDIO, FLOOR 3', 'الخميس 12 نوفمبر · 19:00<br>استوديو لوفت، الطابق 3')}</div>
    </div>
    <div class="rp-print"></div>
  </div>`;
}

/* ---------- Solution minis for Case 1 / Case 4 options ---------- */
const MINIS = {
  hier: '<div class="mini mini-hier"><i class="b ink h1"></i><i class="b h2"></i><i class="b h3"></i><i class="b h4"></i><i class="b soft h5"></i><i class="b acc h6"></i><i class="b h7"></i></div>',
  color: '<div class="mini mini-color"><i class="b h1"></i><i class="b h2"></i><i class="b h3"></i><i class="b h4"></i><i class="b h5"></i><i class="b h6"></i></div>',
  scale: '<div class="mini mini-scale"><i class="b h1"></i><i class="b h2"></i><i class="b h3"></i><i class="b h4"></i><i class="b h5"></i></div>',
  deco: '<div class="mini mini-deco"><i class="b ink h1"></i><i class="b d1"></i><i class="b d2"></i><i class="b d3"></i><i class="b d4"></i><i class="b h2"></i></div>',
};

const LAYOUT_TAG = (en, ar) => A(en, ar);

export const VISUALS = {
  case1: overcrowdedPoster,
  case2: typoPoster,
  case3: colorDirections,
  case4: () => `<div class="case-stage" role="img" aria-label="${A('Four editorial layout options shown as wireframe thumbnails', 'أربعة تركيبات تحريرية معروضة كرسوم تخطيطية')}">
      <div class="case-col"><div class="thumb-frame">${LAYOUT_MINIS.layA}</div><div class="case-tag" style="margin-top:8px">${LAYOUT_TAG('Layout A', 'التركيب أ')}</div></div>
      <div class="case-col"><div class="thumb-frame">${LAYOUT_MINIS.layB}</div><div class="case-tag" style="margin-top:8px">${LAYOUT_TAG('Layout B', 'التركيب ب')}</div></div>
      <div class="case-col"><div class="thumb-frame">${LAYOUT_MINIS.layC}</div><div class="case-tag" style="margin-top:8px">${LAYOUT_TAG('Layout C', 'التركيب ج')}</div></div>
      <div class="case-col"><div class="thumb-frame">${LAYOUT_MINIS.layD}</div><div class="case-tag" style="margin-top:8px">${LAYOUT_TAG('Layout D', 'التركيب د')}</div></div>
    </div>`,
  case5: () => brandSystem() + brandApplications(),
  case6: campaignDirections,
  case7: artDirectionConcepts,
  case8: reviewPoster,
};

export const OPTION_VISUALS = {
  ...MINIS,
  layA: LAYOUT_MINIS.layA, layB: LAYOUT_MINIS.layB, layC: LAYOUT_MINIS.layC, layD: LAYOUT_MINIS.layD,
};

export function renderVisual(key) {
  const fn = VISUALS[key];
  return fn ? fn() : '';
}
export function renderOptionVisual(key) {
  const html = OPTION_VISUALS[key];
  return html ? `<div class="thumb-frame">${html}</div>` : '';
}