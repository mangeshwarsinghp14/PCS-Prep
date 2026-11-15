# PCS Prep

Personal study app for the Punjab Civil Services (PPSC PCS) exam. It updates itself every day from the internet, with rules written in code — no AI and no paid service.

- **App:** https://mangeshwarsinghp14.github.io/PCS-Prep/ — open on a phone and use *Add to Home Screen*.
- **Full syllabus to read on GitHub:** [syllabus/](syllabus/README.md) — every PPSC topic with notes, Punjab angle, deep dives, free reading links, books, practice MCQs (answers folded), Mains questions, and how often PPSC asked it ([Most asked](syllabus/MOST-ASKED.md)).
- **Real PPSC papers:** [past-papers/](past-papers/README.md) — with keys, explanations and links to the topic notes.
- **Current affairs, month by month:** [current-affairs/](current-affairs/README.md) — summaries, key figures, exam angles, quiz, plus *who's who and key rates*.
- **Branches:** `gh-pages` holds the app and its live data; `main` holds the updater and the Markdown pages.

## How it runs on its own

`.github/workflows/garcha-auto-update.yml` runs twice a day (06:47 and 18:47 IST) and on demand (Actions → *PCS Prep auto-update* → *Run workflow*):

| Step | Script | What it does |
|---|---|---|
| 1 | `garcha_train.mjs` | Learns which words point to which syllabus topic from the app's own notes (TF-IDF statistics). |
| 2 | `garcha_feed.mjs` + `garcha_rules.mjs` | Reads PIB (follows each release to its English page and reads the full text), RBI and 20 news searches. Scores each item for exam value; drops politics, crime, gossip and routine notices; merges reports of the same event; writes 2–3 summary points, key figures and an exam angle; tags syllabus topics; cleans older items with the same rules. Watches ppsc.gov.in and news for a PCS notification (strict rules, so coaching ads don't trigger it). |
| 3 | `garcha_quiz.mjs` | Makes quiz questions from the news: fill-the-blank on a country, bloc, body, state or Punjab district; fill-the-number on outlays and figures; which ministry issued a PIB release. |
| 4 | `garcha_facts.mjs` | Keeps *facts that change* current: who holds key posts (starting from a list checked on 15 Nov 2026), the repo/SDF/MSF rates from RBI's MPC resolution, latest CPI inflation and GDP growth. A change is accepted only when two different reports (or one official source) agree; each change becomes a "Fact update" with a question. |
| 5 | — | Commits `feed.json`, `archive/<month>.json`, `facts.json`, `alert.json`, `state.json`, `status.json` to `gh-pages`; the installed app pulls them whenever it is online. |
| 6 | `garcha_export.mjs` | Rewrites `syllabus/`, `past-papers/` and `current-affairs/` on `main`. |
| 7 | `garcha_health.mjs` | Keeps the schedule switched on, and opens a GitHub issue labelled `updater-health` (GitHub emails the owner) if a source keeps failing or nothing new arrives for 3 days; closes it by itself when things recover. |

## Is this free?

Yes. The repository is public, so GitHub Actions minutes on standard runners and GitHub Pages hosting cost nothing. Each run takes 2–4 minutes. GitHub pauses scheduled workflows after 60 days without activity; the workflow re-enables itself on every run, and *Run workflow* restarts it if it is ever paused.

## Limits

- ppsc.gov.in usually refuses connections from GitHub's servers, so the PPSC watch relies on news reports; always confirm on ppsc.gov.in.
- News items carry the headline, related headlines and the source link (newspapers don't allow their full text to be copied); PIB and RBI items are summarised from the full official text.
- Office holders start from a hand-checked list; new appointments are picked up from headlines that agree. If two reports disagree, nothing changes until they agree.
