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

// v5.7: where and how often PPSC asked each topic (same rules as the app)
const PYQ_PAPER = { GS: "GS", CSAT: "CSAT", GS1: "GS1", GS2: "GS2", GS3: "GS3", GS4: "GS4", ESSAY: "Essay", ENG: "English", PUN: "Punjabi" };
const pyqId = (f, n) => "py-" + f + "-" + String(n).replace(/[^A-Za-z0-9]+/g, "_");
const qAnchor = n => "q" + String(n).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "");
const PYM = {}, BYNODE = {}, CYC = new Set();
for (const p of (D.pyq.pre || []).concat(D.pyq.mains || [])) {
  const pre = p.id.startsWith("pre"), cyc = ((p.exam || "").match(/PCS (\d{4})/) || [0, p.year])[1]; CYC.add(cyc);
  for (const x of p.questions) { if (x.skip || !x.q) continue; const id = pyqId(p.id, x.n);
    const m = PYM[id] = { id, f: p.id, pre, yr: String(p.year), cyc, paper: PYQ_PAPER[p.paper] || p.paper, n: x.n, q: one(x.q), node: x.node, label: `${pre ? "Prelims" : "Mains"} ${p.year} · ${PYQ_PAPER[p.paper] || p.paper} Q${x.n}` };
    if (x.node) (BYNODE[x.node] = BYNODE[x.node] || []).push(m); } }
const NCYC = CYC.size, REP = (D.pyqx && D.pyqx.rep) || {}, LIKE = (D.pyqx && D.pyqx.like) || {};
function stat(nid) { const refs = BYNODE[nid] || []; const cyc = new Set(refs.map(m => m.cyc)); const yrs = [...new Set(refs.map(m => m.yr))].sort();
  const rows = {}; refs.forEach(m => { const k = `${m.pre ? "Prelims" : "Mains"} ${m.paper}`; const r = rows[k] = rows[k] || {}; r[m.yr] = (r[m.yr] || 0) + 1; });
  return { n: refs.length, pre: refs.filter(m => m.pre).length, mains: refs.filter(m => !m.pre).length, refs, yrs, rows, every: NCYC >= 3 && cyc.size >= NCYC, cycles: cyc.size }; }
const yy = y => "’" + String(y).slice(-2);
const badge = nid => { const s = stat(nid); return s.n ? `${s.every ? "🔥" : "🔁"} ${s.n}× (${s.yrs.map(yy).join(" ")})` : ""; };
const pqLink = (m, from) => `[${m.label}](${from}${m.f}.md#${qAnchor(m.n)})`;
const repOf = id => (REP[id] || []).map(r => PYM[r]).filter(Boolean).sort((a, b) => a.yr.localeCompare(b.yr));

// stable shuffle so the right option is not always first, but the file does not churn between runs
function seeded(str) { let h = 2166136261; for (const c of str) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909)) >>> 0) / 4294967296; }
function mcqBlock(q, i, id) {
  const opts = (q.o || []).map((t, k) => ({ t, ok: k === (q.a ?? 0) }));
  // statement-style questions ("1 only", "Both 1 and 2") keep their natural order
  const statementy = opts.some(o => /^(\d|both|neither|all|none)\b/i.test(one(o.t)));
  if (!statementy) { const r = seeded(q.q); for (let k = opts.length - 1; k > 0; k--) { const j = Math.floor(r() * (k + 1)); [opts[k], opts[j]] = [opts[j], opts[k]]; } }
  const L = "abcdefgh";
  const right = opts.findIndex(o => o.ok);
  return `**${i}.** ${one(q.q).replace(/\n/g, "  \n")}\n\n${opts.map((o, k) => `(${L[k]}) ${one(o.t)}`).join("  \n")}\n\n<details><summary>Answer</summary>\n\n**(${L[right]}) ${one(opts[right] && opts[right].t)}** — ${one(q.e)}\n\n</details>\n${likeNote(id)}`;
}
function likeNote(id) { const lk = (LIKE[id] || []).map(r => PYM[r]).filter(Boolean); return lk.length ? `\n*Like a real PPSC question: ${lk.map(m => pqLink(m, "../../past-papers/")).join(", ")}*\n` : ""; }
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
      s.push(`**${p.name}** › ${sc.name}${grp ? ` · Subject: ${grp.n}` : ""} · Priority: ${PRI[n.pr] || n.pr || "–"}${badge(n.id) ? ` · **Asked by PPSC: ${badge(n.id)}**` : ""}\n`);
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
      const st = stat(n.id);
      if (st.n) {
        s.push(`## Asked in PPSC papers — ${st.n} time${st.n === 1 ? "" : "s"}${st.every ? " 🔥 (in every recent exam)" : ` (in ${st.cycles} of ${NCYC} recent exams)`}\n`);
        s.push(`| Paper | Years asked |\n|---|---|\n${Object.entries(st.rows).map(([k, r]) => `| ${k} | ${Object.keys(r).sort().map(y => r[y] > 1 ? `${y} (×${r[y]})` : y).join(", ")} |`).join("\n")}\n`);
        s.push(st.refs.slice().sort((a, b) => b.yr.localeCompare(a.yr)).map(m => { const rp = repOf(m.id); return `- ${pqLink(m, "../../past-papers/")} — ${cell(m.q.split("\n")[0]).slice(0, 160)}${rp.length ? `  \n  ↻ *Same theme also asked:* ${rp.map(x => pqLink(x, "../../past-papers/")).join(", ")}` : ""}`; }).join("\n") + "\n");
      }
      if (n.mcq && n.mcq.length) { s.push(`## Practice MCQs (${n.mcq.length})\n`); n.mcq.forEach((q, i) => s.push(mcqBlock(q, i + 1, n.id + "q" + i))); mcqCount += n.mcq.length; }
      if (n.qs && n.qs.length) {
        s.push(`## Mains practice questions (${n.qs.length})\n`);
        n.qs.forEach((q, i) => {
          s.push(`**${i + 1}.** ${one(q.q || q)}\n${likeNote(n.id + "m" + i)}`);
          if (q.outline && q.outline.length) s.push(`<details><summary>Answer outline</summary>\n\n${bullets(Array.isArray(q.outline) ? q.outline : [q.outline])}\n\n</details>\n`);
        });
        mainsCount += n.qs.length;
      }
      s.push(`---\n*Generated from ${ver}. Changeable facts are as of the date shown in the app. Report mistakes in the repository's Issues.*\n`);
      fs.writeFileSync(path.join(dir, file), s.join("\n"));
      rows.push(`- [${one(n.t)}](${p.id}/${file}) · ${PRI[n.pr] || ""}${badge(n.id) ? ` · **${badge(n.id)}**` : ""}${n.mcq && n.mcq.length ? ` · ${n.mcq.length} MCQs` : ""}`);
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
  `- Real PPSC papers: [past-papers](../past-papers/README.md)`,
  `- **[Most asked by PPSC](MOST-ASKED.md)** — topics ranked by how often they were asked, years, repeated themes, real subject weights\n`,
  `**Marks:** 🔁 5× (’18 ’21 ’25) = asked 5 times in PPSC papers, in those years · 🔥 = asked in every recent exam. Counts come from the ${Object.keys(PYM).length} real questions in the app's ${(D.pyq.pre || []).length + (D.pyq.mains || []).length} papers.\n`,
  patMd,
  `## Topics\n`,
  index.join("\n"),
  `\n---\n*Copyrighted textbooks are linked, not copied. Official PPSC notices: https://ppsc.gov.in*\n`
].join("\n"));

// past papers
function ppNote(id, node) { const rp = repOf(id), st = node ? stat(node) : null; const parts = [];
  if (rp.length) parts.push(`↻ **Same theme also asked:** ${rp.map(m => pqLink(m, "")).join(", ")}`);
  if (st && st.n > 1) parts.push(`Topic asked ${st.n}× (${st.yrs.join(", ")})${st.every ? " 🔥" : ""}`);
  return parts.length ? `*${parts.join(" · ")}*\n` : ""; }
const pp = path.join(out, "past-papers");
fs.rmSync(pp, { recursive: true, force: true });
fs.mkdirSync(pp, { recursive: true });
const ppRows = [];
for (const P of D.pyq.pre || []) {
  const s = [`# ${P.exam} — ${P.paper}${P.set ? ` (Set ${P.set})` : ""}\n`, `Held ${P.date || P.year}. Answer key: ${P.keyLabel || P.key || "–"}. ${P.questions.length} questions.\n`];
  if (P.source && P.source.length) s.push(`Sources: ${P.source.map((u, i) => `[${i + 1}](${u})`).join(" · ")}\n`);
  P.questions.forEach(q => {
    const L = "abcd";
    s.push(`<a id="${qAnchor(q.n)}"></a>\n\n**Q${q.n}.** ${one(q.q).replace(/\n/g, "  \n")}\n\n${(q.o || []).map((t, k) => `(${L[k]}) ${one(t)}`).join("  \n")}\n`);
    s.push(`<details><summary>Answer</summary>\n\n${q.a != null && q.o ? `**(${L[q.a]}) ${one(q.o[q.a])}**` : "Key not available"}${q.e ? ` — ${one(q.e)}` : ""}${q.note ? `\n\n*Note:* ${one(q.note)}` : ""}${q.node && topicFile[q.node] ? `\n\nTopic: [notes](${topicFile[q.node]})` : ""}\n\n</details>\n${ppNote(pyqId(P.id, q.n), q.node)}`);
  });
  fs.writeFileSync(path.join(pp, `${P.id}.md`), s.join("\n"));
  ppRows.push(`| ${cell(P.exam)} | ${cell(P.paper)} | ${P.questions.length} MCQs | [open](${P.id}.md) |`);
}
for (const P of D.pyq.mains || []) {
  const s = [`# ${P.exam} — ${P.paper}\n`, `Held ${P.date || P.year}. ${P.questions.length} questions.${P.note ? ` ${one(P.note)}` : ""}\n`];
  if (P.source && P.source.length) s.push(`Sources: ${P.source.map((u, i) => `[${i + 1}](${u})`).join(" · ")}\n`);
  P.questions.forEach(q => {
    s.push(`<a id="${qAnchor(q.n)}"></a>\n\n**Q${q.n}.** ${one(q.q).replace(/\n/g, "  \n")}${q.marks ? ` *(${q.marks} marks${q.words ? `, ${q.words} words` : ""})*` : ""}\n`);
    const extra = [q.why ? `*Why it matters:* ${one(q.why)}` : "", ansBlock(q.ans), q.node && topicFile[q.node] ? `Topic: [notes](${topicFile[q.node]})` : ""].filter(Boolean).join("\n\n");
    if (extra) s.push(`<details><summary>Model answer points</summary>\n\n${extra}\n\n</details>\n`);
    s.push(ppNote(pyqId(P.id, q.n), q.node));
  });
  fs.writeFileSync(path.join(pp, `${P.id}.md`), s.join("\n"));
  ppRows.push(`| ${cell(P.exam)} | ${cell(P.paper)} | ${P.questions.length} questions | [open](${P.id}.md) |`);
}
fs.writeFileSync(path.join(pp, "README.md"), `# Real PPSC PCS papers\n\nPapers inside the PCS Prep app, with keys, explanations and links to the topic notes. Practise them timed in the app: ${APP}#papers\n\n| Exam | Paper | Size | |\n|---|---|---|---|\n${ppRows.join("\n")}\n\n[Back to the syllabus](../syllabus/README.md)\n`);

// most asked page
{
  const NODES = []; for (const p of papers) for (const sc of p.sections) for (const n of sc.nodes) if (!n.removed) NODES.push(n);
  const ranked = NODES.map(n => ({ n, s: stat(n.id) })).filter(x => x.s.n).sort((a, b) => b.s.n - a.s.n || b.s.cycles - a.s.cycles);
  const tl = n => `[${one(n.t)}](${topicFile[n.id].replace("../syllabus/", "")})`;
  const seen = new Set(), themes = [];
  for (const id of Object.keys(REP)) { if (seen.has(id) || !PYM[id]) continue; const g = [], st = [id]; seen.add(id);
    while (st.length) { const x = st.pop(); g.push(PYM[x]); for (const y of REP[x] || []) if (!seen.has(y) && PYM[y]) { seen.add(y); st.push(y); } }
    const m = {}; g.forEach(x => { const k = x.f + "|" + x.q.slice(0, 60); if (m[k]) m[k].ns.push(x.n); else m[k] = { ...x, ns: [x.n] }; });
    const merged = Object.values(m).sort((a, b) => a.yr.localeCompare(b.yr)); merged.exams = new Set(merged.map(x => x.cyc + (x.pre ? "p" : "m"))).size; merged.csat = merged.every(x => x.paper === "CSAT");
    if (merged.length > 1) themes.push(merged); }
  themes.sort((a, b) => (a.csat - b.csat) || (b.exams - a.exams) || (b.length - a.length));
  const gs = (D.pyq.pre || []).filter(p => p.paper === "GS"), W = {};
  const NODE = {}; NODES.forEach(n => NODE[n.id] = n);
  gs.forEach(p => p.questions.forEach(x => { const nd = NODE[x.node]; if (!nd) return; const w = W[nd.g] = W[nd.g] || {}; w[p.year] = (w[p.year] || 0) + 1; }));
  const gy = gs.map(p => String(p.year)).sort();
  const wrows = Object.entries(W).map(([g, w]) => ({ g, v: gy.map(y => w[y] || 0) })).map(r => ({ ...r, avg: r.v.reduce((a, b) => a + b, 0) / r.v.length })).sort((a, b) => b.avg - a.avg);
  const pbv = gy.map((y, i) => wrows.filter(r => /^pb/.test(r.g)).reduce((a, r) => a + r.v[i], 0));
  const md = [
    `# Most asked by PPSC\n`,
    `Ranked from the ${Object.keys(PYM).length} real questions in ${(D.pyq.pre || []).length + (D.pyq.mains || []).length} PPSC papers: Prelims ${[...new Set((D.pyq.pre || []).map(p => p.year))].sort().join(", ")} · Mains ${[...new Set((D.pyq.mains || []).map(p => p.year))].sort().join(", ")}. Years are the years the paper was sat (the 2020 exam was held in 2021, the 2025 Mains in 2026). [Back to the syllabus](README.md)\n`,
    `## 🔥 Asked in every recent exam\n`,
    ranked.filter(x => x.s.every).map(x => `- ${tl(x.n)} — ${x.s.n}× (${x.s.yrs.join(", ")})`).join("\n") + "\n",
    `## Top 50 topics\n`,
    `| # | Topic | Subject | Times | Prelims | Mains | Years |\n|---|---|---|---|---|---|---|\n` + ranked.slice(0, 50).map((x, i) => `| ${i + 1} | ${tl(x.n)} | ${cell(D.groups[x.n.g] ? D.groups[x.n.g].n : "")} | **${x.s.n}** | ${x.s.pre} | ${x.s.mains} | ${x.s.yrs.join(", ")} |`).join("\n") + "\n",
    `## ↻ Themes PPSC asked again\n`,
    `Questions from different exams that test the same idea (matched by wording within a topic).\n`,
    themes.map(g => { const nd = NODE[g[0].node]; return `**${nd ? one(nd.t) : "Theme"}** — ${g.exams} exams\n\n` + g.map(m => `- ${pqLink(m.ns.length > 1 ? { ...m, label: m.label.replace(/Q[^ ]+$/, "Q" + m.ns.join(", ")) } : m, "../past-papers/")} — ${cell(m.q.split("\n")[0]).slice(0, 150)}`).join("\n") + "\n"; }).join("\n"),
    `## Real subject weights — Prelims GS (questions out of 100)\n`,
    `| Subject | ${gy.join(" | ")} | Average |\n|---|${gy.map(() => "---").join("|")}|---|\n` + wrows.map(r => `| ${cell(D.groups[r.g] ? D.groups[r.g].n : r.g)} | ${r.v.join(" | ")} | ${r.avg.toFixed(1)} |`).join("\n") + `\n| **All four Punjab parts** | ${pbv.join(" | ")} | ${(pbv.reduce((a, b) => a + b, 0) / pbv.length).toFixed(1)} |\n`,
    `## Not asked in these papers\n`,
    NODES.filter(n => !stat(n.id).n && !/^(lp|le|es|iv)\d/.test(n.id)).map(n => `- ${tl(n)}`).join("\n") + "\n",
    `---\n*Older papers (2013, 2015) are not in the app yet; adding them will sharpen these counts.*\n`
  ].join("\n");
  fs.writeFileSync(path.join(syl, "MOST-ASKED.md"), md);
}
console.log(`exported ${topicCount} topics, ${mcqCount} MCQs, ${mainsCount} Mains questions, ${ppRows.length} papers`);
