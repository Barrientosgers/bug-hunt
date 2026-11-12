# Bug Hunt: project instructions

A daily debugging game for junior developers. Public GitHub repo (portfolio) and a live app on GitHub Pages. The goal is to get real users eventually, so code quality, a clear README and a clean commit history matter.

Think "Wordle meets a real engineering job", with points and flags like TryHackMe and a language dropdown like LeetCode.

## How we work (ALWAYS follow)

- Work step by step, one phase at a time. At the end of each phase, stop, summarize what changed, and wait for the user's approval before moving on.
- ALWAYS ask before any major change: explain what and why, then wait for a "yes". Major changes: installing or removing packages, creating or deleting more than one file, changing folder structure or architecture, editing config files, creating or changing anything on GitHub, and any git commit or push.
- The user is here to learn. Briefly explain new concepts, libraries and design decisions, and point out anything worth mentioning in job interviews.
- Keep changes small and focused. Suggest a clear commit message after each meaningful step; only commit or push after approval.
- If something is unclear, ask instead of guessing.
- Definition of done for each phase: tests pass, lint passes, the verification script passes, and the user has reviewed and approved.
- Never put secrets, tokens or personal data in the repo or in chat. Use only fictional data and example.com-style content.

## The game

Story: the player is a new junior engineer at "Snackr", a fictional food delivery startup. Each bug arrives as a realistic ticket from a character:

- **Priya** (tech lead): the mentor
- **Maya** (product manager)
- **Leo** (customer support)

The codebase stays the same all season so players slowly learn their way around it.

Each challenge has:

- A ticket written like a real bug report (sometimes vague, so reproducing it is part of the skill)
- Real code to debug. Easy: 1 file, 30-60 lines. Medium: 2-3 files, 100-200 lines. Hard: 4-6 files, 200-400 lines.
- A test suite where some tests fail, plus optional "bonus" tests for extra findings
- A difficulty, a skill category (data types, loops, async, dates, mutation, conditions, etc.) and a lesson
- Versions in multiple languages, chosen from a dropdown

### Gameplay loop

1. Mentor briefing (what this bug practices + one tip)
2. Debug journal: player writes a hypothesis ("I think the bug is in ___ because ___") before editing (+XP)
3. Code editor, Run tests button, test results (expected vs. got), console output panel
4. Hint ladder (4 levels) that teaches debugging METHODS and never jumps to the answer: (1) read the failing test, (2) log/inspect the data, (3) explain the concept, (4) full explanation. Each hint costs XP but solving still counts.
5. Stuck detection: after repeated failed runs or a long time without progress, the mentor gently offers help.
6. After solving, the mentor gives a code review of the player's actual fix (root cause vs. symptom, minimal change, bonus findings, feedback on the journal hypothesis), "how to prevent it next time", "where this shows up at work", and one lesson to keep.
7. Reward screen: captured flag (format `BUGHUNT{snackr-042-js-xxxxxx}`), XP breakdown, rank progress, skill points, badge progress, and a Wordle-style shareable result with no spoilers.

### Tone

Encouraging, never shaming. Getting stuck is normal. Praise good debugging PROCESS, not just the final fix. Challenging, but help is always available.

## Progression

- XP: easy 10, medium 25, hard 50. Bonuses: no hints +3, bonus find +5, debug journal +2, fast solve +3, daily solved same day +10, streak bonus. Each hint -2.
- Ranks: Intern → Junior → Mid-level → Senior → Staff → Bug Hunter
- Streaks, a solved-days heatmap, a skill map per bug category and per language, and badges (e.g. "Type Detective", "Async Whisperer", "No Hints Needed", "Polyglot")
- Daily bug: the same bug for everyone each day, plus a practice library of past bugs
- MVP saves progress in localStorage (always wrapped in try/catch). Accounts and leaderboards come later.

## Languages

- MVP: JavaScript and Python, chosen from a dropdown. Each challenge exists in both.
- Two kinds of bugs: universal logic bugs (in every language) and language-specific bugs (marked with a language badge, e.g. JS type coercion, Python mutable default arguments).
- Each language uses its real test style so players learn real tools.
- Later: Java, TypeScript, SQL, C++ and more via a server-side execution engine (e.g. Judge0 or Piston).

## Tech stack (MVP)

- TypeScript, Vite, React (npm; Node 24)
- Monaco Editor via `@monaco-editor/react`
- JavaScript challenges run in a Web Worker sandbox with a timeout; Python challenges run with Pyodide, also in a Web Worker with a timeout
- Vitest for our own unit tests, ESLint + Prettier
- GitHub Actions for CI and deploying to GitHub Pages
- No backend in the MVP
- Note: TypeScript is pinned to 6.0.x because typescript-eslint does not support TS 7 yet. Revisit when it does.

## Challenge content format

- Each challenge lives in its own folder, e.g. `content/challenges/042-leaderboard/`, with:
  - `challenge.json`: id, title, ticket, character, difficulty, skill, lesson, briefing, hints (per language), review rules, "where this shows up at work", bonus tests description
  - Per language: buggy starter code, the correct reference solution, and tests
- Mentor feedback is rule-based in the MVP (written into each challenge), not AI.
- A verification script (the "mutation check") must confirm for every challenge and language: the reference solution passes all tests, and the buggy version fails at least one required test. Run it in CI so a broken challenge can never ship.

## Starter challenges (MVP): 5 easy, in JavaScript and Python

1. Leaderboard sorts "95" above "120" because points are strings (bonus: sort mutates the original list)
2. Off-by-one error in a "last 7 days of orders" filter
3. Wrong comparison operator in a free-delivery threshold (`>` vs `>=`)
4. A discount function that forgets to return a value in one branch
5. Money math with floating point giving totals like 10.000000001 (lesson: work in cents)

## Security and safety

- User code only runs inside Web Workers with timeouts. Never use eval on the main page.
- No secrets, tokens or personal data in the repo.
- Leaderboard flags must later be issued by a server that re-runs the official tests, so points can't be faked. MVP flags are for personal progress only, and the README must say so.

## GitHub and portfolio

- Repo: `Barrientosgers/bug-hunt` (PUBLIC), MIT license, topics: debugging, education, game, react, typescript, python, junior-developers.
- Commit at the end of each phase with clear messages so history tells the story of the build.
- GitHub Actions: lint, unit tests and the challenge verification script on every push; deploy to GitHub Pages from main.
- Final README: what Bug Hunt is and why it exists, demo GIF, live link, how a challenge works, mentor and hint philosophy, how challenges are verified (mutation check), tech stack, architecture diagram, roadmap, CI badge.

## Phases

0. Setup: repo, Vite + React + TS, ESLint, Prettier, Vitest, folder structure, .gitignore, MIT license, this file. First commit and push.
1. Challenge format + the leaderboard challenge (JS and Python) + the verification script
2. Code runners: JavaScript Web Worker sandbox and Pyodide Web Worker, both with timeouts, returning test results and console output
3. Game screen: ticket, language dropdown, Monaco editor, run tests, results, console, debug journal, timer
4. Mentor system: briefing, hint ladder, stuck detection, post-solve code review, lesson
5. Rewards: flag, XP breakdown, ranks, skill points, badges, streaks (localStorage), shareable result
6. Remaining 4 starter challenges + daily bug selection + practice library page
7. CI (lint, tests, verification) and GitHub Pages deployment
8. Polish: home page, accessibility check, mobile layout, README with demo GIF and live link

## Later (do NOT build yet, but keep the architecture ready)

- Accounts with GitHub login, server-verified signed flags, leaderboards (Supabase)
- "Real-dev mode": a GitHub App that creates a challenge repo in the player's account; they debug in VS Code, push, and GitHub Actions verifies the fix
- More languages via a code execution server
- Real-world replays (past bugs from open-source projects, e.g. BugsJS, BugsInPy, Defects4J, with license credit) and live "good first issue" recommendations
- AI mentor that reviews the player's real fix and only asks guiding questions
- Security Hunt track (OWASP Top 10 vulnerabilities to find and patch)
- Community-created challenges

## Challenge types roadmap (after the MVP; keep the architecture ready)

Real debugging is a loop: **Reproduce → Locate → Fix → Prevent**. The MVP only trains "Fix" (code bugs). Each new type trains another part of the loop and shares the mentor, hints, XP, flags and badges. Each `kind` gets its own screen and its own grader.

- Format prep (small separate change, around Phase 3): add `kind` to `challenge.json` (default `"code"`) and an optional `evidence` field (logs, stack traces).
- Order after the MVP, one phase each:
  1. Warm-ups: 30-second "what does this print?" puzzles (daily habit, keeps streaks alive)
  2. Code Review Mode: Priya sends a small PR; the player clicks the bad line and explains why
  3. QA Mode + Trace Mode: a sandboxed iframe with a fake Snackr page; the player writes a bug report, then traces the wrong function with a simulated DevTools panel (console, network, call stack)
  4. Bisect Mode: a mini git history; find the commit that broke it
  5. UX and accessibility bugs (contrast, missing labels, double-submit, focus traps)
  6. Data and SQL bugs (JSON/CSV with the existing runners; SQL via sql.js in a Worker, same pattern as Pyodide)

### Content principles

- Challenges are authored (fictional Snackr bugs), written with AI assistance and reviewed by the owner. Verified by the mutation check. The README should say openly that challenges are written with AI assistance.
- Quality over quantity; early players must be able to win; every challenge ends with one memorable sentence.
- "Inspired by a real bug" cards (e.g. Mars Climate Orbiter unit mix-up, Y2K two-digit years, Knight Capital deployment) shown after solving, as part of "where this shows up at work". Fictional code, but only facts that are verified accurate.
- Real bugs from open-source projects stay a post-launch option (see "Real-world replays"), trimmed to small self-contained versions, labeled as real, with license credit.

## Commands

`npm run dev` · `npm run build` · `npm run lint` · `npm run format:check` · `npm test` · `npm run verify` (mutation check on every challenge)
