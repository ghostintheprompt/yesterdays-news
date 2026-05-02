import fs from 'node:fs';
import path from 'node:path';
import { summarizeSignal, detectSemanticDrift, scoreSignalFreshness } from '../core/freshness.js';

const args = process.argv.slice(2);
const watchMode = args.includes('--watch');
const fileArg = args.find(arg => !arg.startsWith('--'));

if (!fileArg) {
  console.error('Usage: npm run analyze -- <path-to-json> [--watch]');
  process.exit(1);
}

const fullPath = path.resolve(process.cwd(), fileArg);

function runAnalysis() {
  try {
    const content = fs.readFileSync(fullPath, 'utf8');
    const payload = JSON.parse(content);
    const signals = Array.isArray(payload) ? payload : payload.signals;

    if (!Array.isArray(signals)) {
      console.error('Expected an array or an object with a "signals" array.');
      return;
    }

    console.clear();
    console.log(`--- Analysis for ${fileArg} (${new Date().toLocaleTimeString()}) --- \n`);

    for (const signal of signals) {
      console.log(summarizeSignal(signal));
      
      const drift = detectSemanticDrift(signal.headline + ' ' + (signal.notes || []).join(' '));
      if (drift.detected) {
        console.log('Forensic Audit Result: LOGIC DRIFT / SIGNATURES DETECTED');
        drift.findings.forEach(f => console.log(`  [!] ${f}`));
        if (drift.signatures.length > 0) {
          console.log('  Signatures: ' + drift.signatures.join(', '));
        }
      }

      const scored = scoreSignalFreshness(signal);
      if (scored.verdict === 'YESTERDAYS_NEWS') {
        console.log('Remediation Suggestions:');
        getRemediation(scored).forEach(r => console.log(`  [>] ${r}`));
      }
      
      console.log('');
    }
  } catch (err) {
    console.error(`Error reading file: ${err.message}`);
  }
}

function getRemediation(scored) {
  const suggestions = [];
  if (scored.verdict === 'YESTERDAYS_NEWS') {
    suggestions.push('Seek successor sources with lower lag.');
    suggestions.push('Verify if the information has been fully discounted by the market.');
  }
  if (scored.utility === 'PR_VALUE') {
    suggestions.push('Treat as archival/PR only; do not use for active trade execution.');
  }
  return suggestions;
}

runAnalysis();

if (watchMode) {
  console.log(`Watching for changes in ${fileArg}...`);
  fs.watch(fullPath, (eventType) => {
    if (eventType === 'change') {
      runAnalysis();
    }
  });
}
