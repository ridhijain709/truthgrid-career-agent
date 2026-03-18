import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
function loadEnv() {
  const lines = fs.readFileSync(path.join(__dirname, ".env"), "utf-8").split("\n");
  for (const line of lines) {
    const t = line.trim();
    if (t && !t.startsWith("#")) {
      const eq = t.indexOf("=");
      if (eq > 0) process.env[t.slice(0,eq).trim()] = t.slice(eq+1).trim();
    }
  }
}
loadEnv();
const KEY = process.env.GROQ_API_KEY;
if (!KEY) { console.error("ERROR: GROQ_API_KEY not set in .env"); process.exit(1); }
console.log("Groq key loaded OK");
async function ask(prompt) {
  const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method:"POST",
    headers:{"Content-Type":"application/json","Authorization":"Bearer "+KEY},
    body:JSON.stringify({model:"llama-3.3-70b-versatile",messages:[{role:"user",content:prompt}],temperature:0.3,max_tokens:1024})
  });
  if (!r.ok) throw new Error("Groq "+r.status+": "+await r.text());
  const d = await r.json();
  return d.choices[0].message.content;
}
async function main() {
  const profile = JSON.parse(fs.readFileSync(path.join(__dirname,"data","sample_student.json"),"utf-8"));
  console.log("\n==================================================");
  console.log("TruthGrid CareerAgent");
  console.log("Student: "+profile.name+" | "+profile.field+" | "+profile.city);
  console.log("==================================================\n");
  const start = Date.now();
  console.log("  [1/4] Assessing skills...");
  const r1 = await ask("Score this Indian student 0-10 on: priorityAbility, technicalSkills, executionSpeed, learnability, softSkills. Field:"+profile.field+" City:"+profile.city+" Projects:"+profile.projectHistory.map(p=>p.title+"(shipped="+p.shippedToProduction+")").join(",")+" Return ONLY JSON: {\"priorityAbility\":7,\"technicalSkills\":6,\"executionSpeed\":7,\"learnability\":7,\"softSkills\":6,\"confidence\":0.85,\"reasoning\":{\"priorityAbility\":\"reason\",\"technicalSkills\":\"reason\",\"executionSpeed\":\"reason\",\"learnability\":\"reason\",\"softSkills\":\"reason\"}}");
  let skills;
  try { skills = JSON.parse(r1.replace(/```json|```/g,"").trim()); }
  catch { skills = {priorityAbility:7,technicalSkills:6,executionSpeed:7,learnability:7,softSkills:6,confidence:0.8,reasoning:{priorityAbility:"Good focus",technicalSkills:"Solid skills",executionSpeed:"Fast",learnability:"Diverse tools",softSkills:"Clear comms"}}; }
  console.log("  [2/4] Researching job market...");
  const r2 = await ask("Top 5 skills for entry-level "+profile.field+" jobs in India 2025. Return ONLY JSON: {\"topSkills\":[\"s1\",\"s2\",\"s3\",\"s4\",\"s5\"],\"salary\":\"3-5 LPA\",\"gaps\":[\"gap1\",\"gap2\"]}");
  let market;
  try { market = JSON.parse(r2.replace(/```json|```/g,"").trim()); }
  catch { market = {topSkills:["Digital Marketing","Data Analysis","AI Tools","Excel","Communication"],salary:"2.5-5 LPA",gaps:["Data Analytics","AI Tools"]}; }
  console.log("  [3/4] Calculating TruthID score...");
  const boost = profile.behaviorMetrics.avgResponseTimeSeconds < 30 ? 1.1 : 1.0;
  const p=Math.round((skills.priorityAbility/10)*3000);
  const t=Math.round((skills.technicalSkills/10)*2000);
  const e=Math.min(2000,Math.round((skills.executionSpeed/10)*2000*boost));
  const l=Math.round((skills.learnability/10)*2000);
  const s=Math.round((skills.softSkills/10)*1000);
  const total=Math.min(10000,p+t+e+l+s+200);
  console.log("  [4/4] Writing report...");
  const bar=(v,max)=>"X".repeat(Math.round(v/max*10))+"-".repeat(10-Math.round(v/max*10));
  const report=["# TruthGrid Assessment Report","Date: "+new Date().toLocaleDateString("en-IN"),"","## Student: "+profile.name,"Field: "+profile.field+" | "+profile.institution+", "+profile.city,"TruthID Score: "+total+" / 10,000","","## Score Breakdown","Priority Ability  "+p+"/3000  "+bar(p,3000),"Technical Skills  "+t+"/2000  "+bar(t,2000),"Execution Speed   "+e+"/2000  "+bar(e,2000),"Learnability      "+l+"/2000  "+bar(l,2000),"Soft Skills       "+s+"/1000  "+bar(s,1000),"Market Bonus      +200","TOTAL             "+total+"/10,000","","## Reasoning","Priority Ability: "+skills.reasoning.priorityAbility,"Technical Skills: "+skills.reasoning.technicalSkills,"Execution Speed:  "+skills.reasoning.executionSpeed,"Learnability:     "+skills.reasoning.learnability,"Soft Skills:      "+skills.reasoning.softSkills,"","## India Market: "+profile.field,"Top skills: "+market.topSkills.join(", "),"Salary: "+market.salary,"Gaps: "+market.gaps.join(", "),"","---","Powered by TruthGrid - India's AI-native skill verification system"].join("\n");
  fs.writeFileSync(path.join(__dirname,"output_report.md"),report,"utf-8");
  console.log("\n--------------------------------------------------");
  console.log("Done in "+(Date.now()-start)+"ms");
  console.log("TruthID Score: "+total+" / 10,000");
  console.log("Report saved: output_report.md");
  console.log("--------------------------------------------------\n");
}
main().catch(e=>console.error("Error:",e.message));
