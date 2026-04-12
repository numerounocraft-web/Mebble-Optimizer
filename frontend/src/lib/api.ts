import axios from "axios";
import type { Resume } from "./schemas/resume";

const client = axios.create({ baseURL: "/api" });

// ── Optimizer endpoints ───────────────────────────────────────────────────────

export async function analyzeResume(file: File, jobDescription: string) {
  const form = new FormData();
  form.append("resume", file);
  form.append("job_description", jobDescription);
  const { data } = await client.post("/analyze", form);
  return data;
}

export async function parseResume(file: File) {
  const form = new FormData();
  form.append("resume", file);
  const { data } = await client.post("/parse", form);
  return data;
}

export async function extractJD(jobDescription: string) {
  const { data } = await client.post("/extract-jd", { job_description: jobDescription });
  return data;
}

export async function optimizeSection(
  sectionType: string,
  content: string,
  keywords: string[]
) {
  const { data } = await client.post("/optimize-section", {
    section_type: sectionType,
    content,
    keywords,
  });
  return data;
}

export async function downloadReport(analysisResult: unknown) {
  const { data } = await client.post(
    "/report",
    { analysis: analysisResult },
    { responseType: "blob" }
  );
  return data;
}

// ── Builder endpoints ─────────────────────────────────────────────────────────

export async function exportResumePDF(resume: Resume): Promise<Blob> {
  const { data } = await client.post("/resume/export-pdf", resume, {
    responseType: "blob",
  });
  return data;
}
