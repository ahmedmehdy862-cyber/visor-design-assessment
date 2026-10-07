/* ============================================================
   QUESTION BANK — core (non-case) items.
   Fully data-driven: skill, difficulty, purpose, scoring
   quality per option, reasoning rubrics.

   Schema
   ------------------------------------------------------------
   id         unique
   skill      one of SKILLS[].id
   difficulty 1..7  (drives adaptive routing + score weighting)
   type       'choice' | 'multi'
   visual     optional visual-case id (see visuals.js)
   prompt     question text
   brief      optional { label, text } context block
   options[]  { id, title, desc?, v? (mini visual), q: 0..1 }
   correct[]  option ids
   reasoning  optional { required:[synonymGroups], anti:[groups], max }
   purpose    internal: what this item measures
   active     admin toggle
   ============================================================ */

export const CORE_QUESTIONS = [

  /* ---------------- A. DESIGN FUNDAMENTALS ---------------- */
  {
    id: 'fu-01', skill: 'fundamentals', difficulty: 1, type: 'choice',
    prompt: 'A flyer has a headline, a photo and a date block — all set at the same size and weight. What is missing?',
    options: [
      { id: 'a', title: 'Visual hierarchy', desc: 'A clear order of importance between the elements.', q: 1 },
      { id: 'b', title: 'A grid system', desc: 'Underlying columns to align elements to.', q: .45 },
      { id: 'c', title: 'More colour contrast', desc: 'Additional hues to separate the elements.', q: .4 },
      { id: 'd', title: 'A second typeface', desc: 'Font variety to create interest.', q: .2 },
    ],
    correct: ['a'],
    purpose: 'Baseline: recognises hierarchy as the primary structural requirement.',
  },
  {
    id: 'fu-02', skill: 'fundamentals', difficulty: 2, type: 'choice',
    prompt: 'Two elements in a layout must feel related. What is the most reliable way to signal that?',
    options: [
      { id: 'a', title: 'Consistent alignment and spacing', desc: 'They share an edge and a consistent gap from neighbours.', q: 1 },
      { id: 'b', title: 'Give them the same colour', desc: 'Matching fill colour implies relationship.', q: .55 },
      { id: 'c', title: 'Place them next to each other', desc: 'Physical proximity alone is enough.', q: .5 },
      { id: 'd', title: 'Outline both with a border', desc: 'A visible frame marks them as a pair.', q: .25 },
    ],
    correct: ['a'],
    purpose: 'Proximity vs alignment: understands Gestalt grouping beyond decoration.',
  },
  {
    id: 'fu-03', skill: 'fundamentals', difficulty: 3, type: 'choice',
    visual: 'case1',
    title: 'Case Study 1 — Overcrowded Poster',
    brief: { label: 'Context', text: 'A local festival poster produced in-house. The organiser complains that “people don’t know where to look” and engagement with the poster is poor.' },
    prompt: 'What is the most important problem to fix first?',
    options: [
      { id: 'a', title: 'There is no single dominant focal point', desc: 'The headline, starburst, badge, date bar and body block all compete at similar intensity — the eye has no entry point.', q: 1 },
      { id: 'b', title: 'The colour palette is too loud', desc: 'Recolour the poster with a calmer, more limited palette.', q: .55 },
      { id: 'c', title: 'The body copy is too small', desc: 'Increase all secondary text sizes.', q: .4 },
      { id: 'd', title: 'There are not enough elements', desc: 'Add more content to fill the empty corners.', q: .05 },
    ],
    correct: ['a'],
    purpose: 'Prioritisation: identifies hierarchy failure as the root problem over surface styling.',
  },
  {
    id: 'fu-04', skill: 'fundamentals', difficulty: 4, type: 'choice',
    visual: 'case1',
    title: 'Case Study 1 — Choosing the Fix',
    brief: { label: 'Constraint', text: 'You can make exactly one structural intervention before the poster goes to print tomorrow morning.' },
    prompt: 'Which single intervention most improves this poster?',
    options: [
      { id: 'a', title: 'Establish a hierarchy: one dominant headline, demote everything else', desc: 'Restructure scale, weight and spacing so one element wins; reduce secondary elements to supporting roles.', v: 'hier', q: 1 },
      { id: 'b', title: 'Keep the structure, replace the palette', desc: 'Swap red/blue/yellow for a quieter three-colour scheme.', v: 'color', q: .45 },
      { id: 'c', title: 'Scale every element up for impact', desc: 'Increase type sizes across the board.', v: 'scale', q: .3 },
      { id: 'd', title: 'Add decorative frames to group content', desc: 'Enclose blocks in borders and badges to organise them.', v: 'deco', q: .1 },
    ],
    correct: ['a'],
    purpose: 'Solution selection: understands hierarchy is rebuilt through scale/weight/spacing, not paint.',
  },
  {
    id: 'fu-05', skill: 'fundamentals', difficulty: 4, type: 'choice',
    visual: 'case4',
    title: 'Case Study 4 — Editorial Layout',
    brief: { label: 'Brief', text: 'A two-page magazine feature: headline, standfirst, one large image, three body columns, pull quote and page furniture. Same content in all four layouts.' },
    prompt: 'Which composition is strongest, and why?',
    options: [
      { id: 'a', title: 'Layout A', desc: 'Centered and symmetrical — calm, but everything reads at once with no entry point.', v: 'layA', q: .4 },
      { id: 'b', title: 'Layout B', desc: 'Asymmetric grid: dominant headline and image establish a clear entry, baseline rule and secondary block create a controlled reading path.', v: 'layB', q: 1 },
      { id: 'c', title: 'Layout C', desc: 'Alternating zigzag keeps it active, but uniform element sizes flatten importance.', v: 'layC', q: .45 },
      { id: 'd', title: 'Layout D', desc: 'Clean grid, but the image dominates and the headline is reduced to caption scale — hierarchy inverted.', v: 'layD', q: .35 },
    ],
    correct: ['b'],
    purpose: 'Composition judgement: entry point, reading path, tension vs symmetry.',
    reasoning: {
      required: [['hierarchy', 'focal', 'entry', 'dominant', 'importance'], ['path', 'read', 'flow', 'eye']],
      anti: [['subjective', 'looks nice', 'no difference', 'equally', 'any of them']],
      max: 10,
    },
  },
  {
    id: 'fu-06', skill: 'fundamentals', difficulty: 5, type: 'choice',
    prompt: 'A client wants a “clean, spacious” poster. You have 12 elements. What is the most professional first move?',
    options: [
      { id: 'a', title: 'Cut content to what the poster must communicate, then build space around it', desc: 'Space is produced by deciding what not to say.', q: 1 },
      { id: 'b', title: 'Increase margins and keep all 12 elements', desc: 'Preserve content, gain breathing room at the edges.', q: .5 },
      { id: 'c', title: 'Set everything in a light weight', desc: 'Lighter type will feel spacious.', q: .3 },
      { id: 'd', title: 'Use a white background', desc: 'Switch from colour to white to feel clean.', q: .25 },
    ],
    correct: ['a'],
    purpose: 'Editing as a design act: space as a consequence of prioritisation.',
  },
  {
    id: 'fu-07', skill: 'fundamentals', difficulty: 6, type: 'choice',
    brief: { label: 'Scenario', text: 'A campaign runs across a 48-sheet billboard, a bus-shelter poster and a 1080×1080 social tile. The legal line is mandatory on all three.' },
    prompt: 'How do you handle scale differences without losing the design?',
    options: [
      { id: 'a', title: 'Redesign the hierarchy per format: distance-reading hierarchy for OOH, detail hierarchy for close formats', desc: 'Same system, different information density and size ratios per context.', q: 1 },
      { id: 'b', title: 'Scale the billboard layout down proportionally', desc: 'Keep one master layout and let it shrink everywhere.', q: .4 },
      { id: 'c', title: 'Remove the legal line on the billboard', desc: 'It is unreadable at distance anyway.', q: .15 },
      { id: 'd', title: 'Use different creative per format', desc: 'Fully independent designs for each placement.', q: .35 },
    ],
    correct: ['a'],
    purpose: 'System thinking across scales: proportional scaling vs re-hierarchisation.',
  },

  /* ---------------- B. TYPOGRAPHY ---------------- */
  {
    id: 'ty-01', skill: 'typography', difficulty: 1, type: 'choice',
    prompt: 'A paragraph of body text is hard to read. Which change usually helps most?',
    options: [
      { id: 'a', title: 'Increase line height and shorten the line length', desc: 'Comfortable leading plus 45–75 characters per line.', q: 1 },
      { id: 'b', title: 'Make the text bold', desc: 'Heavier weight improves legibility.', q: .4 },
      { id: 'c', title: 'Add a background colour', desc: 'Contrast behind the text.', q: .3 },
      { id: 'd', title: 'Centre the paragraph', desc: 'Centred text is easier to follow.', q: .15 },
    ],
    correct: ['a'],
    purpose: 'Baseline readability mechanics: leading and measure.',
  },
  {
    id: 'ty-02', skill: 'typography', difficulty: 2, type: 'choice',
    prompt: 'You are pairing a display face with a text face. What makes the pairing work?',
    options: [
      { id: 'a', title: 'Clear contrast of role with shared underlying proportions', desc: 'Distinct voices that share x-height/width logic so they feel like one family of intent.', q: 1 },
      { id: 'b', title: 'Both fonts are from the same superfamily', desc: 'Same designer, different weights.', q: .5 },
      { id: 'c', title: 'They are as different as possible', desc: 'Maximum contrast guarantees hierarchy.', q: .4 },
      { id: 'd', title: 'Both are geometric sans-serifs', desc: 'Consistency of style avoids conflict.', q: .35 },
    ],
    correct: ['a'],
    purpose: 'Pairing logic: contrast of role plus compatibility of structure.',
  },
  {
    id: 'ty-03', skill: 'typography', difficulty: 3, type: 'choice',
    prompt: 'In a headline–subhead–body stack, which set of adjustments most reliably creates hierarchy?',
    options: [
      { id: 'a', title: 'Distinct size steps, weight change, and spacing gaps larger than internal leading', desc: 'Scale, weight and spacing working together.', q: 1 },
      { id: 'b', title: 'Different colours for each level', desc: 'Colour separates the levels.', q: .5 },
      { id: 'c', title: 'Italicise the subhead', desc: 'Style change marks the middle level.', q: .35 },
      { id: 'd', title: 'Capitalise the headline only', desc: 'All-caps signals importance.', q: .4 },
    ],
    correct: ['a'],
    purpose: 'Multi-channel hierarchy: size + weight + spacing rhythm.',
  },
  {
    id: 'ty-04', skill: 'typography', difficulty: 4, type: 'choice',
    visual: 'case2',
    title: 'Case Study 2 — Lecture Poster',
    brief: { label: 'Context', text: 'Printed A3 poster for a public lecture. The organiser reports that “people walk past without reading anything”. Several typographic flaws are present.' },
    prompt: 'What is the most critical typographic issue to fix?',
    options: [
      { id: 'a', title: 'The body copy: display serif at ~9pt, 1.06 leading, fully justified with forced hyphenation', desc: 'At print size this block is effectively unreadable — no reading can happen at all, so every other issue is secondary.', q: 1 },
      { id: 'b', title: 'The headline mixes roman and italic', desc: 'The italic “Narrative” breaks the style consistency of the title.', q: .5 },
      { id: 'c', title: 'The kicker tracking is very wide', desc: 'The mono eyebrow line is letter-spaced too loosely.', q: .45 },
      { id: 'd', title: 'The footer note is grey', desc: 'The venue note uses a lighter grey than the body.', q: .6 },
    ],
    correct: ['a'],
    purpose: 'Severity ranking: readability failure outranks stylistic inconsistency.',
    reasoning: {
      required: [['read', 'legib', 'body', 'paragraph', 'leading', 'measure'], ['print', 'size', 'pt', 'distance']],
      anti: [['all equally', 'same priority', 'subjective']],
      max: 10,
    },
  },
  {
    id: 'ty-05', skill: 'typography', difficulty: 5, type: 'choice',
    brief: { label: 'Brief', text: 'Bilingual identity (Arabic + Latin) for a cultural institution. The Arabic and Latin wordmarks must sit side by side in one lockup.' },
    prompt: 'What matters most for the lockup to feel like one system?',
    options: [
      { id: 'a', title: 'Matching optical weight and vertical proportion rather than matching point size', desc: 'Arabic and Latin have different x-heights, vertical extents and stroke contrast — optical matching keeps them balanced.', q: 1 },
      { id: 'b', title: 'Setting both at the same font size', desc: 'Identical point size guarantees equality.', q: .35 },
      { id: 'c', title: 'Using two fonts from the same designer', desc: 'A shared designer ensures harmony.', q: .5 },
      { id: 'd', title: 'Transliterating the Arabic into Latin', desc: 'Use one script to avoid mismatch.', q: .2 },
    ],
    correct: ['a'],
    purpose: 'Bilingual typography awareness: optical vs metric matching.',
  },
  {
    id: 'ty-06', skill: 'typography', difficulty: 6, type: 'choice',
    brief: { label: 'Scenario', text: 'A long-form report is set in a geometric sans at 16px with generous leading. Readers report “losing their place” between lines.' },
    prompt: 'What is the most likely cause and fix?',
    options: [
      { id: 'a', title: 'Line length is too long for the size; shorten the measure and/or add a subtle column structure', desc: 'Without line-length discipline or guides, the eye cannot track returns reliably.', q: 1 },
      { id: 'b', title: 'The sans-serif is the problem; switch to a serif', desc: 'Serifs are required for long reading.', q: .55 },
      { id: 'c', title: 'Increase font size to 24px', desc: 'Bigger text stops the eye getting lost.', q: .35 },
      { id: 'd', title: 'Justify the text', desc: 'Even edges make tracking easier.', q: .3 },
    ],
    correct: ['a'],
    purpose: 'Diagnosis depth: measure-driven reading failure, not font superstition.',
  },
  {
    id: 'ty-07', skill: 'typography', difficulty: 7, type: 'choice',
    brief: { label: 'System task', text: 'You must define the type scale for a design system used by six product teams, in Arabic and Latin, across marketing site and product UI.' },
    prompt: 'Which principle should anchor the scale?',
    options: [
      { id: 'a', title: 'A modular ratio tied to usage roles, with per-script optical adjustments documented as rules', desc: 'Roles (display/heading/body/caption) get steps from one ratio; Arabic and Latin get documented deviations so teams stay consistent.', q: 1 },
      { id: 'b', title: 'One fixed list of px sizes with no script distinction', desc: 'Simplicity keeps teams aligned.', q: .35 },
      { id: 'c', title: 'Let each team pick sizes per project', desc: 'Contexts differ, so local choice is safer.', q: .1 },
      { id: 'd', title: 'Scale everything by viewport width only', desc: 'Fluid sizing replaces a system.', q: .4 },
    ],
    correct: ['a'],
    purpose: 'Typographic systems thinking at scale, incl. bilingual governance.',
  },

  /* ---------------- C. COLOR ---------------- */
  {
    id: 'co-01', skill: 'color', difficulty: 1, type: 'choice',
    prompt: 'White text sits on a pale yellow background and is hard to read. What is the problem?',
    options: [
      { id: 'a', title: 'Insufficient contrast', desc: 'The luminance difference between text and background is too small.', q: 1 },
      { id: 'b', title: 'The hue is wrong', desc: 'Yellow is a weak background colour.', q: .45 },
      { id: 'c', title: 'The font is too thin', desc: 'Weight is the primary issue.', q: .5 },
      { id: 'd', title: 'The text needs a shadow', desc: 'Add a drop shadow to separate it.', q: .3 },
    ],
    correct: ['a'],
    purpose: 'Baseline contrast recognition.',
  },
  {
    id: 'co-02', skill: 'color', difficulty: 2, type: 'choice',
    prompt: 'You need one accent colour to make the primary action stand out in an interface. What is the best rule?',
    options: [
      { id: 'a', title: 'Use it sparingly and only for the most important action', desc: 'Scarcity creates meaning.', q: 1 },
      { id: 'b', title: 'Use the brand’s brightest colour everywhere for energy', desc: 'Consistency and vibrancy.', q: .3 },
      { id: 'c', title: 'Use a different accent per page', desc: 'Variety keeps the product fresh.', q: .35 },
      { id: 'd', title: 'Use it on all buttons equally', desc: 'Uniformity is fairer to users.', q: .45 },
    ],
    correct: ['a'],
    purpose: 'Colour hierarchy and scarcity.',
  },
  {
    id: 'co-03', skill: 'color', difficulty: 4, type: 'choice',
    visual: 'case3',
    title: 'Case Study 3 — Colour Direction',
    brief: {
      label: 'Client brief',
      text: '“Sprout Bites” — organic soft-baked fruit snacks for ages 4–8. Must win the trust of health-conscious parents, feel natural and premium, and stand apart from candy packaging on a crowded supermarket shelf.',
    },
    prompt: 'Which colour direction best serves this brief?',
    options: [
      { id: 'a', title: 'Direction A — sage / cream / deep green with a warm gold note', desc: 'Signals natural and trustworthy to parents, holds premium restraint, and separates itself from candy-bright shelf neighbours while retaining a warm accent for appeal.', q: 1 },
      { id: 'b', title: 'Direction B — neon lime / hot pink / black', desc: 'Maximum shelf attention, but reads as confectionery energy and undercuts the trust and natural claims.', q: .35 },
      { id: 'c', title: 'Direction C — brown monochrome earth tones', desc: 'Natural and safe, but muddy and dated: weak appetite appeal for children and poor shelf distinction.', q: .5 },
    ],
    correct: ['a'],
    purpose: 'Strategic colour selection against a multi-stakeholder brief (parent trust + shelf + child appeal).',
    reasoning: {
      required: [['trust', 'parent', 'natural', 'organic'], ['shelf', 'stand', 'distinct', 'differ', 'candy', 'conflict'], ['premium', 'child', 'kid', 'appetite', 'appeal']],
      anti: [['just pretty', 'my favourite', 'no difference']],
      max: 12,
    },
  },
  {
    id: 'co-04', skill: 'color', difficulty: 5, type: 'choice',
    brief: { label: 'Brief', text: 'Data dashboard for night-shift operators working in low ambient light. Warning states must be unmistakable but must not cause fatigue over an 8-hour shift.' },
    prompt: 'Which colour strategy is strongest?',
    options: [
      { id: 'a', title: 'Dark neutral base + a small, disciplined set of semantic hues used only for state, with luminance-checked text contrast', desc: 'Restricts colour to meaning, keeps overall luminance low, and reserves intensity for the moments that matter.', q: 1 },
      { id: 'b', title: 'Red-heavy interface so problems are always visible', desc: 'Warnings dominate the palette permanently.', q: .3 },
      { id: 'c', title: 'Bright white background for maximum legibility', desc: 'Highest contrast is always safest.', q: .35 },
      { id: 'd', title: 'Colour-code each module differently', desc: 'Distinct hues help users learn the layout.', q: .5 },
    ],
    correct: ['a'],
    purpose: 'Colour as system + fatigue/context awareness.',
  },
  {
    id: 'co-05', skill: 'color', difficulty: 6, type: 'choice',
    brief: { label: 'Brief', text: 'A non-profit needs a campaign identity that must work in full colour, single-colour print, embroidery and embroidery-adjacent low-cost merch.' },
    prompt: 'What drives the palette choice?',
    options: [
      { id: 'a', title: 'A constrained palette chosen for reproduction behaviour first, then emotional fit', desc: 'Validate each colour in one-colour, low-fidelity and fabric contexts before committing to mood.', q: 1 },
      { id: 'b', title: 'Choose the most emotionally resonant palette, then adapt', desc: 'Feeling first; production problems are solved later.', q: .45 },
      { id: 'c', title: 'Use process cyan/magenta/yellow/black only', desc: 'Standard printing colours are safest.', q: .4 },
      { id: 'd', title: 'Match the competitor’s palette for familiarity', desc: 'Category colour codes build recognition.', q: .3 },
    ],
    correct: ['a'],
    purpose: 'Colour strategy under production constraints.',
  },

  /* ---------------- D. IMAGE & VISUAL DIRECTION ---------------- */
  {
    id: 'im-01', skill: 'image', difficulty: 2, type: 'choice',
    prompt: 'A hero photo has the subject looking out of the frame, away from your headline. What do you do first?',
    options: [
      { id: 'a', title: 'Re-crop or flip so the subject’s gaze leads into the layout', desc: 'Directional energy should point toward content.', q: 1 },
      { id: 'b', title: 'Add an arrow pointing to the headline', desc: 'Explicit guidance fixes the reading order.', q: .4 },
      { id: 'c', title: 'Move the headline behind the subject', desc: 'Overlap creates depth and solves it.', q: .35 },
      { id: 'd', title: 'Keep it — gaze direction rarely matters', desc: 'The photo is strong as-is.', q: .15 },
    ],
    correct: ['a'],
    purpose: 'Crop and gaze direction as compositional tools.',
  },
  {
    id: 'im-02', skill: 'image', difficulty: 3, type: 'choice',
    brief: { label: 'Brief', text: 'Campaign for a fintech app targeting freelancers. Three stock options: (1) handshake in a glass office, (2) person at a laptop in a café shot from behind, (3) close-up of hands sorting invoices with shallow depth of field.' },
    prompt: 'Which image direction is strongest and why?',
    options: [
      { id: 'a', title: '(3) — the tactile, specific detail communicates the actual problem and avoids generic business cliché', desc: 'Specificity over category cliche; also leaves clean space for copy.', q: 1 },
      { id: 'b', title: '(1) — handshakes signal trust and professionalism', desc: 'Standard trust cue for financial services.', q: .4 },
      { id: 'c', title: '(2) — relatable and safe for a broad audience', desc: 'Familiar scenario, easy to like.', q: .6 },
      { id: 'd', title: 'All three work equally with a good headline', desc: 'Copy carries the concept; images are interchangeable.', q: .2 },
    ],
    correct: ['a'],
    purpose: 'Image selection against brief: specificity vs stock convention.',
  },
  {
    id: 'im-03', skill: 'image', difficulty: 4, type: 'choice',
    brief: { label: 'Scenario', text: 'A series of six product photographs must sit in one campaign grid. Shoot day is tomorrow.' },
    prompt: 'Which instruction to the photographer matters most for consistency?',
    options: [
      { id: 'a', title: 'One lighting setup, fixed camera height and a consistent crop logic across all six', desc: 'Light, angle and framing constants make the series read as a system.', q: 1 },
      { id: 'b', title: 'Same background colour for all shots', desc: 'A unified backdrop creates consistency.', q: .55 },
      { id: 'c', title: 'Same camera, same lens, same megapixels', desc: 'Identical gear guarantees identical output.', q: .45 },
      { id: 'd', title: 'Same colour grade applied in post', desc: 'Fix consistency later with filters.', q: .6 },
    ],
    correct: ['a'],
    purpose: 'Photography direction: control at source, not post-hoc patching.',
  },
  {
    id: 'im-04', skill: 'image', difficulty: 5, type: 'choice',
    brief: { label: 'Brief', text: 'Editorial portrait of a reclusive architect. The subject refuses staged studio setups and has 12 minutes.' },
    prompt: 'What is the strongest art-direction approach?',
    options: [
      { id: 'a', title: 'Pre-light their actual workspace, choose one decisive frame with meaningful context, and shoot decisively within the constraint', desc: 'Turns the limitation into the concept: person + work + environment in one image.', q: 1 },
      { id: 'b', title: 'Bring a portable studio and insist on a proper set-up', desc: 'Quality requires the right environment.', q: .35 },
      { id: 'c', title: 'Shoot 400 frames and select in post', desc: 'Volume increases the odds of a keeper.', q: .55 },
      { id: 'd', title: 'Use a formalist headshot against seamless', desc: 'A standard portrait is the professional answer.', q: .45 },
    ],
    correct: ['a'],
    purpose: 'Directing under constraints: concept-first problem solving.',
  },
  {
    id: 'im-05', skill: 'image', difficulty: 6, type: 'choice',
    brief: { label: 'Scenario', text: 'A brand’s image library mixes hard-flash studio shots, soft natural light, and phone snapshots from events. It is being unified.' },
    prompt: 'What creates real visual consistency?',
    options: [
      { id: 'a', title: 'A defined image charter: lighting style, vantage, colour temperature, crop ratios — plus selective re-shoots where assets violate it', desc: 'Rules plus enforcement, applied to the library.', q: 1 },
      { id: 'b', title: 'One global preset applied to everything', desc: 'A single grade unifies the look.', q: .55 },
      { id: 'c', title: 'Black-and-white conversion', desc: 'Removing colour hides inconsistency.', q: .45 },
      { id: 'd', title: 'Accept the mix; audiences do not notice', desc: 'Content matters more than consistency.', q: .15 },
    ],
    correct: ['a'],
    purpose: 'Image systems: charter + governance, not filters.',
  },

  /* ---------------- E. CONCEPT & CREATIVE THINKING ---------------- */
  {
    id: 'cn-01', skill: 'concept', difficulty: 2, type: 'choice',
    brief: { label: 'Brief', text: 'Poster for a community repair café — “we fix what you would otherwise throw away”.' },
    prompt: 'Which starting point is most promising?',
    options: [
      { id: 'a', title: 'The visible evidence of mending — broken made whole — as the central visual device', desc: 'Comes directly from the core idea of the brief.', q: 1 },
      { id: 'b', title: 'A green leaf icon, since repair is environmentally friendly', desc: 'Instantly communicates the benefit.', q: .35 },
      { id: 'c', title: 'A friendly cartoon mascot of a smiling hammer', desc: 'Approachable and memorable for all ages.', q: .45 },
      { id: 'd', title: 'A grid of stock photos of tools', desc: 'Shows exactly what the service involves.', q: .4 },
    ],
    correct: ['a'],
    purpose: 'Concept origin: idea extracted from the brief, not category cliché.',
  },
  {
    id: 'cn-02', skill: 'concept', difficulty: 3, type: 'choice',
    prompt: 'What distinguishes a concept from a style?',
    options: [
      { id: 'a', title: 'A concept is the idea that organises decisions; style is how it is dressed', desc: 'Different executions can carry the same concept; the same style can carry no concept at all.', q: 1 },
      { id: 'b', title: 'Concept is for advertising; style is for branding', desc: 'They belong to different disciplines.', q: .35 },
      { id: 'c', title: 'They are the same thing described differently', desc: 'Interchangeable terms.', q: .3 },
      { id: 'd', title: 'Style is the idea; concept is the execution', desc: 'Concept lives in the craft.', q: .2 },
    ],
    correct: ['a'],
    purpose: 'Conceptual vocabulary used correctly (not as trivia — as decision framework).',
  },
  {
    id: 'cn-03', skill: 'concept', difficulty: 4, type: 'choice',
    brief: { label: 'Brief', text: 'Campaign for a bank’s first-time savings product, targeting 22–28 year-olds who believe they “cannot afford to save”.' },
    prompt: 'Which idea is least likely to be cliché and most on-brief?',
    options: [
      { id: 'a', title: 'Reframe the objection: visualise the cost of small daily non-essentials turning into a visible sum — the money already exists', desc: 'Engages the actual barrier (perceived affordability) rather than generic future-wealth imagery.', q: 1 },
      { id: 'b', title: 'A piggy bank with a graduation cap', desc: 'Warm, familiar savings symbol.', q: .3 },
      { id: 'c', title: 'Sunset over a city with “Your future starts today”', desc: 'Aspirational and emotive.', q: .2 },
      { id: 'd', title: 'A couple smiling at a laptop', desc: 'Relatable digital banking moment.', q: .3 },
    ],
    correct: ['a'],
    purpose: 'Audience insight → idea; recognises category cliché.',
  },
  {
    id: 'cn-04', skill: 'concept', difficulty: 5, type: 'choice',
    brief: { label: 'Brief', text: 'Ministry of Health: reduce littering in national parks. Audience 16–30. Budget modest. Previous campaign used guilt imagery and failed.' },
    prompt: 'Which conceptual territory should you develop?',
    options: [
      { id: 'a', title: 'Make the invisible visible: show what stays behind and for how long, through a counter-intuitive, shareable visual device', desc: 'Shifts from scolding to discovery; suited to low-budget, high-share formats.', q: 1 },
      { id: 'b', title: 'Escalate the guilt: larger fines, darker imagery', desc: 'Previous effort simply needed more pressure.', q: .2 },
      { id: 'c', title: 'A mascot animal that “thanks you”', desc: 'Positive tone, mascot-led.', q: .55 },
      { id: 'd', title: 'Statistics on tourism waste', desc: 'Facts persuade this audience.', q: .5 },
    ],
    correct: ['a'],
    purpose: 'Learning from failed precedent; concept over preachiness.',
  },
  {
    id: 'cn-05', skill: 'concept', difficulty: 6, type: 'choice',
    brief: { label: 'Scenario', text: 'Your team presents four concepts. Two are strong and distinct; two are variations of the same safe idea. The client leans toward one of the safe ones.' },
    prompt: 'What is the strongest professional move?',
    options: [
      { id: 'a', title: 'Present the two strong routes as the real choice, make the safe route’s limitation explicit against the brief, and offer to develop the client’s preference only if it can be sharpened into something ownable', desc: 'Defends the work with brief-based reasoning while keeping the relationship intact.', q: 1 },
      { id: 'b', title: 'Build the safe route the client prefers — they know their business', desc: 'Client preference decides.', q: .4 },
      { id: 'c', title: 'Present all four equally and let them choose', desc: 'Neutral presentation avoids pressure.', q: .55 },
      { id: 'd', title: 'Refuse to present the weak concepts', desc: 'Protect the work by omitting them.', q: .35 },
    ],
    correct: ['a'],
    purpose: 'Concept defence and client reasoning — bridges concept and practice.',
  },
  {
    id: 'cn-06', skill: 'concept', difficulty: 7, type: 'choice',
    brief: { label: 'Brief', text: 'National tourism board: attract a younger international audience without resorting to “ancient monuments + golden light” territory, which every competitor owns.' },
    prompt: 'Which creative platform is strongest?',
    options: [
      { id: 'a', title: 'A serialised “unwritten guide” platform: each execution takes one mundane local ritual and stages it with total seriousness — ownable, expandable, and tonally distinct', desc: 'Builds a repeatable system with a clear point of view rather than a single hero ad.', q: 1 },
      { id: 'b', title: 'Cinematic drone montage of landscapes', desc: 'Scale and beauty sell destinations.', q: .35 },
      { id: 'c', title: 'Influencer takeovers in every city', desc: 'Peer proof reaches the audience.', q: .5 },
      { id: 'd', title: 'A monochrome heritage campaign emphasising history', desc: 'Own the heritage position strongly.', q: .3 },
    ],
    correct: ['a'],
    purpose: 'Platform-level originality with system potential.',
    reasoning: {
      required: [['own', 'distinct', 'differ', 'ownable'], ['system', 'serial', 'extend', 'repeat', 'expand', 'multiple']],
      anti: [['any would work', 'no difference']],
      max: 10,
    },
  },

  /* ---------------- F. BRANDING ---------------- */
  {
    id: 'br-01', skill: 'branding', difficulty: 2, type: 'choice',
    prompt: 'What is the actual purpose of a logo lockup rule (clearspace, minimum size)?',
    options: [
      { id: 'a', title: 'To protect legibility and recognisability across every application', desc: 'Rules exist so the mark survives real-world conditions.', q: 1 },
      { id: 'b', title: 'To make the brand look professional in the guideline PDF', desc: 'Presentation polish.', q: .4 },
      { id: 'c', title: 'To prevent designers from customising the logo', desc: 'Control over the asset.', q: .45 },
      { id: 'd', title: 'To fill space around the logo in layouts', desc: 'Layout utility.', q: .25 },
    ],
    correct: ['a'],
    purpose: 'Understands rules as functional, not decorative.',
  },
  {
    id: 'br-02', skill: 'branding', difficulty: 3, type: 'choice',
    brief: { label: 'Brief', text: 'A brand guideline says: primary navy, accent rust, typeface Archivo, no gradients.' },
    prompt: 'A designer delivers social tiles using forest green and a gradient wash. What is the real issue?',
    options: [
      { id: 'a', title: 'It breaks the visual system — future applications become unpredictable and recognition erodes', desc: 'The violation matters because systems compound over time.', q: 1 },
      { id: 'b', title: 'Green clashes with the logo', desc: 'Colour harmony problem.', q: .5 },
      { id: 'c', title: 'The guideline document is outdated', desc: 'Process issue, not a design issue.', q: .35 },
      { id: 'd', title: 'Nothing, as long as the logo is present', desc: 'Logo presence is what matters.', q: .25 },
    ],
    correct: ['a'],
    purpose: 'Why consistency matters: systemic consequence, not rule-worship.',
  },
  {
    id: 'br-03', skill: 'branding', difficulty: 4, type: 'choice',
    visual: 'case5',
    title: 'Case Study 5 — Brand Application Audit',
    brief: { label: 'Task', text: 'Nord Kaffee identity system shown above. Four applications produced by different designers. One violates the system.' },
    prompt: 'Which application violates the visual system?',
    options: [
      { id: 'a', title: 'B — the in-store poster', desc: 'The wordmark is set in green, outside the defined palette (navy or rust only), breaking colour governance.', q: 1 },
      { id: 'b', title: 'C — the social post', desc: 'Reversed logo on the rust field is not permitted.', q: .45 },
      { id: 'c', title: 'A — the business card', desc: 'The mark is too small to be legible at that size.', q: .5 },
      { id: 'd', title: 'D — the packaging', desc: 'The navy header band is an unauthorised element.', q: .55 },
    ],
    correct: ['a'],
    purpose: 'System auditing: checks application against stated rules (colour governance).',
  },
  {
    id: 'br-04', skill: 'branding', difficulty: 5, type: 'choice',
    brief: { label: 'Scenario', text: 'The same campaign must run under three sub-brands that share one parent identity.' },
    prompt: 'How should the identity system flex?',
    options: [
      { id: 'a', title: 'Lock the constants (logo behaviour, core type, spacing logic); flex only defined variables (accent hue, image style, layout tone)', desc: 'Recognition stays intact while sub-brands gain distinguishable voices.', q: 1 },
      { id: 'b', title: 'Give each sub-brand a completely independent look', desc: 'Distinctness matters more than family resemblance.', q: .35 },
      { id: 'c', title: 'Identical assets everywhere with only the logo changed', desc: 'Maximum consistency.', q: .55 },
      { id: 'd', title: 'Let each marketing team adapt as needed', desc: 'Local teams know their audience.', q: .3 },
    ],
    correct: ['a'],
    purpose: 'Brand architecture: constants vs variables.',
  },
  {
    id: 'br-05', skill: 'branding', difficulty: 6, type: 'choice',
    brief: { label: 'Brief', text: 'A fast-growing startup’s identity was designed for app UI only. It now needs packaging, embroidered uniforms, vehicle livery and an animated sting.' },
    prompt: 'What is the first professional step?',
    options: [
      { id: 'a', title: 'Stress-test the existing system across all new media, then extend it with explicit rules where it fails', desc: 'Audit first: find where the system breaks before inventing new elements.', q: 1 },
      { id: 'b', title: 'Redesign the logo so it works everywhere', desc: 'A more versatile mark solves it.', q: .5 },
      { id: 'c', title: 'Create a separate mark for physical media', desc: 'One mark per domain.', q: .3 },
      { id: 'd', title: 'Start with the most exciting touchpoint (vehicles) and set the tone from there', desc: 'Lead with impact.', q: .35 },
    ],
    correct: ['a'],
    purpose: 'System extension methodology.',
  },
  {
    id: 'br-06', skill: 'branding', difficulty: 7, type: 'choice',
    brief: { label: 'Brief', text: 'A 20-year-old brand must be refreshed for a digital-first audience without alienating its existing customer base. Recognition equity is high.' },
    prompt: 'Which strategy best balances equity and evolution?',
    options: [
      { id: 'a', title: 'Identify the irreducible recognition assets and keep them; evolve everything else — palette relationships, typography, motion and image behaviour — in a documented phased rollout', desc: 'Protects memory structure while modernising expression.', q: 1 },
      { id: 'b', title: 'Radical rebrand with a press moment', desc: 'Clear break signals change.', q: .4 },
      { id: 'c', title: 'Cosmetic update: new gradient, same everything else', desc: 'Low-risk freshness.', q: .55 },
      { id: 'd', title: 'Run two identities in parallel indefinitely', desc: 'Serve both audiences.', q: .3 },
    ],
    correct: ['a'],
    purpose: 'Equity-aware brand evolution — strategic branding judgement.',
  },

  /* ---------------- G. SOCIAL MEDIA & CAMPAIGN DESIGN ---------------- */
  {
    id: 'ca-01', skill: 'campaign', difficulty: 3, type: 'choice',
    brief: { label: 'Platform', text: 'Instagram feed, 1080×1080, thumb-scroll context: the post has roughly 0.8 seconds before the next swipe.' },
    prompt: 'What determines whether it registers?',
    options: [
      { id: 'a', title: 'One dominant element readable at thumbnail size, with a single clear message', desc: 'Scaled-down legibility and one idea.', q: 1 },
      { id: 'b', title: 'How many messages the post manages to include', desc: 'Efficiency of content delivery.', q: .35 },
      { id: 'c', title: 'The number of brand assets present', desc: 'Logo, colours, product, CTA all visible.', q: .4 },
      { id: 'd', title: 'Visual novelty of the background texture', desc: 'Stops the scroll through texture.', q: .45 },
    ],
    correct: ['a'],
    purpose: 'Attention design principle.',
  },
  {
    id: 'ca-02', skill: 'campaign', difficulty: 4, type: 'choice',
    brief: { label: 'Brief', text: 'One campaign must run on billboard, story (9:16), feed (1:1) and a 6-second pre-roll.' },
    prompt: 'What is the correct adaptation logic?',
    options: [
      { id: 'a', title: 'Keep the core idea and its recognition cues fixed; adapt hierarchy, density and timing to each format’s constraints', desc: 'Consistency of idea, flexibility of execution.', q: 1 },
      { id: 'b', title: 'One master asset resized for every placement', desc: 'Guarantees consistency.', q: .4 },
      { id: 'c', title: 'A separate creative per format with no shared system', desc: 'Each platform deserves native work.', q: .45 },
      { id: 'd', title: 'Text-only adaptations for video, image-only for static', desc: 'Split by medium type.', q: .4 },
    ],
    correct: ['a'],
    purpose: 'Multi-format campaign thinking.',
  },
  {
    id: 'ca-03', skill: 'campaign', difficulty: 5, type: 'choice',
    visual: 'case6',
    title: 'Case Study 6 — Campaign Direction',
    brief: {
      label: 'Campaign brief',
      text: 'Riyadh Metro safety campaign. Audience: riders 18–24. Objective: reduce platform phone-distraction incidents. Formats: OOH near stations, Instagram/TikTok cutdowns. Insight: this audience actively ignores fear-based public-service messaging.',
    },
    prompt: 'Which direction should become the campaign’s visual direction?',
    options: [
      { id: 'a', title: 'Direction A — “The Numbers”', desc: 'Data-led warning creative with red alarm palette: credible, but lands in the fear-territory the audience already filters out.', q: .4 },
      { id: 'b', title: 'Direction B — “Read the Room”', desc: 'Signage-derived typographic system: converts the metro’s own visual language into direct, witty messages; modular across formats and endlessly extensible.', q: 1 },
      { id: 'c', title: 'Direction C — “Good Journeys”', desc: 'Warm lifestyle creative: likeable, but carries no safety message and could belong to any transit brand.', q: .35 },
    ],
    correct: ['b'],
    purpose: 'Campaign direction: insight-fit, ownability, modularity across formats.',
    reasoning: {
      required: [['insight', 'ignore', 'fear', 'audience', '18', 'young'], ['system', 'modular', 'extend', 'format', 'adapt'], ['own', 'distinct', 'recogn', 'metro', 'sign']],
      anti: [['all valid', 'no difference', 'depends on budget']],
      max: 12,
    },
  },
  {
    id: 'ca-04', skill: 'campaign', difficulty: 6, type: 'choice',
    brief: { label: 'Scenario', text: 'Week 3 of a campaign: the hero film performs, but static assets built from it get no traction. The media plan doubles static spend next week.' },
    prompt: 'What should you do first?',
    options: [
      { id: 'a', title: 'Diagnose whether static assets carry the film’s hook at a glance, then rebuild the static system around a format-native entry point rather than extracting frames', desc: 'Different formats need different hooks; the failure is structural, not budgetary.', q: 1 },
      { id: 'b', title: 'Increase contrast and saturation on the statics', desc: 'Make them pop harder.', q: .45 },
      { id: 'c', title: 'Post more frequently to compensate', desc: 'Volume offsets weak assets.', q: .3 },
      { id: 'd', title: 'Shift the spend to video entirely', desc: 'Play to what works.', q: .55 },
    ],
    correct: ['a'],
    purpose: 'Campaign performance reasoning: format-native adaptation.',
  },
  {
    id: 'ca-05', skill: 'campaign', difficulty: 7, type: 'choice',
    brief: { label: 'Brief', text: 'A product launch must build 12 weeks of recognition before day one, across OOH, social, retail and PR — with one creative team and a fixed budget.' },
    prompt: 'Which campaign structure is strongest?',
    options: [
      { id: 'a', title: 'One organising visual idea with three progressive phases (intrigue → meaning → invitation), each with defined asset rules so every touchpoint is recognisably part of the same story', desc: 'Time-based narrative with system governance.', q: 1 },
      { id: 'b', title: 'Twelve weeks of independent executions refreshed weekly', desc: 'Freshness sustains attention.', q: .4 },
      { id: 'c', title: 'One hero execution reused everywhere for maximum frequency', desc: 'Repetition builds memory.', q: .55 },
      { id: 'd', title: 'Phase by channel: OOH first, social later, retail last', desc: 'Sequential channel rollout.', q: .5 },
    ],
    correct: ['a'],
    purpose: 'Campaign systems over time — narrative + governance.',
  },

  /* ---------------- H. ART DIRECTION ---------------- */
  {
    id: 'ad-01', skill: 'artDirection', difficulty: 4, type: 'choice',
    brief: { label: 'Brief', text: 'A brand has five separately produced photos that “all look fine” but feel unrelated in a grid.' },
    prompt: 'What single change most makes them a set?',
    options: [
      { id: 'a', title: 'A shared treatment logic: consistent light direction, vantage, crop ratio and colour temperature', desc: 'Common visual grammar beats surface styling.', q: 1 },
      { id: 'b', title: 'Apply one filter to all of them', desc: 'Uniform grade unifies.', q: .6 },
      { id: 'c', title: 'Alternate colour and black-and-white', desc: 'Rhythm creates a system.', q: .4 },
      { id: 'd', title: 'Add a consistent caption style', desc: 'Typography ties them together.', q: .5 },
    ],
    correct: ['a'],
    purpose: 'Set-level consistency: source attributes, not overlays.',
  },
  {
    id: 'ad-02', skill: 'artDirection', difficulty: 5, type: 'choice',
    brief: { label: 'Brief', text: 'You are directing a photographer and a stylist for a food brand’s autumn series. The sketch references are ready. On set, the stylist proposes a completely different table setting that is prettier but breaks the series logic.' },
    prompt: 'What is the right call?',
    options: [
      { id: 'a', title: 'Evaluate it against the series system and brief; adopt only if it can become a rule that applies to the remaining executions', desc: 'Direction means protecting the system while staying open to better ideas on its terms.', q: 1 },
      { id: 'b', title: 'Accept it — on-set energy beats the plan', desc: 'Creative spontaneity is valuable.', q: .45 },
      { id: 'c', title: 'Reject it — the plan is approved', desc: 'Deviation risks the schedule.', q: .5 },
      { id: 'd', title: 'Shoot both and decide in post', desc: 'Optionality is free.', q: .6 },
    ],
    correct: ['a'],
    purpose: 'On-set direction judgement: system consistency vs spontaneity.',
  },
  {
    id: 'ad-03', skill: 'artDirection', difficulty: 6, type: 'choice',
    brief: { label: 'Brief', text: 'A campaign needs six executions over four months. The client wants “something different” every month.' },
    prompt: 'How do you deliver freshness without dissolving the campaign?',
    options: [
      { id: 'a', title: 'Fix the recognition system (composition grammar, colour behaviour, type voice) and rotate the variables (subject, scenario, seasonal motif)', desc: 'Fresh content inside a constant frame.', q: 1 },
      { id: 'b', title: 'New art direction each month with a shared logo', desc: 'Variety with brand presence.', q: .4 },
      { id: 'c', title: 'One hero image reused with seasonal props', desc: 'Consistency through repetition.', q: .55 },
      { id: 'd', title: 'Let each month’s designer interpret freely', desc: 'Diversity of voices is authentic.', q: .25 },
    ],
    correct: ['a'],
    purpose: 'Campaign art direction: constants/variables discipline.',
  },
  {
    id: 'ad-04', skill: 'artDirection', difficulty: 7, type: 'choice',
    brief: { label: 'Brief', text: 'You inherit a campaign with strong craft but no story: beautiful images, no connective logic. Four more executions remain.' },
    prompt: 'What is the most valuable intervention?',
    options: [
      { id: 'a', title: 'Define the narrative spine — what each image says, in what order, and why — then re-shoot or re-frame the remaining executions to carry it', desc: 'Story converts isolated craft into direction.', q: 1 },
      { id: 'b', title: 'Unify the images with a stronger colour treatment', desc: 'Visual consistency will imply a story.', q: .55 },
      { id: 'c', title: 'Add copy that explains each image', desc: 'Words supply the missing logic.', q: .6 },
      { id: 'd', title: 'Leave it — beautiful is enough', desc: 'Craft quality carries campaigns.', q: .2 },
    ],
    correct: ['a'],
    purpose: 'Storytelling as the core of art direction.',
  },

  /* ---------------- I. PROFESSIONAL PRACTICE ---------------- */
  {
    id: 'pr-01', skill: 'practice', difficulty: 2, type: 'choice',
    prompt: 'A client says “make the logo bigger” but their actual complaint is that people do not notice the offer. What do you do?',
    options: [
      { id: 'a', title: 'Clarify the underlying problem first, then propose solutions that address it', desc: 'Diagnose before prescribing.', q: 1 },
      { id: 'b', title: 'Make the logo bigger', desc: 'They asked directly; comply.', q: .4 },
      { id: 'c', title: 'Explain why logos should stay small', desc: 'Educate the client on best practice.', q: .5 },
      { id: 'd', title: 'Make everything bigger', desc: 'Raise all emphasis equally.', q: .3 },
    ],
    correct: ['a'],
    purpose: 'Brief interpretation: symptom vs problem.',
  },
  {
    id: 'pr-02', skill: 'practice', difficulty: 3, type: 'choice',
    prompt: 'A stakeholder’s feedback contradicts the brief and would weaken the design. What is the most professional response?',
    options: [
      { id: 'a', title: 'Test their point against the brief’s objective, present the trade-off openly, and agree a decision criterion together', desc: 'Objective criteria replace taste debate.', q: 1 },
      { id: 'b', title: 'Implement it — stakeholders decide', desc: 'Hierarchy of authority.', q: .45 },
      { id: 'c', title: 'Refuse and escalate to your manager', desc: 'Protect the work.', q: .35 },
      { id: 'd', title: 'Implement it quietly and note your objection in writing', desc: 'Comply with a paper trail.', q: .5 },
    ],
    correct: ['a'],
    purpose: 'Feedback handling via brief-anchored reasoning.',
  },
  {
    id: 'pr-03', skill: 'practice', difficulty: 4, type: 'choice',
    prompt: 'How do you explain a design decision to a non-design client most effectively?',
    options: [
      { id: 'a', title: 'Anchor it to their stated objective and the audience’s likely response, with the visual reasoning as support', desc: 'Business language first, craft second.', q: 1 },
      { id: 'b', title: 'Describe the principles you applied (balance, contrast, rhythm)', desc: 'Show professional reasoning.', q: .55 },
      { id: 'c', title: 'Show two alternatives so they feel choice', desc: 'Present options rather than argue.', q: .6 },
      { id: 'd', title: 'State that it is the professionally correct approach', desc: 'Expert authority resolves it.', q: .35 },
    ],
    correct: ['a'],
    purpose: 'Explaining decisions in the client’s value language.',
  },
  {
    id: 'pr-04', skill: 'practice', difficulty: 5, type: 'choice',
    brief: { label: 'Scenario', text: 'Two days before a campaign lock, the legal team demands a larger disclaimer that breaks your layout.' },
    prompt: 'What is the strongest response?',
    options: [
      { id: 'a', title: 'Re-solve the hierarchy so the disclaimer has a legitimate place — treat it as a design constraint, not an intrusion', desc: 'Absorb constraints into the system.', q: 1 },
      { id: 'b', title: 'Shrink it slightly and hope it passes', desc: 'Preserve the design.', q: .3 },
      { id: 'c', title: 'Push the disclaimer into the corner at minimum size', desc: 'Comply in form only.', q: .5 },
      { id: 'd', title: 'Remove secondary content to make room without changing the headline', desc: 'Cut elsewhere.', q: .75 },
    ],
    correct: ['a'],
    purpose: 'Constraint handling: redesign vs workaround.',
  },
  {
    id: 'pr-05', skill: 'practice', difficulty: 6, type: 'choice',
    brief: { label: 'Scenario', text: 'You lead a project with three stakeholders who want different things, all by Friday.' },
    prompt: 'What protects the work and the deadline?',
    options: [
      { id: 'a', title: 'A single decision-maker confirmed up front, one consolidated feedback round with a shared critique criterion, and a written lock date', desc: 'Governance beats volume of opinions.', q: 1 },
      { id: 'b', title: 'Merge all requests into one deliverable', desc: 'Satisfy everyone at once.', q: .45 },
      { id: 'c', title: 'Work late and iterate on each note individually', desc: 'Effort resolves conflict.', q: .4 },
      { id: 'd', title: 'Let the most senior stakeholder decide informally', desc: 'Rank settles disputes.', q: .55 },
    ],
    correct: ['a'],
    purpose: 'Process design for feedback and priority management.',
  },
  {
    id: 'pr-06', skill: 'practice', difficulty: 7, type: 'choice',
    brief: { label: 'Brief', text: 'A global client will present your campaign to their board. Budget, timeline and channel constraints are fixed; your preferred creative route requires 30% more production budget.' },
    prompt: 'How do you advance your recommendation professionally?',
    options: [
      { id: 'a', title: 'Present the route with its business rationale, an honest cost gap, and a costed alternative that preserves the core idea under the fixed budget — with a clear recommendation', desc: 'Recommends with trade-offs made explicit and solvable.', q: 1 },
      { id: 'b', title: 'Present only the ideal route and let them find the money', desc: 'Advocate for the work.', q: .55 },
      { id: 'c', title: 'Silently drop to the cheaper route', desc: 'Deliver within constraints.', q: .6 },
      { id: 'd', title: 'Present both routes with equal weight', desc: 'Let the board choose.', q: .55 },
    ],
    correct: ['a'],
    purpose: 'Senior-level recommendation with explicit trade-offs.',
  },

  /* ---------------- J. LEADERSHIP & CREATIVE DIRECTION ---------------- */
  {
    id: 'le-01', skill: 'leadership', difficulty: 3, type: 'choice',
    prompt: 'A junior designer asks for your feedback on their layout. What is the most useful response?',
    options: [
      { id: 'a', title: 'Name the specific problem, tie it to the objective, and suggest what to try — with the reason', desc: 'Actionable, educative, brief-anchored.', q: 1 },
      { id: 'b', title: '“I would do it differently” and redraw it yourself', desc: 'Fastest path to quality.', q: .35 },
      { id: 'c', title: 'Ask what they think of it', desc: 'Socratic and empowering.', q: .65 },
      { id: 'd', title: 'List every issue you can find', desc: 'Thorough review.', q: .5 },
    ],
    correct: ['a'],
    purpose: 'Quality of feedback: specific, tied to objective, includes direction.',
  },
  {
    id: 'le-02', skill: 'leadership', difficulty: 4, type: 'choice',
    brief: { label: 'Scenario', text: 'Two designers deliver conflicting routes for the same brief. You must choose one by end of day.' },
    prompt: 'What is the strongest decision basis?',
    options: [
      { id: 'a', title: 'Evaluate both against the brief and audience with a stated criterion, choose, and give the losing route’s designer a clear rationale and next step', desc: 'Transparent criteria + development for both.', q: 1 },
      { id: 'b', title: 'Present both to the client and let them pick', desc: 'The client owns the choice.', q: .5 },
      { id: 'c', title: 'Choose the one by the more senior designer', desc: 'Experience reduces risk.', q: .35 },
      { id: 'd', title: 'Combine the best parts of both', desc: 'Nothing is wasted.', q: .55 },
    ],
    correct: ['a'],
    purpose: 'Creative decision-making with rationale and team development.',
  },
  {
    id: 'le-03', skill: 'leadership', difficulty: 5, type: 'choice',
    brief: { label: 'Scenario', text: 'A designer on your team consistently produces attractive work that drifts from the brand system under deadline pressure.' },
    prompt: 'What is the most effective intervention?',
    options: [
      { id: 'a', title: 'Give them a checklist-based self-review gate plus a short paired review on the next two projects, and remove ambiguity about what is non-negotiable', desc: 'Fixes the process that produces the drift.', q: 1 },
      { id: 'b', title: 'Redo their files yourself before each delivery', desc: 'Guarantee quality at the finish line.', q: .4 },
      { id: 'c', title: 'Reassign them off brand work', desc: 'Play to different strengths.', q: .45 },
      { id: 'd', title: 'Warn them once, formally', desc: 'Clarity of consequence.', q: .5 },
    ],
    correct: ['a'],
    purpose: 'Building quality systems rather than firefighting.',
  },
  {
    id: 'le-04', skill: 'leadership', difficulty: 6, type: 'choice',
    brief: { label: 'Brief', text: 'You are taking over creative direction of a team of four with no shared standards. Deliverables vary wildly between designers.' },
    prompt: 'What is the highest-leverage first move?',
    options: [
      { id: 'a', title: 'Codify a lightweight visual standard (reference board, do/don’t examples, critique criteria) and install a recurring critique ritual that enforces it', desc: 'Standards + ritual = compounding consistency.', q: 1 },
      { id: 'b', title: 'Review every file personally before release', desc: 'Direct control of output.', q: .55 },
      { id: 'c', title: 'Restructure the team by channel', desc: 'Ownership reduces variance.', q: .5 },
      { id: 'd', title: 'Hire a senior designer to raise the floor', desc: 'Talent fixes quality.', q: .55 },
    ],
    correct: ['a'],
    purpose: 'Establishing standards and critique culture.',
  },
  {
    id: 'le-05', skill: 'leadership', difficulty: 7, type: 'choice',
    brief: { label: 'Brief', text: 'Your team of six must deliver a campaign in three weeks while two members are at different skill levels and one is remote in another time zone.' },
    prompt: 'Which approach best protects final creative quality?',
    options: [
      { id: 'a', title: 'Define the creative system and non-negotiables first, assign work matched to capability, run two structured checkpoints with written criteria, and reserve a final direction pass for yourself', desc: 'Structure, fit, checkpoints and a final gate.', q: 1 },
      { id: 'b', title: 'Assign equal parts and review at the end', desc: 'Fair workload, one quality gate.', q: .45 },
      { id: 'c', title: 'Take the hardest executions yourself and delegate the rest', desc: 'Lead from the front.', q: .6 },
      { id: 'd', title: 'Increase meeting frequency to stay aligned', desc: 'Communication solves coordination.', q: .45 },
    ],
    correct: ['a'],
    purpose: 'Directing a team under delivery pressure — systems + delegation + gates.',
  },
];
