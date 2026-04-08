import fs from 'node:fs';
import path from 'node:path';
import { buildSourceProfiles, formatSourceProfiles } from '../core/source-profile.js';

const fileArg = process.argv[2] || 'data/examples/signals.json';
const fullPath = path.resolve(process.cwd(), fileArg);
const payload = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
const signals = Array.isArray(payload) ? payload : payload.signals;

if (!Array.isArray(signals)) {
  console.error('Expected an array or an object with a "signals" array.');
  process.exit(1);
}

const profiles = buildSourceProfiles(signals);

console.log('YESTERDAY\'S NEWS :: SOURCE PROFILE');
console.log('Who is early, who is useful, and who mostly shows up after the move.');
console.log('');
console.log(formatSourceProfiles(profiles));
