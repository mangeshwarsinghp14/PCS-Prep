// PCS Prep — garcha_quiz.mjs
// Makes multiple-choice questions from news items with fixed rules (no AI):
//  1. "fill the blank" on a country, bloc, body, state or Punjab district named in the headline,
//     with wrong options of the same kind;
//  2. "fill the number" on a figure (₹ crore, %, GW, km…) with wrong options scaled from the true one;
//  3. "which ministry" for PIB releases.
// Every question keeps the right answer first (the app shuffles), and only fires when the pattern is clear.

export const MINISTRIES = ["Ministry of Chemicals and Fertilizers", "Ministry of Civil Aviation", "Ministry of Coal", "Ministry of Commerce & Industry", "Ministry of Communications", "Ministry of Consumer Affairs, Food & Public Distribution", "Ministry of Cooperation", "Ministry of Corporate Affairs", "Ministry of Culture", "Ministry of Defence", "Ministry of Development of North-East Region", "Ministry of Earth Sciences", "Ministry of Education", "Ministry of Electronics & IT", "Ministry of Environment, Forest and Climate Change", "Ministry of External Affairs", "Ministry of Finance", "Ministry of Fisheries, Animal Husbandry & Dairying", "Ministry of Food Processing Industries", "Ministry of Health and Family Welfare", "Ministry of Heavy Industries", "Ministry of Home Affairs", "Ministry of Housing & Urban Affairs", "Ministry of Information & Broadcasting", "Ministry of Jal Shakti", "Ministry of Labour & Employment", "Ministry of Law and Justice", "Ministry of Micro, Small & Medium Enterprises", "Ministry of Mines", "Ministry of Minority Affairs", "Ministry of New and Renewable Energy", "Ministry of Panchayati Raj", "Ministry of Parliamentary Affairs", "Ministry of Personnel, Public Grievances & Pensions", "Ministry of Petroleum & Natural Gas", "Ministry of Power", "Ministry of Railways", "Ministry of Road Transport & Highways", "Ministry of Rural Development", "Ministry of Science & Technology", "Ministry of Ports, Shipping and Waterways", "Ministry of Skill Development and Entrepreneurship", "Ministry of Social Justice & Empowerment", "Ministry of Statistics & Programme Implementation", "Ministry of Steel", "Ministry of Textiles", "Ministry of Tourism", "Ministry of Tribal Affairs", "Ministry of Women and Child Development", "Ministry of Youth Affairs and Sports"];

const LISTS = {
  bloc: ["ASEAN", "MERCOSUR", "European Union", "BRICS", "SCO", "G20", "G7", "Quad", "GCC", "SAARC", "BIMSTEC", "African Union", "IORA", "OPEC", "APEC", "EFTA", "NATO", "Commonwealth"],
  body: ["NITI Aayog", "RBI", "SEBI", "ISRO", "DRDO", "WHO", "IMF", "World Bank", "UNESCO", "UNEP", "WTO", "FAO", "ILO", "NABARD", "SIDBI", "CAG", "Election Commission", "NHRC", "NGT", "CBI", "ICMR", "CSIR", "IIT Ropar", "PGIMER", "Finance Commission", "GST Council", "FSSAI", "TRAI", "IRDAI", "PFRDA", "NHAI", "UIDAI", "NPCI", "BIS", "CPCB", "IMD", "ICAR", "AIIMS", "UGC", "NCERT", "NABARD", "Asian Development Bank", "New Development Bank", "AIIB", "UNICEF", "UNDP", "IAEA", "IEA", "Interpol", "FATF"],
  country: ["United States", "China", "Russia", "Japan", "Germany", "France", "United Kingdom", "Australia", "Canada", "Brazil", "South Africa", "Saudi Arabia", "UAE", "Qatar", "Iran", "Israel", "Egypt", "Indonesia", "Vietnam", "Philippines", "Singapore", "Malaysia", "Thailand", "Bangladesh", "Nepal", "Bhutan", "Sri Lanka", "Maldives", "Myanmar", "Afghanistan", "Pakistan", "Mauritius", "Kenya", "Nigeria", "Argentina", "Chile", "Mexico", "Italy", "Spain", "Netherlands", "Sweden", "Norway", "Denmark", "Finland", "Poland", "Ukraine", "Turkey", "Greece", "South Korea", "New Zealand", "Oman", "Kuwait", "Bahrain", "Ethiopia", "Tanzania", "Ghana", "Peru", "Colombia", "Uzbekistan", "Kazakhstan", "Kyrgyzstan", "Tajikistan", "Armenia", "Belgium", "Switzerland", "Austria", "Cyprus", "Morocco", "Algeria", "Fiji"],
  state: ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Jammu and Kashmir", "Ladakh", "Delhi", "Puducherry", "Chandigarh"],
  district: ["Amritsar", "Barnala", "Bathinda", "Faridkot", "Fatehgarh Sahib", "Fazilka", "Ferozepur", "Gurdaspur", "Hoshiarpur", "Jalandhar", "Kapurthala", "Ludhiana", "Malerkotla", "Mansa", "Moga", "Sri Muktsar Sahib", "Pathankot", "Patiala", "Rupnagar", "Sangrur", "SAS Nagar (Mohali)", "Shaheed Bhagat Singh Nagar", "Tarn Taran"],
};
const ALIAS = { "US": "United States", "USA": "United States", "U.S.": "United States", "UK": "United Kingdom", "Britain": "United Kingdom", "EU": "European Union", "Mohali": "SAS Nagar (Mohali)", "Muktsar": "Sri Muktsar Sahib", "Nawanshahr": "Shaheed Bhagat Singh Nagar", "Ropar": "Rupnagar", "Firozpur": "Ferozepur", "J&K": "Jammu and Kashmir", "Reserve Bank": "RBI" };
const ORDER = ["bloc", "body", "country", "district", "state"];

function seeded(str) { let h = 2166136261; for (const c of String(str)) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return () => { h = Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909); return (h >>> 0) / 4294967296; }; }
const pickN = (arr, n, r) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a.slice(0, n); };
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const fmtDay = d => new Date(d + "T00:00:00Z").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

// 1. named-entity blank
function entityQ(it, r) {
  const title = it.title;
  const found = [];
  for (const cat of ORDER) {
    const names = LISTS[cat].concat(Object.keys(ALIAS).filter(a => LISTS[cat].includes(ALIAS[a])));
    for (const name of names) {
      const m = title.match(new RegExp(`(^|[^A-Za-z])(${esc(name)})(?![A-Za-z])`));
      if (m) found.push({ cat, shown: m[2], ans: ALIAS[m[2]] || m[2], at: m.index + m[1].length });
    }
  }
  // skip India and the obvious state for Punjab news; skip if the same entity shows twice
  if (/\s\|\s/.test(title)) return null; // tag-style headlines make poor questions
  const cand = found.filter(f => f.ans !== "India" && !(f.cat === "state" && f.ans === "Punjab") && title.split(f.shown).length === 2 && !/\bNew\s$/.test(title.slice(0, f.at)));
  if (!cand.length) return null;
  const f = cand[0];
  const others = LISTS[f.cat].filter(x => x !== f.ans && !new RegExp(`(^|[^A-Za-z])${esc(x)}(?![A-Za-z])`, "i").test(title));
  if (others.length < 3) return null;
  const blanked = title.slice(0, f.at) + "_____" + title.slice(f.at + f.shown.length);
  const what = { bloc: "group", body: "body", country: "country", state: "state", district: "district" }[f.cat];
  return { q: `Fill the blank (news, ${fmtDay(it.date)}): “${blanked}”. Which ${what} is it?`, o: [f.ans].concat(pickN(others, 3, r)), e: explain(it) };
}

// 2. number blank
const NUM = /(₹\s?|rs\.?\s?|us\$\s?|\$\s?)?(\d{1,3}(?:,\d{2,3})*(?:\.\d+)?)(\s?(?:-\s?)?(?:lakh crore|lakh cr\b|lakh-crore|crore|cr\b|lakh|billion|million|trillion|%|per ?cent|gw|gwh|mw|km|hectares?|tonnes?|lmt|incidents|cases|villages|beneficiaries|farmers|families|households))\b/i;
function numberQ(it, r) {
  const pool = [it.title].concat(it.points || []);
  for (const sent of pool) {
    const m = sent.match(NUM); if (!m) continue;
    const raw = m[2], val = parseFloat(raw.replace(/,/g, "")); if (!isFinite(val) || val <= 0 || /^(19|20)\d\d$/.test(raw)) continue;
    const dec = (raw.split(".")[1] || "").length, commas = raw.includes(",");
    const fmt = v => { let s = v.toFixed(dec); if (commas) { const [a, b] = s.split("."); s = Number(a).toLocaleString("en-IN") + (b ? "." + b : ""); } return (m[1] || "") + s + m[3]; };
    const pct = /%|per ?cent/i.test(m[3]);
    const mults = pct && val < 100 ? [-0.25, 0.3, -0.45, 0.55].map(x => val * (1 + x)) : [0.5, 0.75, 1.5, 2].map(x => val * x);
    const opts = [...new Set(mults.map(v => fmt(dec ? v : Math.max(1, Math.round(v)))))].filter(s => s !== m[0].trim() && s !== fmt(val));
    if (opts.length < 3) continue;
    const blanked = sent.replace(m[0], "_____");
    if (blanked.length < 30) continue;
    return { q: `Fill the number (news, ${fmtDay(it.date)}): “${blanked}”`, o: [fmt(val)].concat(pickN(opts, 3, r)), e: explain(it) };
  }
  return null;
}

// 3. which ministry (PIB)
function ministryQ(it, r) {
  if (!it.ministry || !MINISTRIES.includes(it.ministry)) return null;
  const key = it.ministry.replace(/^Ministry of /, "").split(/[ ,&]+/).filter(w => w.length > 3);
  if (key.some(w => new RegExp(`\\b${esc(w)}`, "i").test(it.title))) return null; // the headline gives it away
  return { q: `Which ministry issued this release (PIB, ${fmtDay(it.date)}): “${it.title}”?`, o: [it.ministry].concat(pickN(MINISTRIES.filter(x => x !== it.ministry), 3, r)), e: explain(it) };
}

function explain(it) {
  const src = (it.src || [])[0] || {};
  const pt = (it.points || [])[0];
  return `${src.t || "News"}, ${fmtDay(it.date)}.${pt ? " " + pt : ""}`.slice(0, 400);
}

export function makeQuiz(it, max = 2) {
  const r = seeded(it.id);
  const out = [];
  for (const f of [entityQ, ministryQ, numberQ]) {
    if (out.length >= max) break;
    const q = f(it, r);
    if (q && q.o.length === 4 && new Set(q.o).size === 4 && !out.some(x => x.q === q.q)) out.push(q);
  }
  return out;
}
