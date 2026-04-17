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

/**
 * Identifies spikes in information output that may indicate compromise or spam.
 * @param {import('../core/freshness.js').SignalCase[]} signals
 */
function detectSpikes(signals) {
  const timeWindows = new Map(); // source -> Map(hour -> count)
  
  for (const signal of signals) {
    const date = new Date(signal.publishTime);
    const hourKey = `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()} T${date.getUTCHours()}`;
    
    if (!timeWindows.has(signal.source)) {
      timeWindows.set(signal.source, new Map());
    }
    const sourceMap = timeWindows.get(signal.source);
    sourceMap.set(hourKey, (sourceMap.get(hourKey) || 0) + 1);
  }

  const spikes = [];
  for (const [source, hours] of timeWindows) {
    for (const [hour, count] of hours) {
      if (count > 2) { // Simple threshold for spike
        spikes.push({ source, hour, count });
      }
    }
  }
  return spikes;
}

const spikes = detectSpikes(signals);
if (spikes.length > 0) {
  console.log('\n[!] ANOMALY DETECTED: VOLUME SPIKES');
  spikes.forEach(s => {
    console.log(`  - ${s.source} produced ${s.count} signals in window ${s.hour}`);
  });
}
