import "dotenv/config";
import * as fs from "fs";
import * as path from "path";
import { runCareerAgent } from "./agent";
import { sanitizePayload } from "./middleware/IncomingPayloadSanitizer";
import { StudentProfile } from "./types";

async function main() {
  if (!process.env.GOOGLE_API_KEY && !process.env.ANTHROPIC_API_KEY) {
    console.error("ERROR: GOOGLE_API_KEY or ANTHROPIC_API_KEY must be set in .env file");
    process.exit(1);
  }

  // ── SPRINT 2: Sanitize incoming payload ────────────────────
  const samplePath = path.join(__dirname, "../data/sample_student.json");
  const fileContent = fs.readFileSync(samplePath, "utf-8");

  const sanitization = sanitizePayload(fileContent);
  if (sanitization.fallback === "full") {
    console.error("ERROR: Input payload failed sanitization completely.");
    console.error("Failures:", JSON.stringify(sanitization.failures, null, 2));
    process.exit(1);
  }

  if (sanitization.sanitized) {
    console.warn("⟁️  Input was partially sanitized:");
    sanitization.failures.forEach((f) =>
      console.warn(`   [7${f.code}] ${f.detail}`)
    );
    console.warn(`   Processing time: ${sanitization.processingTimeMs}ms\n`);
  }

  const profile: StudentProfile = sanitization.profile;

  // ── Run the agent ────────────────────────────
  const result = await runCareerAgent(profile);

  if (result.report) {
    const outPath = path.join(__dirname, "../output_report.md");
    fs.writeFileSync(outPath, result.report, "utf-8");
    console.log("Report saved to: output_report.md");
  }

  if (result.truthId) {
    console.log("Final TruthID Score: " + result.truthId.overallScore + " / 10,000");
    console.log("Summary: " + (result.truthId as any).employerSummary);
  }
}

main().catch(console.error);
