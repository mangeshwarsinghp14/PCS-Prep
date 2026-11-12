# PCS Prep

Personal study app for the Punjab Civil Services (PPSC PCS) exam.

- **App:** https://mangeshwarsinghp14.github.io/PCS-Prep/ — open on a phone and use *Add to Home Screen*.
- **Full syllabus to read on GitHub:** [syllabus/](syllabus/README.md) — every PPSC topic with notes, Punjab angle, deep dives, free reading links, books, practice MCQs (answers folded) and Mains questions.
- **Real PPSC papers:** [past-papers/](past-papers/README.md) — with keys, explanations and links to the topic notes.
- **Branches:** `gh-pages` holds the app; `main` holds the updater and the Markdown syllabus.

## Automatic updates (no AI)

`.github/workflows/garcha-auto-update.yml` runs twice a day (06:47 and 18:47 IST) and on demand (Actions → *PCS Prep auto-update* → *Run workflow*):

1. `updater/scripts/garcha_train.mjs` learns which words point to which syllabus topic from the app's own notes and hand-tagged current affairs (TF-IDF statistics).
2. `updater/scripts/garcha_feed.mjs` reads PIB and RBI feeds plus news searches, keeps exam-relevant English items (drops crime, film, party politics, routine RBI auctions), removes duplicates, tags each item to syllabus topics, and checks ppsc.gov.in and news for a new PCS notification.
3. It commits `feed.json` (newest 400), `archive/<month>.json`, `alert.json` and `status.json` to `gh-pages`. The installed app pulls them whenever it is online.

`status.json` shows the last run and which sources worked. Auto-collected items carry the headline, a short summary where the source gives one, the source link and syllabus links; open the source for detail.
4. `updater/scripts/garcha_export.mjs` rewrites `syllabus/` and `past-papers/` on `main` from the app's data, so the readable syllabus always matches the app.

## Is this free?

Yes. The repository is public, so GitHub Actions minutes on standard runners and GitHub Pages hosting cost nothing. Each run takes about a minute. GitHub pauses scheduled workflows after 60 days with no commits; the updater's own commits keep it active, and *Run workflow* restarts it if it is ever paused.
