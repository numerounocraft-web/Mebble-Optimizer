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

export async function optimizeBuilderResume(
  resumeData: { summary: string; experience: { id: string; bullets: string[] }[] },
  missingKeywords: string[],
  domain: string
) {
  const { data } = await client.post("/optimize-builder", {
    resume: resumeData,
    missing_keywords: missingKeywords,
    domain,
  });
  return data;
}

export async function getSummaryVariants(
  summary: string,
  missingKeywords: string[],
  domain: string
) {
  const { data } = await client.post("/optimize-summary-variants", {
    summary,
    missing_keywords: missingKeywords,
    domain,
  });
  return data;
}

export async function analyzeBuilderResume(resumeText: string, jobDescription: string) {
  const { data } = await client.post("/analyze-builder", {
    resume_text: resumeText,
    job_description: jobDescription,
  });
  return data;
}

export async function importResumePDF(file: File) {
  const form = new FormData();
  form.append("file", file);
  const { data } = await client.post("/resume/import", form);
  return data;
}

// ── Builder endpoints ─────────────────────────────────────────────────────────

export async function exportResumePDF(resume: Resume): Promise<Blob> {
  const { data } = await client.post("/resume/export-pdf", resume, {
    responseType: "blob",
  });
  return data;
}

// ── Cloud resume endpoints (JWT-authenticated) ────────────────────────────────

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export interface CloudResumeMeta {
  id: string;
  title: string;
  updated_at: string;
  created_at: string;
}

export async function listCloudResumes(token: string): Promise<CloudResumeMeta[]> {
  const { data } = await client.get("/resumes", { headers: authHeaders(token) });
  return data.resumes ?? [];
}

export async function createCloudResume(resume: Resume, token: string): Promise<CloudResumeMeta> {
  const { data } = await client.post("/resumes", { data: resume }, { headers: authHeaders(token) });
  return data.resume;
}

export async function getCloudResume(id: string, token: string): Promise<{ meta: CloudResumeMeta; data: Resume }> {
  const { data } = await client.get(`/resumes/${id}`, { headers: authHeaders(token) });
  return { meta: data.resume, data: data.resume.data as Resume };
}

export async function updateCloudResume(id: string, resume: Resume, token: string): Promise<CloudResumeMeta> {
  const { data } = await client.put(`/resumes/${id}`, { data: resume }, { headers: authHeaders(token) });
  return data.resume;
}
