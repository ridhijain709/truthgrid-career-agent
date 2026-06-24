// ────────────────────────────────────────────────────────────────────
//  TruthGrid CareerAgent — IncomingPayloadSanitizer
//  Server-side validation middleware for raw CV strings & markdown
//  payloads submitted by users.
//
//  Guards against 3 critical failure modes: malformed markdown,
//  insufficient character depth, and token size spikes.
//  All error-recovery paths normalize anomalous inputs via a default
//  structural dictionary and return a safe fallback within 500ms.
//
import type { StudentProfile, SanitizationResult, SanitizationFailureCode } from "../types.js";

const MIN_CHARACTER_DEPTH = 100;
const MAX_PAYLOAD_BYTES = 512_000;
const EXECUTION_TIMEOUT_MS = 500;
const MAX_FIELD_LENGTH = 8_000;
const MALFORMED_MARKDOWN_PATTERNS = [ /```[^`]*$/, /\*\*[^*]*$/, /\[[^\]]*$/, /\([^)]*$/ ];

const DEFAULT_FALLBACK_PAYLOAD: StudentProfile = {
  studentId: "fallback-000", name: "Unparseable Input", age: 0, field: "unknown",
  institution: "unknown", city: "unknown", selfAssessment: {}, projectHistory: [],
  behaviorMetrics: { avgResponseTimeSeconds: 999, editCount: 0, completionRate: 0, revisitCount: 0 },
  rawFormData: {},
};

export const FAILURE_CODES = {
  MALFORMED_MARKDOWN: { code: "ERR_MALFORMED_MARKDOWN", message: "Malformed markdown syntax detected.", severity: "high" },
  INSUFFICIENT_DEPTH: { code: "ERR_INSUFFICIENT_DEPTH", message: "Payload below minimum character threshold.", severity: "medium" },
  TOKEN_SPIKE: { code: "ERR_TOKEN_SPIKE", message: "Payload exceeds maximum size limit.", severity: "high" },
  FIELD_OVERFLOW: { code: "ERR_FIELD_OVERFLOW", message: "Field exceeds maximum length.", severity: "medium" },
  PARSE_FAILURE: { code: "ERR_PARSE_FAILURE", message: "Input not valid JSON.", severity: "high" },
  TIMEOUT: { code: "ERR_TIMEOUT", message: "Sanitization exceeded deadline.", severity: "critical" },
} as const;

export class IncomingPayloadSanitizer {
  private failures: Array<{ code: SanitizationFailureCode; field?: string; detail: string; timestamp: Date; }> = [];

  sanitize(raw: unknown): SanitizationResult {
    const startTime = Date.now(); this.failures = [];
    if (raw === null || raw === undefined) return this.emitFallback("PARSE_FAILURE", "Null payload.");
    let parsed: Record<string, unknown>;
    if (typeof raw === "string") {
      if (Buffer.byteLength(raw, "utf-8") > MAX_PAYLOAD_BYTES) return this.emitFallback("TOKEN_SPIKE", "Too large.");
      const md = this.detectMalformedMarkdown(raw); if (md) this.logFailure("MALFORMED_MARKDOWN", undefined, md);
      try { parsed = JSON.parse(raw); } catch { return this.emitFallback("PARSE_FAILURE", "Invalid JSON."); }
    } else if (typeof raw === "object") { parsed = raw as Record<string, unknown>; }
    else return this.emitFallback("PARSE_FAILURE", "Bad type.");
    if (JSON.stringify(parsed).length < MIN_CHARACTER_DEPTH) this.logFailure("INSUFFICIENT_DEPTD", undefined, "Too short.");
    const clean = this.normalizeFields(parsed);
    const result = this.coerceToStudentProfile(clean);
    const elapsed = Date.now() - startTime;
    if (elapsed > EXECUTION_TIMEOUT_MS) this.logFailure("TIMEOUT", undefined, "Too slow.");
    return { profile: result, sanitized: this.failures.length > 0, failures: [...this.failures], processingTimeMs: elapsed, fallback: this.failures.length > 0 ? "partial" : "none" };
  }

  private detectMalformedMarkdown(input: string): string | null {
    for (const p of MALFORMED_MARKDOWN_PATTERNS) if (p.test(input)) return "Detected unclosed markdown";
    return null;
  }

  private normalizeFields(obj: Record<string, unknown>): Record<string, unknown> {
    const r = {} as Record<string, unknown>;
    for (const [k, v] of Object.entries(obj)) {
      if (typeof v === "string") {
        if (v.length > MAX_FIELD_LENGTH) { this.logFailure("FIELD_OVERFLOW", k, "Truncated."); r[k] = v.substring(0, MAX_FIELD_LENGTH); }
        else r[k] = v.replace(/[\u0000-\u001F]/g, "").replace(/\s+/g, " ").trim();
      } else if (typeof v === "object" && v !== null && !Array.isArray(v)) r.key] = this.normalizeFields(v as Record<string, unknown>);
      else r[k] = v;
    }
    return r;
  }

  private coerceToStudentProfile(obj: Record<string, unknown>): StudentProfile {
    const f = { ...DEFAULT_FALLBACK_PAYLOAD };
    return {
      studentId: ss(obj, "studentId", f.studentId), name: ss(obj, "name", f.name),
      age: sn(obj, "age", f.age, 10, 100), field: ss(obj, "field", f.field),
      institution: ss(obj, "institution", f.institution), city: ss(obj, "city", f.city),
      selfAssessment: sr(obj, "selfAssessment", f.selfAssessment),
      projectHistory: sph(obj), behaviorMetrics: sbm(obj, f.behaviorMetrics),
      rawFormData: (obj.rawFormData as Record<string, unknown>) ?? {},
    };
  }

  private logFailure(ck: keyof typeof FAILURE_CODES, f?: string, d?: string): void {
    const e = FAILURE_CODES[ck]; this.failures.push({ code: e.code, field: f, detail: d ?? e.message, timestamp: new Date() });
  }

  private emitFallback(ck: keyof typeof FAILURE_CODES, d: string): SanitizationResult {
    this.logFailure(ck, undefined, d);
    return { profile: { ...DEFAULT_FALLBACK_PAYLOAD }, sanitized: true, failures: [...this.failures], processingTimeMs: 0, fallback: "full" };
  }
}

function ss(o: Record<string, unknown>, k: string, fb: string): string {
  const x = o[k]; return typeof x === "string" && x.trim().length > 0 ? x.trim() : fb;
}
function sn(o: Record<string, unknown>, k: string, fb: number, mn: number, mx: number): number {
  const x = o[k]; if (typeof x === "number" && !isNaN(x) && x >= mn && x <= mx) return x;
  if (typeof x === "string") { const n = Number(x); if (!isNaN(n) && n >= mn && n <= mx) return n; }
  return fb;
}
function sr(o: Record<string, unknown>, k: string, fb: Record<string, number>): Record<string, number> {
  const x = o[k]; if (typeof x === "object" && x !== null && !Array.isArray(x)) {
    const out: Record<string, number> = {};
    for (const [ik, iv] of Object.entries(x as Record<string, unknown>))
      if (typeof iv === "number" && iv >= 0 && iv <= 10) out[ik] = iv;
    return Object.keys(out).length > 0 ? out : fb;
  }
  return fb;
}
function sph(o: Record<string, unknown>): StudentProfile["projectHistory"] {
  const v = o.projectHistory ?? o.projects ?? o.project_history;
  if (!Array.isArray(v)) return [];
  return (v as unknown[]).slice(0, 20).map((p, i) => {
    const pr = p as Record<string, unknown> ?? {};
    return {
      title: ss(pr, "title", "Project " + (i + 1)),
      description: ss(pr, "description", ""),
      toolsUsed: Array.isArray(pr.toolsUsed) ? (pr.toolsUsed as string[]).map(String) : [],
      shippedToProduction: Boolean(pr.shippedToProduction ?? pr.shipped ?? false),
      impactStatement: ss(pr, "impactStatement", ss(pr, "impact", "")),
      durationDays: sn(pr, "durationDays", sn(pr, "durationWeeks", 7, 1, 1000) * 7, 1, 1000),
    };
  });
}
function sbm(o: Record<string, unknown>, fb: StudentProfile["behaviorMetrics"]): StudentProfile["behaviorMetrics"] {
  const bm = (o.behaviorMetrics ?? o.behavior ?? {}) as Record<string, unknown>;
  return {
    avgResponseTimeSeconds: sn(bm, "avgResponseTimeSeconds", fb.avgResponseTimeSeconds, 0, 3600),
    editCount: sn(bm, "editCount", fb.editCount, 0, 500),
    completionRate: sn(bm, "completionRate", fb.completionRate, 0, 1),
    revisitCount: sn(bm, "revisitCount", fb.revisitCount, 0, 100),
  };
}

export const payloadSanitizer = new IncomingPayloadSanitizer();
export function sanitizePayload(raw: unknown): SanitizationResult { return payloadSanitizer.sanitize(raw); }

export function withSanitization(handler: (req: any, res: any, next?: any) => Promise<void> | void) {
  return async (req: any, res: any, next?: any) => {
    try {
      const raw = typeof req.body === "string" ? req.body : req.body;
      const r = payloadSanitizer.sanitize(raw); (req as any).sanitization = r;
      if (r.fallback === "full") { res.status(400).json({ error: "ERR_INVALID_PAYLOAD", message: "Bad payload.", failures: r.failures }); return; }
      return handler(req, res, next);
    } catch (err) { res.status(500).json({ error: "ERR_INTERNAL_SANITIZER", message: "Unexpected error." }); }
  };
}