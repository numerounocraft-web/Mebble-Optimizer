"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { X, ArrowRight } from "lucide-react";
import MebbleLogo from "@/components/ui/MebbleLogo";
import { AnimatedLayers,    type AnimatedLayersHandle    } from "@/components/ui/AnimatedLayers";
import { AnimatedScrollText, type AnimatedScrollTextHandle } from "@/components/ui/AnimatedScrollText";
import { useWindowSize } from "@/lib/hooks";

const STYLES = `
  @keyframes modalIn {
    from { opacity: 0; transform: scale(0.96) translateY(6px); }
    to   { opacity: 1; transform: scale(1)    translateY(0);   }
  }
  @keyframes liSpinner { to { transform: rotate(360deg); } }
`;

/* ── Page ───────────────────────────────────────────────────────────────────── */
export default function HomePage() {
  const router = useRouter();

  const [hoveredBuild,    setHoveredBuild]    = useState(false);
  const [hoveredOptimize, setHoveredOptimize] = useState(false);
  const buildIconRef    = useRef<AnimatedLayersHandle>(null);
  const optimizeIconRef = useRef<AnimatedScrollTextHandle>(null);

  // Modal state
  const [modalView,     setModalView]     = useState<null | "choice" | "upload" | "linkedin">(null);
  const [uploadFile,    setUploadFile]    = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError,   setUploadError]   = useState("");
  const [uploadDragging,setUploadDragging]= useState(false);
  const [hoveredUpload,   setHoveredUpload]   = useState(false);
  const [hoveredLinkedIn, setHoveredLinkedIn] = useState(false);
  const fileInputRef   = useRef<HTMLInputElement>(null);
  const liFileInputRef = useRef<HTMLInputElement>(null);

  function closeModal() {
    setModalView(null); setUploadFile(null);
    setUploadError(""); setUploadLoading(false); setUploadDragging(false);
  }

  function handleFileDrop(e: React.DragEvent) {
    e.preventDefault(); setUploadDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.type === "application/pdf") { setUploadFile(file); setUploadError(""); }
    else setUploadError("Please drop a PDF file.");
  }

  async function handleResumeImport() {
    if (!uploadFile) return;
    setUploadLoading(true); setUploadError("");
    try {
      const form = new FormData(); form.append("file", uploadFile);
      const res  = await fetch("/api/resume/import", { method: "POST", body: form });
      const json = await res.json();
      if (!json.success) { setUploadError(json.error || "Failed to parse PDF."); return; }
      localStorage.setItem("mebble_linkedin_prefill", JSON.stringify(json.data));
      router.push("/builder");
    } catch { setUploadError("Could not reach the server. Please try again."); }
    finally  { setUploadLoading(false); }
  }

  async function handleLinkedInImport() {
    if (!uploadFile) return;
    setUploadLoading(true); setUploadError("");
    try {
      const form = new FormData(); form.append("file", uploadFile);
      const res  = await fetch("/api/linkedin/import", { method: "POST", body: form });
      const json = await res.json();
      if (!json.success) { setUploadError(json.error || "Failed to parse PDF."); return; }
      localStorage.setItem("mebble_linkedin_prefill", JSON.stringify(json.data));
      router.push("/builder");
    } catch { setUploadError("Could not reach the server. Please try again."); }
    finally  { setUploadLoading(false); }
  }

  const { width: windowWidth } = useWindowSize();
  const isMobile = windowWidth < 768;
  const CARD_HEIGHT = isMobile ? 100 : 120;

  return (
    <>
      <style>{STYLES}</style>

      <div style={{ display: "flex", height: "100vh", overflow: "hidden", fontFamily: "var(--font-geist-sans), system-ui, sans-serif" }}>
        <div style={{ flex: 1, backgroundColor: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", padding: isMobile ? "24px" : "48px" }}>
          <div style={{ width: "100%", maxWidth: "360px", display: "flex", flexDirection: "column", gap: "24px" }}>

            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <MebbleLogo height={16} />
            </div>

            <p style={{ fontSize: isMobile ? "26px" : "32px", fontWeight: 600, lineHeight: "115%", letterSpacing: "-0.04em", margin: 0 }}>
              <span style={{ color: "#C3C3C3" }}>The </span>
              <span style={{ color: "#020202" }}>Resume</span>
              <span style={{ color: "#C3C3C3" }}> Builder That Thinks Like a </span>
              <span style={{ color: "#F46702" }}>Recruiter.</span>
            </p>

            <p style={{ fontSize: "13px", lineHeight: "160%", color: "#767678", fontWeight: 500, letterSpacing: "-0.01em", margin: 0 }}>
              Your next big role starts with a resume that speaks the language of recruiters. Mebble shows you how the system sees your resume.
            </p>

            <div style={{ display: "flex", flexDirection: "row", gap: "12px", alignItems: "stretch" }}>

              {/* Build a Resume */}
              <Link href="/builder" style={{ textDecoration: "none", flex: "1 1 0", minWidth: 0 }}>
                <div
                  onMouseEnter={() => { setHoveredBuild(true);  buildIconRef.current?.startAnimation(); }}
                  onMouseLeave={() => { setHoveredBuild(false); buildIconRef.current?.stopAnimation();  }}
                  style={{ width: "100%", height: `${CARD_HEIGHT}px`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px", padding: "16px 12px", backgroundColor: "#FFFFFF", border: "3px solid #028FF4", borderRadius: "14px", cursor: "pointer", transition: "box-shadow 0.2s ease", boxShadow: hoveredBuild ? "0 2px 8px rgba(2,143,244,0.10)" : "none", boxSizing: "border-box" }}
                >
                  <AnimatedLayers ref={buildIconRef} size={36} style={{ color: "#028FF4", pointerEvents: "none" }} />
                  <p style={{ fontSize: "12px", fontWeight: 600, lineHeight: "130%", color: "#767678", letterSpacing: "-0.02em", margin: 0, textAlign: "center" }}>Build a Resume</p>
                </div>
              </Link>

              {/* Optimize Existing Resume */}
              <div style={{ flex: "1 1 0", minWidth: 0, cursor: "pointer" }} onClick={() => setModalView("choice")}>
                <div
                  onMouseEnter={() => { setHoveredOptimize(true);  optimizeIconRef.current?.startAnimation(); }}
                  onMouseLeave={() => { setHoveredOptimize(false); optimizeIconRef.current?.stopAnimation();  }}
                  style={{ width: "100%", height: `${CARD_HEIGHT}px`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px", padding: "16px 12px", backgroundColor: "#FFFFFF", border: "3px solid #F1F1F1", borderRadius: "14px", cursor: "pointer", transition: "box-shadow 0.2s ease", boxShadow: hoveredOptimize ? "0 2px 8px rgba(0,0,0,0.05)" : "none", boxSizing: "border-box" }}
                >
                  <AnimatedScrollText ref={optimizeIconRef} size={36} style={{ color: "#C8C8C8", pointerEvents: "none" }} />
                  <p style={{ fontSize: "12px", fontWeight: 600, lineHeight: "130%", color: "#767678", letterSpacing: "-0.02em", margin: 0, textAlign: "center" }}>Optimize<br />Existing Resume</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* ── Modal ─────────────────────────────────────────────────────────────── */}
      {modalView && (
        <div onClick={closeModal} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "24px" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: "400px", backgroundColor: "#FFFFFF", borderRadius: "20px", padding: isMobile ? "16px" : "24px", display: "flex", flexDirection: "column", gap: "16px", animation: "modalIn 0.2s cubic-bezier(0.16,1,0.3,1) forwards", boxShadow: "0 20px 60px rgba(0,0,0,0.14)" }}>

            {/* Choice view */}
            {modalView === "choice" && (
              <>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#1F1F1F", letterSpacing: "-0.03em" }}>Optimize Your Resume</p>
                    <p style={{ margin: "4px 0 0", fontSize: "12px", fontWeight: 500, color: "#9A9A9C", letterSpacing: "-0.01em" }}>Choose how you&apos;d like to get started</p>
                  </div>
                  <button onClick={closeModal} style={{ flexShrink: 0, marginLeft: "12px", background: "none", border: "none", cursor: "pointer", padding: "2px", color: "#AEAEB2", display: "flex", alignItems: "center" }}><X size={18} strokeWidth={2} /></button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div onMouseEnter={() => setHoveredUpload(true)} onMouseLeave={() => setHoveredUpload(false)} onClick={() => { setUploadFile(null); setUploadError(""); setModalView("upload"); }} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 16px", border: `1.5px solid ${hoveredUpload ? "#D0D0D0" : "#EBEBEB"}`, borderRadius: "12px", cursor: "pointer", transition: "border-color 0.15s ease, box-shadow 0.15s ease", boxShadow: hoveredUpload ? "0 1px 6px rgba(0,0,0,0.06)" : "none" }}>
                    <div style={{ width: 38, height: 38, borderRadius: "10px", backgroundColor: "#F4F8FF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#028FF4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#1F1F1F", letterSpacing: "-0.02em" }}>Upload PDF or Document</p>
                      <p style={{ margin: "2px 0 0", fontSize: "11px", fontWeight: 500, color: "#9A9A9C", letterSpacing: "-0.01em" }}>Upload your resume file directly from your device</p>
                    </div>
                    <ArrowRight size={14} color="#AEAEB2" />
                  </div>

                  <div onMouseEnter={() => setHoveredLinkedIn(true)} onMouseLeave={() => setHoveredLinkedIn(false)} onClick={() => { setUploadFile(null); setUploadError(""); setModalView("linkedin"); }} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 16px", border: `1.5px solid ${hoveredLinkedIn ? "#D0D0D0" : "#EBEBEB"}`, borderRadius: "12px", cursor: "pointer", transition: "border-color 0.15s ease, box-shadow 0.15s ease", boxShadow: hoveredLinkedIn ? "0 1px 6px rgba(0,0,0,0.06)" : "none" }}>
                    <div style={{ width: 38, height: 38, borderRadius: "10px", backgroundColor: "#F0F7FF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="4" fill="#0A66C2"/><path d="M7.2 9.6H5V19h2.2V9.6zM6.1 8.5a1.3 1.3 0 1 0 0-2.6 1.3 1.3 0 0 0 0 2.6zM19 13.4c0-2.1-1.1-3.9-3.2-3.9-1 0-1.9.5-2.4 1.3V9.6H11V19h2.4v-5c0-1 .5-1.9 1.6-1.9 1.1 0 1.6.9 1.6 1.9V19H19v-5.6z" fill="white"/></svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#1F1F1F", letterSpacing: "-0.02em" }}>Import from LinkedIn</p>
                      <p style={{ margin: "2px 0 0", fontSize: "11px", fontWeight: 500, color: "#9A9A9C", letterSpacing: "-0.01em" }}>Export your LinkedIn profile as a PDF</p>
                    </div>
                    <ArrowRight size={14} color="#AEAEB2" />
                  </div>
                </div>
              </>
            )}

            {/* Upload / LinkedIn drop zone */}
            {(modalView === "upload" || modalView === "linkedin") && (() => {
              const isLI   = modalView === "linkedin";
              const accent = isLI ? "#0A66C2" : "#028FF4";
              return (
                <>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <button onClick={() => { setUploadFile(null); setUploadError(""); setModalView("choice"); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#AEAEB2", display: "flex", alignItems: "center" }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                        </button>
                        <p style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#1F1F1F", letterSpacing: "-0.03em" }}>{isLI ? "Import from LinkedIn" : "Upload Your Resume"}</p>
                      </div>
                      <p style={{ margin: 0, fontSize: "12px", fontWeight: 500, color: "#9A9A9C", letterSpacing: "-0.01em", paddingLeft: "24px" }}>{isLI ? "Export your profile as a PDF, then upload it below" : "We'll read your resume and fill in the builder for you"}</p>
                    </div>
                    <button onClick={closeModal} style={{ flexShrink: 0, marginLeft: "12px", background: "none", border: "none", cursor: "pointer", padding: "2px", color: "#AEAEB2", display: "flex", alignItems: "center" }}><X size={18} strokeWidth={2} /></button>
                  </div>

                  {isLI && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", padding: "12px 14px", backgroundColor: "#F4F8FF", borderRadius: "10px" }}>
                      <p style={{ margin: 0, fontSize: "11px", fontWeight: 700, color: accent, letterSpacing: "0.02em" }}>HOW TO EXPORT YOUR PDF</p>
                      {["Go to your LinkedIn profile", "Click \"More\" below your name", "Select \"Save to PDF\"", "Upload the downloaded file below"].map((s, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                          <span style={{ flexShrink: 0, width: "16px", height: "16px", borderRadius: "50%", backgroundColor: accent, color: "#fff", fontSize: "10px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</span>
                          <p style={{ margin: 0, fontSize: "12px", fontWeight: 500, color: "#4A4A4C", lineHeight: "140%", letterSpacing: "-0.01em" }}>{s}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div onDragOver={(e) => { e.preventDefault(); setUploadDragging(true); }} onDragLeave={() => setUploadDragging(false)} onDrop={handleFileDrop} onClick={() => (isLI ? liFileInputRef : fileInputRef).current?.click()} style={{ border: `2px dashed ${uploadDragging ? accent : uploadFile ? "#22C55E" : "#D8D8DA"}`, borderRadius: "12px", padding: "20px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", cursor: "pointer", backgroundColor: uploadDragging ? "#F0F7FF" : uploadFile ? "#F0FDF4" : "#FAFAFA", transition: "all 0.15s ease" }}>
                    <input ref={fileInputRef}   type="file" accept=".pdf" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) { setUploadFile(f); setUploadError(""); } }} />
                    <input ref={liFileInputRef} type="file" accept=".pdf" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) { setUploadFile(f); setUploadError(""); } }} />
                    {uploadFile ? (
                      <>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#22C55E"/><path d="M7 12.5l3.5 3.5 6.5-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#16A34A", letterSpacing: "-0.02em" }}>{uploadFile.name}</p>
                        <p style={{ margin: 0, fontSize: "11px", fontWeight: 500, color: "#86EFAC" }}>Click to change file</p>
                      </>
                    ) : (
                      <>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#AEAEB2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                        <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#767678", letterSpacing: "-0.02em" }}>{uploadDragging ? "Drop your PDF here" : "Click or drag your PDF here"}</p>
                        <p style={{ margin: 0, fontSize: "11px", fontWeight: 500, color: "#AEAEB2" }}>PDF files only</p>
                      </>
                    )}
                  </div>

                  {uploadError && <p style={{ margin: 0, fontSize: "12px", fontWeight: 500, color: "#EF4444", letterSpacing: "-0.01em" }}>{uploadError}</p>}

                  <div style={{ display: "flex", gap: "10px" }}>
                    <button onClick={() => { setUploadFile(null); setUploadError(""); setModalView("choice"); }} style={{ flex: 1, height: "42px", borderRadius: "10px", border: "1.5px solid #E8E8EA", background: "#FFFFFF", fontSize: "13px", fontWeight: 600, color: "#767678", cursor: "pointer", fontFamily: "inherit", letterSpacing: "-0.02em" }}>Back</button>
                    <button onClick={isLI ? handleLinkedInImport : handleResumeImport} disabled={uploadLoading || !uploadFile} style={{ flex: 2, height: "42px", borderRadius: "10px", border: "none", backgroundColor: uploadLoading || !uploadFile ? (isLI ? "#D1E9FD" : "#C8E4FF") : accent, color: "#FFFFFF", fontSize: "13px", fontWeight: 600, cursor: uploadLoading || !uploadFile ? "default" : "pointer", fontFamily: "inherit", letterSpacing: "-0.02em", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "background-color 0.15s ease" }}>
                      {uploadLoading ? (<><span style={{ width: "14px", height: "14px", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.35)", borderTopColor: "#FFFFFF", display: "inline-block", animation: "liSpinner 0.7s linear infinite" }}/>Importing…</>) : isLI ? "Import Profile" : "Fill Builder"}
                    </button>
                  </div>
                </>
              );
            })()}

          </div>
        </div>
      )}
    </>
  );
}
