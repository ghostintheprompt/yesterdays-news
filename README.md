# Yesterday's News

Terminal-native finance tools for grading whether a market story is still alive, just useful, or already dead.

## What This Is

`Yesterday's News` is a research-first repo about signal decay, source latency, and the difference between public information and tradable information.

It starts from a simple Wall Street truth:

If it is public, it is late.
The only question is what kind of late.

Some late information still has value:

- concept value
- observation value
- publicity value

What public information usually stops being is clean entry.

This repo is not a stock-picking machine.
It is not a newsletter funnel.
It is not a fake-alpha sales pitch.
It is not here to comfort anyone who showed up after the money moved.

It is a toolkit for asking better questions:

- Did price move before the article?
- Is this analysis early, on time, or late?
- Is the writer adding signal or embalming a corpse?
- How much of the move was already in the tape before the hot take arrived?
- Is this edge, or just yesterday's news with better typography?
- If it is late, is it still useful for something besides the trade?

## Why It Exists

The repo starts from a simple desk truth:

By the time a lot of public finance writing looks clean, the trade is already damaged.

That does not mean the writing is worthless.
It may still be useful as concept, observation, or publicity.

But markets do not pay you just for knowing what happened.
They pay for timing, positioning, uncertainty management, and for seeing what is not yet fully metabolized.

This repo turns that truth into a framework.

## First-Version Scope

The first version is research-first:

- a scoring engine for signal freshness
- a usefulness layer for deciding what late information is still good for
- a small CLI for grading example market stories
- synthetic case studies showing what late conviction looks like
- a thesis document and a Ghost-ready origin draft

Later versions can become:

- a media-latency analyzer
- an article-url grader
- a story-vs-price research notebook
- a browser extension if it earns one

There is no UI yet on purpose.

The command line fits the idea better.
If you trade, code, or read tape for a living, you do not need a toy dashboard to tell you when the room is full of late confidence.

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

## Current Verdict Labels

- `FRESH_SIGNAL`
- `STILL_LIVE`
- `LATE_BUT_VISIBLE`
- `YESTERDAYS_NEWS`

The point is not to pretend the score is magic.
The point is to create a framework for arguing about timing with something sharper than vibes, screenshots, and selective memory.

## Current Use Labels

- `TRADEABLE`
- `LIVE_BUT_THIN`
- `CONCEPT_VALUE`
- `OBSERVATION_ONLY`
- `PR_VALUE`

## Source Accountability

A stale article is one thing.
A stale source is a business model.

The repo now includes a source-profile pass so you can ask:

- Which sources are early more often than not?
- Which sources are intelligent but terminally late?
- Which desks, blogs, or letters mostly narrate after the tape has finished eating?

That matters because a lot of market commentary is not wrong.
It is just late often enough to cost somebody money.

## What Makes It Different

Most finance tools try to predict.

This one starts by asking whether the thing in front of you is even still tradable, and if it is not, whether it still has any other use left in it.

That matters because:

- late certainty is expensive
- narrative freshness is not tradable freshness
- market commentary often arrives as grief counseling for missed moves
- most public “edge” is a receipt, not an edge
- polished information is not the same thing as useful information

## Philosophy

The best public finance work should be:

- blunt
- honest
- useful
- skeptical of stale confidence
- generous to younger traders without bullshitting them
- coded by someone who knows the phone-room psychology, and now builds AI and red-team evaluation from the terminal

That is the tone here.

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

## License

MIT
