// PCS Prep — garcha_export.mjs
// Writes the whole PPSC PCS syllabus that lives inside the app as readable Markdown on GitHub:
//   syllabus/README.md                     index by paper and section, with exam pattern
//   syllabus/<PAPER>/<id>-<slug>.md        one page per topic: short notes, Punjab angle, deep dives,
//                                          free reading links, books, practice MCQs (answers folded), Mains questions
//   past-papers/README.md + <id>.md        real PPSC papers already in the app, with keys and explanations
// No AI. It only re-formats what is already in the app (site/index.html).
// Usage: node garcha_export.mjs <folder with index.html> <output repo folder>
import fs from "node:fs";
import path from "node:path";

const site = process.argv[2] || ".";
const out = process.argv[3] || ".";
const html = fs.readFileSync(path.join(site, "index.html"), "utf8");
const m = html.match(/const D = (\{[\s\S]*?\});\nconst GRP/);
if (!m) throw new Error("Could not find app data in index.html");
const D = JSON.parse(m[1]);
const ver = (html.match(/PCS Prep v[\d.]+/) || ["PCS Prep"])[0];

const APP = "https://mangeshwarsinghp14.github.io/PCS-Prep/";
const slug = s => String(s).toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50) || "topic";
const one = s => String(s ?? "").replace(/\r/g, "").trim();
const cell = s => one(s).replace(/\|/g, "\\|").replace(/\n+/g, " ");
const bullets = arr => (arr || []).map(b => `- ${one(b).replace(/\n+/g, " ")}`).join("\n");
const link = r => r && r.u ? `[${cell(r.t)}](${r.u})` : cell(r && r.t);
const PRI = { H: "High", M: "Medium", L: "Low" };

// stable shuffle so the right option is not always first, but the file does not churn between runs
function seeded(str) { let h = 2166136261; for (const c of str) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909)) >>> 0) / 4294967296; }
function mcqBlock(q, i) {
  const opts = (q.o || []).map((t, k) => ({ t, ok: k === (q.a ?? 0) }));
  // statement-style questions ("1 only", "Both 1 and 2") keep their natural order
  const statementy = opts.some(o => /^(\d|both|neither|all|none)\b/i.test(one(o.t)));
  if (!statementy) { const r = seeded(q.q); for (let k = opts.length - 1; k > 0; k--) { const j = Math.floor(r() * (k + 1)); [opts[k], opts[j]] = [opts[j], opts[k]]; } }
  const L = "abcdefgh";
  const right = opts.findIndex(o => o.ok);
  return `**${i}.** ${one(q.q).replace(/\n/g, "  \n")}\n\n${opts.map((o, k) => `(${L[k]}) ${one(o.t)}`).join("  \n")}\n\n<details><summary>Answer</summary>\n\n**(${L[right]}) ${one(opts[right] && opts[right].t)}** — ${one(q.e)}\n\n</details>\n`;
}
function ansBlock(a) {
  if (!a) return "";
  if (typeof a === "string") return a;
  const parts = [];
  for (const [k, v] of Object.entries(a)) {
    const head = k[0].toUpperCase() + k.slice(1);
    parts.push(Array.isArray(v) ? `*${head}:*\n${bullets(v)}` : `*${head}:* ${one(v)}`);
  }
  return parts.join("\n\n");
}

const papers = D.syl.papers;
const index = [];
const topicFile = {};
let topicCount = 0, mcqCount = 0, mainsCount = 0;
const syl = path.join(out, "syllabus");
fs.rmSync(syl, { recursive: true, force: true });
fs.mkdirSync(syl, { recursive: true });

for (const p of papers) {
  const dir = path.join(syl, p.id);
  fs.mkdirSync(dir, { recursive: true });
  const rows = [];
  let num = 0;
  for (const sc of p.sections) {
    rows.push(`\n#### ${sc.name}\n`);
    for (const n of sc.nodes) {
      if (n.removed) continue;
      topicCount++;
      const file = `${String(++num).padStart(2, "0")}-${n.id}-${slug(n.t)}.md`;
      topicFile[n.id] = `../syllabus/${p.id}/${file}`;
      const dp = D.deep[n.id] || {};
      const grp = D.groups[n.g];
      const s = [];
      s.push(`# ${one(n.t)}\n`);
      s.push(`**${p.name}** › ${sc.name}${grp ? ` · Subject: ${grp.n}` : ""} · Priority: ${PRI[n.pr] || n.pr || "–"}\n`);
      s.push(`> Official syllabus line: ${one(n.x)}\n`);
      s.push(`[Study this in the app](${APP}#node/${n.id}) · [Index](../README.md)\n`);
      if (n.brief && n.brief.length) s.push(`## Short notes\n\n${bullets(n.brief)}\n`);
      if (n.punjab && n.punjab.length) s.push(`## Punjab angle\n\n${bullets(n.punjab)}\n`);
      if (n.focus) s.push(`## How PPSC asks it\n\n${one(n.focus)}\n`);
      if (dp.deep && dp.deep.length) {
        s.push(`## Deep dive\n`);
        for (const d of dp.deep) s.push(`### ${one(d.h)}\n\n${bullets(d.b)}\n`);
      }
      const reads = [].concat(D.ncert[n.id] || [], dp.read || []);
      const seen = new Set();
      const uniq = reads.filter(r => r && r.u && !seen.has(r.u) && seen.add(r.u));
      if (uniq.length) s.push(`## Free reading (official and open sources)\n\n${uniq.map(r => `- ${link(r)}`).join("\n")}\n`);
      if (dp.books && dp.books.length) s.push(`## Books\n\n${dp.books.map(b => `- **${cell(b.t)}** — ${cell(b.a)}${b.why ? `: ${one(b.why)}` : ""}`).join("\n")}\n`);
      if (n.sources && n.sources.length) s.push(`## Sources the notes follow\n\n${bullets(n.sources)}\n`);
      if (n.mcq && n.mcq.length) { s.push(`## Practice MCQs (${n.mcq.length})\n`); n.mcq.forEach((q, i) => s.push(mcqBlock(q, i + 1))); mcqCount += n.mcq.length; }
      if (n.qs && n.qs.length) {
        s.push(`## Mains practice questions (${n.qs.length})\n`);
        n.qs.forEach((q, i) => {
          s.push(`**${i + 1}.** ${one(q.q || q)}\n`);
          if (q.outline && q.outline.length) s.push(`<details><summary>Answer outline</summary>\n\n${bullets(Array.isArray(q.outline) ? q.outline : [q.outline])}\n\n</details>\n`);
        });
        mainsCount += n.qs.length;
      }
      s.push(`---\n*Generated from ${ver}. Changeable facts are as of the date shown in the app. Report mistakes in the repository's Issues.*\n`);
      fs.writeFileSync(path.join(dir, file), s.join("\n"));
      rows.push(`- [${one(n.t)}](${p.id}/${file}) · ${PRI[n.pr] || ""}${n.mcq && n.mcq.length ? ` · ${n.mcq.length} MCQs` : ""}`);
    }
  }
  index.push(`### ${p.stage}: ${p.name}\n\n*${one(p.marks)}*\n${rows.join("\n")}\n`);
}

const pat = D.guide && D.guide.pattern;
const patMd = pat ? [
  `## Exam pattern\n`,
  `| Prelims paper | Questions and marks | Time | Role |\n|---|---|---|---|\n${(pat.prelims || []).map(r => `| ${r.map(cell).join(" | ")} |`).join("\n")}\n`,
  bullets(pat.prelimsNotes), "",
  `| Mains paper | Marks |\n|---|---|\n${(pat.mains || []).map(r => `| ${r.map(cell).join(" | ")} |`).join("\n")}\n`,
  bullets(pat.mainsNotes), ""
].join("\n") : "";

fs.writeFileSync(path.join(syl, "README.md"), [
  `# PPSC PCS — complete syllabus with notes\n`,
  `Every topic of the official PPSC Punjab Civil Services syllabus, written out from the **PCS Prep** app: short notes, Punjab angle, deep dives, free reading links, books, practice MCQs (answers folded) and Mains questions.\n`,
  `**${topicCount} topics · ${mcqCount} practice MCQs · ${mainsCount} Mains questions.** Refreshed automatically whenever the app changes.\n`,
  `- Open the app: ${APP}`,
  `- Learn in random order with quick checks: [Shuffle Learn](${APP}#learn)`,
  `- Real PPSC papers: [past-papers](../past-papers/README.md)\n`,
  patMd,
  `## Topics\n`,
  index.join("\n"),
  `\n---\n*Copyrighted textbooks are linked, not copied. Official PPSC notices: https://ppsc.gov.in*\n`
].join("\n"));

// past papers
const pp = path.join(out, "past-papers");
fs.rmSync(pp, { recursive: true, force: true });
fs.mkdirSync(pp, { recursive: true });
const ppRows = [];
for (const P of D.pyq.pre || []) {
  const s = [`# ${P.exam} — ${P.paper}${P.set ? ` (Set ${P.set})` : ""}\n`, `Held ${P.date || P.year}. Answer key: ${P.keyLabel || P.key || "–"}. ${P.questions.length} questions.\n`];
  if (P.source && P.source.length) s.push(`Sources: ${P.source.map((u, i) => `[${i + 1}](${u})`).join(" · ")}\n`);
  P.questions.forEach(q => {
    const L = "abcd";
    s.push(`**Q${q.n}.** ${one(q.q).replace(/\n/g, "  \n")}\n\n${(q.o || []).map((t, k) => `(${L[k]}) ${one(t)}`).join("  \n")}\n`);
    s.push(`<details><summary>Answer</summary>\n\n${q.a != null && q.o ? `**(${L[q.a]}) ${one(q.o[q.a])}**` : "Key not available"}${q.e ? ` — ${one(q.e)}` : ""}${q.note ? `\n\n*Note:* ${one(q.note)}` : ""}${q.node && topicFile[q.node] ? `\n\nTopic: [notes](${topicFile[q.node]})` : ""}\n\n</details>\n`);
  });
  fs.writeFileSync(path.join(pp, `${P.id}.md`), s.join("\n"));
  ppRows.push(`| ${cell(P.exam)} | ${cell(P.paper)} | ${P.questions.length} MCQs | [open](${P.id}.md) |`);
}
for (const P of D.pyq.mains || []) {
  const s = [`# ${P.exam} — ${P.paper}\n`, `Held ${P.date || P.year}. ${P.questions.length} questions.${P.note ? ` ${one(P.note)}` : ""}\n`];
  if (P.source && P.source.length) s.push(`Sources: ${P.source.map((u, i) => `[${i + 1}](${u})`).join(" · ")}\n`);
  P.questions.forEach(q => {
    s.push(`**Q${q.n}.** ${one(q.q).replace(/\n/g, "  \n")}${q.marks ? ` *(${q.marks} marks${q.words ? `, ${q.words} words` : ""})*` : ""}\n`);
    const extra = [q.why ? `*Why it matters:* ${one(q.why)}` : "", ansBlock(q.ans), q.node && topicFile[q.node] ? `Topic: [notes](${topicFile[q.node]})` : ""].filter(Boolean).join("\n\n");
    if (extra) s.push(`<details><summary>Model answer points</summary>\n\n${extra}\n\n</details>\n`);
  });
  fs.writeFileSync(path.join(pp, `${P.id}.md`), s.join("\n"));
  ppRows.push(`| ${cell(P.exam)} | ${cell(P.paper)} | ${P.questions.length} questions | [open](${P.id}.md) |`);
}
fs.writeFileSync(path.join(pp, "README.md"), `# Real PPSC PCS papers\n\nPapers inside the PCS Prep app, with keys, explanations and links to the topic notes. Practise them timed in the app: ${APP}#papers\n\n| Exam | Paper | Size | |\n|---|---|---|---|\n${ppRows.join("\n")}\n\n[Back to the syllabus](../syllabus/README.md)\n`);

console.log(`exported ${topicCount} topics, ${mcqCount} MCQs, ${mainsCount} Mains questions, ${ppRows.length} papers`);
