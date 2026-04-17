import { scoreSignalFreshness, detectSemanticDrift } from './freshness.js';

/**
 * @typedef {Object} SourceProfile
 * @property {string} source
 * @property {number} samples
 * @property {number} averageStaleScore
 * @property {number} averageLagMinutes
 * @property {number} freshCount
 * @property {number} deadCount
 * @property {number} driftAlerts
 * @property {number} integrityScore
 * @property {string} reputation
 */

/**
 * @param {Array<import('./freshness.js').SignalCase>} signals
 * @returns {SourceProfile[]}
 */
export function buildSourceProfiles(signals) {
  const grouped = new Map();

  for (const signal of signals) {
    const scored = scoreSignalFreshness(signal);
    const drift = detectSemanticDrift(signal.headline + ' ' + (signal.notes || []).join(' '));
    
    const current = grouped.get(signal.source) ?? {
      source: signal.source,
      samples: 0,
      staleScoreTotal: 0,
      lagMinutesTotal: 0,
      freshCount: 0,
      deadCount: 0,
      driftAlerts: 0,
    };

    current.samples += 1;
    current.staleScoreTotal += scored.staleScore;
    current.lagMinutesTotal += scored.lagMinutes;
    if (drift.detected) current.driftAlerts += 1;

    if (scored.verdict === 'FRESH_SIGNAL' || scored.verdict === 'STILL_LIVE') {
      current.freshCount += 1;
    }

    if (scored.verdict === 'YESTERDAYS_NEWS') {
      current.deadCount += 1;
    }

    grouped.set(signal.source, current);
  }

  return Array.from(grouped.values())
    .map((profile) => {
      const averageStaleScore = Math.round(profile.staleScoreTotal / profile.samples);
      const averageLagMinutes = Math.round(profile.lagMinutesTotal / profile.samples);
      
      // Integrity Score: Starts at 100, drops for drift alerts and staleness
      const driftPenalty = (profile.driftAlerts / profile.samples) * 50;
      const stalePenalty = (averageStaleScore / 100) * 30;
      const integrityScore = Math.max(0, Math.round(100 - driftPenalty - stalePenalty));

      return {
        source: profile.source,
        samples: profile.samples,
        averageStaleScore,
        averageLagMinutes,
        freshCount: profile.freshCount,
        deadCount: profile.deadCount,
        driftAlerts: profile.driftAlerts,
        integrityScore,
        reputation: classifySource(profile.samples, averageStaleScore, profile.freshCount, profile.deadCount, integrityScore),
      };
    })
    .sort((a, b) => {
      if (b.integrityScore !== a.integrityScore) {
        return b.integrityScore - a.integrityScore;
      }
      return a.averageStaleScore - b.averageStaleScore;
    });
}

/**
 * @param {number} samples
 * @param {number} averageStaleScore
 * @param {number} freshCount
 * @param {number} deadCount
 * @param {number} integrityScore
 * @returns {string}
 */
function classifySource(samples, averageStaleScore, freshCount, deadCount, integrityScore) {
  if (integrityScore < 40) {
    return 'UNRELIABLE_DRIFT';
  }

  if (samples >= 2 && freshCount === samples && averageStaleScore < 35 && integrityScore > 80) {
    return 'EARLY_READ';
  }

  if (averageStaleScore >= 75 || deadCount >= Math.ceil(samples / 2)) {
    return 'OBITUARY_DESK';
  }

  if (averageStaleScore >= 55) {
    return 'LATE_CONFIDENCE';
  }

  if (freshCount >= Math.ceil(samples / 2)) {
    return 'TRADEABLE_ENOUGH';
  }

  return 'MIXED_TAPE';
}

/**
 * @param {SourceProfile[]} profiles
 * @returns {string}
 */
export function formatSourceProfiles(profiles) {
  const headers = ['SOURCE', 'SAMPLES', 'AVG_SCORE', 'INTEGRITY', 'DRIFT', 'FRESH', 'REPUTATION'];
  const rows = profiles.map((profile) => [
    profile.source,
    String(profile.samples),
    String(profile.averageStaleScore),
    `${profile.integrityScore}%`,
    String(profile.driftAlerts),
    String(profile.freshCount),
    profile.reputation,
  ]);

  const widths = headers.map((header, i) =>
    Math.max(header.length, ...rows.map((row) => row[i].length))
  );

  const formatRow = (row) =>
    row.map((cell, i) => cell.padEnd(widths[i], ' ')).join('  ');

  return [formatRow(headers), formatRow(widths.map((w) => '-'.repeat(w))), ...rows.map(formatRow)].join('\n');
}
