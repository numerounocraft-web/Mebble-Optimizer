"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  FileText,
  Upload,
  Download,
  AlertCircle,
} from "lucide-react";
import MebbleLogo from "@/components/ui/MebbleLogo";
import Button from "@/components/ui/Button";
import { AnimatedAtom, type AnimatedAtomHandle } from "@/components/ui/AnimatedAtom";
import Loader from "@/components/ui/Loader";
import ArcGauge from "@/components/optimizer/ArcGauge";
import KeywordPills from "@/components/optimizer/KeywordPills";
import { analyzeResume, downloadReport } from "@/lib/api";
import { useWindowSize } from "@/lib/hooks";

interface AnalysisResult {
  score: number;
  matched_keywords: string[];
  missing_keywords: string[];
  action_words?: {
    strong: string[];
    weak: { word: string; suggestion: string }[];
  };
}

export default function OptimizePage() {
  const fileInputRef   = useRef<HTMLInputElement>(null);
  const analyzeIconRef = useRef<AnimatedAtomHandle>(null);
  const { width: windowWidth } = useWindowSize();
  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1100;
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (window.location.search.includes("upload=true")) {
      fileInputRef.current?.click();
    }
  }, []);
  const [dragging, setDragging] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  function handleFileDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.type === "application/pdf") setFile(dropped);
    else setError("Please upload a PDF file.");
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0];
    if (picked) setFile(picked);
  }

  async function handleAnalyze() {
    if (!file) { setError("Please upload your resume."); return; }
    if (!jobDescription.trim()) { setError("Please paste a job description."); return; }
    setError(null);
    setLoading(true);
    try {
      const data = await analyzeResume(file, jobDescription);
      setResult(data);
    } catch {
      setError("Analysis failed. Make sure the backend is running at localhost:5000.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload() {
    if (!result) return;
    setDownloading(true);
    try {
      const blob = await downloadReport(result);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "mebble-report.md";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // silently fail
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        height: isMobile ? "auto" : "100vh",
        minHeight: "100vh",
        overflow: isMobile ? "auto" : "hidden",
        fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
      }}
    >
      {/* ── Left: upload + JD ──────────────────────────────────────────────────── */}
      <div
        style={{
          width: isMobile ? "100%" : isTablet ? "320px" : "380px",
          flexShrink: 0,
          borderRight: isMobile ? "none" : "1px solid #F1F1F1",
          borderBottom: isMobile ? "1px solid #F1F1F1" : "none",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px 16px",
            borderBottom: "1px solid #F1F1F1",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <MebbleLogo />
          <Link href="/" style={{ textDecoration: "none" }}>
            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "12px",
                color: "#C3C3C3",
                fontWeight: 500,
                letterSpacing: "-0.01em",
                fontFamily: "inherit",
              }}
            >
              <ChevronLeft size={13} />
              Home
            </button>
          </Link>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* File upload */}
          <div>
            <p style={{ fontSize: "12px", fontWeight: 600, color: "#020202", letterSpacing: "-0.01em", marginBottom: "10px" }}>
              Resume PDF
            </p>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                borderRadius: "14px",
                border: dragging ? "2px dashed #028FF4" : "2px dashed #E0E0E0",
                backgroundColor: dragging ? "#E4F3FE" : "#F9F9FB",
                padding: "24px",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "10px",
                transition: "all 0.15s ease",
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
              {file ? (
                <>
                  <FileText size={28} color="#028FF4" />
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#028FF4", letterSpacing: "-0.01em" }}>
                    {file.name}
                  </span>
                  <span style={{ fontSize: "11px", color: "#767678" }}>Click to change</span>
                </>
              ) : (
                <>
                  <Upload size={28} color="#C3C3C3" />
                  <span style={{ fontSize: "13px", fontWeight: 500, color: "#767678", letterSpacing: "-0.01em" }}>
                    Drag & drop your PDF resume here
                  </span>
                  <button
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      backgroundColor: "#E4F3FE",
                      border: "none",
                      borderRadius: "9999px",
                      padding: "8px 14px",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#028FF4",
                      fontFamily: "inherit",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    Upload CV
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Job description */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <p style={{ fontSize: "12px", fontWeight: 600, color: "#020202", letterSpacing: "-0.01em", margin: 0 }}>
              Job Description
            </p>
            <textarea
              placeholder="Paste the job description here…"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              style={{
                width: "100%",
                minHeight: "200px",
                padding: "12px 14px",
                borderRadius: "12px",
                border: "1px solid #F1F1F1",
                backgroundColor: "#F9F9FB",
                fontSize: "13px",
                color: "#020202",
                fontFamily: "inherit",
                letterSpacing: "-0.01em",
                lineHeight: "1.6",
                resize: "vertical",
                outline: "none",
              }}
              onFocus={(e) => { e.target.style.borderColor = "#028FF4"; e.target.style.backgroundColor = "#fff"; }}
              onBlur={(e) => { e.target.style.borderColor = "#F1F1F1"; e.target.style.backgroundColor = "#F9F9FB"; }}
            />
          </div>

          {error && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <AlertCircle size={13} color="#F70407" />
              <span style={{ fontSize: "12px", color: "#F70407", fontWeight: 500 }}>{error}</span>
            </div>
          )}

          <Button
            variant="primary"
            onClick={handleAnalyze}
            disabled={loading}
            onMouseEnter={() => analyzeIconRef.current?.startAnimation()}
            onMouseLeave={() => analyzeIconRef.current?.stopAnimation()}
            style={{ width: "100%" }}
          >
            <AnimatedAtom
              ref={analyzeIconRef}
              size={14}
              style={{ color: "currentColor", pointerEvents: "none" }}
            />
            {loading ? "Analyzing…" : "Analyze Resume"}
          </Button>

          {result && (
            <Button
              variant="secondary"
              onClick={handleDownload}
              disabled={downloading}
              style={{ width: "100%" }}
            >
              <Download size={14} />
              {downloading ? "Downloading…" : "Download Report"}
            </Button>
          )}
        </div>
      </div>

      {/* ── Right: results ─────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, backgroundColor: "#F9F9FB", overflowY: isMobile ? "visible" : "auto", padding: isMobile ? "24px 16px" : "32px" }}>
        {loading && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
            <Loader label="Analyzing your resume…" />
          </div>
        )}

        {!loading && !result && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              gap: "12px",
              color: "#C3C3C3",
            }}
          >
            <svg width="64" height="64" viewBox="0 0 121 121" fill="none">
              <path d="M34.143 106.412C31.519 106.316 29.022 105.635 26.653 104.369C24.288 103.106 22.052 101.256 19.947 98.818C16.498 94.9 13.812 90.082 11.89 84.364C9.963 78.645 9 72.706 9 66.545C9 59.361 10.337 52.619 13.011 46.317C15.685 40.015 19.359 34.527 24.032 29.854C28.705 25.181 34.174 21.49 40.438 18.781C46.702 16.073 53.389 14.717 60.5 14.713C67.611 14.709 74.298 16.071 80.562 18.799C86.826 21.526 92.275 25.215 96.91 29.865C101.546 34.516 105.219 39.99 107.931 46.288C110.644 52.586 112 59.304 112 66.442C112 72.61 111.008 78.54 109.024 84.232C107.041 89.924 104.298 94.818 100.796 98.915C98.568 101.437 96.287 103.316 93.952 104.552C91.621 105.788 89.149 106.406 86.536 106.406C85.186 106.406 83.873 106.246 82.599 105.925C81.321 105.608 80.043 105.132 78.765 104.495L70.754 100.489C69.171 99.695 67.498 99.1 65.736 98.704C63.97 98.307 62.188 98.109 60.391 98.109C58.522 98.109 56.723 98.307 54.995 98.704C53.267 99.1 51.646 99.695 50.131 100.489L42.235 104.495C40.861 105.227 39.532 105.752 38.246 106.068C36.957 106.389 35.589 106.507 34.143 106.412Z" fill="#E7E7E7" />
            </svg>
            <p style={{ fontSize: "14px", fontWeight: 500, letterSpacing: "-0.02em", textAlign: "center" }}>
              Upload your resume and paste a job description<br />to get your ATS score
            </p>
          </div>
        )}

        {!loading && result && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "560px", margin: "0 auto" }}>

            {/* Score card */}
            <div
              style={{
                backgroundColor: "#fff",
                borderRadius: "16px",
                border: "1px solid #F1F1F1",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <p style={{ fontSize: "12px", fontWeight: 600, color: "#727272", letterSpacing: "-0.02em", alignSelf: "flex-start" }}>
                ATS Score
              </p>
              <ArcGauge score={result.score} />
              <p style={{ fontSize: "11px", color: "#C3C3C3", fontWeight: 500 }}>
                Based on keyword overlap with the job description
              </p>
            </div>

            {/* Keywords card */}
            <div
              style={{
                backgroundColor: "#fff",
                borderRadius: "16px",
                border: "1px solid #F1F1F1",
                padding: "24px",
              }}
            >
              <p style={{ fontSize: "12px", fontWeight: 600, color: "#727272", letterSpacing: "-0.02em", marginBottom: "16px" }}>
                Keyword Analysis
              </p>
              <KeywordPills
                matched={result.matched_keywords ?? []}
                missing={result.missing_keywords ?? []}
              />
            </div>

            {/* Action words */}
            {result.action_words && (
              <div
                style={{
                  backgroundColor: "#fff",
                  borderRadius: "16px",
                  border: "1px solid #F1F1F1",
                  padding: "24px",
                }}
              >
                <p style={{ fontSize: "12px", fontWeight: 600, color: "#727272", letterSpacing: "-0.02em", marginBottom: "16px" }}>
                  Action Words
                </p>

                {result.action_words.weak.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {result.action_words.weak.map((item, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "8px 12px",
                          borderRadius: "10px",
                          backgroundColor: "#F9F9FB",
                          border: "1px solid #F1F1F1",
                          fontSize: "12px",
                        }}
                      >
                        <span style={{ color: "#F70407", fontWeight: 600, letterSpacing: "-0.01em" }}>
                          {item.word}
                        </span>
                        <span style={{ color: "#C3C3C3" }}>→</span>
                        <span style={{ color: "#FF7512", fontWeight: 600, letterSpacing: "-0.01em" }}>
                          {item.suggestion}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {result.action_words.weak.length === 0 && (
                  <p style={{ fontSize: "12px", color: "#01B747", fontWeight: 500 }}>
                    Strong action words throughout — great work!
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
