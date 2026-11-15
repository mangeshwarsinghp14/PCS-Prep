// PCS Prep — garcha_rules.mjs
// Hand-written rules (no AI) that decide whether a news item matters for the PPSC exam,
// what kind of item it is, what to note about it, and which facts and figures to pull out.

export const PUNJAB = /\b(punjab|punjabi|chandigarh|ludhiana|amritsar|jalandhar|patiala|bathinda|mohali|sas nagar|ferozepur|firozpur|gurdaspur|hoshiarpur|kapurthala|moga|muktsar|faridkot|fazilka|mansa|sangrur|barnala|malerkotla|rupnagar|ropar|nawanshahr|shaheed bhagat singh nagar|tarn taran|pathankot|fatehgarh sahib|bhakra|sutlej|satluj|beas|ravi|ppsc|pspcl|sgpc|golden temple|akal takht|harike|kanjli|ropar wetland)\b/i;
export const INTL = /\b(un|united nations|g20|g7|brics|sco|asean|wto|imf|world bank|who|unesco|unep|unfccc|cop\d+|summit|bilateral|treaty|china|pakistan|usa|u\.s\.|united states|russia|ukraine|israel|gaza|palestin|iran|bangladesh|nepal|sri lanka|bhutan|myanmar|maldives|afghanistan|eu|european union|uk|britain|japan|australia|canada|france|germany|mercosur|gcc|african union|philippines|indonesia|vietnam|singapore|saudi|uae|qatar)\b/i;

// ---- what kind of item is it? (decides the exam angle and the quiz) ----
export const KINDS = [
  { k: "scheme", re: /\b(scheme|yojana|mission|abhiyan|programme|program|initiative|portal|app launched|launches?|rolls out|unveil)/i, why: "Note the scheme's name, the ministry or department running it, launch date, outlay and who benefits." },
  { k: "law", re: /\b(act|bill|ordinance|amendment|rules,? 20\d\d|notif(y|ied|ication)|code on|regulation|guidelines|directions|framework|policy)\b/i, why: "Note what the law or policy changes, who issued it, the date it takes effect and the constitutional or legal basis." },
  { k: "court", re: /\b(supreme court|high court|sc |hc |verdict|judgment|ruling|constitution bench|bench of)\b/i, why: "Note the court, the principle laid down, the article or law interpreted, and how it affects governance." },
  { k: "report", re: /\b(report|index|ranking|ranks?|survey|census|data|statistics|estimates|bulletin|gdp|inflation|cpi|wpi|iip|balance of payments|forex reserves)\b/i, why: "Note who publishes it, the headline numbers, India's or Punjab's rank and the trend versus last time." },
  { k: "intl", re: /\b(summit|bilateral|treaty|agreement|mou|pact|protocol|visit|talks|dialogue|joint statement|fta|cepa|partnership|un general assembly|security council)\b/i, why: "Note the countries or bodies involved, the place, what was signed or agreed, and why it matters for India." },
  { k: "appoint", re: /\b(appointed|named|takes charge|assumes charge|sworn in|elected (as|to)|new chief|next chief|chairperson|chairman of)\b/i, why: "Note the person, the post, who appoints to it (and under which article or law), and the predecessor." },
  { k: "sci", re: /\b(isro|drdo|satellite|launch vehicle|missile|test-?fired|rocket|space|mission|research|vaccine|ai model|semiconductor|quantum|nuclear)\b/i, why: "Note the organisation, the technology, what is new or a first for India, and its use." },
  { k: "env", re: /\b(stubble|pollution|aqi|emission|climate|cop\d+|forest|wildlife|tiger|ramsar|wetland|biodiversity|groundwater|water table|flood|drought|monsoon|heatwave|cyclone|earthquake)\b/i, why: "Note the place, the numbers, the cause, the government response and the related law or scheme." },
  { k: "economy", re: /\b(budget|gst|tax|msp|procurement|exports?|imports?|tariff|subsid|investment|fdi|pli|bank|rbi|repo|loan|credit|fiscal|deficit|debt)\b/i, why: "Note the figures, the policy reason and the effect on farmers, industry or the state's finances." },
  { k: "award", re: /\b(award|prize|honour|honor|medal|gi tag|unesco|heritage|world record|first ever|first-ever)\b/i, why: "Note who received what, from whom, and for what — these are classic one-liners in Prelims." },
];
export const kindOf = t => (KINDS.find(x => x.re.test(t)) || { k: "general", why: "Note the who, what, where and the figures; link it to the syllabus topic below." });

// ---- relevance: points for exam value, penalties for noise ----
const STRONG = /\b(supreme court|high court|upholds|strikes down|ruling|cabinet (approves|approved|nod)|approves?|approval|launch(es|ed)?|inaugurat\w*|scheme|yojana|mission|act|bill|ordinance|policy|notif\w*|guidelines|framework|index|report|ranking|survey|census|summit|agreement|mou|protocol|treaty|signs?|appoint\w*|sworn in|takes charge|award|gi tag|ramsar|unesco|tiger reserve|satellite|missile|exercise|first ever|first-ever|record|verdict|judgment|constitution|article \d+|gdp|inflation|repo rate|budget|msp|procurement|groundwater|stubble|canal|dam|reservoir|tariff|exports?|fdi|pli|census)\b/i;
const NUMBERS = /(₹|rs\.?\s?|\$|\b\d[\d,.]*\s?(crore|lakh|billion|million|%|per ?cent|gw|mw|km|hectares?|tonnes?|bps|incidents|cases|villages|districts))/i;
export const POLITICS = /\b(factional|faction|rift|infighting|yatra|defame|clash(es)?|vows?|returns? to power|dharna|uproar|walk-?out|chaos|protest(s|ers)?|agitation|gherao|alleged|seeks probe|demands? probe|failed to|blame game|polls?|elections? (rally|campaign)|ahead of (the )?(20\d\d )?(assembly |lok sabha )?(polls|elections)|campaign|rally|rallies|roadshow|candidates?|tickets?|to contest|joins (the )?(bjp|congress|aap|sad|akali|bsp)|slams?|hits out|lashes out|jibe|dig at|war of words|takes aim|targets?|attacks?|accuses?|alleges?|allegations?|betray\w*|cruel joke|blames?|jolt to|setback for|u-turn|poll promise|manifesto|by-?polls?|seat-sharing|defection|resigns from (the )?party|expelled|show-cause|press conference|says (bjp|congress|aap|sad)|(bjp|congress|aap|sad|akali dal|bsp)('s)? (leader|chief|president|mla|mp|spokesperson)|opposition leader|leader of opposition)\b/i;
export const CRIME = /\b(sentenced?|convicted|conviction|acquitted|jail(ed)?|disappearance|abduct\w*|kidnap\w*|extortion|collide[sd]?|collision|injured|injures|blaze|fire breaks|drown\w*|recovered|seized|seizure|parole|custody|ncb|opioids?|smuggl\w*|heroin|narcotics?|murder\w*|killed|kills|dead body|stabbed|shot (dead|at)|firing|rape|molest\w*|robbery|loot|theft|arrest\w*|held for|nabbed|nabs|drug peddler|gangster|smuggler|accident|crash|mishap|suicide|dies|death of|fir (lodged|registered)|booked|bail|raids?|searches at|ed (attaches|arrests|raids|summons)|cbi (arrests|raids|summons|widens)|vigilance (bureau )?(arrests|nabs)|bribe|scam accused|absconding|encounter)\b/i;
export const FLUFF = /\b(cci approves|approves (the )?(proposed )?combination|acquisition of (certain )?shareholding|county|playing xi|wickets?|innings|t20|odi|test match|squad|transfer window|signs (a )?(fresh |new )?contract|legend|hawai\S*|actor|actress|film|movie|box office|trailer|song|singer|celebrity|wedding|horoscope|astrology|zodiac|cricket score|ipl|bollywood|pollywood|web series|ott|viral video|shocking|photos:|in pics|watch:|video:|live updates|live:|headlines|top news|news today|morning brief|evening brief|school assembly|quiz|current affairs \d|stocks? to (buy|watch)|share price|target price|sensex|nifty|ipo|multibagger|buy or sell|gold rate today|petrol price today|weather today|lottery|results? (declared|out)|admit card|answer key)\b/i;
export const RBI_ROUTINE = /(auction|t-bill|treasury bills?|government securit|state government securit|money market operations|vrrr|vrr |reverse repo auction|repo auction|underwriting|conversion\/switch|switch of government|sale \(re-issue\)|ecb \/ fccb|lending and deposit rates|weekly statistical|scheduled banks.? statement|statement of position|penalty|penalises|imposes|cancels the certificate|cancellation of (the )?certificate|certificate of registration|directions under section|all inclusive directions|amalgamation of|voluntary amalgamation|reserve money|money supply|sectoral deployment|overseas investment|reference rate|ombudsman scheme annual|sovereign gold bond.*redemption|redemption price|premature redemption|issue price|sgb|cut-off|results? of)/i;
export const RBI_KEEP = /(monetary policy|policy repo|resolution of the monetary|governor|framework|guidelines|directions on|draft|launch|statement on developmental|financial stability|annual report|payment system|digital rupee|e-rupee|cbdc|inflation|bulletin|survey|balance of payments|forex reserves|external debt|financial inclusion|green|priority sector|kyc|upi|currency|banknotes?|coins?|deposit insurance|credit|fintech|cyber)/i;
const OFFICIAL = /^(PIB|RBI|DD News|News On AIR|All India Radio|Prasar Bharati|PRS)/i;
const PARTY = /\b(bjp|congress|aap|sad|akali|bsp|inld|jjp|cpi\(?m\)?|tmc|dmk|rjd|jd\(u\)|shiv sena|ncp)\b/i;
const PROTOCOL = /\b(greetings?|greets|wishes|condoles|condolences?|tributes?|homage|celebrates|felicitat\w*|calls on|courtesy|meets|interacts|addresses|visits|to visit|chairs|reviews|inspects|attends|participat\w*|showcases|organi[sz]es|sports meets?|cyclothon|marathon|walkathon|convocation|birth anniversary|jayanti|greets)\b/i;
const SPECUL = /\b(may|might|could|likely to|expected to|set to|seen (hitting|rising|falling)|poised|predicts?|forecast)\b/i;
const OPINION = /^(analysis|opinion|explained|editorial|view|comment)\b|\b(how|why|what) (is|are|the|punjab|india)\b|:\s*(how|why|what)\b|\b(from .* to)\b/i;
export const PAK_PUNJAB = /(pakistan'?s punjab|punjab,? pakistan|\blahore\b|maryam nawaz|rawalpindi|faisalabad|multan|gujranwala|\bsindh\b|\bpml-?n\b|\bpti\b|\bpaf\b)/i;

// score 0–100; items under 30 are dropped
export function relevance({ title, text, publisher, scope }) {
  const t = title + " " + (text || "");
  let s = OFFICIAL.test(publisher || "") ? 30 : 20;
  const strong = (title.match(new RegExp(STRONG.source, "gi")) || []).length + (((text || "").match(new RegExp(STRONG.source, "gi")) || []).length > 2 ? 1 : 0);
  s += Math.min(30, strong * 10);
  if (NUMBERS.test(t)) s += 8;
  if (scope === "Punjab" || PUNJAB.test(title)) s += 10;
  if (/,? says (\w+ ){0,3}(cm|minister|mla|mp|leader|chief)\b|\b(hits back|retorts|counters)\b/i.test(title)) s -= 25;
  if (/^["“'‘][^"”'’]{8,}["”'’]\s*:/.test(title)) s -= 15; // a quote first, then who said it
  if (POLITICS.test(title)) s -= 45;
  else if (PARTY.test(title)) s -= 30;
  if (PROTOCOL.test(title) && strong <= 1) s -= 15;
  if (SPECUL.test(title) && !OFFICIAL.test(publisher || "")) s -= 10;
  if (OPINION.test(title) && !OFFICIAL.test(publisher || "")) s -= 8;
  if (CRIME.test(title) && !/\b(act|policy|rules|reform|law|bill)\b/i.test(title)) s -= 40;
  if (FLUFF.test(title)) s -= 50;
  if (/\?$/.test(title) && !OFFICIAL.test(publisher || "")) s -= 5;
  if (title.length < 35) s -= 8;
  return Math.max(0, Math.min(100, s));
}
export const stars = s => (s >= 60 ? 3 : s >= 45 ? 2 : 1);

// ---- key figures: numbers with their unit and a few words of context ----
const FIG = /(?:₹\s?|rs\.?\s?|inr\s?|us\$\s?|\$\s?)?\b\d{1,3}(?:,\d{2,3})*(?:\.\d+)?\s?(?:-\s?)?(?:lakh crore|crore|lakh|billion|million|trillion|%|per ?cent|bps|basis points|gw|gwh|mw|kw|km|kms|kilometres?|hectares?|acres?|tonnes?|lmt|mt|incidents|cases|villages|districts|beneficiaries|farmers|students|families|households|units)\b/gi;
export function figures(text, max = 4) {
  const out = [], seen = new Set();
  for (const sent of String(text || "").split(/(?<=[.!?;])\s+/)) {
    for (const m of sent.matchAll(FIG)) {
      const v = m[0].trim(); if (/^\d{4}$/.test(v) || seen.has(v.toLowerCase())) continue;
      const before = sent.slice(Math.max(0, m.index - 70), m.index).split(/\s+/).slice(-6).join(" ");
      const after = sent.slice(m.index + m[0].length, m.index + m[0].length + 60).split(/\s+/).slice(0, 6).join(" ");
      const ctx = (before + " " + v + " " + after).replace(/\s+/g, " ").replace(/^[^A-Za-z₹$0-9]+|[,;:(]+$/g, "").trim();
      if (ctx.length < 12) continue;
      seen.add(v.toLowerCase()); out.push(ctx.length > 110 ? ctx.slice(0, 107) + "…" : ctx);
      if (out.length >= max) return out;
    }
  }
  return out;
}

// ---- extractive summary: pick the sentences that carry the most information ----
const STOPW = new Set("the a an and or of in on at to for from by with into is are was were be been has have had this that these those it its as also will would shall may can which who whom whose their there here than then over under about after before during under shri smt dr hon'ble honourable said says stated added further".split(" "));
export function summarise(text, n = 3) {
  const sents = String(text || "").replace(/\s+/g, " ").split(/(?<=[.!?])\s+(?=[A-Z0-9“"‘(])/).map(s => s.trim()).filter(s => s.length > 40 && s.length < 420 && !/^(\*+|follow us|for more|also read|click here|tags?:|source:)/i.test(s));
  if (!sents.length) return [];
  const words = s => s.toLowerCase().replace(/[^a-z0-9₹%\s-]/g, " ").split(/\s+/).filter(w => w.length > 2 && !STOPW.has(w));
  const tf = {}; sents.forEach(s => new Set(words(s)).forEach(w => tf[w] = (tf[w] || 0) + 1));
  const scored = sents.map((s, i) => {
    const ws = words(s); let sc = ws.reduce((a, w) => a + Math.log(1 + tf[w]), 0) / Math.sqrt(ws.length + 1);
    if (i === 0) sc *= 1.5; else if (i < 3) sc *= 1.15;
    if (FIG.test(s)) sc *= 1.25; FIG.lastIndex = 0;
    if (/\b(will|shall) (be )?(attend|grace|present)|dignitaries|on the occasion|felicitat|vote of thanks|welcome address/i.test(s)) sc *= 0.5;
    return { s, i, sc };
  });
  const pick = scored.slice().sort((a, b) => b.sc - a.sc).slice(0, n).sort((a, b) => a.i - b.i);
  return pick.map(p => p.s.replace(/^[A-Z][A-Za-z .]+,\s*\d{1,2}(st|nd|rd|th)? [A-Z][a-z]+,? 20\d\d[:,.\s-]*/, "")).map(s => s.length > 300 ? s.slice(0, 297).replace(/\s\S*$/, "") + "…" : s);
}
