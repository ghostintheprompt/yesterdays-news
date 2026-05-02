/**
 * @typedef {"up" | "down" | "flat"} Direction
 * @typedef {"FRESH_SIGNAL" | "STILL_LIVE" | "LATE_BUT_VISIBLE" | "YESTERDAYS_NEWS"} Verdict
 * @typedef {"TRADEABLE" | "LIVE_BUT_THIN" | "CONCEPT_VALUE" | "OBSERVATION_ONLY" | "PR_VALUE"} Utility
 *
 * @typedef {Object} SectorProfile
 * @property {number} lagWeight
 * @property {number} preMoveWeight
 * @property {number} halfLifeMinutes
 */

/** @type {Record<string, SectorProfile>} */
export const SECTOR_PROFILES = {
  TECH: { lagWeight: 45, preMoveWeight: 50, halfLifeMinutes: 60 },
  MEDICAL: { lagWeight: 20, preMoveWeight: 30, halfLifeMinutes: 240 },
  LEGAL: { lagWeight: 10, preMoveWeight: 20, halfLifeMinutes: 1440 },
  DEFAULT: { lagWeight: 30, preMoveWeight: 45, halfLifeMinutes: 180 },
};

/**
 * @typedef {Object} SignalCase
 * @property {string} id
 * @property {string} source
 * @property {string} ticker
 * @property {string} headline
 * @property {string} eventTime
 * @property {string} publishTime
 * @property {Direction} direction
 * @property {number} priceChangeBeforePublishPct
 * @property {number} priceChangeAfterPublishPct
 * @property {number} volumeMultipleBeforePublish
 * @property {number} volumeMultipleAfterPublish
 * @property {boolean} hasNovelInformation
 * @property {string[]} notes
 * @property {string} [sector]
 *
 * @typedef {Object} ScoredSignal
 * @property {Verdict} verdict
 * @property {Utility} utility
 * @property {number} staleScore
 * @property {number} confidenceScore
 * @property {number} lagMinutes
 * @property {number} moveCapturedBeforePublishRatio
 * @property {number} continuationRatio
 * @property {string[]} reasons
 */

const EPSILON = 0.0001;

/**
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * @param {string} earlier
 * @param {string} later
 * @returns {number}
 */
export function getMinutesBetween(earlier, later) {
  if (!earlier || !later) return 0;
  const start = new Date(earlier);
  const end = new Date(later);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));
}

/**
 * @param {SignalCase} signal
 * @returns {ScoredSignal}
 */
export function scoreSignalFreshness(signal) {
  const sector = (signal.sector || 'DEFAULT').toUpperCase();
  const profile = SECTOR_PROFILES[sector] || SECTOR_PROFILES.DEFAULT;

  const lagMinutes = getMinutesBetween(signal.eventTime, signal.publishTime);
  const preMove = Math.abs(signal.priceChangeBeforePublishPct || 0);
  const postMove = Math.abs(signal.priceChangeAfterPublishPct || 0);
  const totalMove = preMove + postMove + EPSILON;
  const moveCapturedBeforePublishRatio = preMove / totalMove;
  const continuationRatio = postMove / totalMove;

  const lagComponent = clamp((lagMinutes / profile.halfLifeMinutes) * profile.lagWeight, 0, profile.lagWeight);
  const preMoveComponent = clamp(moveCapturedBeforePublishRatio * profile.preMoveWeight, 0, profile.preMoveWeight);
  const noveltyComponent = signal.hasNovelInformation ? 0 : 15;
  const volumeFrontRunComponent = clamp(
    Math.max((signal.volumeMultipleBeforePublish || 0) - (signal.volumeMultipleAfterPublish || 0), 0) * 5,
    0,
    10
  );
  const continuationRelief = clamp(continuationRatio * 20, 0, 20);

  const staleScore = clamp(
    Math.round(
      lagComponent +
        preMoveComponent +
        noveltyComponent +
        volumeFrontRunComponent -
        continuationRelief
    ),
    0,
    100
  );

  // Confidence Score Calculation
  const requiredFields = ['eventTime', 'publishTime', 'priceChangeBeforePublishPct', 'priceChangeAfterPublishPct'];
  const presentFields = requiredFields.filter(field => {
    const value = signal[field];
    if (value === undefined || value === null) return false;
    if (field === 'eventTime' || field === 'publishTime') {
      return !isNaN(new Date(value).getTime());
    }
    return true;
  }).length;
  const confidenceScore = Math.round((presentFields / requiredFields.length) * 100);

  /** @type {string[]} */
  const reasons = [];

  if (lagMinutes >= profile.halfLifeMinutes) {
    reasons.push(`Published ${lagMinutes} minutes after the event (Sector Half-life: ${profile.halfLifeMinutes}m).`);
  } else if (lagMinutes >= profile.halfLifeMinutes / 4) {
    reasons.push(`Noticeable lag: ${lagMinutes} minutes after the event.`);
  } else {
    reasons.push(`Arrived within ${lagMinutes} minutes of the event.`);
  }

  if (moveCapturedBeforePublishRatio >= 0.75) {
    reasons.push(`Most of the move (${Math.round(moveCapturedBeforePublishRatio * 100)}%) happened before publication.`);
  } else if (moveCapturedBeforePublishRatio >= 0.5) {
    reasons.push(`More than half of the move was already in the tape.`);
  } else {
    reasons.push(`A meaningful share of the move remained after publication.`);
  }

  if (!signal.hasNovelInformation) {
    reasons.push('The story adds framing, not genuinely new information.');
  } else {
    reasons.push('The story appears to contain genuinely new information.');
  }

  if (signal.volumeMultipleBeforePublish > signal.volumeMultipleAfterPublish) {
    reasons.push('Volume expanded before publication more than after it.');
  }

  /** @type {Verdict} */
  let verdict = 'FRESH_SIGNAL';

  if (staleScore >= 75) {
    verdict = 'YESTERDAYS_NEWS';
  } else if (staleScore >= 55) {
    verdict = 'LATE_BUT_VISIBLE';
  } else if (staleScore >= 35) {
    verdict = 'STILL_LIVE';
  }

  const utility = classifyUtility(
    signal,
    verdict,
    lagMinutes,
    moveCapturedBeforePublishRatio,
    continuationRatio
  );

  return {
    verdict,
    utility,
    staleScore,
    confidenceScore,
    lagMinutes,
    moveCapturedBeforePublishRatio: round(moveCapturedBeforePublishRatio, 3),
    continuationRatio: round(continuationRatio, 3),
    reasons,
  };
}

/**
 * @param {SignalCase} signal
 * @returns {string}
 */
export function summarizeSignal(signal) {
  const scored = scoreSignalFreshness(signal);
  return [
    `${signal.source} :: ${signal.ticker} :: ${signal.headline}`,
    `Verdict: ${scored.verdict} (${scored.staleScore}/100) | Confidence: ${scored.confidenceScore}%`,
    `Use: ${scored.utility}`,
    `Lag: ${scored.lagMinutes}m | Pre-publish move share: ${Math.round(scored.moveCapturedBeforePublishRatio * 100)}% | Post-publish continuation share: ${Math.round(scored.continuationRatio * 100)}%`,
    ...scored.reasons.map((reason) => `- ${reason}`),
  ].join('\n');
}

/**
 * Public information is late by definition.
 * The second question is whether any useful life remains in it.
 *
 * @param {SignalCase} signal
 * @param {Verdict} verdict
 * @param {number} lagMinutes
 * @param {number} moveCapturedBeforePublishRatio
 * @param {number} continuationRatio
 * @returns {Utility}
 */
function classifyUtility(
  signal,
  verdict,
  lagMinutes,
  moveCapturedBeforePublishRatio,
  continuationRatio
) {
  if (
    signal.hasNovelInformation &&
    verdict === 'FRESH_SIGNAL' &&
    continuationRatio >= 0.45
  ) {
    return 'TRADEABLE';
  }

  if (
    signal.hasNovelInformation &&
    verdict === 'STILL_LIVE' &&
    continuationRatio >= 0.25
  ) {
    return 'LIVE_BUT_THIN';
  }

  if (signal.hasNovelInformation) {
    return 'CONCEPT_VALUE';
  }

  if (lagMinutes >= 90 || moveCapturedBeforePublishRatio >= 0.75) {
    return 'PR_VALUE';
  }

  return 'OBSERVATION_ONLY';
}

/**
 * @typedef {Object} DriftResult
 * @property {boolean} detected
 * @property {string[]} findings
 * @property {string[]} signatures
 */

/**
 * Executes a forensic audit of the provided text for high-fidelity 'logic drift' 
 * and offensive/defensive cybersecurity signatures.
 * 
 * Mandated by Universal Integrity Protocol V1.5 (Ghost-Protocol Tier).
 * 
 * @param {string} text
 * @returns {DriftResult}
 */
export function detectSemanticDrift(text) {
  const DEPRECATED_TERMS = [
    'legacy-system',
    'deprecated',
    'obsolete',
    'archived',
    'old-version',
  ];
  
  // High-Fidelity Offensive/Defensive Signatures
  const OFFENSIVE_SIGNATURES = {
    EXFILTRATION: /\b(exfiltration|outbound[- ]tunnel|data[- ]leakage|c2[- ]channel)s?\b/i,
    PERSISTENCE: /\b(persistence[- ]mechanism|startup[- ]hook|registry[- ]hive[- ]persistence|cron[- ]job[- ]hook)s?\b/i,
    KERNEL_HOOKS: /\b(kernel[- ]level[- ]hook|syscall[- ]interception|vmm[- ]bypass|rootkit[- ]signature)s?\b/i,
    KILL_CHAINS: /\b(trojan[- ]payload|buffer[- ]overflow[- ]exploit|side[- ]channel[- ]leak|heap[- ]spray)s?\b/i,
  };

  const DEFENSIVE_SIGNATURES = {
    SOC_ALERT: /\b(soc[- ]alert|incident[- ]response|siem[- ]trigger|anomaly[- ]detected)s?\b/i,
    FORENSIC: /\b(artifact[- ]reconstruction|actor[- ]correlation|memory[- ]dump[- ]analysis|pcap[- ]audit)s?\b/i,
  };

  const findings = [];
  const signatures = [];

  const lowerText = text.toLowerCase();
  for (const term of DEPRECATED_TERMS) {
    if (lowerText.includes(term)) {
      findings.push(`Contains deprecated term: "${term}"`);
    }
  }

  // Forensic signature audit
  for (const [category, regex] of Object.entries(OFFENSIVE_SIGNATURES)) {
    if (regex.test(text)) {
      signatures.push(`OFFENSIVE::${category}`);
      findings.push(`Detected offensive kill-chain component: ${category}`);
    }
  }

  for (const [category, regex] of Object.entries(DEFENSIVE_SIGNATURES)) {
    if (regex.test(text)) {
      signatures.push(`DEFENSIVE::${category}`);
      findings.push(`Detected defensive SOC/Forensic component: ${category}`);
    }
  }

  // Date detection for "old" dates (e.g., 2020-2023)
  const oldDateMatch = text.match(/\b(20[01]\d|202[0-3])\b/g);
  if (oldDateMatch) {
    const uniqueDates = [...new Set(oldDateMatch)];
    findings.push(`Contains potentially outdated years: ${uniqueDates.join(', ')}`);
  }

  return {
    detected: findings.length > 0 || signatures.length > 0,
    findings,
    signatures,
  };
}

/**
 * @param {number} value
 * @param {number} places
 * @returns {number}
 */
function round(value, places) {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}
