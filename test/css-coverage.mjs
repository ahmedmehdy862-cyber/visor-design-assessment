/* Reports class names referenced in JS markup that have no CSS rule. */
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cssFiles = ['css/app.css', 'css/cases.css', 'css/admin.css'];
const css = cssFiles.map(f => readFileSync(path.join(root, f), 'utf8')).join('\n');
const defined = new Set([...css.matchAll(/\.([a-zA-Z][\w-]*)/g)].map(m => m[1]));

const files = [];
(function walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === 'test') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.js')) files.push(p);
  }
})(root);

const JS_LITERALS = new Set(['null', 'true', 'false', 'undefined', 'else', 'if']);

const missing = new Map();
for (const f of files) {
  const src = readFileSync(f, 'utf8');
  for (const m of src.matchAll(/class="([^"]+)"/g)) {
    for (const raw of m[1].split(/\s+/)) {
      const name = raw.replace(/\$\{[^}]*\}/g, '').trim();
      if (!name || name.includes('$') || JS_LITERALS.has(name)) continue;
      if (!/^[a-zA-Z][\w-]*$/.test(name)) continue;
      if (!defined.has(name) && !missing.has(name)) missing.set(name, path.relative(root, f));
    }
  }
}

console.log(`checked ${files.length} JS files against ${cssFiles.length} stylesheets`);
if (!missing.size) {
  console.log('✓ every class referenced in JS markup has a CSS rule');
} else {
  console.log('classes referenced in JS but not defined in CSS:');
  for (const [k, v] of [...missing].sort()) console.log(`  ${k}   <- ${v}`);
  process.exitCode = 1;
}
