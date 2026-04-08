import { scoreSignalFreshness } from './freshness.js';

/**
 * @typedef {Object} SourceProfile
 * @property {string} source
 * @property {number} samples
 * @property {number} averageStaleScore
 * @property {number} averageLagMinutes
 * @property {number} freshCount
 * @property {number} deadCount
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
    const current = grouped.get(signal.source) ?? {
      source: signal.source,
      samples: 0,
      staleScoreTotal: 0,
      lagMinutesTotal: 0,
      freshCount: 0,
      deadCount: 0,
    };

    current.samples += 1;
    current.staleScoreTotal += scored.staleScore;
    current.lagMinutesTotal += scored.lagMinutes;

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

      return {
        source: profile.source,
        samples: profile.samples,
        averageStaleScore,
        averageLagMinutes,
        freshCount: profile.freshCount,
        deadCount: profile.deadCount,
        reputation: classifySource(profile.samples, averageStaleScore, profile.freshCount, profile.deadCount),
      };
    })
    .sort((a, b) => {
      if (a.averageStaleScore !== b.averageStaleScore) {
        return a.averageStaleScore - b.averageStaleScore;
      }

      return b.samples - a.samples;
    });
}

/**
 * @param {number} samples
 * @param {number} averageStaleScore
 * @param {number} freshCount
 * @param {number} deadCount
 * @returns {string}
 */
function classifySource(samples, averageStaleScore, freshCount, deadCount) {
  if (samples >= 2 && freshCount === samples && averageStaleScore < 35) {
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
  const headers = ['SOURCE', 'SAMPLES', 'AVG_SCORE', 'AVG_LAG', 'FRESH', 'DEAD', 'REPUTATION'];
  const rows = profiles.map((profile) => [
    profile.source,
    String(profile.samples),
    String(profile.averageStaleScore),
    `${profile.averageLagMinutes}m`,
    String(profile.freshCount),
    String(profile.deadCount),
    profile.reputation,
  ]);

  const widths = headers.map((header, i) =>
    Math.max(header.length, ...rows.map((row) => row[i].length))
  );

  const formatRow = (row) =>
    row.map((cell, i) => cell.padEnd(widths[i], ' ')).join('  ');

  return [formatRow(headers), formatRow(widths.map((w) => '-'.repeat(w))), ...rows.map(formatRow)].join('\n');
}
