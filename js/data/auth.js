/* ============================================================
   Admin gate — client-side only (this is a static, no-backend
   site). Credentials are compared as a hash so the password is
   not stored in plaintext. Change ACCESS below and recompute the
   hash to set your own username/password.

   Default:  username "admin"  ·  password "visor2026"
   ============================================================ */

/* FNV-1a of "admin:visor2026" — regenerate when credentials change. */
const ACCESS_HASH = '2e6e2bc7';
const SESSION_KEY = 'visor.admin.auth';

function digest(s) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

function store() {
  try { if (typeof sessionStorage !== 'undefined' && sessionStorage) return sessionStorage; } catch { /* ignore */ }
  try { if (typeof window !== 'undefined' && window.sessionStorage) return window.sessionStorage; } catch { /* ignore */ }
  return null;
}

export function isAuthed() {
  const s = store();
  try { return !!s && s.getItem(SESSION_KEY) === '1'; } catch { return false; }
}

export function login(user, pass) {
  const ok = digest(`${String(user).trim()}:${String(pass)}`) === ACCESS_HASH;
  if (ok) { const s = store(); try { if (s) s.setItem(SESSION_KEY, '1'); } catch { /* ignore */ } }
  return ok;
}

export function logout() {
  const s = store();
  try { if (s) s.removeItem(SESSION_KEY); } catch { /* ignore */ }
}
