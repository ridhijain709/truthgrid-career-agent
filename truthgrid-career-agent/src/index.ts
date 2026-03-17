import "dotenv/config";
import * as fs from "fs";
import * as path from "path";
import { runAgent } from "./agent";
import { StudentProfile } from "./types";

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("ERROR: ANTHROPIC_API_KEY not set. Copy .env.example to .env and add your key.");
    process.exit(1);
  }

  // Load sample student or accept stdin JSON
  const samplePath = path.join(__dirname, "../data/sample_student.json");
  const profile: StudentProfile = JSON.parse(fs.readFileSync(samplePath, "utf-8")) as StudentProfile;

  const result = await runAgent(profile);

  // Save report to output file
  if (result.report) {
    const outPath = path.join(__dirname, "../output_report.md");
    fs.writeFileSync(outPath, result.report, "utf-8");
    console.log(`\nReport saved to: output_report.md`);
  }

  // Save full result for benchmarking
  const resultPath = path.join(__dirname, "../benchmarks/last_result.json");
  fs.mkdirSync(path.dirname(resultPath), { recursive: true });
  fs.writeFileSync(
    resultPath,
    JSON.stringify(
      { ...result, state: { ...result.state, output: result.truthId } },
      null,
      2
    ),
    "utf-8"
  );

  console.log(`Full result saved to: benchmarks/last_result.json`);

  if (result.truthId) {
    console.log(`\nFinal TruthID Score: ${result.truthId.overallScore.toLocaleString()} / 10,000`);
    console.log(`Employer Summary: ${result.truthId.employerSummary}`);
  }
}

main().catch(console.error);
