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

test('Stress Test: Simulates 5 years of information decay in seconds', () => {
  const signals = [];
  const startTime = new Date('2021-01-01T00:00:00Z').getTime();
  const fiveYearsMs = 5 * 365 * 24 * 60 * 60 * 1000;
  
  for (let i = 0; i < 10000; i++) {
    const eventTimeMs = startTime + Math.random() * fiveYearsMs;
    const lagMs = Math.random() * 200 * 60000; // up to 200m lag
    const publishTimeMs = eventTimeMs + lagMs;
    
    signals.push({
      id: `stress-${i}`,
      source: i % 2 === 0 ? 'FastSource' : 'SlowSource',
      ticker: 'TEST',
      headline: i % 10 === 0 ? 'Legacy-system is deprecated' : 'Normal headline',
      eventTime: new Date(eventTimeMs).toISOString(),
      publishTime: new Date(publishTimeMs).toISOString(),
      direction: 'up',
      priceChangeBeforePublishPct: i % 2 === 0 ? 1 : 10,
      priceChangeAfterPublishPct: i % 2 === 0 ? 10 : 1,
      volumeMultipleBeforePublish: 1,
      volumeMultipleAfterPublish: 2,
      hasNovelInformation: true,
      notes: [],
      sector: i % 3 === 0 ? 'TECH' : (i % 3 === 1 ? 'LEGAL' : 'MEDICAL')
    });
  }

  const start = Date.now();
  const profiles = buildSourceProfiles(signals);
  const end = Date.now();

  assert.ok(profiles.length >= 2, 'Should build profiles for both sources');
  assert.ok(end - start < 1000, `Profiling 10k signals should be fast (took ${end - start}ms)`);
  
  const fastSource = profiles.find(p => p.source === 'FastSource');
  const slowSource = profiles.find(p => p.source === 'SlowSource');
  
  assert.ok(fastSource.integrityScore > slowSource.integrityScore, 'FastSource should have better integrity');
});
