"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, X } from "lucide-react";
import MebbleLogo from "@/components/ui/MebbleLogo";

/* ── Keyframe animations injected once ─────────────────────────────────────── */
const STYLES = `
  @keyframes buildFloat {
    0%   { transform: translateY(0px) scale(1.15); }
    50%  { transform: translateY(-4px) scale(1.18); }
    100% { transform: translateY(0px) scale(1.15); }
  }
  @keyframes slidersWiggle {
    0%   { transform: scale(1.15) rotate(0deg); }
    25%  { transform: scale(1.15) rotate(-6deg); }
    75%  { transform: scale(1.15) rotate(6deg); }
    100% { transform: scale(1.15) rotate(0deg); }
  }
  @keyframes liModalIn {
    0%   { opacity: 0; transform: scale(0.94) translateY(8px); }
    100% { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes liSpinner {
    to { transform: rotate(360deg); }
  }
`;

/* ── Build a Resume icon ────────────────────────────────────────────────────── */
function BuildIcon({ hovered }: { hovered: boolean }) {
  const anim: React.CSSProperties = hovered
    ? { animation: "buildFloat 0.7s ease-in-out infinite" }
    : { transform: "scale(1)", transition: "transform 0.25s ease" };

  return (
    <svg width="42" height="42" viewBox="0 0 42 42" fill="none" style={anim}>
      <rect x="4"  y="13" width="21" height="23" rx="4" fill="#028FF4" opacity="0.18" />
      <rect x="11" y="7"  width="21" height="23" rx="4" fill="#028FF4" opacity="0.5"  />
      <rect x="17" y="11" width="13" height="15" rx="3" fill="#028FF4" />
    </svg>
  );
}

/* ── Optimize Existing Resume icon — sliders ────────────────────────────────── */
function OptimizeIcon({ hovered, active }: { hovered: boolean; active: boolean }) {
  const color = active ? "#028FF4" : "#AEAEB2";
  const anim: React.CSSProperties = hovered
    ? { animation: "slidersWiggle 0.55s ease-in-out infinite" }
    : { transform: "scale(1)", transition: "transform 0.25s ease" };

  return (
    <svg width="42" height="42" viewBox="0 0 42 42" fill="none" style={anim}>
      {/* Three horizontal track lines */}
      <line x1="6"  y1="12" x2="36" y2="12" stroke={color} strokeWidth="3" strokeLinecap="round" />
      <line x1="6"  y1="21" x2="36" y2="21" stroke={color} strokeWidth="3" strokeLinecap="round" />
      <line x1="6"  y1="30" x2="36" y2="30" stroke={color} strokeWidth="3" strokeLinecap="round" />
      {/* Slider handles */}
      <circle cx="14" cy="12" r="4.5" fill="white" stroke={color} strokeWidth="3" />
      <circle cx="26" cy="21" r="4.5" fill="white" stroke={color} strokeWidth="3" />
      <circle cx="18" cy="30" r="4.5" fill="white" stroke={color} strokeWidth="3" />
    </svg>
  );
}


/* ── Page ───────────────────────────────────────────────────────────────────── */
export default function HomePage() {
  const router = useRouter();

  const [hoveredBuild,    setHoveredBuild]    = useState(false);
  const [hoveredOptimize, setHoveredOptimize] = useState(false);
  const [hoveredLinkedIn, setHoveredLinkedIn] = useState(false);

  // LinkedIn modal
  const [modalOpen,  setModalOpen]  = useState(false);
  const [liFile,     setLiFile]     = useState<File | null>(null);
  const [liLoading,  setLiLoading]  = useState(false);
  const [liError,    setLiError]    = useState("");
  const [liDragging, setLiDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function closeModal() {
    setModalOpen(false);
    setLiFile(null);
    setLiError("");
    setLiLoading(false);
  }

  function handleFileDrop(e: React.DragEvent) {
    e.preventDefault();
    setLiDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.type === "application/pdf") { setLiFile(file); setLiError(""); }
    else setLiError("Please drop a PDF file.");
  }

  async function handleLinkedInImport() {
    if (!liFile) return;
    setLiLoading(true);
    setLiError("");
    try {
      const form = new FormData();
      form.append("file", liFile);
      const res = await fetch("/api/linkedin/import", { method: "POST", body: form });
      const json = await res.json();
      if (!json.success) { setLiError(json.error || "Failed to parse PDF."); return; }
      localStorage.setItem("mebble_linkedin_prefill", JSON.stringify(json.data));
      router.push("/builder");
    } catch {
      setLiError("Could not reach the server. Please try again.");
    } finally {
      setLiLoading(false);
    }
  }

  const CARD_HEIGHT = 72; // px — shared row height

  return (
    <>
      <style>{STYLES}</style>

      <div
        style={{
          display: "flex",
          height: "100vh",
          overflow: "hidden",
          fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
        }}
      >
        {/* Main content */}
        <div
          style={{
            flex: 1,
            backgroundColor: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "48px",
          }}
        >
          <div style={{ width: "100%", maxWidth: "360px", display: "flex", flexDirection: "column", gap: "24px" }}>

            {/* Logo */}
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <MebbleLogo height={16} />
            </div>

            {/* Headline */}
            <p
              style={{
                fontSize: "32px",
                fontWeight: 600,
                lineHeight: "115%",
                letterSpacing: "-0.04em",
                margin: 0,
              }}
            >
              <span style={{ color: "#C3C3C3" }}>The </span>
              <span style={{ color: "#020202" }}>Resume</span>
              <span style={{ color: "#C3C3C3" }}> Builder That Thinks Like a </span>
              <span style={{ color: "#F46702" }}>Recruiter.</span>
            </p>

            {/* Body */}
            <p
              style={{
                fontSize: "13px",
                lineHeight: "160%",
                color: "#767678",
                fontWeight: 500,
                letterSpacing: "-0.01em",
                margin: 0,
              }}
            >
              Your next big role starts with a resume that speaks the language of recruiters. Mebble transforms your standard CV into a high-performance career asset.
            </p>

            {/* CTA Cards — stacked vertically, content horizontal */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

              {/* Build a Resume */}
              <Link href="/builder" style={{ textDecoration: "none" }}>
                <div
                  onMouseEnter={() => setHoveredBuild(true)}
                  onMouseLeave={() => setHoveredBuild(false)}
                  style={{
                    width: "100%",
                    height: `${CARD_HEIGHT}px`,
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: "16px",
                    padding: "0 20px",
                    backgroundColor: "#FFFFFF",
                    border: `3px solid ${hoveredBuild ? "#0075CC" : "#028FF4"}`,
                    borderRadius: "14px",
                    cursor: "pointer",
                    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                    boxShadow: hoveredBuild ? "0 4px 16px rgba(2,143,244,0.18)" : "none",
                    boxSizing: "border-box",
                  }}
                >
                  <BuildIcon hovered={hoveredBuild} />
                  <p
                    style={{
                      flex: 1,
                      fontSize: "13px",
                      fontWeight: 600,
                      lineHeight: "120%",
                      color: "#767678",
                      letterSpacing: "-0.02em",
                      margin: 0,
                    }}
                  >
                    Build a Resume
                  </p>
                  <ArrowRight size={14} color="#028FF4" />
                </div>
              </Link>

              {/* Import from LinkedIn */}
              <div
                onMouseEnter={() => setHoveredLinkedIn(true)}
                onMouseLeave={() => setHoveredLinkedIn(false)}
                onClick={() => setModalOpen(true)}
                style={{
                  width: "100%",
                  height: `${CARD_HEIGHT}px`,
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: "16px",
                  padding: "0 20px",
                  backgroundColor: "#FFFFFF",
                  border: `3px solid ${hoveredLinkedIn ? "#D8D8D8" : "#F1F1F1"}`,
                  borderRadius: "14px",
                  cursor: "pointer",
                  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                  boxShadow: hoveredLinkedIn ? "0 4px 16px rgba(0,0,0,0.07)" : "none",
                  boxSizing: "border-box",
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <rect width="24" height="24" rx="4" fill="#0A66C2" />
                    <path d="M7.2 9.6H5V19h2.2V9.6zM6.1 8.5a1.3 1.3 0 1 0 0-2.6 1.3 1.3 0 0 0 0 2.6zM19 13.4c0-2.1-1.1-3.9-3.2-3.9-1 0-1.9.5-2.4 1.3V9.6H11V19h2.4v-5c0-1 .5-1.9 1.6-1.9 1.1 0 1.6.9 1.6 1.9V19H19v-5.6z" fill="white" />
                  </svg>
                </div>
                <p
                  style={{
                    flex: 1,
                    fontSize: "13px",
                    fontWeight: 600,
                    lineHeight: "120%",
                    color: "#767678",
                    letterSpacing: "-0.02em",
                    margin: 0,
                  }}
                >
                  Import from LinkedIn
                </p>
                <ArrowRight size={14} color="#AEAEB2" />
              </div>

              {/* Optimize Existing Resume */}
              <Link href="/optimize" style={{ textDecoration: "none" }}>
                <div
                  onMouseEnter={() => setHoveredOptimize(true)}
                  onMouseLeave={() => setHoveredOptimize(false)}
                  style={{
                    width: "100%",
                    height: `${CARD_HEIGHT}px`,
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: "16px",
                    padding: "0 20px",
                    backgroundColor: "#FFFFFF",
                    border: `3px solid ${hoveredOptimize ? "#D8D8D8" : "#F1F1F1"}`,
                    borderRadius: "14px",
                    cursor: "pointer",
                    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                    boxShadow: hoveredOptimize ? "0 4px 16px rgba(0,0,0,0.07)" : "none",
                    boxSizing: "border-box",
                  }}
                >
                  <OptimizeIcon hovered={hoveredOptimize} active={false} />
                  <p
                    style={{
                      flex: 1,
                      fontSize: "13px",
                      fontWeight: 600,
                      lineHeight: "120%",
                      color: "#767678",
                      letterSpacing: "-0.02em",
                      margin: 0,
                    }}
                  >
                    Optimize Existing Resume
                  </p>
                  <ArrowRight size={14} color="#AEAEB2" />
                </div>
              </Link>

            </div>
          </div>
        </div>
      </div>

      {/* ── LinkedIn Import Modal ─────────────────────────────────────────────── */}
      {modalOpen && (
        <div
          onClick={closeModal}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "24px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "400px",
              backgroundColor: "#FFFFFF",
              borderRadius: "20px",
              padding: "28px",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              animation: "liModalIn 0.22s cubic-bezier(0.16,1,0.3,1) forwards",
              boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
            }}
          >
            {/* Modal header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <rect width="24" height="24" rx="4" fill="#0A66C2" />
                    <path d="M7.2 9.6H5V19h2.2V9.6zM6.1 8.5a1.3 1.3 0 1 0 0-2.6 1.3 1.3 0 0 0 0 2.6zM19 13.4c0-2.1-1.1-3.9-3.2-3.9-1 0-1.9.5-2.4 1.3V9.6H11V19h2.4v-5c0-1 .5-1.9 1.6-1.9 1.1 0 1.6.9 1.6 1.9V19H19v-5.6z" fill="white" />
                  </svg>
                  <p style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#1F1F1F", letterSpacing: "-0.03em" }}>
                    Import from LinkedIn
                  </p>
                </div>
                <p style={{ margin: 0, fontSize: "12px", color: "#9A9A9C", lineHeight: "150%", letterSpacing: "-0.01em" }}>
                  Export your profile as a PDF from LinkedIn, then upload it below.
                </p>
              </div>
              <button
                onClick={closeModal}
                style={{ flexShrink: 0, marginLeft: "12px", background: "none", border: "none", cursor: "pointer", padding: "2px", color: "#AEAEB2", display: "flex", alignItems: "center" }}
              >
                <X size={18} strokeWidth={2} />
              </button>
            </div>

            {/* How-to steps */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", padding: "12px 14px", backgroundColor: "#F4F8FF", borderRadius: "10px" }}>
              <p style={{ margin: 0, fontSize: "11px", fontWeight: 700, color: "#0A66C2", letterSpacing: "-0.01em" }}>HOW TO EXPORT YOUR PDF</p>
              {[
                "Go to your LinkedIn profile",
                'Click the "More" button below your name',
                'Select "Save to PDF"',
                "Upload the downloaded file below",
              ].map((step, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                  <span style={{ flexShrink: 0, width: "16px", height: "16px", borderRadius: "50%", backgroundColor: "#0A66C2", color: "#fff", fontSize: "10px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {i + 1}
                  </span>
                  <p style={{ margin: 0, fontSize: "12px", color: "#4A4A4C", lineHeight: "140%", letterSpacing: "-0.01em" }}>{step}</p>
                </div>
              ))}
            </div>

            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setLiDragging(true); }}
              onDragLeave={() => setLiDragging(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${liDragging ? "#0A66C2" : liFile ? "#22C55E" : "#D8D8DA"}`,
                borderRadius: "12px",
                padding: "20px 16px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                backgroundColor: liDragging ? "#F0F7FF" : liFile ? "#F0FDF4" : "#FAFAFA",
                transition: "all 0.15s ease",
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                style={{ display: "none" }}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) { setLiFile(f); setLiError(""); }
                }}
              />
              {liFile ? (
                <>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#22C55E" /><path d="M7 12.5l3.5 3.5 6.5-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#16A34A", letterSpacing: "-0.02em" }}>{liFile.name}</p>
                  <p style={{ margin: 0, fontSize: "11px", color: "#86EFAC" }}>Click to change file</p>
                </>
              ) : (
                <>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#AEAEB2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#767678", letterSpacing: "-0.02em" }}>
                    {liDragging ? "Drop your PDF here" : "Click or drag your LinkedIn PDF here"}
                  </p>
                  <p style={{ margin: 0, fontSize: "11px", color: "#AEAEB2" }}>PDF files only</p>
                </>
              )}
            </div>

            {liError && (
              <p style={{ margin: 0, fontSize: "12px", color: "#EF4444", lineHeight: "140%", letterSpacing: "-0.01em" }}>
                {liError}
              </p>
            )}

            {/* Actions */}
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={closeModal}
                style={{ flex: 1, height: "42px", borderRadius: "10px", border: "1.5px solid #E8E8EA", background: "#FFFFFF", fontSize: "13px", fontWeight: 600, color: "#767678", cursor: "pointer", fontFamily: "inherit", letterSpacing: "-0.02em" }}
              >
                Cancel
              </button>
              <button
                onClick={handleLinkedInImport}
                disabled={liLoading || !liFile}
                style={{
                  flex: 2, height: "42px", borderRadius: "10px", border: "none",
                  backgroundColor: liLoading || !liFile ? "#D1E9FD" : "#0A66C2",
                  color: "#FFFFFF", fontSize: "13px", fontWeight: 600,
                  cursor: liLoading || !liFile ? "default" : "pointer",
                  fontFamily: "inherit", letterSpacing: "-0.02em",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  transition: "background-color 0.15s ease",
                }}
              >
                {liLoading ? (
                  <>
                    <span style={{ width: "14px", height: "14px", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.35)", borderTopColor: "#FFFFFF", display: "inline-block", animation: "liSpinner 0.7s linear infinite" }} />
                    Importing…
                  </>
                ) : "Import Profile"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
