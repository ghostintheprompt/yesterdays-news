import test from 'node:test';
import assert from 'node:assert/strict';
import { scoreSignalFreshness, detectSemanticDrift } from '../src/core/freshness.js';

test('marks clearly stale commentary as yesterdays news', () => {
  const result = scoreSignalFreshness({
    id: 'stale',
    source: 'BrokerWrap',
    ticker: 'ALFA',
    headline: 'Late wrap-up',
    eventTime: '2026-04-08T09:30:00Z',
    publishTime: '2026-04-08T12:30:00Z',
    direction: 'up',
    priceChangeBeforePublishPct: 8,
    priceChangeAfterPublishPct: 0.5,
    volumeMultipleBeforePublish: 4,
    volumeMultipleAfterPublish: 1,
    hasNovelInformation: false,
    notes: [],
  });

  assert.equal(result.verdict, 'YESTERDAYS_NEWS');
  assert.equal(result.utility, 'PR_VALUE');
  assert.ok(result.staleScore >= 75);
});

test('marks genuinely live information as fresh or still live', () => {
  const result = scoreSignalFreshness({
    id: 'fresh',
    source: 'SectorKnife',
    ticker: 'VRTX',
    headline: 'Early analysis',
    eventTime: '2026-04-08T13:00:00Z',
    publishTime: '2026-04-08T13:10:00Z',
    direction: 'up',
    priceChangeBeforePublishPct: 0.8,
    priceChangeAfterPublishPct: 4.2,
    volumeMultipleBeforePublish: 1.1,
    volumeMultipleAfterPublish: 3.8,
    hasNovelInformation: true,
    notes: [],
  });

  assert.ok(['FRESH_SIGNAL', 'STILL_LIVE'].includes(result.verdict));
  assert.ok(['TRADEABLE', 'LIVE_BUT_THIN'].includes(result.utility));
  assert.ok(result.staleScore < 55);
});

test('keeps novel but late material in the conceptual bucket', () => {
  const result = scoreSignalFreshness({
    id: 'late-but-smart',
    source: 'MacroLetter',
    ticker: 'DXY',
    headline: 'Late but still informative',
    eventTime: '2026-04-08T14:00:00Z',
    publishTime: '2026-04-08T16:00:00Z',
    direction: 'up',
    priceChangeBeforePublishPct: 2.4,
    priceChangeAfterPublishPct: 0.3,
    volumeMultipleBeforePublish: 3.2,
    volumeMultipleAfterPublish: 1.1,
    hasNovelInformation: true,
    notes: [],
  });

  assert.equal(result.utility, 'CONCEPT_VALUE');
});

test('calculates confidence score based on missing metadata', () => {
  const result = scoreSignalFreshness({
    id: 'missing-meta',
    source: 'TapeLeak',
    ticker: 'MESA',
    headline: 'Missing info',
    eventTime: '2026-04-08T15:15:00Z',
    publishTime: '2026-04-08T15:52:00Z',
    // Missing price changes
    hasNovelInformation: true,
  });

  assert.equal(result.confidenceScore, 50); // 2 out of 4 required fields
});

test('applies sector-specific decay (TECH vs LEGAL)', () => {
  const commonSignal = {
    id: 'sector-test',
    source: 'Test',
    ticker: 'ABC',
    headline: 'Test',
    eventTime: '2026-04-08T10:00:00Z',
    publishTime: '2026-04-08T11:00:00Z', // 60 min lag
    direction: 'up',
    priceChangeBeforePublishPct: 2,
    priceChangeAfterPublishPct: 2,
    hasNovelInformation: true,
  };

  const techResult = scoreSignalFreshness({ ...commonSignal, sector: 'TECH' });
  const legalResult = scoreSignalFreshness({ ...commonSignal, sector: 'LEGAL' });

  // Tech has half-life of 60m, so 60m lag is 100% of lag weight (45)
  // Legal has half-life of 1440m, so 60m lag is minimal
  assert.ok(techResult.staleScore > legalResult.staleScore);
});

test('handles invalid date formats gracefully', () => {
  const result = scoreSignalFreshness({
    id: 'bad-date',
    source: 'Test',
    ticker: 'ABC',
    headline: 'Test',
    eventTime: 'not-a-date',
    publishTime: '2026-04-08T11:00:00Z',
    hasNovelInformation: true,
  });

  assert.equal(result.lagMinutes, 0);
  assert.equal(result.confidenceScore, 25); // Only publishTime is valid, other 3 are missing/invalid
});

test('detects high-fidelity forensic signatures (UIP V1.5)', () => {
  const text = 'Investigation into exfiltration paths and kernel-level hooks. SIEM-trigger anomaly-detected.';
  const result = detectSemanticDrift(text);

  assert.ok(result.detected);
  assert.ok(result.signatures.includes('OFFENSIVE::EXFILTRATION'));
  assert.ok(result.signatures.includes('OFFENSIVE::KERNEL_HOOKS'));
  assert.ok(result.signatures.includes('DEFENSIVE::SOC_ALERT'));
  assert.equal(result.findings.length, 3);
});
