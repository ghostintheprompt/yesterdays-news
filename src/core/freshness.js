/**
 * @typedef {"up" | "down" | "flat"} Direction
 * @typedef {"FRESH_SIGNAL" | "STILL_LIVE" | "LATE_BUT_VISIBLE" | "YESTERDAYS_NEWS"} Verdict
 *
 * @typedef {Object} SignalCase
 * @property {string} id
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
 *
 * @typedef {Object} ScoredSignal
 * @property {Verdict} verdict
 * @property {number} staleScore
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
  const start = new Date(earlier);
  const end = new Date(later);
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));
}

/**
 * @param {SignalCase} signal
 * @returns {ScoredSignal}
 */
export function scoreSignalFreshness(signal) {
  const lagMinutes = getMinutesBetween(signal.eventTime, signal.publishTime);
  const preMove = Math.abs(signal.priceChangeBeforePublishPct);
  const postMove = Math.abs(signal.priceChangeAfterPublishPct);
  const totalMove = preMove + postMove + EPSILON;
  const moveCapturedBeforePublishRatio = preMove / totalMove;
  const continuationRatio = postMove / totalMove;

  const lagComponent = clamp((lagMinutes / 180) * 30, 0, 30);
  const preMoveComponent = clamp(moveCapturedBeforePublishRatio * 45, 0, 45);
  const noveltyComponent = signal.hasNovelInformation ? 0 : 15;
  const volumeFrontRunComponent = clamp(
    Math.max(signal.volumeMultipleBeforePublish - signal.volumeMultipleAfterPublish, 0) * 5,
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

  /** @type {string[]} */
  const reasons = [];

  if (lagMinutes >= 120) {
    reasons.push(`Published ${lagMinutes} minutes after the event.`);
  } else if (lagMinutes >= 45) {
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

  return {
    verdict,
    staleScore,
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
    `${signal.ticker} :: ${signal.headline}`,
    `Verdict: ${scored.verdict} (${scored.staleScore}/100)`,
    `Lag: ${scored.lagMinutes}m | Pre-publish move share: ${Math.round(scored.moveCapturedBeforePublishRatio * 100)}% | Post-publish continuation share: ${Math.round(scored.continuationRatio * 100)}%`,
    ...scored.reasons.map((reason) => `- ${reason}`),
  ].join('\n');
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
