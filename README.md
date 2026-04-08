# Yesterday's News

Terminal-native finance tools for grading whether a market story is still alive, just useful, or already dead.

## Core Rule

If it is public, it is late.

The only question is what kind of late.

Some late information still has value:

- concept value
- observation value
- publicity value

What public information usually stops being is clean entry.

## What It Does

`Yesterday's News` is a research-first repo about signal decay, source latency, and the difference between public information and tradable information.

It does four things:

- scores freshness
- scores remaining usefulness
- profiles sources by how often they are early or late
- gives you a terminal workflow for arguing about timing with something better than vibes

## What It Checks

- Did price move before the article?
- Is this analysis early, on time, or late?
- Is the writer adding signal or embalming a corpse?
- How much of the move was already in the tape before the hot take arrived?
- Is this edge, or just yesterday's news with better typography?
- If it is late, is it still useful for something besides the trade?

## What It Is Not

- not a stock-picking machine
- not a newsletter funnel
- not a fake-alpha sales pitch
- not a toy dashboard pretending to rescue late entries
- not apologetic about calling stale information stale

## Why Terminal

There is no UI yet on purpose.

The command line fits the idea better. If you trade, code, or read tape for a living, you do not need a glossy interface to tell you the room is full of late confidence.

## Current Labels

### Verdict

- `FRESH_SIGNAL`
- `STILL_LIVE`
- `LATE_BUT_VISIBLE`
- `YESTERDAYS_NEWS`

### Use

- `TRADEABLE`
- `LIVE_BUT_THIN`
- `CONCEPT_VALUE`
- `OBSERVATION_ONLY`
- `PR_VALUE`

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
│   │   ├── score-sources.js
│   │   └── run-examples.js
│   └── core/
│       ├── freshness.js
│       └── source-profile.js
├── test/
│   ├── freshness.test.js
│   └── source-profile.test.js
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

Score the sources themselves:

```bash
npm run sources -- data/examples/signals.json
```

Run tests:

```bash
npm test
```

## Source Accountability

A stale article is one thing.
A stale source is a business model.

The repo now includes a source-profile pass so you can ask:

- Which sources are early more often than not?
- Which sources are intelligent but terminally late?
- Which desks, blogs, or letters mostly narrate after the tape has finished eating?

That matters because a lot of market commentary is not wrong.
It is just late often enough to cost somebody money.

## Why It Matters

Most finance tools try to predict. This one starts by asking whether the thing in front of you is even still tradable, and if it is not, whether it still has any other use left in it.

- late certainty is expensive
- narrative freshness is not tradable freshness
- market commentary often arrives as grief counseling for missed moves
- most public "edge" is a receipt, not an edge
- polished information is not the same thing as useful information

## Roadmap

### Phase 1

- signal freshness engine
- example cases
- CLI workflow
- source accountability scoring

### Phase 2

- article URL analyzer
- narrative decay research notebook
- source scoring by latency profile

### Phase 3

- browser extension or bookmarklet, only if it actually earns one
- page badge for stale commentary
- AI-evaluation and red-team mode for grading generated market write-ups

## Lens

Built from boiler room and trading floor psychology, and now aimed at AI dev, evaluation, and red-team work from the terminal.

The goal is simple: bring useful tools and blunt truth.

## License

MIT
