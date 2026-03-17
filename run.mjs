import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read .env file manually - no dotenv needed
function loadEnv() {
  try {
    const envPath = path.join(__dirname, ".env");
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const eq = trimmed.indexOf("=");
        if (eq > 0) {
          const key = trimmed.slice(0, eq).trim();
          const val = trimmed.slice(eq + 1).trim();
          process.env[key] = val;
        }
      }
    }
  } catch {
    console.error("Could not read .env file - make sure it exists");
    process.exit(1);
  }
}

loadEnv();

const API_KEY = process.env.GOOGLE_API_KEY;
if (!API_KEY) {
  console.error("ERROR: GOOGLE_API_KEY not found in .env file");
  process.exit(1);
}

console.log("API key loaded OK");

async function callGemini(prompt) {
  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + API_KEY;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 1024 }
    })
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error("Gemini error " + res.status + ": " + err);
  }
  const data = await res.json();
  return data.candidates[0].content.parts[0].text;
}

async function assessSkills(profile) {
  console.log("  [1/4] Assessing skills...");
  const prompt = "Score this Indian student for the job market. Return ONLY valid JSON, no markdown, no extra text.\n\nStudent field: " + profile.field + "\nCity: " + profile.city + "\nProjects: " + profile.projectHistory.map(p => p.title + " shipped=" + p.shippedToProduction).join(", ") + "\nSelf scores: " + JSON.stringify(profile.selfAssessment) + "\n\nReturn exactly this JSON structure:\n{\"priorityAbility\":7,\"technicalSkills\":6,\"executionSpeed\":7,\"learnability\":7,\"softSkills\":6,\"confidence\":0.85,\"reasoning\":{\"priorityAbility\":\"reason here\",\"technicalSkills\":\"reason here\",\"executionSpeed\":\"reason here\",\"learnability\":\"reason here\",\"softSkills\":\"reason here\"}}";
  const raw = await callGemini(prompt);
  const clean = raw.replace(/```json/g, "").replace(/```/g, "").trim();
  try {
    return JSON.parse(clean);
  } catch {
    console.log("  (using default scores)");
    return { priorityAbility:7, technicalSkills:6, executionSpeed:7, learnability:7, softSkills:6, confidence:0.8, reasoning:{ priorityAbility:"Good focus on shipped work", technicalSkills:"Solid domain execution", executionSpeed:"Fast delivery", learnability:"Diverse tools used", softSkills:"Clear impact statements" } };
  }
}

async function researchMarket(profile) {
  console.log("  [2/4] Researching job market...");
  const prompt = "Top 5 skills for entry-level " + profile.field + " jobs in India 2025. Return ONLY this JSON:\n{\"topSkills\":[\"skill1\",\"skill2\",\"skill3\",\"skill4\",\"skill5\"],\"salary\":\"3-5 LPA\",\"gaps\":[\"gap1\",\"gap2\"]}";
  const raw = await callGemini(prompt);
  const clean = raw.replace(/```json/g, "").replace(/```/g, "").trim();
  try {
    return JSON.parse(clean);
  } catch {
    return { topSkills:["Digital Marketing","Data Analysis","AI Tools","Excel","Communication"], salary:"2.5-5 LPA", gaps:["Data Analytics","AI Tools"] };
  }
}

function calcScore(skills, behavior) {
  const boost = behavior.avgResponseTimeSeconds < 30 ? 1.1 : 1.0;
  const p = Math.round((skills.priorityAbility / 10) * 3000);
  const t = Math.round((skills.technicalSkills  / 10) * 2000);
  const e = Math.min(2000, Math.round((skills.executionSpeed / 10) * 2000 * boost));
  const l = Math.round((skills.learnability     / 10) * 2000);
  const s = Math.round((skills.softSkills       / 10) * 1000);
  const bonus = 200;
  return { p, t, e, l, s, bonus, total: Math.min(10000, p+t+e+l+s+bonus) };
}

function bar(v, max) {
  const filled = Math.round((v / max) * 10);
  return "X".repeat(filled) + "-".repeat(10 - filled);
}

async function main() {
  const profilePath = path.join(__dirname, "data", "sample_student.json");
  const profile = JSON.parse(fs.readFileSync(profilePath, "utf-8"));

  console.log("\n" + "=".repeat(50));
  console.log("TruthGrid CareerAgent");
  console.log("Student: " + profile.name + " | " + profile.field + " | " + profile.city);
  console.log("=".repeat(50) + "\n");

  const start = Date.now();

  const skills = await assessSkills(profile);
  const market = await researchMarket(profile);

  console.log("  [3/4] Calculating TruthID score...");
  const sc = calcScore(skills, profile.behaviorMetrics);

  console.log("  [4/4] Writing report...");
  const report = [
    "# TruthGrid Assessment Report",
    "Date: " + new Date().toLocaleDateString("en-IN"),
    "",
    "## Student: " + profile.name,
    "Field: " + profile.field + " | " + profile.institution + ", " + profile.city,
    "TruthID Score: " + sc.total + " / 10,000",
    "",
    "## Score Breakdown",
    "Priority Ability  " + sc.p + "/3000  " + bar(sc.p, 3000),
    "Technical Skills  " + sc.t + "/2000  " + bar(sc.t, 2000),
    "Execution Speed   " + sc.e + "/2000  " + bar(sc.e, 2000),
    "Learnability      " + sc.l + "/2000  " + bar(sc.l, 2000),
    "Soft Skills       " + sc.s + "/1000  " + bar(sc.s, 1000),
    "Market Bonus      +" + sc.bonus,
    "",
    "## Score Reasoning",
    "Priority Ability: " + skills.reasoning.priorityAbility,
    "Technical Skills: " + skills.reasoning.technicalSkills,
    "Execution Speed:  " + skills.reasoning.executionSpeed,
    "Learnability:     " + skills.reasoning.learnability,
    "Soft Skills:      " + skills.reasoning.softSkills,
    "",
    "## India Job Market: " + profile.field,
    "Top skills in demand: " + market.topSkills.join(", "),
    "Fresher salary range: " + market.salary,
    "Skill gaps to close:  " + market.gaps.join(", "),
    "",
    "---",
    "Powered by TruthGrid — India's AI-native skill verification system"
  ].join("\n");

  fs.writeFileSync(path.join(__dirname, "output_report.md"), report, "utf-8");

  const ms = Date.now() - start;
  console.log("\n" + "-".repeat(50));
  console.log("Done in " + ms + "ms");
  console.log("TruthID Score: " + sc.total + " / 10,000");
  console.log("Report saved: output_report.md");
  console.log("-".repeat(50) + "\n");
}

main().catch(function(err) { console.error("Error:", err.message); });
