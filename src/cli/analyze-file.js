import fs from 'node:fs';
import path from 'node:path';
import { summarizeSignal } from '../core/freshness.js';

const fileArg = process.argv[2];

if (!fileArg) {
  console.error('Usage: npm run analyze -- <path-to-json>');
  process.exit(1);
}

const fullPath = path.resolve(process.cwd(), fileArg);
const payload = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
const signals = Array.isArray(payload) ? payload : payload.signals;

if (!Array.isArray(signals)) {
  console.error('Expected an array or an object with a "signals" array.');
  process.exit(1);
}

for (const signal of signals) {
  console.log(summarizeSignal(signal));
  console.log('');
}
