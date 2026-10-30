/* ============================================================
   In-progress run persistence (localStorage).
   Lets a closed tab or refresh resume the assessment at the
   exact question, option order and selection the user left.
   Local-only, same device — mirrors board.js storage rules.
   ============================================================ */

const KEY = 'visor.run.v1';
const MAX_AGE = 7 * 24 * 3600 * 1000; /* a stale week-old draft is not resumed */

export function saveRun(payload) {
  try { localStorage.setItem(KEY, JSON.stringify({ ...payload, at: Date.now() })); }
  catch { /* storage unavailable or full — run continues without persistence */ }
}

export function loadRun() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const run = JSON.parse(raw);
    if (!run || run.v !== 1 || !run.current || !run.current.qid) return null;
    if (Date.now() - (run.at || 0) > MAX_AGE) { clearRun(); return null; }
    return run;
  } catch { return null; }
}

export function clearRun() {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}
