// PCS Prep — garcha_train.mjs
// "Trains" the no-AI tagger: learns which words point to which syllabus topic,
// using the app's own notes (topic titles, syllabus lines, short notes, deep-dive headings)
// and the current-affairs items already tagged by hand. Pure statistics (TF-IDF), no AI.
// Usage: node garcha_train.mjs <site folder containing index.html>  → writes <site>/model.json
import fs from "node:fs";
import path from "node:path";

const site = process.argv[2] || ".";
const html = fs.readFileSync(path.join(site, "index.html"), "utf8");
const m = html.match(/const D = (\{[\s\S]*?\});\nconst GRP/);
if (!m) throw new Error("Could not find app data in index.html");
const D = JSON.parse(m[1]);

import { tokens } from "./garcha_text.mjs";

const docs = {};   // node id -> token counts
const meta = {};   // node id -> {g, t, stage}
const add = (id, text, w = 1) => { const d = docs[id] = docs[id] || {}; for (const k of tokens(text)) d[k] = (d[k] || 0) + w; };
for (const p of D.syl.papers) for (const sc of p.sections) for (const n of sc.nodes) {
  if (n.removed || /^(cs|lp|le|es|iv)\d/.test(n.id)) continue; // not news topics
  meta[n.id] = { t: n.t, g: n.g || "", stage: p.stage, paper: p.id };
  add(n.id, n.t, 4); add(n.id, n.x, 2);
  for (const b of n.brief || []) add(n.id, b, 1);
  for (const b of n.punjab || []) add(n.id, b, 1);
  for (const d of n.deep || []) add(n.id, d.h, 2);
}
// hand-tagged current affairs = labelled training examples
for (const it of (D.ca && D.ca.items) || []) for (const id of it.nodes || []) if (docs[id]) { add(id, it.title, 3); for (const b of it.points || []) add(id, b, 1); }

const N = Object.keys(docs).length, df = {};
for (const d of Object.values(docs)) for (const k of Object.keys(d)) df[k] = (df[k] || 0) + 1;
const model = { trained: new Date().toISOString(), nodes: meta, w: {} };
for (const [id, d] of Object.entries(docs)) {
  const total = Object.values(d).reduce((a, b) => a + b, 0) || 1;
  const scored = Object.entries(d).map(([k, c]) => [k, (c / total) * Math.log(1 + N / df[k])]).sort((a, b) => b[1] - a[1]).slice(0, 60);
  for (const [k, s] of scored) (model.w[k] = model.w[k] || {})[id] = +s.toFixed(5);
}
fs.writeFileSync(path.join(site, "model.json"), JSON.stringify(model));
console.log(`trained on ${N} topics, ${Object.keys(model.w).length} keywords`);
