// PCS Prep — garcha_facts.mjs
// Keeps "facts that change" up to date with no AI:
//  • who holds key posts (RBI Governor, CJI, CEC, Army chief, Punjab CM/Governor, …) — starts from a list checked by hand
//    on 15 Nov 2026, then watches headlines; a change is accepted only when two different outlets (or one official source)
//    report the same name taking charge;
//  • policy rates from RBI's own MPC resolution; CPI inflation and quarterly GDP from headlines that agree.
// Each accepted change is added to the news feed as a "Fact update" item with a quiz question.
// Usage: node garcha_facts.mjs <site folder>
import fs from "node:fs";
import path from "node:path";

const site = process.argv[2] || ".";
const P = f => path.join(site, f);
const readJSON = (f, d) => { try { return JSON.parse(fs.readFileSync(P(f), "utf8")); } catch { return d; } };
const now = new Date(), today = now.toISOString().slice(0, 10);
const day = d => new Date(d + "T00:00:00Z");
const fmt = d => day(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

// ---- baseline, checked 15 Nov 2026 ----
const BASE = [
  { k: "pres", post: "President of India", name: "Droupadi Murmu", since: "2022-07-25", re: /\bpresident of india\b|\brashtrapati\b/i },
  { k: "vp", post: "Vice-President of India", name: "C. P. Radhakrishnan", since: "2025-09-12", re: /\bvice[- ]president of india\b|\bvice[- ]president\b(?!.*(us|america|china))/i },
  { k: "pm", post: "Prime Minister of India", name: "Narendra Modi", since: "2014-05-26", re: /\bprime minister of india\b/i },
  { k: "cji", post: "Chief Justice of India", name: "Surya Kant", since: "2025-11-24", re: /\bchief justice of india\b|\bcji\b/i },
  { k: "cec", post: "Chief Election Commissioner", name: "Gyanesh Kumar", since: "2025-02-19", re: /\bchief election commissioner\b|\bcec\b/i },
  { k: "speaker", post: "Speaker, Lok Sabha", name: "Om Birla", since: "2019-06-19", re: /\b(lok sabha speaker|speaker of (the )?lok sabha)\b/i },
  { k: "cag", post: "Comptroller and Auditor General", name: "K. Sanjay Murthy", since: "2024-11-21", re: /\bcomptroller and auditor general\b|\bcag\b/i },
  { k: "rbi", post: "Governor, Reserve Bank of India", name: "Sanjay Malhotra", since: "2024-12-11", re: /\b(rbi|reserve bank)('s)? governor\b|\bgovernor of (the )?(rbi|reserve bank)\b/i },
  { k: "niti", post: "Vice-Chairperson, NITI Aayog", name: "Ashok Kumar Lahiri", since: "2026-04", re: /\bniti aayog vice[- ]?chair(man|person)?\b|\bvice[- ]?chair(man|person)? of niti aayog\b/i },
  { k: "cds", post: "Chief of Defence Staff", name: "N. S. Raja Subramani", since: "2026", re: /\bchief of defence staff\b|\bcds\b/i },
  { k: "coas", post: "Chief of the Army Staff", name: "Dhiraj Seth", since: "2026", re: /\barmy chief\b|\bchief of (the )?army staff\b|\bcoas\b/i },
  { k: "cns", post: "Chief of the Naval Staff", name: "Krishna Swaminathan", since: "2026", re: /\bnavy chief\b|\bchief of (the )?naval staff\b/i },
  { k: "pbcm", post: "Chief Minister of Punjab", name: "Bhagwant Mann", since: "2022-03-16", re: /\b(punjab (chief minister|cm)|chief minister of punjab)\b/i },
  { k: "pbgov", post: "Governor of Punjab & Administrator, Chandigarh", name: "Gulab Chand Kataria", since: "2024-07-31", re: /\b(punjab governor|governor of punjab)\b/i },
  { k: "unsg", post: "UN Secretary-General", name: "António Guterres", since: "2017-01-01", note: "Term ends 31 Dec 2026; successor being selected", re: /\b(un|united nations) secretary[- ]general\b|\bsecretary[- ]general of the united nations\b/i },
];
const RATES0 = [
  { k: "repo", label: "Policy repo rate", v: "5.50%", since: "2026-10-07", note: "Raised 25 bps by the MPC (5–7 Oct 2026); stance: calibrated tightening", src: "https://rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx?prid=63839" },
  { k: "sdf", label: "Standing Deposit Facility rate", v: "5.25%", since: "2026-10-07" },
  { k: "msf", label: "Marginal Standing Facility & Bank Rate", v: "5.75%", since: "2026-10-07" },
  { k: "cpi", label: "CPI inflation (Sep 2026)", v: "5.54%", since: "2026-10-12", note: "MoSPI" },
];

const facts = readJSON("facts.json", null) || { posts: BASE.map(({ re, ...b }) => ({ ...b, src: "checked by hand" })), rates: RATES0, changes: [], seen: {} };
facts.seen = facts.seen || {};
for (const b of BASE) if (!facts.posts.find(p => p.k === b.k)) { const { re, ...x } = b; facts.posts.push({ ...x, src: "checked by hand" }); }

// ---- inputs: the news feed + two appointment searches + RBI press releases ----
const G = "https://news.google.com/rss/search?hl=en-IN&gl=IN&ceid=IN:en&q=";
const QUERIES = [
  '("takes charge" OR "sworn in" OR "assumes charge" OR "takes over") (governor OR "chief justice" OR "army chief" OR "navy chief" OR "air chief" OR CDS OR CAG OR "election commissioner" OR "NITI Aayog") when:14d',
  '("appointed" OR "named") (next OR new) ("RBI governor" OR "chief justice of india" OR "army chief" OR "navy chief" OR "chief of defence staff" OR "chief election commissioner" OR "NITI Aayog" OR "Punjab governor" OR "UN secretary-general") when:14d',
];
const tag = (xml, t) => { const m = xml.match(new RegExp(`<${t}[^>]*>([\\s\\S]*?)</${t}>`, "i")); return m ? m[1] : ""; };
const unent = s => String(s || "").replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
async function get(url, ms = 25000) { const ac = new AbortController(); const t = setTimeout(() => ac.abort(), ms); try { const r = await fetch(url, { signal: ac.signal, headers: { "Accept-Language": "en-IN,en;q=0.9" } }); if (!r.ok) throw new Error("HTTP " + r.status); return await r.text(); } finally { clearTimeout(t); } }
const rss = xml => (xml.match(/<item[\s>][\s\S]*?<\/item>/gi) || []).map(it => ({ title: unent(tag(it, "title")).replace(/<[^>]+>/g, "").trim(), link: unent(tag(it, "link")).trim(), date: new Date(unent(tag(it, "pubDate"))), desc: unent(tag(it, "description")) }));

const heads = []; // {t, pub, date, link, official}
const feed = readJSON("feed.json", { items: [] });
for (const x of feed.items) { const s = (x.src || [])[0] || {}; for (const t of [x.title].concat(x.also || [])) heads.push({ t, pub: s.t || "", date: x.date, link: s.u || "", official: /^(PIB|DD News|News On AIR|RBI)/.test(s.t || "") }); }
const log = [];
for (const q of QUERIES) {
  try { for (const it of rss(await get(G + encodeURIComponent(q)))) { const m = it.title.match(/\s+-\s+([^-]{2,60})$/); heads.push({ t: m ? it.title.slice(0, m.index) : it.title, pub: m ? m[1].trim() : "", date: isNaN(it.date) ? today : it.date.toISOString().slice(0, 10), link: it.link, official: /^(PIB|DD News|News On AIR)/.test(m ? m[1] : "") }); } log.push("appointment search ok"); }
  catch (e) { log.push("appointment search failed: " + (e.message || e)); }
  await new Promise(r => setTimeout(r, 1000));
}

// ---- appointments ----
const RANK = "(?:(?:Gen(?:eral)?|Lt\\.? Gen\\.?|Lieutenant General|Adm(?:iral)?|Vice Adm(?:iral)?\\.?|Air Chief Marshal|Air Marshal|Justice|Dr\\.?|Shri|Smt\\.?|Prof\\.?|Mr\\.?|Ms\\.?|Former|Ex-|Senior IAS officer|IAS officer|Economist|Bureaucrat)\\s+)*";
const NAME = "((?:[A-Z][a-zA-Z'’.-]*|[A-Z]{1,3}\\.?)(?:\\s+(?:[A-Z][a-zA-Z'’.-]*|[A-Z]{1,3}\\.?)){1,4})";
const VERB = "(takes? charge|takes? over|assumes? (?:charge|office)|sworn in|takes? oath|appointed|named|to be|set to be|will be|becomes|elected|to succeed|succeeds)";
const PAT = new RegExp(`^${RANK}${NAME}\\s+${VERB}\\b(.*)$`);
const PAT2 = new RegExp(`^(?:Centre|Govt|Government|President|Cabinet|ACC|Murmu)\\s+(?:appoints|names)\\s+${RANK}${NAME}\\s+as\\b(.*)$`);
const NOTNAME = /^(India|Indian|Centre|Government|Govt|Cabinet|President|PM|Modi|Punjab|Delhi|New|Next|The|Who|How|Why|Meet|Know|Army|Navy|Air|RBI|NITI|UN|Supreme|Chief|Union|Former|Senior)$/;
const norm = s => s.toLowerCase().replace(/\b(gen|general|lt|lieutenant|adm|admiral|vice|air|chief|marshal|justice|dr|shri|smt|prof|mr|ms)\b\.?/g, "").replace(/[^a-z\s]/g, " ").replace(/\s+/g, " ").trim();
const sameName = (a, b) => { const A = norm(a).split(" "), B = norm(b).split(" "); return A[A.length - 1] === B[B.length - 1] && A.some(w => w.length > 2 && B.includes(w) && w !== A[A.length - 1]) || norm(a) === norm(b); };
const claims = {}; // key → {name, status, pubs:Set, official, date, link}
for (const h of heads) {
  if (!h.t || h.date < new Date(now - 21 * 864e5).toISOString().slice(0, 10)) continue;
  const tt = h.t.replace(/[‘’]/g, "'");
  let m = tt.match(PAT), name, verb, rest;
  if (m) { name = m[1].trim(); verb = m[2].toLowerCase(); rest = m[3]; }
  else { const m2 = tt.match(PAT2); if (!m2) continue; name = m2[1].trim(); verb = "appointed"; rest = m2[2]; }
  const words = name.split(/\s+/); if (words.some(w => NOTNAME.test(w.replace(/[.'’]/g, "")))) continue;
  if (/\b(may|likely|could|frontrunner|probable|race|contender|candidates?|shortlist)\b/i.test(h.t)) continue;
  for (const b of BASE) {
    if (!b.re.test(rest)) continue;
    if (b.k === "pbgov" && !/punjab/i.test(rest)) continue;
    const status = /charge|over|assume|sworn|oath|becomes|succeeds/.test(verb) ? "in" : "next";
    const key = b.k + "|" + status + "|" + norm(name);
    const c = claims[key] = claims[key] || { k: b.k, name, status, pubs: new Set(), official: false, date: h.date, link: h.link };
    c.pubs.add((h.pub || h.link) + "|" + h.t.toLowerCase()); c.official = c.official || h.official; if (h.date > c.date) { c.date = h.date; c.link = h.link; }
    break;
  }
}
const changes = [];
for (const c of Object.values(claims)) {
  if (c.pubs.size < 2 && !c.official) continue;
  const p = facts.posts.find(x => x.k === c.k); if (!p) continue;
  if (c.status === "in") {
    if (sameName(p.name, c.name)) { if (p.next && sameName(p.next.name, c.name)) delete p.next; continue; }
    const prev = p.name;
    Object.assign(p, { name: c.name, since: c.date, src: c.link, prev }); delete p.next; delete p.note;
    changes.push({ date: c.date, k: c.k, text: `${c.name} took charge as ${p.post}, succeeding ${prev}.`, src: c.link, name: c.name, prev, post: p.post });
  } else if (!sameName(p.name, c.name) && !(p.next && sameName(p.next.name, c.name))) {
    p.next = { name: c.name, date: c.date, src: c.link };
    changes.push({ date: c.date, k: c.k, text: `${c.name} has been named the next ${p.post} (now: ${p.name}).`, src: c.link, name: c.name, prev: p.name, post: p.post, next: 1 });
  }
}

// ---- RBI policy rates from the MPC resolution ----
try {
  for (const it of rss(await get("https://www.rbi.org.in/pressreleases_rss.xml"))) {
    if (!/resolution of the monetary policy committee|monetary policy statement/i.test(it.title)) continue;
    const txt = it.desc.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
    const d = isNaN(it.date) ? today : it.date.toISOString().slice(0, 10);
    const grab = (k, re) => { const m = txt.match(re); if (!m) return; const v = parseFloat(m[1]).toFixed(2) + "%"; const r = facts.rates.find(x => x.k === k); if (r && r.v !== v && d >= (r.since || "")) { changes.push({ date: d, k, text: `${r.label} now ${v} (was ${r.v}).`, src: it.link, rate: 1, name: v, prev: r.v, post: r.label }); Object.assign(r, { v, since: d, src: it.link, note: k === "repo" ? "From the RBI MPC resolution" : r.note }); } };
    grab("repo", /policy repo rate[^.]{0,120}?(?:at|to)\s+(\d+\.\d+)\s*per\s*cent/i);
    grab("sdf", /standing deposit facility[^.]{0,80}?(\d+\.\d+)\s*per\s*cent/i);
    grab("msf", /marginal standing facility[^.]{0,80}?(\d+\.\d+)\s*per\s*cent/i);
  }
  log.push("RBI ok");
} catch (e) { log.push("RBI failed: " + (e.message || e)); }

// ---- CPI inflation and GDP growth from headlines that agree ----
const MON = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
const NOTDATA = /\b(seen|expected|likely|may|could|forecast|projection|projects?|estimates?|poll|economists|sees|predict|to hit|could hit|brokerage|bofa|sbi research|icra|crisil|nomura|goldman)\b/i;
function agreeOn(re, fn) {
  const votes = {};
  for (const h of heads) { if (NOTDATA.test(h.t)) continue; const m = h.t.match(re); if (!m) continue; const r = fn(m, h); if (!r) continue; const key = r.key; (votes[key] = votes[key] || { ...r, pubs: new Set(), official: false }).pubs.add(h.pub + "|" + h.t.toLowerCase()); votes[key].official = votes[key].official || h.official; }
  return Object.values(votes).filter(v => v.pubs.size >= 2 || v.official).sort((a, b) => b.order.localeCompare(a.order))[0];
}
const cpi = agreeOn(/(?:retail|cpi|consumer price)[^.]{0,30}?inflation[^.]{0,80}?(\d{1,2}(?:\.\d{1,2})?)\s?(?:%|per ?cent)\s+in\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\b/i, (m, h) => {
  const mi = MON.findIndex(x => x.startsWith(m[2].toLowerCase().slice(0, 3))); const hd = day(h.date); let y = hd.getUTCFullYear(); if (mi > hd.getUTCMonth()) y--;
  const lag = (hd.getUTCFullYear() - y) * 12 + hd.getUTCMonth() - mi; if (lag < 0 || lag > 2) return null;
  return { key: m[1] + "|" + mi + "|" + y, v: (+m[1]).toFixed(2).replace(/0$/, "") + "%", label: `CPI inflation (${MON[mi][0].toUpperCase() + MON[mi].slice(1, 3)} ${y})`, order: `${y}-${String(mi + 1).padStart(2, "0")}`, date: h.date, link: h.link };
});
if (cpi) { const r = facts.rates.find(x => x.k === "cpi"); if (r && (r.label !== cpi.label || r.v !== cpi.v) && cpi.order >= (r.order || "2026-09")) { changes.push({ date: cpi.date, k: "cpi", text: `${cpi.label}: ${cpi.v} (previous reading ${r.v}).`, src: cpi.link, rate: 1, name: cpi.v, prev: r.v, post: cpi.label }); Object.assign(r, { label: cpi.label, v: cpi.v, since: cpi.date, src: cpi.link, order: cpi.order, note: "From news reports of the MoSPI release" }); } }
const gdp = agreeOn(/\bgdp\b[^%\d]{0,50}?(\d{1,2}\.\d)\s?(?:%|per ?cent)[^.]{0,40}?\b(?:in|for)\s+(?:the\s+)?(q[1-4]|first|second|third|fourth|april-june|july-september|october-december|january-march)\b(?:\s+quarter)?/i, (m, h) => {
  const qmap = { q1: 1, first: 1, "april-june": 1, q2: 2, second: 2, "july-september": 2, q3: 3, third: 3, "october-december": 3, q4: 4, fourth: 4, "january-march": 4 };
  const q = qmap[m[2].toLowerCase()]; const hd = day(h.date); const fy = hd.getUTCMonth() >= 5 || q === 4 && hd.getUTCMonth() < 7 ? hd.getUTCFullYear() + (q === 4 ? 0 : 1) : hd.getUTCFullYear();
  return { key: m[1] + "|" + q + "|" + fy, v: m[1] + "%", label: `GDP growth (Q${q} FY${String(fy - 1).slice(2)}-${String(fy).slice(2)})`, order: `${fy}-${q}`, date: h.date, link: h.link };
});
if (gdp) { let r = facts.rates.find(x => x.k === "gdp"); if (!r) { r = { k: "gdp", label: "", v: "" }; facts.rates.push(r); } if (r.label !== gdp.label || r.v !== gdp.v) { if (r.v) changes.push({ date: gdp.date, k: "gdp", text: `${gdp.label}: ${gdp.v}.`, src: gdp.link, rate: 1, name: gdp.v, prev: r.v, post: gdp.label }); Object.assign(r, { label: gdp.label, v: gdp.v, since: gdp.date, src: gdp.link, note: "From news reports of the NSO release" }); } }

// ---- record changes once, and add them to the news feed ----
const fresh = changes.filter(c => !facts.seen[c.k + "|" + c.name]);
for (const c of fresh) facts.seen[c.k + "|" + c.name] = today;
facts.changes = fresh.concat(facts.changes || []).slice(0, 40);
facts.checked = now.toISOString(); facts.log = log;
fs.writeFileSync(P("facts.json"), JSON.stringify(facts, null, 1));
if (fresh.length) {
  const others = facts.posts.map(p => p.name);
  for (const c of fresh) {
    const id = "fact-" + c.k + "-" + c.date + "-" + norm(String(c.name)).replace(/\s+/g, "-").slice(0, 20);
    if (feed.items.some(x => x.id === id)) continue;
    const opts = c.rate ? null : [c.name, c.prev].concat(others.filter(n => !sameName(n, c.name) && !sameName(n, c.prev)).slice(0, 2));
    feed.items.unshift({ id, date: c.date, scope: c.k.startsWith("pb") ? "Punjab" : "National", title: "Fact update: " + c.text, points: [c.text], why: c.rate ? "Rates and data change often — PPSC asks the latest figure and who publishes it." : "Appointments are classic one-liners: note the person, the post, who appoints to it and the predecessor.", nodes: ["p1ca"], src: [{ t: "Auto-checked", u: c.src || "" }], auto: 1, fact: 1, rel: 70, stars: 3, kind: c.rate ? "report" : "appoint",
      mcq: opts && new Set(opts).size === 4 ? [{ q: c.next ? `Who has been named the next ${c.post} (news, ${fmt(c.date)})?` : `Who took charge as ${c.post} (news, ${fmt(c.date)})?`, o: opts, e: c.text }] : [] });
  }
  fs.writeFileSync(P("feed.json"), JSON.stringify(feed));
}
console.log(`facts: ${fresh.length} new change(s); ${log.join("; ")}`);
for (const c of fresh) console.log("  " + c.text);
