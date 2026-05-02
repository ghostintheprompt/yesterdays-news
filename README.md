<p align="center">
  <img src="yesterdays_news.png" width="520">
</p>

# Yesterday's News
Terminal-native tools for grading whether a market story is still alive, just useful, or already dead. — v1.0

## The Rule

If it is public, it is late.

The only question is what kind of late.

Being right is irrelevant. Being early is the only shot you have. By the time the explanation looks clean and the conviction arrives dressed like certainty, the move is over. price is already in the parking lot with your money in its pocket.

## Instrument

`Yesterday's News` is a rude little instrument for signal decay and narrative lag. It exists to ask the right first question: is this still alive, or am I being handed a corpse with a chart attached.

- **Freshness Scoring:** How much of the move happened before the write-up?
- **Utility Classification:** If it is late, is it still useful for something besides the trade?
- **Source Accountability:** Which desks mostly narrate after the move is done?
- **Terminal Workflow:** Stop arguing with vibes.

## Verdicts

### Classification
- `FRESH_SIGNAL` - The move is just starting.
- `STILL_LIVE` - Late, but still breathing.
- `LATE_BUT_VISIBLE` - Edge is gone. clarity is high.
- `YESTERDAYS_NEWS` - Polished receipts for a corpse.

### Use
- `TRADEABLE`
- `LIVE_BUT_THIN`
- `CONCEPT_VALUE`
- `OBSERVATION_ONLY`
- `PR_VALUE` (Excellent journalism, dead money)

## No UI

No UI on purpose.

The command line fits the tape. If you read tape for a living, you do not need a glossy interface to tell you the room is full of late confidence. Most public finance work is just grief counseling for missed moves.

## The Reality

The market does not care that you finally understand the story. It pays for surviving uncertainty while it is still alive. 

A stale article is one thing. A stale source is a business model. Most market commentary is not wrong—it is just late often enough to cost you money.

## Execution

```bash
npm run analyze -- data/examples/signals.json
npm run sources -- data/examples/signals.json
```

## Lens

Boiler room psychology. Blunt truth. No fluff. No fake prophecy.

## License

MIT
