// PCS Prep — garcha_feed.mjs
// Researches current affairs and PPSC notices on its own, with no AI:
//  1. reads public RSS feeds (PIB, RBI, The Hindu, Indian Express, Hindustan Times),
//  2. keeps exam-relevant English items and drops crime, film and gossip,
//  3. tags each item to syllabus topics with the trained keyword model (model.json),
//  4. writes feed.json (newest 400), monthly archives, alert.json (PPSC notice watch) and status.json.
// Usage: node garcha_feed.mjs <site folder>   (Node 18+; no packages)
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { tokens } from "./garcha_text.mjs";

const site = process.argv[2] || ".";
const P = f => path.join(site, f);
const readJSON = (f, d) => { try { return JSON.parse(fs.readFileSync(P(f), "utf8")); } catch { return d; } };
const model = readJSON("model.json", { w: {}, nodes: {} });
const now = new Date(), today = now.toISOString().slice(0, 10);

const G = "https://news.google.com/rss/search?hl=en-IN&gl=IN&ceid=IN:en&q=";
// Official feeds read directly; news searches (headline + link only) give wide, fresh coverage.
const SOURCES = [
  { name: "PIB", url: "https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3", scope: "National" },
  { name: "RBI", url: "https://www.rbi.org.in/pressreleases_rss.xml", scope: "National" },
  { name: "news", url: G + encodeURIComponent("Punjab government") + "+when:3d", scope: "Punjab", news: true },
  { name: "news", url: G + encodeURIComponent("Punjab cabinet decision") + "+when:3d", scope: "Punjab", news: true },
  { name: "news", url: G + encodeURIComponent("Punjab Vidhan Sabha") + "+when:3d", scope: "Punjab", news: true },
  { name: "news", url: G + encodeURIComponent("Punjab scheme launched") + "+when:3d", scope: "Punjab", news: true },
  { name: "news", url: G + encodeURIComponent("Punjab paddy OR stubble OR groundwater OR canal") + "+when:3d", scope: "Punjab", news: true },
  { name: "news", url: G + encodeURIComponent("Punjab economy OR budget OR GSDP") + "+when:3d", scope: "Punjab", news: true },
  { name: "news", url: G + encodeURIComponent("Chandigarh administration") + "+when:3d", scope: "Punjab", news: true },
  { name: "news", url: G + encodeURIComponent("Union Cabinet approves") + "+when:3d", scope: "National", news: true },
  { name: "news", url: G + encodeURIComponent("Supreme Court verdict") + "+when:3d", scope: "National", news: true },
  { name: "news", url: G + encodeURIComponent("RBI policy") + "+when:3d", scope: "National", news: true },
  { name: "news", url: G + encodeURIComponent("ISRO OR DRDO launch") + "+when:3d", scope: "National", news: true },
  { name: "news", url: G + encodeURIComponent("government launches scheme India") + "+when:3d", scope: "National", news: true },
  { name: "news", url: G + encodeURIComponent("NITI Aayog report") + "+when:3d", scope: "National", news: true },
  { name: "news", url: G + encodeURIComponent("India ranks index report") + "+when:3d", scope: "National", news: true },
  { name: "news", url: G + encodeURIComponent("India signs agreement") + "+when:3d", scope: "International", news: true },
  { name: "news", url: G + encodeURIComponent("India bilateral talks summit") + "+when:3d", scope: "International", news: true },
  { name: "news", url: G + encodeURIComponent("United Nations India") + "+when:3d", scope: "International", news: true },
];
// PPSC watch: the Commission's site (often unreachable from abroad) + a news search fallback (titles only, used just to raise the alarm).
const PPSC_PAGES = ["https://ppsc.gov.in/", "https://ppsc.gov.in/Notifications.aspx"];
const PPSC_NEWS = "https://news.google.com/rss/search?q=%22Punjab+Civil+Services%22+OR+%22PPSC+PCS%22+notification+when:30d&hl=en-IN&gl=IN&ceid=IN:en";

const PUNJAB = /\b(punjab|punjabi|chandigarh|ludhiana|amritsar|jalandhar|patiala|bathinda|mohali|sas nagar|ferozepur|firozpur|gurdaspur|hoshiarpur|kapurthala|moga|muktsar|faridkot|fazilka|mansa|sangrur|barnala|malerkotla|rupnagar|ropar|nawanshahr|tarn taran|pathankot|fatehgarh sahib|bhakra|sutlej|beas|ravi|ppsc|pspcl|bhagwant mann|mann govt|sgpc|golden temple)\b/i;
const INTL = /\b(un|united nations|g20|g7|brics|sco|asean|wto|imf|world bank|who|summit|bilateral|treaty|china|pakistan|usa|us |russia|ukraine|israel|gaza|iran|bangladesh|nepal|sri lanka|bhutan|myanmar|maldives|afghanistan|eu|european union|uk |japan|australia|canada|france|germany)\b/i;
// what makes an item exam-worthy, and what makes it noise
const KEEP = /\b(cabinet|approv|scheme|yojana|mission|policy|act|bill|ordinance|amend|notif|launch|inaugurat|portal|budget|gst|gdp|inflation|repo|rbi|sebi|niti|census|survey|index|report|ranking|rank|award|prize|appoint|elected|sworn|governor|chief minister|minister|supreme court|high court|verdict|judgment|ruling|commission|committee|isro|launch vehicle|satellite|drdo|missile|exercise|treaty|agreement|mou|summit|visit|bilateral|tariff|export|import|monsoon|flood|drought|stubble|paddy|wheat|msp|groundwater|canal|water|pollution|climate|emission|tiger|wildlife|forest|ramsar|unesco|heritage|vaccine|disease|health|education|university|exam|recruitment|vacancies|ppsc|upsc|election|electoral|panchayat|municipal|vidhan sabha|assembly|parliament|lok sabha|rajya sabha|record|first|world|international|national)\w*/i;
const ROUTINE = /(headlines|school assembly|top news|news today|live updates|news wrap|quiz|current affairs \d|morning brief|evening brief|explained in \d|money market operations|money market operations|auction result|t-bill|treasury bills?|vrrr|vrr auction|reverse repo auction|repo auction|underwriting auction|conversion\/switch|switch of government|government securit|state government securit|sale \(re-issue\)|ecb \/ fccb|lending and deposit rates|weekly statistical|penalty on|monetary penalty|imposes .*penalty|cancels the certificate|cancellation of certificate|directions under section|all inclusive directions)/i;
const GOOD = /(tribune|the hindu|indian express|hindustan times|news ?on ?air|all india radio|pib|press information bureau|dd news|times of india|business standard|mint|livemint|economic times|financial express|babushahi|ndtv|deccan herald|theprint|the print|down to earth|india today|moneycontrol|the wire|scroll|frontline|reuters|bbc|al jazeera|the federal|outlook|news18|firstpost|wion|dainik|bhaskar|jagran|punjab kesari|yes punjab|punjab news express|ani|pti|ians)/i;
const POLITICS = /\b(candidates?|ticket|campaign|rally|rallies|roadshow|joins (the )?(bjp|congress|aap|sad|akali)|slams|hits out|lashes out|jibe|war of words|attacks? (on )?(govt|government|opposition)|alleges|allegation|poll promise|manifesto|by-?poll|seat-sharing)\b/i;
const DROP = /\b(murder|killed|kills|dead body|stabbed|shot dead|rape|molest|robbery|loot|theft|arrested|held for|nabbed|drug peddler|gangster|accident|crash|mishap|suicide|dies|death of|actor|actress|film|movie|box office|trailer|song|singer|celebrity|wedding|horoscope|astrology|zodiac|cricket score|ipl|bollywood|web series|ott|viral video|shocking)\b/i;

const ENT = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", ndash: "–", mdash: "—", hellip: "…" };
const clean = s => String(s || "").replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/<[^>]+>/g, " ")
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/&([a-z]+);/gi, (m, e) => ENT[e.toLowerCase()] ?? m).replace(/\s+/g, " ").trim();
const tag = (xml, t) => { const m = xml.match(new RegExp(`<${t}[^>]*>([\\s\\S]*?)</${t}>`, "i")); return m ? m[1] : ""; };
function parseRSS(xml) {
  return (xml.match(/<item[\s>][\s\S]*?<\/item>/gi) || []).map(it => ({
    title: clean(tag(it, "title")), link: clean(tag(it, "link")) || (it.match(/<link[^>]*href="([^"]+)"/i) || [])[1] || "",
    desc: clean(tag(it, "description")), date: clean(tag(it, "pubDate") || tag(it, "dc:date") || tag(it, "updated")),
  }));
}
async function get(url, ms = 20000) {
  const ac = new AbortController(); const t = setTimeout(() => ac.abort(), ms);
  try { const r = await fetch(url, { signal: ac.signal, headers: { "Accept": "application/rss+xml, application/xml, text/xml, text/html" } });
    if (!r.ok) throw new Error("HTTP " + r.status); return await r.text(); } finally { clearTimeout(t); }
}
const isEnglish = s => { const latin = (s.match(/[A-Za-z]/g) || []).length; return latin / Math.max(1, s.replace(/\s/g, "").length) > 0.7; };
const isoDate = s => { const d = new Date(s); return isNaN(d) ? today : d.toISOString().slice(0, 10); };
function topicsFor(text, scope) {
  const score = {};
  for (const k of tokens(text)) { const w = model.w[k]; if (!w) continue; for (const [id, v] of Object.entries(w)) score[id] = (score[id] || 0) + v; }
  const ranked = Object.entries(score).sort((a, b) => b[1] - a[1]);
  const top = ranked.filter(([, v], i) => i < 3 && v >= 0.02).map(([id]) => id);
  const out = ["p1ca"]; if (scope === "Punjab" && model.nodes.pbe1) out.push(...top.filter(id => id.startsWith("pb")).slice(0, 1));
  for (const id of top) if (!out.includes(id)) out.push(id);
  return out.slice(0, 4);
}
function summary(desc, title) {
  let d = desc.replace(/^.*?\b(The post|Continue reading).*$/i, "").trim();
  if (!d || d.toLowerCase() === title.toLowerCase()) return [];
  const sents = d.match(/[^.!?]+[.!?]+/g) || [d];
  let s = sents.slice(0, 2).join(" ").trim(); if (s.length > 320) s = s.slice(0, 317).replace(/\s\S*$/, "") + "…";
  return [s];
}

const status = { run: now.toISOString(), sources: [], added: 0, kept: 0, ppsc: "" };
const feed = readJSON("feed.json", { items: [] });
const known = new Set(feed.items.map(x => x.id));
const seenTitles = new Set(feed.items.map(x => x.title.toLowerCase().slice(0, 80)));
const fresh = [];
const cutoff = new Date(now - 10 * 864e5).toISOString().slice(0, 10);

for (const src of SOURCES) {
  try {
    const items = parseRSS(await get(src.url));
    let n = 0;
    for (const it of items) {
      const pubM = it.title.match(/\s+-\s+([^-]{2,60})$/); const publisher = src.news ? (pubM ? pubM[1].trim() : "") : src.name;
      if (src.news && !GOOD.test(publisher)) continue;
      const title = (src.news && pubM ? it.title.slice(0, pubM.index) : it.title).trim();
      if (!title || !it.link || !isEnglish(title)) continue;
      const text = title + " " + it.desc;
      if (DROP.test(text) || POLITICS.test(title) || ROUTINE.test(title) || !KEEP.test(text)) continue;
      const tw = new Set(tokens(title)); if (fresh.some(f => { const fw = f._w; let i = 0; tw.forEach(w => { if (fw.has(w)) i++; }); return i / Math.max(1, tw.size + fw.size - i) >= 0.5; })) continue;
      if (src.scope === "Punjab" && !PUNJAB.test(text)) continue;
      const date = isoDate(it.date); if (date < cutoff) continue;
      const scope = PUNJAB.test(text) ? "Punjab" : (src.scope === "International" || (INTL.test(title) && !/\bindia\b/i.test(title) && src.scope !== "Punjab")) ? "International" : src.scope;
      const id = "auto-" + date + "-" + crypto.createHash("sha1").update(it.link).digest("hex").slice(0, 10);
      const tkey = title.toLowerCase().slice(0, 80);
      if (known.has(id) || seenTitles.has(tkey)) continue;
      known.add(id); seenTitles.add(tkey); n++;
      fresh.push({ id, date, scope, title, points: src.news ? [] : summary(it.desc, title), why: "", nodes: topicsFor(text, scope), src: [{ t: publisher || src.name, u: it.link }], auto: 1, _w: tw });
    }
    status.sources.push({ name: src.name, url: src.url, ok: true, items: items.length, added: n });
    await new Promise(r => setTimeout(r, 1200));
  } catch (e) { status.sources.push({ name: src.name, url: src.url, ok: false, error: String(e.message || e) }); }
}

fresh.forEach(f => delete f._w);
// a topic that fits everything fits nothing: drop over-used tags (except each item's best match)
const freq = {}; fresh.forEach(f => f.nodes.slice(1).forEach(id => freq[id] = (freq[id] || 0) + 1));
fresh.forEach(f => { f.nodes = f.nodes.filter((id, i) => i <= 1 || (freq[id] || 0) <= Math.max(6, fresh.length * 0.2)); });
const all = fresh.concat(feed.items).sort((a, b) => b.date.localeCompare(a.date));
// monthly archive keeps everything; feed.json keeps the newest 400 for the app
const byMonth = {};
for (const it of fresh) (byMonth[it.date.slice(0, 7)] = byMonth[it.date.slice(0, 7)] || []).push(it);
fs.mkdirSync(P("archive"), { recursive: true });
for (const [mon, list] of Object.entries(byMonth)) {
  const f = "archive/" + mon + ".json"; const old = readJSON(f, { items: [] });
  const ids = new Set(old.items.map(x => x.id)); const merged = old.items.concat(list.filter(x => !ids.has(x.id))).sort((a, b) => b.date.localeCompare(a.date));
  fs.writeFileSync(P(f), JSON.stringify({ month: mon, items: merged }));
}
const months = fs.readdirSync(P("archive")).filter(f => /^\d{4}-\d{2}\.json$/.test(f)).map(f => f.slice(0, 7)).sort().reverse();
fs.writeFileSync(P("feed.json"), JSON.stringify({ updated: now.toISOString(), months, items: all.slice(0, 400) }));
status.added = fresh.length; status.kept = Math.min(all.length, 400);

// ---- PPSC notification watch ----
const alert = readJSON("alert.json", { found: [] });
const PCS = /(punjab civil services|p\.?\s?c\.?\s?s\.?\b|pcs \(executive|combined competitive|civil services \(executive\)|pscscce)/i;
const NOTE = /(advertisement|advt|notification|recruitment|online application|apply|vacanc|posts)/i;
const NOT_YET = /(expected|likely|soon|rumou?r|syllabus|answer key|result|admit card|cut-?off|scam|paper leak|merit list|interview schedule)/i;
const hits = [];
for (const u of PPSC_PAGES) {
  try { const html = await get(u, 25000);
    const links = [...html.matchAll(/<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)].map(m => ({ href: m[1], text: clean(m[2]) }));
    for (const l of links) if (PCS.test(l.text) && NOTE.test(l.text) && !NOT_YET.test(l.text)) hits.push({ title: l.text.slice(0, 200), link: new URL(l.href, u).href, via: "ppsc.gov.in" });
    status.ppsc += "site ok; ";
  } catch (e) { status.ppsc += "site unreachable (" + (e.message || e) + "); "; }
}
try { for (const it of parseRSS(await get(PPSC_NEWS))) if (PCS.test(it.title) && NOTE.test(it.title) && !NOT_YET.test(it.title) && /ppsc|punjab/i.test(it.title)) hits.push({ title: it.title.slice(0, 200), link: it.link, via: "news", date: isoDate(it.date) }); status.ppsc += "news ok"; }
catch (e) { status.ppsc += "news unreachable (" + (e.message || e) + ")"; }
const yr = now.getFullYear();
const relevant = hits.filter(h => new RegExp(`\\b(${yr}|${yr + 1})\\b`).test(h.title) || h.via === "news");
const old = new Set(alert.found.map(x => x.title));
for (const h of relevant) if (!old.has(h.title)) alert.found.unshift(Object.assign({ first: today }, h));
alert.found = alert.found.slice(0, 20); alert.checked = now.toISOString();
fs.writeFileSync(P("alert.json"), JSON.stringify(alert));
fs.writeFileSync(P("status.json"), JSON.stringify(status, null, 1));
console.log(`added ${status.added} items; feed has ${status.kept}; PPSC: ${status.ppsc}; alert entries ${alert.found.length}`);
for (const s of status.sources) console.log((s.ok ? "  ok   " : "  FAIL ") + s.name + " " + (s.ok ? `${s.items} read, ${s.added} added` : s.error));
