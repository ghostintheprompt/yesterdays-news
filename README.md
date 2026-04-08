# Yesterday's News

Finance tools for spotting when a market story is already dead by the time it gets published.

## What This Is

`Yesterday's News` is a research-first repo about signal decay, narrative lag, and stale conviction.

It starts from a simple Wall Street truth:

By the time most people are confidently explaining the move, the move is already gone.

This repo is not a stock-picking machine.
It is not a newsletter funnel.
It is not a fake-alpha costume.

It is a toolkit for asking better questions:

- Did price move before the article?
- Is this analysis early, on time, or late?
- Is the writer adding signal or embalming a corpse?
- How much of the move was already in the tape before the hot take arrived?

## Why It Exists

On the desk, a running joke was telling a guy on the phone he was reading yesterday's news.

If he was real, he knew exactly what that meant.

Markets do not pay you for knowing what happened.
They pay for timing, positioning, uncertainty management, and for seeing what is not yet fully metabolized.

This repo turns that joke into a framework.

## First-Version Scope

The first version is research-first:

- a scoring engine for signal freshness
- a small CLI for grading example market stories
- synthetic case studies showing what late conviction looks like
- a thesis document and a Ghost-ready origin draft

Later versions can become:

- a dashboard
- a browser extension
- a media-latency analyzer
- a story-vs-price research notebook

## Repo Shape

```text
.
├── data/
│   └── examples/
│       └── signals.json
├── docs/
│   ├── GHOST_ARTICLE_DRAFT.md
│   └── THESIS.md
├── src/
│   ├── cli/
│   │   ├── analyze-file.js
│   │   └── run-examples.js
│   └── core/
│       └── freshness.js
├── test/
│   └── freshness.test.js
├── .gitignore
├── LICENSE
└── package.json
```

## Quick Start

Requires Node 20+.

```bash
npm run examples
```

Analyze the bundled example set:

```bash
npm run analyze -- data/examples/signals.json
```

Run tests:

```bash
npm test
```

## Current Verdict Labels

- `FRESH_SIGNAL`
- `STILL_LIVE`
- `LATE_BUT_VISIBLE`
- `YESTERDAYS_NEWS`

The point is not to act like the score is magic.
The point is to create a clean framework for arguing about timing with something more useful than vibes.

## What Makes It Different

Most finance tools try to predict.

This one starts by asking whether the thing in front of you is even still tradable.

That matters because:

- late certainty is expensive
- narrative freshness is not tradable freshness
- market commentary often arrives as grief counseling for missed moves

## Philosophy

The best public finance work should be:

- blunt
- honest
- useful
- skeptical of stale confidence
- generous to younger traders without bullshitting them

That is the tone here.

## Roadmap

### Phase 1

- signal freshness engine
- example cases
- CLI workflow

### Phase 2

- article URL analyzer
- event / publish / price lag dashboard
- narrative decay research notebook

### Phase 3

- browser extension or bookmarklet
- page badge for stale commentary
- source scoring by latency profile

## License

MIT
