import "dotenv/config";
import * as fs from "fs";
import * as path from "path";
import { runAgent } from "./agent";
import { StudentProfile } from "./types";

async function main() {
  if (!process.env.GOOGLE_API_KEY) {
    console.error("ERROR: GOOGLE_API_KEY not set in .env file");
    process.exit(1);
  }

  var samplePath = path.join(__dirname, "../data/sample_student.json");
  var fileContent = fs.readFileSync(samplePath, "utf-8");
  var profile = JSON.parse(fileContent) as StudentProfile;

  var result = await runAgent(profile);

  if (result.report) {
    var outPath = path.join(__dirname, "../output_report.md");
    fs.writeFileSync(outPath, result.report, "utf-8");
    console.log("Report saved to: output_report.md");
  }

  if (result.truthId) {
    console.log("Final TruthID Score: " + result.truthId.overallScore + " / 10,000");
    console.log("Summary: " + result.truthId.employerSummary);
  }
}

main().catch(console.error);
