// CITADEL SIEGE: dependency-free static smoke tests.
// Run: node tests/smoke.mjs
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const script = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].map(x=>x[1]).join('\n');
assert.ok(script.length > 1000, 'Game JavaScript must be embedded in index.html');
new vm.Script(script, { filename: 'index.html' });
for (const id of ['canvas','menu','startGame','continueGame','joystick','skill0','skill1','skill2','skill3']) {
  assert.match(html, new RegExp('id=["\\\']' + id + '["\\\']'), 'Missing UI element: ' + id);
}
assert.match(script, /function direction\(\)/, 'Movement handler missing');
assert.match(script, /moveDestination/, 'Tap-to-move missing');
assert.match(script, /function createGame\(/, 'Game start missing');
assert.match(html, /CITADEL SIEGE\s*[·-]\s*ВЕРСИЯ\s*\d+\.\d+/i, 'Visible version missing');
console.log('PASS: JavaScript syntax, game controls, start screen, version label');
