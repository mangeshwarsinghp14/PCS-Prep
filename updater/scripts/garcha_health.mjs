// PCS Prep — garcha_health.mjs
// Runs at the end of every update. If something needs a human (a source failing several runs in a row,
// no new items for days, a step crashing), it opens one GitHub issue labelled "updater-health" — GitHub emails
// the repository owner. When everything works again it closes the issue by itself.
// Usage (inside GitHub Actions): node garcha_health.mjs <site folder>   needs GH_TOKEN, GITHUB_REPOSITORY
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const site = process.argv[2] || ".";
const readJSON = (f, d) => { try { return JSON.parse(fs.readFileSync(path.join(site, f), "utf8")); } catch { return d; } };
const status = readJSON("status.json", {}), facts = readJSON("facts.json", {});
const problems = [...((status.health || {}).problems || [])];
const out = k => (process.env[k] || "").toLowerCase();
if (out("FEED_OUTCOME") === "failure") problems.push("The news collector (garcha_feed.mjs) crashed — see the run log.");
if (out("FACTS_OUTCOME") === "failure") problems.push("The facts checker (garcha_facts.mjs) crashed — see the run log.");
if (out("JOB_STATUS") === "failure") problems.push("A step of the update job failed — see the run log.");
for (const l of facts.log || []) if (/failed/.test(l)) problems.push("Facts: " + l);
if (status.run && (Date.now() - new Date(status.run)) / 864e5 > 2) problems.push(`status.json was last written on ${status.run} — the collector may not be running.`);

const repo = process.env.GITHUB_REPOSITORY, run = process.env.GITHUB_SERVER_URL && process.env.GITHUB_RUN_ID ? `${process.env.GITHUB_SERVER_URL}/${repo}/actions/runs/${process.env.GITHUB_RUN_ID}` : "";
const gh = args => execFileSync("gh", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
console.log(problems.length ? "Problems:\n- " + problems.join("\n- ") : "Healthy");
if (!repo || !process.env.GH_TOKEN) process.exit(0);
try {
  const open = JSON.parse(gh(["issue", "list", "-R", repo, "--label", "updater-health", "--state", "open", "--json", "number,body"]) || "[]");
  if (problems.length) {
    const body = `The automatic updater found something that needs attention:\n\n${problems.map(p => "- " + p).join("\n")}\n\nRun: ${run}\n\nWhat to do: open the run log above. Most problems (a website down for a day) fix themselves; this issue closes automatically when the next run is healthy. If a source keeps failing for a week, ask Claude to look at \`updater/scripts\`.\n\n<!-- health:${problems.join("|").length} -->`;
    if (!open.length) {
      try { gh(["label", "create", "updater-health", "-R", repo, "--color", "B60205", "--description", "Raised by the PCS Prep updater", "--force"]); } catch {}
      gh(["issue", "create", "-R", repo, "--title", "PCS Prep updater needs attention", "--label", "updater-health", "--body", body]);
      console.log("Opened a health issue");
    } else if (!open[0].body.includes(`<!-- health:${problems.join("|").length} -->`)) {
      gh(["issue", "comment", String(open[0].number), "-R", repo, "--body", body]);
      gh(["issue", "edit", String(open[0].number), "-R", repo, "--body", body]);
      console.log("Updated the health issue");
    }
  } else if (open.length) {
    for (const i of open) gh(["issue", "close", String(i.number), "-R", repo, "--comment", `Fixed itself — the run on ${new Date().toISOString().slice(0, 10)} was healthy. ${run}`]);
    console.log("Closed the health issue");
  }
} catch (e) { console.log("Could not update the health issue: " + (e.stderr || e.message || e)); }
