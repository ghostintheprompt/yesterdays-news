import fs from 'node:fs';
import path from 'node:path';
import { summarizeSignal } from '../core/freshness.js';

const examplesPath = path.resolve(process.cwd(), 'data/examples/signals.json');
const signals = JSON.parse(fs.readFileSync(examplesPath, 'utf8'));

console.log('YESTERDAY\'S NEWS :: TERMINAL');
console.log('If it is public, it is late. The only question is what kind of late.');
console.log('');

for (const signal of signals) {
  console.log(summarizeSignal(signal));
  console.log('');
}
