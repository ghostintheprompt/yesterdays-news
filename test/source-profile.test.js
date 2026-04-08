import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSourceProfiles } from '../src/core/source-profile.js';

test('classifies repeat late sources harshly', () => {
  const profiles = buildSourceProfiles([
    {
      id: 'a',
      source: 'BrokerWrap',
      ticker: 'AAA',
      headline: 'Late note',
      eventTime: '2026-04-08T09:30:00Z',
      publishTime: '2026-04-08T12:30:00Z',
      direction: 'up',
      priceChangeBeforePublishPct: 8,
      priceChangeAfterPublishPct: 0.4,
      volumeMultipleBeforePublish: 4,
      volumeMultipleAfterPublish: 1,
      hasNovelInformation: false,
      notes: [],
    },
    {
      id: 'b',
      source: 'BrokerWrap',
      ticker: 'BBB',
      headline: 'Another late note',
      eventTime: '2026-04-08T10:00:00Z',
      publishTime: '2026-04-08T13:00:00Z',
      direction: 'up',
      priceChangeBeforePublishPct: 6,
      priceChangeAfterPublishPct: 0.5,
      volumeMultipleBeforePublish: 3,
      volumeMultipleAfterPublish: 1,
      hasNovelInformation: false,
      notes: [],
    },
  ]);

  assert.equal(profiles[0].source, 'BrokerWrap');
  assert.equal(profiles[0].reputation, 'OBITUARY_DESK');
});
