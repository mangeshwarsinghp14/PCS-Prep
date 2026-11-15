// PCS Prep — garcha_feed.mjs (v2, 15 Nov 2026)
// Researches current affairs and PPSC notices on its own, with no AI:
//  1. reads PIB (follows each Hindi release to its English version and reads the full text), RBI and news searches;
//  2. scores every item for exam value and drops politics, crime, gossip and routine notices (garcha_rules.mjs);
//  3. merges reports of the same event, writes 2–3 summary points, key figures and an exam angle;
//  4. tags items to syllabus topics with the trained keyword model (model.json);
//  5. makes quiz questions (garcha_quiz.mjs);
//  6. cleans older items with the same rules, writes feed.json (newest 400), archive/<month>.json,
//     alert.json (PPSC watch), state.json (memory between runs) and status.json (health).
// Usage: node garcha_feed.mjs <site folder>   (Node 18+; no packages)
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { tokens } from "./garcha_text.mjs";
import { PUNJAB, PAK_PUNJAB, INTL, kindOf, relevance, stars, figures, summarise, RBI_ROUTINE, RBI_KEEP } from "./garcha_rules.mjs";
import { makeQuiz } from "./garcha_quiz.mjs";

const site = process.argv[2] || ".";
const P = f => path.join(site, f);
const readJSON = (f, d) => { try { return JSON.parse(fs.readFileSync(P(f), "utf8")); } catch { return d; } };
const model = readJSON("model.json", { w: {}, nodes: {} });
const state = readJSON("state.json", { pib: {}, fails: {} });
state.pib = state.pib || {}; state.fails = state.fails || {};
const now = new Date(), today = now.toISOString().slice(0, 10);
const KEEP_SCORE = 35;
const RULES_V = 2; // bump when garcha_rules.mjs changes, so older items are scored again

const G = "https://news.google.com/rss/search?hl=en-IN&gl=IN&ceid=IN:en&q=";
const q = (s, scope) => ({ name: "news: " + s, url: G + encodeURIComponent(s) + "+when:3d", scope, news: true });
const SOURCES = [
  { name: "PIB", url: "https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3", scope: "National", pib: true },
  { name: "RBI", url: "https://www.rbi.org.in/pressreleases_rss.xml", scope: "National", rbi: true },
  q("Punjab government", "Punjab"), q("Punjab cabinet decision", "Punjab"), q("Punjab Vidhan Sabha", "Punjab"),
  q("Punjab scheme launched", "Punjab"), q("Punjab paddy OR stubble OR groundwater OR canal", "Punjab"),
  q("Punjab economy OR budget OR GSDP", "Punjab"), q("Chandigarh administration", "Punjab"), q("Punjab heritage OR culture OR Sikh history", "Punjab"),
  q("Union Cabinet approves", "National"), q("Supreme Court verdict", "National"), q("RBI policy", "National"),
  q("ISRO OR DRDO launch", "National"), q("government launches scheme India", "National"), q("NITI Aayog report", "National"),
  q("India ranks index report", "National"), q("GI tag OR Ramsar site OR tiger reserve India", "National"),
  q("India signs agreement", "International"), q("India bilateral talks summit", "International"), q("United Nations India", "International"),
];
const PPSC_PAGES = ["https://ppsc.gov.in/", "https://ppsc.gov.in/Notifications.aspx"];
const PPSC_NEWS = "https://news.google.com/rss/search?q=%22Punjab+Civil+Services%22+OR+%22PPSC+PCS%22+notification+when:30d&hl=en-IN&gl=IN&ceid=IN:en";
const GOOD = /\b(tribune|the hindu|indian express|hindustan times|news ?on ?air|all india radio|pib|dd ?news|times of india|business standard|mint|livemint|economic times|financial express|babushahi|ndtv|deccan herald|theprint|the print|down to earth|india today|moneycontrol|the wire|scroll|frontline|reuters|bbc|al jazeera|the federal|outlook|news18|firstpost|wion|dainik|jagran|punjab kesari|yes punjab|punjab news express|ani|pti|ians|the statesman|new indian express|telegraph|organiser|prs)\b/i;

// ---- helpers ----
const ENT = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", ndash: "–", mdash: "—", hellip: "…", rupee: "₹" };
const unent = s => String(s || "").replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16))).replace(/&([a-z]+);/gi, (m, e) => ENT[e.toLowerCase()] ?? m);
const strip = s => unent(String(s || "").replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ").replace(/<br\s*\/?>/gi, "\n").replace(/<\/(p|li|div|tr|h\d)>/gi, "\n").replace(/<[^>]+>/g, " ")).replace(/[ \t\r\f\v]+/g, " ").replace(/\s*\n\s*/g, "\n").trim();
const clean = s => strip(s).replace(/\s+/g, " ").trim();
const tag = (xml, t) => { const m = xml.match(new RegExp(`<${t}[^>]*>([\\s\\S]*?)</${t}>`, "i")); return m ? m[1] : ""; };
const parseRSS = xml => (xml.match(/<item[\s>][\s\S]*?<\/item>/gi) || []).map(it => ({
  title: clean(tag(it, "title")), link: clean(tag(it, "link")) || (it.match(/<link[^>]*href="([^"]+)"/i) || [])[1] || "",
  rawDesc: unent(tag(it, "description").replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")), date: clean(tag(it, "pubDate") || tag(it, "dc:date") || tag(it, "updated")),
}));
async function get(url, ms = 25000) {
  const ac = new AbortController(); const t = setTimeout(() => ac.abort(), ms);
  try { const r = await fetch(url, { signal: ac.signal, redirect: "follow", headers: { "Accept": "application/rss+xml, application/xml, text/xml, text/html", "Accept-Language": "en-IN,en;q=0.9" } });
    if (!r.ok) throw new Error("HTTP " + r.status); return await r.text(); } finally { clearTimeout(t); }
}
const pause = ms => new Promise(r => setTimeout(r, ms));
const isEnglish = s => { const latin = (s.match(/[A-Za-z]/g) || []).length; return latin / Math.max(1, s.replace(/\s/g, "").length) > 0.7; };
const isoDate = s => { const d = new Date(s); return isNaN(d) ? today : d.toISOString().slice(0, 10); };
const idFor = (date, key) => "auto-" + date + "-" + crypto.createHash("sha1").update(key).digest("hex").slice(0, 10);
function topicsFor(text, scope) {
  const score = {};
  for (const k of tokens(text)) { const w = model.w[k]; if (!w) continue; for (const [id, v] of Object.entries(w)) score[id] = (score[id] || 0) + v; }
  const top = Object.entries(score).sort((a, b) => b[1] - a[1]).filter(([, v], i) => i < 3 && v >= 0.02).map(([id]) => id);
  const out = ["p1ca"]; if (scope === "Punjab") out.push(...top.filter(id => id.startsWith("pb")).slice(0, 1));
  for (const id of top) if (!out.includes(id)) out.push(id);
  return out.slice(0, 4);
}
const scopeOf = (text, hint) => PUNJAB.test(text) ? "Punjab" : (hint === "International" || (INTL.test(text) && !/\bindia\b/i.test(text) && hint !== "Punjab")) ? "International" : hint === "Punjab" ? "National" : hint;

// ---- PIB: Hindi feed → English release page ----
async function pibEnglish(hindiLink) {
  const hp = (hindiLink.match(/PRID=(\d+)/i) || [])[1]; if (!hp) return null;
  if (state.pib[hp] !== undefined) return { skip: true };
  let ep = hp, html = await get(`https://pib.gov.in/PressReleaseIframePage.aspx?PRID=${hp}`);
  const title0 = unent((html.match(/id="ltrTitlee" value="([^"]*)"/) || [])[1] || "");
  if (!isEnglish(title0)) {
    const m = html.match(/href='https?:\/\/pib\.gov\.in\/PressReleasePage\.aspx\?PRID=(\d+)'[^>]*>\s*English\s*</i);
    if (!m) { state.pib[hp] = 0; return { skip: true }; }
    ep = m[1]; await pause(800); html = await get(`https://pib.gov.in/PressReleaseIframePage.aspx?PRID=${ep}`);
  }
  state.pib[hp] = +ep;
  const title = unent((html.match(/id="ltrTitlee" value="([^"]*)"/) || [])[1] || "").replace(/\s+/g, " ").trim();
  const sub = strip(unent((html.match(/id="ltrSubtitlee" value="([^"]*)"/) || [])[1] || "")).split("\n").map(s => s.trim()).filter(s => s.length > 25);
  const body = strip(unent((html.match(/id="ltrDescriptionn" value="([^"]*)"/) || [])[1] || ""));
  const ministry = clean((html.match(/MinistryNameSubhead[^>]*>([\s\S]*?)<\/div>/) || [])[1] || "");
  const dm = html.match(/(\d{1,2}) (JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[A-Z]* (20\d\d)/i);
  const date = dm ? isoDate(`${dm[1]} ${dm[2]} ${dm[3]} 12:00 UTC`) : today;
  if (!title || !isEnglish(title)) return { skip: true };
  return { title, sub, body, ministry, date, link: `https://pib.gov.in/PressReleasePage.aspx?PRID=${ep}` };
}

// ---- collect ----
const status = { run: now.toISOString(), sources: [], added: 0, merged: 0, dropped: 0, kept: 0, ppsc: "", quiz: 0 };
const feed = readJSON("feed.json", { items: [] });
const known = new Set(feed.items.flatMap(x => [x.id].concat(x.mids || [])));
const cutoff = new Date(now - 10 * 864e5).toISOString().slice(0, 10);
const cand = [];

for (const src of SOURCES) {
  let read = 0, took = 0;
  try {
    const items = parseRSS(await get(src.url)); read = items.length;
    let pibCalls = 0;
    for (const it of items) {
      let c = null;
      if (src.pib) {
        if (pibCalls >= 30) break;
        const e = await pibEnglish(it.link); if (!e || e.skip) continue; pibCalls++; await pause(800);
        const pts = (e.sub.length ? e.sub.slice(0, 3) : []).concat(e.sub.length < 2 ? summarise(e.body, 3 - e.sub.length) : []).slice(0, 3);
        c = { title: e.title, text: e.body, points: pts, date: e.date, link: e.link, publisher: "PIB", ministry: e.ministry || "", scopeHint: "National" };
      } else if (src.rbi) {
        if (RBI_ROUTINE.test(it.title) || !RBI_KEEP.test(it.title)) continue;
        const raw = it.rawDesc.replace(/<table[\s\S]*?<\/table>/gi, " ");
        const text = strip(raw).replace(/\s+/g, " ");
        c = { title: it.title, text, points: summarise(text, 3), date: isoDate(it.date), link: it.link, publisher: "RBI", scopeHint: "National" };
      } else {
        const pubM = it.title.match(/\s+-\s+([^-]{2,60})$/); const publisher = pubM ? pubM[1].trim() : "";
        if (!GOOD.test(publisher)) continue;
        const title = (pubM ? it.title.slice(0, pubM.index) : it.title).replace(/\s*\|\s*[^|]{2,40}$/, "").trim();
        if (!title || !isEnglish(title)) continue;
        if (src.scope === "Punjab" && !PUNJAB.test(title + " " + it.rawDesc)) continue;
        if (PAK_PUNJAB.test(title) && !/\b(india|indian|mea|amritsar|chandigarh|mann)\b/i.test(title)) continue; // Pakistan's Punjab
        // Google News lists other outlets' headlines for the same story in the description
        const also = [...it.rawDesc.matchAll(/<a [^>]*>([\s\S]*?)<\/a>(?:&nbsp;|\s)*<font[^>]*>([\s\S]*?)<\/font>/gi)].map(m => ({ t: clean(m[1]), p: clean(m[2]) })).filter(a => a.t && a.t.toLowerCase() !== title.toLowerCase() && isEnglish(a.t)).slice(0, 3);
        c = { title, text: also.map(a => a.t).join(". "), points: [], also: also.map(a => a.t), date: isoDate(it.date), link: it.link, publisher, scopeHint: src.scope };
      }
      if (!c || c.date < cutoff) continue;
      c.rel = relevance({ title: c.title, text: c.text, publisher: c.publisher, scope: c.scopeHint });
      if (c.rel < KEEP_SCORE) { if (!known.has(idFor(c.date, c.link))) status.dropped++; continue; }
      cand.push(c); took++;
    }
    status.sources.push({ name: src.name, url: src.url, ok: true, items: read, taken: took });
    state.fails[src.name] = 0;
  } catch (e) {
    state.fails[src.name] = (state.fails[src.name] || 0) + 1;
    status.sources.push({ name: src.name, url: src.url, ok: false, error: String(e.message || e), failsInRow: state.fails[src.name] });
  }
  await pause(1000);
}

// ---- build items, merge same-event reports ----
const GENERIC = new Set("cabinet approves approved approval crore lakh punjab punjabi india indian government govt centre central union minister ministers chief launches launched launch scheme schemes records recorded says said national state states first signs signed announces announced report reports seeks cases incidents district districts year years week today news amid over after held held project projects rabi kharif boost new plan plans policy issues issued rate rates high record sector development".split(" "));
const keyToks = t => new Set(tokens(t).filter(w => w.length > 3 && !GENERIC.has(w)));
const KCACHE = new Map(); // title → key words (kept in memory only)
const KC = x => { let k = KCACHE.get(x.title); if (!k) { k = keyToks(x.title); KCACHE.set(x.title, k); } return k; };
function similar(a, b) {
  const A = KC(a), B = KC(b);
  let i = 0; A.forEach(w => { if (B.has(w)) i++; });
  const j = i / Math.max(1, A.size + B.size - i);
  const nums = s => new Set((s.match(/\d[\d,.]*(st|nd|rd|th)?\b/g) || []).filter(x => (x.length > 2 || /\d(st|nd|rd|th)$/.test(x)) && !/^20\d\d$/.test(x)));
  const na = nums(a.title), nb = nums(b.title); let sameNum = false; na.forEach(x => { if (nb.has(x)) sameNum = true; });
  return (i >= 2 && j >= 0.34) || (i >= 3 && j >= 0.18) || (sameNum && i >= 1);
}
const OFFICIAL = /^(PIB|RBI|DD News|News On AIR)/i;
function enrich(x) {
  const t = (x.points || []).join(" ") + " " + (x._text || "");
  const kd = kindOf(x.title + " " + (x.points || []).join(" "));
  x.kind = kd.k;
  const topic = (x.nodes || []).find(id => id !== "p1ca" && model.nodes[id]);
  x.why = kd.why + (topic ? ` Links to “${model.nodes[topic].t}”.` : "") + (x.scope === "Punjab" ? " Useful as a Punjab example in Mains." : "");
  const figs = figures(t, 4).filter(f => !x.title.includes(f.slice(0, 40))); if (figs.length) x.figs = figs; else delete x.figs;
  x.stars = stars(x.rel || 40);
}
function mergeInto(base, add) {
  const srcs = base.src || [];
  base.mids = base.mids || [];
  if (add.id === base.id || base.mids.includes(add.id)) return false; // already merged on an earlier run
  base.mids.push(add.id, ...(add.mids || [])); if (base.mids.length > 30) base.mids = base.mids.slice(-30);
  const newSrc = (add.src || []).filter(s => !srcs.some(z => z.u === s.u));
  for (const s of newSrc) if (srcs.length < 5) srcs.push(s);
  base.src = srcs;
  const alsoT = new Set(base.also || []);
  (add.also || []).forEach(t => alsoT.add(t));
  const baseOff = OFFICIAL.test((base.src[0] || {}).t || ""), addOff = OFFICIAL.test(((add.src || [])[0] || {}).t || "");
  // the headline goes to an official version, else to the newest report of a running story
  if ((addOff && !baseOff) || (add.date > base.date && (addOff || !baseOff))) {
    alsoT.add(base.title);
    base.title = add.title; if ((add.points || []).length || addOff) base.points = add.points || [];
    base.ministry = add.ministry || base.ministry; if (add.date > base.date) base.date = add.date;
    base.src = [add.src[0]].concat(base.src.filter(s => s.u !== add.src[0].u));
  } else {
    alsoT.add(add.title);
    if (!(base.points || []).length && (add.points || []).length) base.points = add.points;
  }
  base.also = [...alsoT].filter(t => t.toLowerCase() !== base.title.toLowerCase()).slice(0, 4);
  base.rel = Math.min(100, Math.max(base.rel || 0, add.rel || 0) + (newSrc.length ? 3 : 0)); // reported by several outlets
  delete base.mcq; base._touched = 1; // quiz rebuilt with the better text
  return true;
}

const fresh = [];
for (const c of cand) {
  const scope = scopeOf(c.title + " " + c.text.slice(0, 400), c.scopeHint);
  const it = { id: idFor(c.date, c.link), date: c.date, scope, title: c.title, points: c.points, why: "", nodes: topicsFor(c.title + " " + c.points.join(" ") + " " + c.text.slice(0, 1500), scope), src: [{ t: c.publisher, u: c.link }], auto: 1, rel: c.rel, _text: c.text.slice(0, 3000) };
  if (c.ministry) it.ministry = c.ministry;
  if (c.also && c.also.length) it.also = c.also;
  if (known.has(it.id)) continue;
  const recent = fresh.concat(feed.items.filter(x => x.auto && !x.fact && x.date >= new Date(now - 5 * 864e5).toISOString().slice(0, 10)));
  const twin = recent.find(x => similar(x, it));
  if (twin) { if (mergeInto(twin, it)) status.merged++; continue; }
  known.add(it.id); fresh.push(it);
}

// ---- clean older auto items with today's rules (politics, crime, routine, duplicates) ----
function tidy(list) {
  const kept = [];
  for (const x of list.slice().sort((a, b) => a.date.localeCompare(b.date))) {
    if (!x.auto || x.fact) { kept.push(x); continue; } // hand-written and fact-update items are kept as they are
    const pub = (x.src || [{}])[0].t || "";
    x.title = x.title.replace(/\s+[-|]\s+(India Today|Hindustan Times|News18|N18|Akashvani News|India News|The Hindu|NDTV|Times of India|ThePrint|The Tribune|Mint|Livemint|Business Standard|Moneycontrol|ANI|DD News)\s*$/i, "").replace(/\s+\|\s+[^|]{2,30}$/, "");
    const r0 = x.v === RULES_V && x.rel != null ? x.rel : relevance({ title: x.title, text: (x.points || []).join(" "), publisher: pub, scope: x.scope });
    const noise = (pub === "RBI" && RBI_ROUTINE.test(x.title)) || (!OFFICIAL.test(pub) && !GOOD.test(pub)) || (PAK_PUNJAB.test(x.title) && !/\b(india|indian|mea|amritsar|chandigarh|mann)\b/i.test(x.title));
    if (r0 < KEEP_SCORE || noise) { status.dropped++; continue; }
    x.rel = Math.max(x.rel || 0, r0); x.v = RULES_V;
    const twin = kept.find(k => k.auto && Math.abs(new Date(k.date) - new Date(x.date)) <= 4 * 864e5 && similar(k, x));
    if (twin) { if (mergeInto(twin, x)) status.merged++; continue; }
    kept.push(x);
  }
  return kept.sort((a, b) => b.date.localeCompare(a.date));
}
let all = tidy(fresh.concat(feed.items));
for (const x of all) if (x.auto && !x.fact && (fresh.includes(x) || x._touched || !x.kind)) {
  enrich(x);
  if (!x.mcq && x.rel >= 40) { const m = makeQuiz(x); if (m.length) { x.mcq = m; status.quiz += m.length; } }
}
all.forEach(x => { delete x._text; delete x._touched; });

// ---- write feed + monthly archives (archives get the same cleaning) ----
fs.mkdirSync(P("archive"), { recursive: true });
const byMonth = {};
for (const it of all) (byMonth[it.date.slice(0, 7)] = byMonth[it.date.slice(0, 7)] || []).push(it);
for (const [mon, list] of Object.entries(byMonth)) {
  const f = "archive/" + mon + ".json"; const old = readJSON(f, { items: [] });
  const ids = new Set(list.map(x => x.id));
  const merged = tidy(list.concat(old.items.filter(x => !ids.has(x.id))));
  merged.forEach(x => { if (x.auto && (!x.kind || x._touched)) { enrich(x); if (!x.mcq && x.rel >= 40) { const m = makeQuiz(x); if (m.length) x.mcq = m; } } delete x._touched; delete x._text; });
  fs.writeFileSync(P(f), JSON.stringify({ month: mon, items: merged }));
}
const months = fs.readdirSync(P("archive")).filter(f => /^\d{4}-\d{2}\.json$/.test(f)).map(f => f.slice(0, 7)).sort().reverse();
all.forEach(x => { delete x._k; delete x._text; delete x._touched; });
fs.writeFileSync(P("feed.json"), JSON.stringify({ updated: now.toISOString(), months, items: all.slice(0, 400) }));
status.added = fresh.length; status.kept = Math.min(all.length, 400);

// ---- PPSC notification watch ----
const alert = readJSON("alert.json", { found: [] });
// strict: the Commission AND the PCS exam AND a notice word, each as whole words; coaching/UPSC/student stories are excluded
const PPSC = /\b(ppsc|punjab public service commission|punjab pcs)\b/i;
const PCS = /\b(punjab civil services|pcs|pcs \(executive branch\)|combined competitive|civil services \(executive|pscscce)\b/i;
const NOTE = /\b(advertisement|advt\.?|notification|notified|recruitment|online applications?|apply online|applications? invited|vacancies|vacancy|posts)\b/i;
const NOT_YET = /\b(expected|likely|soon|rumou?rs?|syllabus|answer key|results?|admit card|cut-?off|scam|paper leak|merit list|interview schedule|coaching|upsc|students?|course|training|free)\b/i;
const isPpscNotice = t => PPSC.test(t) && PCS.test(t) && NOTE.test(t) && !NOT_YET.test(t);
const hits = [];
for (const u of PPSC_PAGES) {
  try { const html = await get(u, 25000);
    const links = [...html.matchAll(/<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)].map(m => ({ href: m[1], text: clean(m[2]) }));
    for (const l of links) if (PCS.test(l.text) && NOTE.test(l.text) && !NOT_YET.test(l.text)) hits.push({ title: l.text.slice(0, 200), link: new URL(l.href, u).href, via: "ppsc.gov.in" });
    status.ppsc += "site ok; ";
  } catch (e) { status.ppsc += "site unreachable (" + (e.message || e) + "); "; }
}
try { for (const it of parseRSS(await get(PPSC_NEWS))) { const t = it.title.replace(/\s+-\s+[^-]{2,60}$/, ""); if (isPpscNotice(t)) hits.push({ title: t.slice(0, 200), link: it.link, via: "news", date: isoDate(it.date) }); } status.ppsc += "news ok"; }
catch (e) { status.ppsc += "news unreachable (" + (e.message || e) + ")"; }
const yr = now.getFullYear();
const relevant = hits.filter(h => new RegExp(`\\b(${yr}|${yr + 1})\\b`).test(h.title) || h.via === "news");
alert.found = (alert.found || []).filter(x => x.via === "ppsc.gov.in" || isPpscNotice(x.title.replace(/\s+-\s+[^-]{2,60}$/, ""))); // clears earlier false alarms
const oldA = new Set(alert.found.map(x => x.title));
for (const h of relevant) if (!oldA.has(h.title)) alert.found.unshift(Object.assign({ first: today }, h));
alert.found = alert.found.slice(0, 20); alert.checked = now.toISOString();
fs.writeFileSync(P("alert.json"), JSON.stringify(alert));

// ---- memory between runs + health ----
const pk = Object.keys(state.pib).sort((a, b) => b - a); if (pk.length > 800) for (const k of pk.slice(800)) delete state.pib[k];
fs.writeFileSync(P("state.json"), JSON.stringify(state));
const newest = all.filter(x => x.auto).map(x => x.date).sort().pop() || "";
const problems = [];
for (const s of status.sources) if (!s.ok && s.failsInRow >= 3) problems.push(`${s.name} has failed ${s.failsInRow} runs in a row (${s.error})`);
if (newest && (now - new Date(newest)) / 864e5 > 3) problems.push(`No new current-affairs item since ${newest}`);
if (status.sources.find(s => s.name === "PIB" && s.ok && s.taken === 0 && s.items > 0) && Object.values(state.pib).slice(-20).every(v => !v)) problems.push("PIB items could not be matched to English releases");
status.health = { ok: problems.length === 0, problems };
fs.writeFileSync(P("status.json"), JSON.stringify(status, null, 1));
console.log(`added ${status.added}, merged ${status.merged}, dropped ${status.dropped}, quiz questions ${status.quiz}; feed has ${status.kept}; PPSC: ${status.ppsc}; health: ${problems.length ? problems.join(" | ") : "ok"}`);
for (const s of status.sources) console.log((s.ok ? "  ok   " : "  FAIL ") + s.name + " " + (s.ok ? `${s.items} read, ${s.taken} taken` : s.error));
