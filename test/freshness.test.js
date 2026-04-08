import test from 'node:test';
import assert from 'node:assert/strict';
import { scoreSignalFreshness } from '../src/core/freshness.js';

test('marks clearly stale commentary as yesterdays news', () => {
  const result = scoreSignalFreshness({
    id: 'stale',
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
  assert.ok(result.staleScore >= 75);
});

test('marks genuinely live information as fresh or still live', () => {
  const result = scoreSignalFreshness({
    id: 'fresh',
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
  assert.ok(result.staleScore < 55);
});
