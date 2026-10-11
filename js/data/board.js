/* ============================================================
   Local persistence for the progress board and feedback.
   No backend — every attempt and note lives in this browser only.
   Shared by the landing board and the results feedback form.
   ============================================================ */

const ATTEMPTS_KEY = 'visor.attempts.v1';
const FEEDBACK_KEY = 'visor.guestbook.v1';

function read(key) {
  try { return JSON.parse(localStorage.getItem(key)) || []; }
  catch { return []; }
}

function write(key, list) {
  try { localStorage.setItem(key, JSON.stringify(list)); } catch { /* storage unavailable */ }
}

/* ---- completed assessment attempts (the progress board) ---- */
export function loadAttempts() {
  return read(ATTEMPTS_KEY);
}

export function saveAttempt(rec) {
  const list = read(ATTEMPTS_KEY);
  list.unshift({ id: 'a' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), ...rec });
  write(ATTEMPTS_KEY, list.slice(0, 50));
  return list;
}

/* ---- feedback notes (guestbook) ---- */
export function loadFeedback() {
  return read(FEEDBACK_KEY);
}

export function saveFeedback(rec) {
  const list = read(FEEDBACK_KEY);
  list.unshift({ at: Date.now(), ...rec });
  write(FEEDBACK_KEY, list.slice(0, 30));
  return list;
}
