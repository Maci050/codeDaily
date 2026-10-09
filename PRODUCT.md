# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Learners and students practicing Python or Java. They open CodeDaily for a short, self-contained exercise (a single function plus automatic tests) as a daily practice habit, not a long study session. Novato and Intermedio are the core audience. Pro and Hacker mode exist for players who have outgrown them, but they come second.

## Product Purpose

CodeDaily is a Wordle-style daily programming challenge: one short problem a day, the same for everyone, solved by writing real code that is executed and checked against test cases.

Success means two things together:
- **Actual learning:** players get better at programming. Hints, test feedback, and solutions exist to teach, not just to gate.
- **Daily return:** players come back every day. Streaks, the archive, and the result share serve the habit.

## Positioning

Unlike quiz or multiple-choice coding games, the daily challenge runs real code. Python executes in the browser via Pyodide and Java via the Judge0 public API. The same deterministic daily puzzle is available in both languages. It is free, needs no account, and has no backend.

## Operating Context

- Played in a browser, typically once a day, in a few minutes.
- Flow: read the problem → write a solution in the editor → run against tests → unlock progressive hints on failed attempts (Normal mode) → finish, see a result modal with an emoji grid, share.
- Progress lives only in the player's browser (localStorage).
- Live site: https://codedaily-nu.vercel.app (Vercel, static).

## Capabilities and Constraints

**Capabilities (shipped):**
- Daily challenge picked deterministically by date and difficulty; the same index in Python and Java.
- Difficulties: Novato (Beginner), Intermedio (Intermediate), Pro. 50 challenges per level per language (150 Python + 150 Java).
- Hacker mode: Pro only, no hints, max 3 attempts.
- Progressive hints on failed attempts (Normal mode only).
- Extra modes: "What does it return?" (3 attempts), "Find the bug" (real Python execution), "What's the complexity?" (multiple-choice Big O, 2 attempts). 64 challenges across them.
- Archive of past daily challenges, starting at the launch date 2026-03-22.
- Weekly challenge (Python only), harder than the daily: transform code (iterative ↔ recursive), solve under rules (no `sorted`, no `[::-1]`…) or meet a time limit. Changes every Monday 00:00 UTC; week #1 started 2026-10-05. Rules are checked on the syntax tree (Python `ast`), not by text search. Challenges are authored and validated with `npm run weekly` (scripts/weekly/build_weekly.py).
- Profile and local progress: attempts, completion, hints used, streak, preferences.
- Result modal and share text: emoji grid, day number, streak.
- UI and challenge content in Spanish and English.
- How-to-play modal and first-time tutorial.

**Constraints (must preserve):**
- No account and no backend. The site stays fully static and free, and progress stays in localStorage.
- Same puzzle for everyone: the daily pick stays deterministic and shared across all players and both languages.
- Java execution depends on the free public Judge0 API, so latency and availability are external.

**Terminology:** Daily Challenge, Novato / Intermedio / Pro (Beginner / Intermediate / Pro), Hacker mode, Modes, Archive, streak, hints.

**Undecided:**
- Whether Spanish or English is the primary market. Spanish is the current HTML default (`lang="es"`, `og:locale es_ES`), but it was not confirmed as a commitment.
- How much mobile play matters. Not confirmed either way.
- Roadmap items: more programming languages, more challenge types.

## Brand Commitments

- Name: **CodeDaily**.
- Pitch in use: "Un reto de programación diferente cada día, en Python o Java. Gratis, sin registro. Como Wordle pero para programadores."
- Personal project by Yeray, MIT licensed.

## Evidence on Hand

- Challenge banks: `codedaily/src/data/challenges/*.json`.
- Live deployment: https://codedaily-nu.vercel.app.
- No player counts, testimonials, press, or learning-outcome data exist. Do not fabricate any.

## Product Principles

1. **Learning over gatekeeping.** Every failure state should teach something: a test result, a hint, or the solution at the right time.
2. **Small enough to do daily.** A challenge fits in a few minutes. Anything that makes the daily loop heavier works against the habit.
3. **Real code, honest feedback.** Solutions run for real against tests. Never fake or simplify validation in ways that would mislead a learner.
4. **Shared day, zero friction.** One puzzle for everyone, no sign-up, nothing to install. The daily ritual is the social object.
