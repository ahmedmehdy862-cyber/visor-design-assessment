/* ============================================================
   Visual case renderers.
   Each case is a purpose-built artifact (HTML string) — good,
   intentionally bad, or subtly flawed. Cases are data-driven:
   question bank references them by id.
   ============================================================ */

/* ---------- Case 1: overcrowded poster ---------- */
function overcrowdedPoster() {
  return `
  <div class="poster bad-poster" role="img" aria-label="Overcrowded music festival poster with competing colors, multiple focal points and weak hierarchy">
    <div class="bp-dots"></div>
    <div class="bp-circle"></div>
    <div class="bp-star">BEST<br>MUSIC<br>2026</div>
    <div class="bp-badge">FREE<br>ENTRY<br>!!!</div>
    <div class="bp-title">CITY <i>SOUND</i><br>FEST<u>مهرجان المدينة الصوتي</u></div>
    <div class="bp-dates">AUG 14–16 <span>◆</span> RIVERSIDE PARK <span>◆</span> 40+ ACTS</div>
    <div class="bp-line"></div>
    <div class="bp-info">
      Three days of live music, food trucks, art installations and night markets featuring
      over forty local and international artists across four stages. <b>Buy tickets now at
      citysoundfest.com</b> — group discounts available, kids under 12 free, VIP lounges,
      meet &amp; greet passes, parking zones A–D and shuttle routes from downtown every 15 minutes.
      <div class="bp-row"><span>DAILY 4PM–2AM</span><span>@CITYSOUND</span><span>+1 555 0199</span></div>
    </div>
    <div class="bp-corner">Sponsored by: Radio One · Volt · Mango FM · City Talk</div>
  </div>`;
}

/* ---------- Case 2: typography poster ---------- */
function typoPoster() {
  return `
  <div class="typo-poster" role="img" aria-label="Lecture poster with typographic issues">
    <div class="tp-kicker">Faculty of Design Presents</div>
    <div class="tp-head">The Future<br>of <em>Narrative</em><br>Form</div>
    <div class="tp-rule"></div>
    <div class="tp-body">This public lecture examines how contemporary typographic systems negotiate meaning across fragmented media environments, arguing that the compositional logic of the page continues to inform screen-based reading practices even as temporal and spatial assumptions about text are continually revised by new interfaces and interaction paradigms.</div>
    <div class="tp-body">Attendees will encounter a survey of experimental editorial projects, variable type specimens, and archival case studies drawn from regional and international publishing traditions, followed by an open discussion moderated by the faculty committee with participation from invited practitioners and advanced graduate researchers working across print, web, and installation formats.</div>
    <div class="tp-caps">Open to all students and faculty · No registration required · Refreshments served in the west atrium immediately following the closing remarks of the session</div>
    <div class="tp-meta">
      <div>
        <div class="tp-when">19:00 THU</div>
        <div class="tp-venue">Hall C</div>
      </div>
      <div class="tp-note">Building 4, Level 2 — enter from the north courtyard. Limited seating; doors close promptly at seven.</div>
    </div>
  </div>`;
}

/* ---------- Case 3: color directions ---------- */
function colorDirections() {
  const dir = (cls, tag, kicker, name, sub, pill) => `
    <div class="color-dir ${cls}">
      <span class="cd-tag">${tag}</span>
      <div class="cd-blob"></div><div class="cd-blob2"></div>
      <div class="cd-inner">
        <div class="cd-kicker">${kicker}</div>
        <div class="cd-name">${name}</div>
        <div class="cd-sub">${sub}</div>
        <div class="cd-pill">${pill}</div>
      </div>
      <div class="cd-sw"><i></i><i></i><i></i><i></i></div>
    </div>`;
  return `
  <div class="case-stage">
    <div class="case-col">${dir('dir-a', 'A', 'ORGANIC · AGES 4–8', 'Sprout<br>Bites', 'Soft-baked fruit snacks with nothing to hide.', 'CERTIFIED ORGANIC')}
      <div class="case-tag" style="margin-top:8px">Direction A</div></div>
    <div class="case-col">${dir('dir-b', 'B', 'ORGANIC · AGES 4–8', 'Sprout<br>Bites', 'Soft-baked fruit snacks with nothing to hide.', 'CERTIFIED ORGANIC')}
      <div class="case-tag" style="margin-top:8px">Direction B</div></div>
    <div class="case-col">${dir('dir-c', 'C', 'ORGANIC · AGES 4–8', 'Sprout<br>Bites', 'Soft-baked fruit snacks with nothing to hide.', 'CERTIFIED ORGANIC')}
      <div class="case-tag" style="margin-top:8px">Direction C</div></div>
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
  <div class="brand-system">
    <div class="bs-title">Identity System — Nord Kaffee</div>
    <div class="bs-grid">
      <div class="bs-logo">NORD<i>·</i>KAFFEE</div>
      <div class="bs-sw"><span></span><span></span><span></span><span></span></div>
      <div class="bs-type">Archivo 800 / IBM Plex Mono 500</div>
      <div class="bs-note">Logo: navy or rust only · clearspace = cap-height</div>
    </div>
  </div>`;
}

function brandApplications() {
  return `
  <div class="apps-grid">
    <div class="app-tile">
      <div class="app-card"><div class="bc"><div class="bs-logo">NORD<i>·</i>KAFFEE</div></div></div>
      <div class="app-label">A · Business card</div>
    </div>
    <div class="app-tile">
      <div class="app-poster">
        <div class="ap-logo">NORD<i>·</i>KAFFEE</div>
        <div class="ap-head">Single<br>Origin<br>Autumn</div>
        <div class="ap-body">Washed Yirgacheffe, roasted weekly in small batches at our harbour roastery.</div>
        <div class="ap-arch"></div>
        <div class="ap-foot">NORDKAFFEE.CO</div>
      </div>
      <div class="app-label">B · In-store poster</div>
    </div>
    <div class="app-tile">
      <div class="app-social">
        <div class="as-logo">NORD<i>·</i>KAFFEE</div>
        <div class="as-head">Brew<br>Notes<br>No. 12</div>
        <div class="as-sub">FILTER GUIDE →</div>
      </div>
      <div class="app-label">C · Social post</div>
    </div>
    <div class="app-tile">
      <div class="app-pack">
        <div class="pk">
          <div class="bs-logo">NORD<i>·</i>KAFFEE</div>
          <div class="pk-line">250 G · WHOLE BEAN</div>
          <div class="pk-band"></div>
        </div>
      </div>
      <div class="app-label">D · Packaging</div>
    </div>
  </div>`;
}

/* ---------- Case 6: campaign directions ---------- */
function campaignDirections() {
  const card = (id, cls, name, desc) => `
    <div class="case-col wide" style="max-width:300px">
      <div class="dir-card">
        <div class="dir-art ${cls}">
          ${id === 'A' ? '<div class="warn">⚠ Platform Data</div><div class="stat">73%<span>of incidents involve phone distraction on platforms</span></div>' : ''}
          ${id === 'B' ? '<div class="sign">Your stop<br>is not<br>where you<br>look.</div><div class="sign alt">Heads up,<br>heads up.</div><div class="sign mut">Stand behind the yellow line →</div><div class="arrow">→</div>' : ''}
          ${id === 'C' ? '<div class="lamp"></div><div class="ppl"><i></i><i></i><i></i></div><div class="cap">Ride together. Arrive smiling.</div>' : ''}
        </div>
        <div class="dir-meta">
          <div class="dm-name">Direction ${id}</div>
          <div class="dm-desc">${name}</div>
          <div class="dm-desc">${desc}</div>
        </div>
      </div>
      <div class="case-tag" style="margin-top:8px">${id}</div>
    </div>`;
  return `<div class="case-stage">
    ${card('A', 'dir-a6', '“The Numbers’ — data-led warning creative.', 'Large incident statistics over dark platform photography, red alarm palette.')}
    ${card('B', 'dir-b6', '“Read the Room’ — signage-derived typographic system.', 'Modular message blocks built from metro wayfinding logic; high-contrast, ownable, endlessly extensible.')}
    ${card('C', 'dir-c6', '“Good Journeys’ — lifestyle community creative.', 'Warm, glossy commuter moments with a friendly tagline.')}
  </div>`;
}

/* ---------- Case 7: art direction concepts ---------- */
function artDirectionConcepts() {
  const card = (id, cls, name, desc) => `
    <div class="case-col wide" style="max-width:300px">
      <div class="dir-card">
        <div class="dir-art ${cls}">
          ${id === 'A' ? '<div class="gold">Maison Khidr</div><div class="marble"><div class="dates"><i></i><i></i><i></i></div></div>' : ''}
          ${id === 'B' ? '<div class="strata"><i></i><i></i><i></i><i></i></div><div class="beam"></div><div class="series">Terroir Series · I–VI</div><div class="idx">01/06</div>' : ''}
          ${id === 'C' ? '<div class="win"></div><div class="bowl"></div><div class="hand"></div><div class="tag">Chef-approved, daily.</div>' : ''}
        </div>
        <div class="dir-meta">
          <div class="dm-name">Concept ${id}</div>
          <div class="dm-desc">${name}</div>
          <div class="dm-desc">${desc}</div>
        </div>
      </div>
      <div class="case-tag" style="margin-top:8px">${id}</div>
    </div>`;
  return `<div class="case-stage">
    ${card('A', 'dir-a7', '“Heritage Luxury”.', 'Dates on veined marble, soft gold light, serif wordmark. Classic premium food-luxury codes.')}
    ${card('B', 'dir-b7', '“Strata”.', 'Dates staged as geological layers under one hard raking light — a repeatable still-life system with numbered executions.')}
    ${card('C', 'dir-c7', '“Kitchen Moments”.', 'Natural-light kitchen scenes with hands preparing desserts and a warm lifestyle tagline.')}
  </div>`;
}

/* ---------- Case 8: near-finished poster ---------- */
function reviewPoster() {
  return `
  <div class="review-poster" role="img" aria-label="Event poster awaiting final review">
    <div class="rp-logo">TYPE<i>&amp;</i>TASTE</div>
    <div class="rp-serial">Nº 014</div>
    <div class="rp-figure"></div>
    <div class="rp-kicker">Design Meetup · Vol. 14</div>
    <div class="rp-head">Design that<br>sells, and<br>still <em>means</em><br>something</div>
    <div class="rp-body">An evening on the craft of detail — three talks on pricing, portfolio and the quiet discipline of the craft of detail.</div>
    <div class="rp-rule"></div>
    <div class="rp-foot">
      <div class="rp-cta">Reserve a seat</div>
      <div class="rp-meta">THU 12 NOV · 19:00<br>LOFT STUDIO, FLOOR 3</div>
    </div>
  </div>`;
}

/* ---------- Solution minis for Case 1 / Case 4 options ---------- */
const MINIS = {
  hier: '<div class="mini mini-hier"><i class="b ink h1"></i><i class="b h2"></i><i class="b h3"></i><i class="b h4"></i><i class="b soft h5"></i><i class="b acc h6"></i><i class="b h7"></i></div>',
  color: '<div class="mini mini-color"><i class="b h1"></i><i class="b h2"></i><i class="b h3"></i><i class="b h4"></i><i class="b h5"></i><i class="b h6"></i></div>',
  scale: '<div class="mini mini-scale"><i class="b h1"></i><i class="b h2"></i><i class="b h3"></i><i class="b h4"></i><i class="b h5"></i></div>',
  deco: '<div class="mini mini-deco"><i class="b ink h1"></i><i class="b d1"></i><i class="b d2"></i><i class="b d3"></i><i class="b d4"></i><i class="b h2"></i></div>',
};

export const VISUALS = {
  case1: overcrowdedPoster,
  case2: typoPoster,
  case3: colorDirections,
  case4: () => `<div class="case-stage">
      <div class="case-col"><div class="thumb-frame">${LAYOUT_MINIS.layA}</div><div class="case-tag" style="margin-top:8px">Layout A</div></div>
      <div class="case-col"><div class="thumb-frame">${LAYOUT_MINIS.layB}</div><div class="case-tag" style="margin-top:8px">Layout B</div></div>
      <div class="case-col"><div class="thumb-frame">${LAYOUT_MINIS.layC}</div><div class="case-tag" style="margin-top:8px">Layout C</div></div>
      <div class="case-col"><div class="thumb-frame">${LAYOUT_MINIS.layD}</div><div class="case-tag" style="margin-top:8px">Layout D</div></div>
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
