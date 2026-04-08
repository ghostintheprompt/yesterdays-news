import fs from 'node:fs';
import path from 'node:path';
import { summarizeSignal } from '../core/freshness.js';

const examplesPath = path.resolve(process.cwd(), 'data/examples/signals.json');
const signals = JSON.parse(fs.readFileSync(examplesPath, 'utf8'));

console.log('Yesterday\'s News :: Example Cases');
console.log('');

for (const signal of signals) {
  console.log(summarizeSignal(signal));
  console.log('');
}
